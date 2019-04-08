import React, { forwardRef, useRef, useImperativeHandle } from "react";
import DragContainer from "../../DragContainer";
import TextEditor from "../../Editor";
import { StyledEditorContainer } from "./styled";

const RoomItem = (props, ref) => {
  const {
    id,
    draggableId,
    setDraggableId,
    textEditorProps,
    emitTextEditorChanges,
    latestTextEditorChanges,
    initialRawContent,
    editorPosition
  } = props;

  const editorRef = useRef(null);

  useImperativeHandle(ref, () => {
    if (!ref.current) ref.current = {};
    ref.current[id] = editorRef.current;
    return {
      ...ref.current
    };
  });

  const roomEmitTextEditorChanges = changes =>
    emitTextEditorChanges({ ...changes, roomItemId: id });

  const roomitemTextEditorProps = {
    ...textEditorProps,
    emitTextEditorChanges: roomEmitTextEditorChanges
  };
  console.log(latestTextEditorChanges);

  return (
    <DragContainer
      id={id}
      position={editorPosition}
      draggableId={draggableId}
      setDraggableId={setDraggableId}
    >
      {/* <StyledEditorContainer id="editor"> */}
      <StyledEditorContainer>
        <TextEditor
          ref={editorRef}
          {...roomitemTextEditorProps}
          latestTextEditorChanges={latestTextEditorChanges}
          initialRawContent={initialRawContent}
        />
      </StyledEditorContainer>
    </DragContainer>
  );
};

export default forwardRef(RoomItem);
