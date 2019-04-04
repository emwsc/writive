import React, { useReducer, useImperativeHandle } from "react";
import {
  Editor,
  EditorState,
  convertToRaw,
  getDefaultKeyBinding
} from "draft-js";
import "../../../node_modules/draft-js/dist/Draft.css";
import reducer from "./reducer";
import TYPES from "./types";
import COMMANDS from "../../common/commands";
import { EDITOR_PLACEHOLDER } from "./constants";
import {
  useOnTextEditorRemoteChanges,
  gatherEditorChanges,
  gatherEditorChangesOnInput,
  useEditorInitialState
} from "./utils";

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

  useImperativeHandle(ref, () => {
    return {
      rawContent: convertToRaw(editorState.getCurrentContent())
    };
  });

  /**
   * Update editor state
   * @param {EditorState} nextEditorState
   * @param {boolean} emitNext
   */
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
    emitTextEditorChanges({ ...gatherEditorChangesOnInput(editorState), char });
  };

  const handleReturn = (event, editorState) => {
    debugger;
  };

  useEditorInitialState(initialRawContent, dispatch);

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
