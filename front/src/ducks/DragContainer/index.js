import React, { useState, forwardRef } from "react";
import {
  StyledDragContainer,
  StyledHandler,
  StyledOverflowContainer
} from "./styled";

const DragContainer = ({
  id,
  children,
  position,
  draggableId,
  setDraggableId
}) => {
  return (
    <StyledDragContainer position={position}>
      <StyledHandler
        id={id}
        isVisible={draggableId === id}
        onMouseDown={() => {
          if (!draggableId || draggableId !== id) setDraggableId(id);
        }}
      />
      <StyledOverflowContainer>{children}</StyledOverflowContainer>
    </StyledDragContainer>
  );
};

export default DragContainer;
