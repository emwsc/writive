import { useEffect } from "react";
import COMMANDS from "../../common/commands";
import {
  EditorState,
  Modifier,
  ContentBlock,
  CharacterMetadata,
  convertFromRaw
} from "draft-js";
import { List, Repeat } from "immutable";
import TYPES from "./types";

/**
 * Combine array of values for useEffect hook
 * @param {object} textEditorChanges
 */
function getEffectKeys(textEditorChanges) {
  return [
    textEditorChanges.char ? textEditorChanges.char : "",
    textEditorChanges.focusOffset ? textEditorChanges.focusOffset : -1,
    textEditorChanges.anchorKey ? textEditorChanges.anchorKey : "",
    textEditorChanges.anchorOffset ? textEditorChanges.anchorOffset : -1
  ];
}

/**
 * Act on recieving changes from remove user
 * @param {object} textEditorChanges
 * @param {object} editorState
 * @param {function} onEditorChange
 */
export function useOnTextEditorRemoteChanges(
  textEditorChanges,
  editorState,
  onEditorChange
) {
  useEffect(() => {
    console.log(textEditorChanges);
    const noChanges =
      !editorState ||
      !textEditorChanges.anchorKey ||
      (textEditorChanges.command === COMMANDS.INSERT_TEXT &&
        (!textEditorChanges.char || textEditorChanges.char === ""));
    if (noChanges) return;
    const contentState = editorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    // const block = blockMap.get(textEditorChanges.anchorKey);

    // if (!block && textEditorChanges.command === COMMANDS.INSERT_TEXT)
    //   onNewBlock(textEditorChanges, blockMap, editorState, onEditorChange);
    // else if (textEditorChanges.command === COMMANDS.NEWLINE) {
    //   onNewBlock(textEditorChanges, blockMap, editorState, onEditorChange);
    // } else if (block)
    if (textEditorChanges.command === COMMANDS.NEWLINE)
      onNewBlock(textEditorChanges, blockMap, editorState, onEditorChange);
    else onExistingBlock(textEditorChanges, editorState, onEditorChange);
  }, getEffectKeys(textEditorChanges));
}

/**
 * Append new block to text editor. If it's new line, then we search for prev block and append new block after him
 * @param {object} textEditorChanges
 * @param {Map} blockMap
 * @param {EditorState} editorState
 * @param {function} onEditorChange
 */
function onNewBlock(textEditorChanges, blockMap, editorState, onEditorChange) {
  let editorStateForNewBlock = null;
  let currentBlock = editorState
    .getCurrentContent()
    .getBlockForKey(textEditorChanges.focusKey);
  const currentBlockObj = currentBlock.toObject();
  const currentText = currentBlockObj.text;
  let newBlockText = "";
  if (textEditorChanges.focusOffset < currentText.length) {
    newBlockText = currentText.substr(textEditorChanges.focusOffset);
    const selectionState = editorState
      .getSelection()
      .set("anchorKey", textEditorChanges.focusKey)
      .set("focusKey", textEditorChanges.focusKey)
      .set("focusOffset", currentText.length)
      .set("anchorOffset", textEditorChanges.focusOffset);
    const contentState = editorState.getCurrentContent();
    const ncs = Modifier.removeRange(contentState, selectionState, "backward");
    const es = EditorState.push(editorState, ncs, textEditorChanges.command);
    editorStateForNewBlock = es;
    currentBlock = editorStateForNewBlock
      .getCurrentContent()
      .getBlockForKey(textEditorChanges.focusKey);
  }
  if (editorStateForNewBlock == null) editorStateForNewBlock = editorState;

  const newBlock = new ContentBlock({
    key: textEditorChanges.anchorKey,
    text: newBlockText,
    characterList: new List(
      Repeat(CharacterMetadata.create(), newBlockText.length)
    ),
    type: "unstyled"
  });

  const blocksBefore = blockMap.toSeq().takeUntil(function(v) {
    return v === currentBlock;
  });
  const blocksAfter = blockMap
    .toSeq()
    .skipUntil(function(v) {
      return v === currentBlock;
    })
    .rest();
  let newBlocks = [
    [currentBlock.getKey(), currentBlock],
    [newBlock.getKey(), newBlock]
  ];
  const newBlockMap = blocksBefore
    .concat(newBlocks, blocksAfter)
    .toOrderedMap();

  const mergedContentState = editorStateForNewBlock.getCurrentContent().merge({
    blockMap: newBlockMap
  });
  if (newBlockMap) {
    const es = EditorState.push(
      editorStateForNewBlock,
      mergedContentState,
      "insert-fragment"
    );
    onEditorChange(es, false);
  }
}

/**
 * Insert text into existing block in text editor
 * @param {object} textEditorChanges
 * @param {EditorState} editorState
 * @param {function} onEditorChange
 */
function onExistingBlock(textEditorChanges, editorState, onEditorChange) {
  switch (textEditorChanges.command) {
    case COMMANDS.INSERT_TEXT: {
      const contentState = editorState.getCurrentContent();
      const savedSelection = editorState.getSelection();
      const selection = editorState
        .getSelection()
        .set("anchorKey", textEditorChanges.anchorKey)
        .set("focusKey", textEditorChanges.focusKey)
        .set("focusOffset", textEditorChanges.focusOffset - 1)
        .set("anchorOffset", textEditorChanges.anchorOffset - 1);

      const ncs = Modifier.insertText(
        contentState,
        selection,
        textEditorChanges.char
      );
      const es = EditorState.push(
        editorState,
        ncs
          .set("selectionBefore", savedSelection)
          .set("selectionAfter", savedSelection),
        textEditorChanges.command
      );
      onEditorChange(es, false);
      return;
    }
    case COMMANDS.REMOVE_RANGE:
    case COMMANDS.REMOVE_TEXT: {
      const selectionState = editorState
        .getSelection()
        .set("anchorKey", textEditorChanges.anchorKey)
        .set("focusKey", textEditorChanges.focusKey)
        .set("focusOffset", textEditorChanges.focusOffset)
        .set("anchorOffset", textEditorChanges.anchorOffset);
      const contentState = editorState.getCurrentContent();
      const ncs = Modifier.removeRange(
        contentState,
        selectionState,
        "backward"
      );
      const es = EditorState.push(editorState, ncs, textEditorChanges.command);
      onEditorChange(es, false);
      return;
    }
  }
}

/**
 * Getting meaningful information of editor state changes
 * @param {EditorState} editorState
 */
export function gatherEditorChanges(editorState) {
  const rawState = editorState.toJS();
  const { currentContent, selection } = rawState;
  const { anchorKey, anchorOffset, focusOffset, focusKey } = selection;
  const { blockMap } = currentContent;
  const char = blockMap[anchorKey].text[anchorOffset - 1];
  const command = rawState.lastChangeType;
  switch (command) {
    case COMMANDS.REMOVE_TEXT:
    case COMMANDS.REMOVE_RANGE: {
      const removeFocusOffset =
        rawState.currentContent.selectionBefore.focusOffset >
        rawState.currentContent.selectionBefore.anchorOffset
          ? rawState.currentContent.selectionBefore.focusOffset
          : rawState.currentContent.selectionBefore.anchorOffset;

      return {
        char,
        command,
        focusOffset: removeFocusOffset,
        anchorKey: rawState.currentContent.selectionAfter.anchorKey,
        focusKey: rawState.currentContent.selectionBefore.focusKey,
        anchorOffset: rawState.currentContent.selectionAfter.anchorOffset
      };
    }
    case COMMANDS.NEWLINE: {
      return {
        char,
        command,
        focusOffset: rawState.currentContent.selectionBefore.focusOffset,
        anchorKey: rawState.currentContent.selectionAfter.anchorKey,
        focusKey: rawState.currentContent.selectionBefore.focusKey,
        anchorOffset
      };
    }
    default: {
      return {
        char,
        command,
        focusOffset,
        anchorKey,
        focusKey,
        anchorOffset
      };
    }
  }
}

/**
 * Getting meaningful information of editor state changes only for input and on handleBeforeInput event
 * @param {EditorState} editorState
 */
export function gatherEditorChangesOnInput(editorState) {
  const selectionState = editorState.getSelection();
  const anchorKey = selectionState.getAnchorKey(),
    anchorOffset = selectionState.getAnchorOffset() + 1,
    focusOffset = selectionState.getFocusOffset() + 1,
    focusKey = selectionState.getFocusKey();

  return {
    command: COMMANDS.INSERT_TEXT,
    focusOffset,
    anchorKey,
    focusKey,
    anchorOffset
  };
}

/**
 * Hookm for setting initial editor set, when you already have clients with some text
 * @param {object} initialRawContent
 * @param {function} dispatch
 */
export function useEditorInitialState(initialRawContent, dispatch) {
  useEffect(() => {
    if (initialRawContent) {
      dispatch({
        type: TYPES.ON_CHANGE,
        payload: {
          editorState: EditorState.createWithContent(
            convertFromRaw(initialRawContent)
          )
        }
      });
    }
  }, [initialRawContent]);
}
