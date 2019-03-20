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
      !textEditorChanges.char ||
      textEditorChanges.char === "";
    if (noChanges) return;
    const contentState = editorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    const block = blockMap.get(textEditorChanges.anchorKey);
    if (!block && textEditorChanges.command === COMMANDS.INSERT_TEXT)
      onNewBlock(textEditorChanges, blockMap, editorState, dispatch);
    else if (block) onExistingBlock(textEditorChanges, editorState, dispatch);
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
    text: textEditorChanges.char,
    characterList: new List(
      Repeat(CharacterMetadata.create(), textEditorChanges.char.length)
    ),
    type: "unstyled"
  });
  const newBlockMap = blockMap
    .toSeq()
    .concat([[newBlock.getKey(), newBlock]])
    .toOrderedMap();
  const mergedContentState = editorState.getCurrentContent().merge({
    blockMap: newBlockMap
  });
  const es = EditorState.push(
    editorState,
    mergedContentState,
    "insert-fragment"
  );
  dispatch({ type: TYPES.ON_CHANGE, payload: { editorState: es } });
}

/**
 * Insert text into existing block in text editor
 * @param {object} textEditorChanges
 * @param {object} editorState
 * @param {function} dispatch
 */
function onExistingBlock(textEditorChanges, editorState, dispatch) {
  switch (textEditorChanges.command) {
    case COMMANDS.INSERT_TEXT: {
      const selection = editorState
        .getSelection()
        .set("anchorKey", textEditorChanges.anchorKey)
        .set("focusKey", textEditorChanges.focusKey)
        .set("focusOffset", textEditorChanges.focusOffset)
        .set("anchorOffset", textEditorChanges.anchorOffset);
      const contentState = editorState.getCurrentContent();
      const ncs = Modifier.insertText(
        contentState,
        selection,
        textEditorChanges.char
      );
      const es = EditorState.push(editorState, ncs, "insert-fragment");
      dispatch({ type: TYPES.ON_CHANGE, payload: { editorState: es } });
      return;
    }
    case COMMANDS.REMOVE_TEXT: {
      const selection = editorState
        .getSelection()
        .set("anchorKey", textEditorChanges.anchorKey)
        .set("focusKey", textEditorChanges.focusKey)
        .set("focusOffset", textEditorChanges.focusOffset + 1)
        .set("anchorOffset", textEditorChanges.anchorOffset);
      const contentState = editorState.getCurrentContent();
      const ncs = Modifier.removeRange(contentState, selection, "backward");
      const es = EditorState.push(editorState, ncs, "remove-range");
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
  return {
    char,
    command: rawState.lastChangeType,
    focusOffset,
    anchorKey,
    focusKey,
    anchorOffset
  };
}

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

  return prevBlockMap[prevAnchorKey].text !== nextBlockMap[nextAnchorKey].text;
}
