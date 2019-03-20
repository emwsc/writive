import React, { useReducer } from "react";
import { Editor, EditorState, getDefaultKeyBinding } from "draft-js";
import "../../../node_modules/draft-js/dist/Draft.css";
import reducer from "./reducer";
import TYPES from "./types";
import { EDITOR_PLACEHOLDER } from "./constants";
import { useOnTextEditorRemoteChanges } from "./utils";
import COMMANDS from "./commands";

const TextEditor = props => {
  const { emitTextEditorChanges, latestTextEditorChanges = {} } = props;
  const [editorState, dispatch] = useReducer(
    reducer.editorState,
    EditorState.createEmpty()
  );

  useOnTextEditorRemoteChanges(latestTextEditorChanges, editorState, dispatch);

  const onEditorChange = (editorState, command) => {
    dispatch({ type: TYPES.ON_CHANGE, payload: { editorState } });
    const rawState = editorState.toJS();
    const { currentContent, selection } = rawState;
    const { anchorKey, anchorOffset, focusOffset, focusKey } = selection;
    const { blockMap } = currentContent;
    const char = blockMap[anchorKey].text[anchorOffset - 1];
    emitTextEditorChanges({
      char,
      command,
      focusOffset,
      anchorKey,
      focusKey,
      anchorOffset
    });
  };

  const keyBindingFn = e => {
    if (e.key === "Backspace") {
      return COMMANDS.REMOVE_TEXT;
    }
    return getDefaultKeyBinding(e);
  };

  const handleKeyCommand = command => {
    if (command === COMMANDS.REMOVE_TEXT) {
      onEditorChange(editorState, command);
      return "handled";
    }
    return "not-handled";
  };

  return (
    <Editor
      placeholder={EDITOR_PLACEHOLDER}
      editorState={editorState}
      onChange={editorState => onEditorChange(editorState, COMMANDS.INSER_TEXT)}
      handleKeyCommand={handleKeyCommand}
      keyBindingFn={keyBindingFn}
    />
  );
};

export default TextEditor;
