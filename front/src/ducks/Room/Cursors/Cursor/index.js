import React, { useEffect } from "react";
import { StyledCursor } from "./styled";
import { getTextWidth } from "./utils";

const Cursor = ({
  client,
  focusKey,
  focusOffset,
  socketId,
  positions,
  setPositions
}) => {
  const textContainerElement = document.querySelector(
    `[data-offset-key='${focusKey}-0-0']`
  );
  if (!textContainerElement || !client) return null;

  const editorElement = document.getElementById("editor");
  const editorPosition = editorElement.getBoundingClientRect();

  const position = textContainerElement.getBoundingClientRect();
  const text = textContainerElement.innerText.substr(0, focusOffset);
  const textWidth = getTextWidth(text);

  let left =
    client.socketId === socketId
      ? textWidth + position.left + 14
      : positions[client.socketId]
      ? positions[client.socketId].left
      : null;

  let top =
    client.socketId === socketId
      ? position.top
      : positions[client.socketId]
      ? positions[client.socketId].top
      : null;

  if (left && top) {
    while (left >= editorPosition.width) {
      left -= editorPosition.width;
      top += 18;
    }
  }

  const color =
    client.socketId === socketId
      ? client.color
      : positions[client.socketId]
      ? positions[client.socketId].color
      : null;

  useEffect(() => {
    const updatedPositions = {
      ...positions
    };
    updatedPositions[socketId] = {
      left,
      top,
      color
    };
    if (color) setPositions(updatedPositions);
  }, [socketId, focusKey, focusOffset]);

  left = left;
  top = top;

  return <StyledCursor left={left} top={top} color={color} />;
};

export default Cursor;
