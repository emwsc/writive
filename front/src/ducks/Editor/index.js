import React, { useEffect, useReducer, useImperativeHandle } from "react";
import { Editor, EditorState, convertToRaw, convertFromRaw } from "draft-js";
import "../../../node_modules/draft-js/dist/Draft.css";
import reducer from "./reducer";
import TYPES from "./types";
import { EDITOR_PLACEHOLDER } from "./constants";
import {
  useOnTextEditorRemoteChanges,
  gatherEditorChanges,
  hasTextEditorChanges
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

  useOnTextEditorRemoteChanges(latestTextEditorChanges, editorState, dispatch);

  const onEditorChange = nextEditorState => {
    dispatch({
      type: TYPES.ON_CHANGE,
      payload: { editorState: nextEditorState }
    });
    if (hasTextEditorChanges(editorState, nextEditorState))
      emitTextEditorChanges(gatherEditorChanges(nextEditorState));
  };

  return (
    <Editor
      placeholder={EDITOR_PLACEHOLDER}
      editorState={editorState}
      onChange={onEditorChange}
    />
  );
};

export default React.forwardRef(TextEditor);
