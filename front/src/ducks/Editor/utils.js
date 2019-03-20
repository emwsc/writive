import { useEffect } from "react";
import {
  EditorState,
  Modifier,
  ContentBlock,
  CharacterMetadata
} from "draft-js";
import { List, Repeat } from "immutable";
import TYPES from "./types";

function getEffectKeys(latestTextEditorChanges) {
  const effectKeys = {
    char: latestTextEditorChanges.char ? latestTextEditorChanges.char : "",
    focusOffset: latestTextEditorChanges.focusOffset
      ? latestTextEditorChanges.focusOffset
      : -1,
    anchorKey: latestTextEditorChanges.anchorKey
      ? latestTextEditorChanges.anchorKey
      : "",
    anchorOffset: latestTextEditorChanges.anchorOffset
      ? latestTextEditorChanges.anchorOffset
      : -1
  };
  return Object.values(effectKeys);
}

/**
 * Act on recieving changes from remove user
 * @param {object} latestTextEditorChanges
 * @param {object} editorState
 * @param {function} dispatch
 */
export function useOnTextEditorRemoteChanges(
  latestTextEditorChanges,
  editorState,
  dispatch
) {
  useEffect(() => {
    const noChanges =
      !editorState ||
      !latestTextEditorChanges.anchorKey ||
      !latestTextEditorChanges.char ||
      latestTextEditorChanges.char === "";

    if (noChanges) return;
    const contentState = editorState.getCurrentContent();
    const blockMap = contentState.getBlockMap();
    const block = blockMap.get(latestTextEditorChanges.anchorKey);
    if (!block)
      onNewBlock(latestTextEditorChanges, blockMap, editorState, dispatch);
    else onExistingBlock(latestTextEditorChanges, editorState, dispatch);
  }, getEffectKeys(latestTextEditorChanges));
}

/**
 * Append new block to text editor
 * @param {object} latestTextEditorChanges
 * @param {Map} blockMap
 * @param {object} editorState
 * @param {function} dispatch
 */
function onNewBlock(latestTextEditorChanges, blockMap, editorState, dispatch) {
  const newBlock = new ContentBlock({
    key: latestTextEditorChanges.anchorKey,
    text: latestTextEditorChanges.char,
    characterList: new List(
      Repeat(CharacterMetadata.create(), latestTextEditorChanges.char.length)
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
 * @param {object} latestTextEditorChanges
 * @param {object} editorState
 * @param {function} dispatch
 */
function onExistingBlock(latestTextEditorChanges, editorState, dispatch) {
  const selection = editorState
    .getSelection()
    .set("anchorKey", latestTextEditorChanges.anchorKey)
    .set("focusKey", latestTextEditorChanges.focusKey)
    .set("focusOffset", latestTextEditorChanges.focusOffset)
    .set("anchorOffset", latestTextEditorChanges.anchorOffset);
  const contentState = editorState.getCurrentContent();
  const ncs = Modifier.insertText(
    contentState,
    selection,
    latestTextEditorChanges.char
  );
  const es = EditorState.push(editorState, ncs, "insert-fragment");
  dispatch({ type: TYPES.ON_CHANGE, payload: { editorState: es } });
}
