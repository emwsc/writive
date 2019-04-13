import React from "react";
import {
  StyledDragContainer,
  StyledHandler,
  StyledOverflowContainer
} from "./styled";
import ReactResizeDetector from "react-resize-detector";

const DragContainer = ({
  id,
  children,
  position = {},
  draggableId,
  resizibleId,
  setResizibleId,
  setDraggableId,
  setSize
}) => {
  const { width, height } = position;
  return (
    <StyledDragContainer position={position} showBorder={resizibleId === id}>
      <StyledHandler
        id={id}
        showHandler={draggableId && draggableId === id}
        onMouseDown={() => {
          if (!draggableId || draggableId !== id) setDraggableId(id);
        }}
      />
      <StyledOverflowContainer
        showResizible={resizibleId && resizibleId === id}
        id={"resize-" + id}
        width={width}
        height={height}
      >
        {children}
        <ReactResizeDetector
          handleWidth
          handleHeight
          onResize={(width, height) => {
            if (width === 200) return; //minimal size
            console.log(width, height)
            setSize(id, width, height);
            if (!resizibleId || resizibleId !== id) setResizibleId(id);
          }}
        />
      </StyledOverflowContainer>
    </StyledDragContainer>
  );
};

export default DragContainer;
