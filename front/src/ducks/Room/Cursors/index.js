import React, { useEffect, useState } from "react";
import Cursor from "./Cursor";
import COMMANDS from "../../../common/commands";

const Cursors = React.memo(
  ({
    roomId,
    currentSocketId,
    connections,
    textEditorChanges,
    positions,
    setPositions
  }) => {
    const [width, setWidth] = useState(window.innerWidth);

    const updateDimensions = () => {
      setWidth(window.innerWidth);
    };

    useEffect(() => {
      window.addEventListener("resize", updateDimensions);
      return () => {
        window.removeEventListener("resize", updateDimensions);
      };
    }, []);

    const cursors = [];
    if (connections.clients) {
      for (const id in connections.clients) {
        if (currentSocketId === id) continue;
        const offset =
          textEditorChanges.focusOffset < textEditorChanges.anchorOffset
            ? textEditorChanges.focusOffset
            : textEditorChanges.anchorOffset;
        const blockKey =
          textEditorChanges.command === COMMANDS.INSERT_TEXT
            ? textEditorChanges.focusKey
            : textEditorChanges.anchorKey;
        cursors.push(
          <Cursor
            key={id}
            roomId={roomId}
            width={width}
            blockKey={blockKey}
            offset={offset}
            command={textEditorChanges.command}
            socketId={textEditorChanges.socketId}
            client={connections.clients[id]}
            positions={positions}
            setPositions={setPositions}
          />
        );
      }
    }

    return <React.Fragment>{cursors}</React.Fragment>;
  },
  (prev, next) =>
    prev.connections.count === next.connections.count &&
    prev.textEditorChanges.anchorKey === next.textEditorChanges.anchorKey &&
    prev.textEditorChanges.focusKey === next.textEditorChanges.focusKey &&
    prev.textEditorChanges.anchorOffset ===
      next.textEditorChanges.anchorOffset &&
    prev.textEditorChanges.focusOffset === next.textEditorChanges.focusOffset &&
    prev.textEditorChanges.socketId === next.textEditorChanges.socketId
);

export default Cursors;
