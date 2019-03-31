import React from "react";
import Cursor from "./Cursor";

const Cursors = React.memo(
  ({
    currentSocketId,
    connections,
    focusKey,
    focusOffset,
    socketId,
    positions,
    setPositions
  }) => {
    const cursors = [];
    if (connections.clients) {
      for (const id in connections.clients) {
        if (currentSocketId === id) continue;
        cursors.push(
          <Cursor
            key={id}
            focusKey={focusKey}
            focusOffset={focusOffset}
            socketId={socketId}
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
    prev.focusKey === next.focusKey &&
    prev.focusOffset === next.focusOffset &&
    prev.socketId === next.socketId
);

export default Cursors;
