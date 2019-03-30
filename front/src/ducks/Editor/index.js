import React, { useEffect, useReducer, useImperativeHandle } from "react";
import {
  Editor,
  EditorState,
  convertToRaw,
  convertFromRaw,
  getDefaultKeyBinding
} from "draft-js";
import "../../../node_modules/draft-js/dist/Draft.css";
import reducer from "./reducer";
import TYPES from "./types";
import COMMANDS from "./commands";
import { EDITOR_PLACEHOLDER } from "./constants";
import { useOnTextEditorRemoteChanges, gatherEditorChanges } from "./utils";

const TextEditor = (props, ref) => {
  const {
    initialRawContent = null,
    emitTextEditorChanges,
    latestTextEditorChanges = {}
  } = props;

  const [editorState, dispatch] = useReducer(
    reducer.editorState,
    EditorState.createEmpty()
  );

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

  useImperativeHandle(ref, () => {
    return {
      rawContent: convertToRaw(editorState.getCurrentContent())
    };
  });

  const onEditorChange = (nextEditorState, emitNext = true) => {
    dispatch({
      type: TYPES.ON_CHANGE,
      payload: { editorState: nextEditorState }
    });
    if (
      emitNext &&
      nextEditorState.getLastChangeType() !== COMMANDS.INSERT_TEXT
    ) {
      emitTextEditorChanges(gatherEditorChanges(nextEditorState));
    }
  };

  const handleKeyCommand = command => {
    return "not-handled";
  };

  const keyBinding = e => {
    return getDefaultKeyBinding(e);
  };

  /**
   * Simple way to get next input character and not spend time what really changed
   * @param {string} char
   * @param {object} editorState
   */
  const handleBeforeInput = (char, editorState) => {
    const selectionState = editorState.getSelection();
    const anchorKey = selectionState.getAnchorKey(),
      anchorOffset = selectionState.getAnchorOffset() + 1,
      focusOffset = selectionState.getFocusOffset() + 1,
      focusKey = selectionState.getFocusKey();
    const changes = {
      char,
      command: COMMANDS.INSERT_TEXT,
      focusOffset,
      anchorKey,
      focusKey,
      anchorOffset
    };
    emitTextEditorChanges(changes);
  };

  const handleReturn = (event, editorState) => {
    debugger;
  };

  useOnTextEditorRemoteChanges(
    latestTextEditorChanges,
    editorState,
    onEditorChange
  );

  return (
    <Editor
      placeholder={EDITOR_PLACEHOLDER}
      editorState={editorState}
      onChange={onEditorChange}
      handleKeyCommand={handleKeyCommand}
      keyBindingFn={keyBinding}
      handleReturn={handleReturn}
      handleBeforeInput={handleBeforeInput}
    />
  );
};

export default React.forwardRef(TextEditor);
