import React, { useEffect } from "react";
import { StyledCursor } from "./styled";
import { getTextWidth } from "./utils";
import COMMANDS from "../../../../../common/commands";

const Cursor = ({
  roomId,
  client,
  blockKey,
  offset,
  socketId,
  command,
  positions,
  setPositions
}) => {
  const textContainerElement = document.querySelector(
    `[data-offset-key='${blockKey}-0-0']`
  );
  if (!textContainerElement || !client) return null;
  const editorElement = document.getElementById("editor-" + roomId);
  const editorPosition = editorElement.getBoundingClientRect();

  const position = textContainerElement.getBoundingClientRect();
  const text = textContainerElement.innerText.substr(0, offset);
  const textWidth = getTextWidth(text);

  const additionalOffset = command === COMMANDS.INSERT_TEXT ? 14 : 2;

  let left =
    client.socketId === socketId
      ? textWidth + additionalOffset
      : positions[client.socketId]
      ? positions[client.socketId].left
      : null;

  let top =
    client.socketId === socketId
      ? position.top - editorPosition.top
      : positions[client.socketId]
      ? positions[client.socketId].top
      : null;

  if (left && top) {
    while (left - position.left >= editorPosition.width) {
      left -= editorPosition.width;
      left += additionalOffset;
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
  }, [socketId, blockKey, offset]);

  left = left;
  top = top;

  return (
    <StyledCursor left={left} top={top} color={color} name={client.name} />
  );
};

export default Cursor;
