import { useEffect } from "react";
import COMMANDS from "./commands";
import {
  EditorState,
  Modifier,
  ContentBlock,
  CharacterMetadata
} from "draft-js";
import { List, Repeat, OrderedMap } from "immutable";
import TYPES from "./types";

/**
 * Combine array of values for useEffect hook
 * @param {object} textEditorChanges
 */
function getEffectKeys(textEditorChanges) {
  const effectKeys = {
    char: textEditorChanges.char ? textEditorChanges.char : "",
    focusOffset: textEditorChanges.focusOffset
      ? textEditorChanges.focusOffset
      : -1,
    anchorKey: textEditorChanges.anchorKey ? textEditorChanges.anchorKey : "",
    anchorOffset: textEditorChanges.anchorOffset
      ? textEditorChanges.anchorOffset
      : -1
  };
  return Object.values(effectKeys);
}

/**
 * Act on recieving changes from remove user
 * @param {object} textEditorChanges
 * @param {object} editorState
 * @param {function} dispatch
 */
export function useOnTextEditorRemoteChanges(
  textEditorChanges,
  editorState,
  dispatch
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
    const block = blockMap.get(textEditorChanges.anchorKey);
    if (!block && textEditorChanges.command === COMMANDS.INSERT_TEXT)
      onNewBlock(textEditorChanges, blockMap, editorState, dispatch);
    else if (textEditorChanges.command === COMMANDS.NEWLINE) {
      onNewBlock(textEditorChanges, blockMap, editorState, dispatch);
    } else if (block) onExistingBlock(textEditorChanges, editorState, dispatch);
  }, getEffectKeys(textEditorChanges));
}

/**
 * Append new block to text editor
 * @param {object} textEditorChanges
 * @param {Map} blockMap
 * @param {object} editorState
 * @param {function} dispatch
 */
function onNewBlock(textEditorChanges, blockMap, editorState, dispatch) {
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
  let newBlockMap = null;
  switch (textEditorChanges.command) {
    case COMMANDS.NEWLINE: {
      // const seq = blockMap.toSeq();
      // debugger;
      // let map = OrderedMap();
      // const iter = seq.entries();
      // while (true) {
      //   const item = iter.next();
      //   if (item.done) break;
      //   const [key, block] = item.value;
      //   if (key !== textEditorChanges.focusKey) {
      //     map = map.set(key, block);
      //   }
      //   //newSeq = newSeq.concat([key, block]);
      //   else {
      //     // newSeq = newSeq.concat([key, block]);
      //     debugger;
      //     map = map.set(key, block);
      //     map = map.set(newBlock.getKey(), newBlock);
      //     // newSeq = newSeq.concat([[newBlock.getKey(), newBlock]]);
      //   }
      // }
      // newBlockMap = map;
      // break;
      debugger;
      const currentBlock = editorState
        .getCurrentContent()
        .getBlockForKey(textEditorChanges.focusKey);

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
    case COMMANDS.INSERT_TEXT:
      newBlockMap = blockMap
        .toSeq()
        .concat([[newBlock.getKey(), newBlock]])
        .toOrderedMap();
      break;
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
    dispatch({ type: TYPES.ON_CHANGE, payload: { editorState: es } });
  }
}

/**
 * Insert text into existing block in text editor
 * @param {object} textEditorChanges
 * @param {object} editorState
 * @param {function} dispatch
 */
function onExistingBlock(textEditorChanges, editorState, dispatch) {
  switch (textEditorChanges.command) {
    // case COMMANDS.NEWLINE: {
    //   debugger;
    //   const selection = editorState
    //     .getSelection()
    //     .set("anchorKey", textEditorChanges.anchorKey)
    //     .set("focusKey", textEditorChanges.focusKey)
    //     .set("focusOffset", textEditorChanges.focusOffset + 1)
    //     .set("anchorOffset", textEditorChanges.anchorOffset + 1);
    //   const contentState = editorState.getCurrentContent();
    //   const ncs = Modifier.splitBlock(contentState, selection);
    //   const es = EditorState.push(editorState, ncs, textEditorChanges.command);
    //   dispatch({ type: TYPES.ON_CHANGE, payload: { editorState: es } });
    //   return;
    // }
    case COMMANDS.INSERT_TEXT: {
      const selection = editorState
        .getSelection()
        .set("anchorKey", textEditorChanges.anchorKey)
        .set("focusKey", textEditorChanges.focusKey)
        .set("focusOffset", textEditorChanges.focusOffset - 1)
        .set("anchorOffset", textEditorChanges.anchorOffset - 1);
      const contentState = editorState.getCurrentContent();
      const ncs = Modifier.insertText(
        contentState,
        selection,
        textEditorChanges.char
      );
      const es = EditorState.push(editorState, ncs, textEditorChanges.command);
      dispatch({ type: TYPES.ON_CHANGE, payload: { editorState: es } });
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

      dispatch({ type: TYPES.ON_CHANGE, payload: { editorState: es } });
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
        focusOffset,
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
