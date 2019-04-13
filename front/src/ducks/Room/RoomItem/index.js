import React, {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState
} from "react";
import DragContainer from "../../DragContainer";
import TextEditor from "../../Editor";
import Cursors from "./Cursors";
import { StyledEditorContainer } from "./styled";

const RoomItem = (props, ref) => {
  const {
    id,
    resizibleId,
    setResizibleId,
    draggableId,
    setDraggableId,
    textEditorProps,
    emitTextEditorChanges,
    latestTextEditorChanges,
    initialRawContent,
    editorPosition,
    connections,
    socketId
  } = props;

  const editorRef = useRef(null);

  const [positions, setPositions] = useState({});

  useImperativeHandle(ref, () => {
    if (!ref.current) ref.current = {};
    if (!ref.current[id]) ref.current[id] = {};
    ref.current[id].editorState = editorRef.current;
    ref.current[id].editorPosition = {
      ...editorPosition
    };
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

  const cursorsProps = {
    textEditorChanges: latestTextEditorChanges,
    connections,
    currentSocketId: socketId,
    positions,
    setPositions,
    roomId: id
  };
  return (
    <DragContainer
      id={id}
      resizibleId={resizibleId}
      setResizibleId={setResizibleId}
      position={editorPosition}
      draggableId={draggableId}
      setDraggableId={setDraggableId}
    >
      {/* <StyledEditorContainer id="editor"> */}
      <StyledEditorContainer id={"editor-" + id}>
        <Cursors {...cursorsProps} />
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
