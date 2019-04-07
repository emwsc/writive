import React, { useState, forwardRef } from "react";
import { StyledDragContainer, StyledHandler } from "./styled";

const DragContainer = (
  { children, position, isDraggable, setIsDraggable },
  handlerRef
) => {
  return (
    <StyledDragContainer position={position}>
      <StyledHandler
        ref={handlerRef}
        isDraggable={isDraggable}
        onMouseDown={() => {
          if (!isDraggable) setIsDraggable(true);
        }}
      />
      {children}
    </StyledDragContainer>
  );
};

export default forwardRef(DragContainer);
