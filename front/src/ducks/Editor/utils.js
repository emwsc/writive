import { useEffect } from "react";
import COMMANDS from "./commands";
import {
  EditorState,
  Modifier,
  ContentBlock,
  CharacterMetadata
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
    debugger;
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
 * @param {object} editorState
 * @param {function} onEditorChange
 */
function onNewBlock(textEditorChanges, blockMap, editorState, onEditorChange) {
  let newBlockMap = null;
  switch (textEditorChanges.command) {
    case COMMANDS.NEWLINE: {
      debugger;
      const currentBlock = editorState
        .getCurrentContent()
        .getBlockForKey(textEditorChanges.focusKey);
      const currentBlockObj = currentBlock.toObject();
      const currentText = currentBlockObj.text;
      let newBlockText = "";
      if (textEditorChanges.focusOffset < currentText.length) {
        newBlockText = currentText.substr(textEditorChanges.focusOffset);
        onExistingBlock(
          {
            command: COMMANDS.REMOVE_RANGE,
            focusOffset: currentText.length,
            anchorKey: textEditorChanges.focusKey,
            focusKey: textEditorChanges.focusKey,
            anchorOffset: textEditorChanges.focusOffset
          },
          editorState,
          onEditorChange
        );
      }

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
      newBlockMap = blocksBefore.concat(newBlocks, blocksAfter).toOrderedMap();
      break;
    }
    case COMMANDS.INSERT_TEXT: {
      const newBlock = new ContentBlock({
        key: textEditorChanges.anchorKey,
        text: textEditorChanges.char ? textEditorChanges.char : "",
        characterList: new List(
          Repeat(
            CharacterMetadata.create(),
            textEditorChanges.char ? textEditorChanges.char.length : 0
          )
        ),
        type: "unstyled"
      });
      newBlockMap = blockMap
        .toSeq()
        .concat([[newBlock.getKey(), newBlock]])
        .toOrderedMap();
      break;
    }
  }

  const mergedContentState = editorState.getCurrentContent().merge({
    blockMap: newBlockMap
  });
  if (newBlockMap) {
    const es = EditorState.push(
      editorState,
      mergedContentState,
      "insert-fragment"
    );
    onEditorChange(es, false);
  }
}

/**
 * Insert text into existing block in text editor
 * @param {object} textEditorChanges
 * @param {object} editorState
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
 * @param {object} editorState
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
 * Check changes
 * @param {object} prev
 * @param {next} next
 */
export function hasTextEditorChanges(prev, next) {
  if (!prev || !next) return false;
  const rawPrevState = prev.toJS();
  const rawNextState = next.toJS();

  const prevContent = rawPrevState.currentContent;
  const prevSelection = rawPrevState.selection;
  const prevAnchorKey = prevSelection.anchorKey;
  const prevBlockMap = prevContent.blockMap;

  const nextContent = rawNextState.currentContent;
  const nextSelection = rawNextState.selection;
  const nextAnchorKey = nextSelection.anchorKey;
  const nextBlockMap = nextContent.blockMap;
  /**
   * We are on same block of text
   */
  if (prevAnchorKey === nextAnchorKey)
    return (
      prevBlockMap[prevAnchorKey].text !== nextBlockMap[nextAnchorKey].text
    );
  else {
    return (
      !prevBlockMap[nextAnchorKey] ||
      prevBlockMap[nextAnchorKey].text !== nextBlockMap[nextAnchorKey].text
    );
  }
}
