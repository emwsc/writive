import React, { useState, useRef } from "react";
import {
  StyledRoom,
  StyledTop,
  StyledRoomTitle,
  StyledRoomErrors
} from "./styled";
import { useOnRoomLoad, getConnections } from "./utils";
import ConnectedUsers from "./ConnectedUsers";
import SyncErrors from "./SyncErrors";
import RoomItem from "./RoomItem";

const prevPosition = {};

const Room = props => {
  const { match } = props;

  const roomRef = useRef(null);
  const connectionsRef = useRef(connections);

  const [hasSyncErrors, setHasSyncErrors] = useState(false);
  const [socket, setSocket] = useState();
  const [latestTextEditorChanges, setTextEditorChanges] = useState({});
  const [userColor, setUserColor] = useState(null);
  const [connections, setConnections] = useState({
    count: 0
  });
  const [positions, setPositions] = useState({});
  const [draggableId, setDraggableId] = useState(false);
  const [editorPosition, setEditorPosition] = useState({});
  const [roomItems, setRoomItems] = useState([]);

  /**
   * Check current connections to room
   */
  function checkConnections(socket) {
    getConnections(match.params.roomhash).then(connectionsJson => {
      if (connectionsJson) {
        const connections = JSON.parse(connectionsJson);
        if (connections.clients[socket.id])
          setUserColor(connections.clients[socket.id].color);
        connectionsRef.current = connections;
        setConnections(connections);
      }
    });
  }

  /**
   * Emit changes to other clients
   * @param {object} textEditorChanges
   */
  function emitTextEditorChanges(textEditorChanges) {
    if (!socket || !textEditorChanges.command) return;
    socket.emit("emitTextEditorChanges", {
      ...textEditorChanges,
      socketId: socket.id
    });
  }

  /**
   * Emit full room state to new client
   * @param {string} socketId
   * @param {object} socket
   */
  function emitCurrentEditorState(socketId, socket) {
    if (!socket || !roomRef || !roomRef.current) return;
    socket.emit("sendCurrentEditorState", {
      to: socketId,
      state: roomRef.current
    });
  }

  const textEditorProps = {
    userColor,
    setHasSyncErrors
  };

  const cursorsProps = {
    currentSocketId: socket ? socket.id : null,
    connections,
    textEditorChanges: latestTextEditorChanges,
    positions,
    setPositions
  };

  const events = [
    {
      eventName: "recieveTextEditorChanges",
      handler: (changes, socket) => {
        if (socket.id === changes.socketId) return;
        setTextEditorChanges(changes);
      }
    },
    {
      eventName: "connectionsCountChanges",
      handler: socket => checkConnections(socket)
    },
    {
      eventName: "getCurrentEditorState",
      handler: emitCurrentEditorState
    },
    {
      eventName: "setCurrentEditorState",
      handler: data => {
        if (data) {
          debugger;
          const { state } = data;
          const ids = Object.keys(state);
          const roomItems = ids.map(id => ({
            id,
            initialRawContent: state[id].editorState,
            editorPosition: state[id].editorPosition
          }));
          setRoomItems(roomItems);
        }
      }
    }
  ];

  const roomName = match.params.roomhash.split("-").join(" ");

  useOnRoomLoad(match.params.roomhash, setSocket, events);

  const onMouseMove = e => {
    if (draggableId) {
      const handlerBounding = document
        .getElementById(draggableId)
        .getBoundingClientRect();
      const top = document.getElementById("top");
      const { height: topY } = top.getBoundingClientRect();
      if (!prevPosition[draggableId]) prevPosition[draggableId] = {};
      if (!prevPosition[draggableId].x)
        prevPosition[draggableId].x = e.pageX - handlerBounding.x;
      if (!prevPosition[draggableId].y)
        prevPosition[draggableId].y = e.pageY - handlerBounding.y;
      const diffX = e.pageX - handlerBounding.x - prevPosition[draggableId].x;
      const diffY =
        e.pageY - handlerBounding.y - prevPosition[draggableId].y - topY + 50;
      const p = { ...editorPosition };
      p[draggableId] = {
        x: handlerBounding.x + diffX,
        y: handlerBounding.y + diffY
      };
      setEditorPosition(p);
    }
  };

  return (
    <StyledRoom
      onMouseMove={onMouseMove}
      onMouseUp={() => {
        if (draggableId) {
          setDraggableId(null);
          prevPosition[draggableId].x = null;
          prevPosition[draggableId].y = null;
        }
      }}
    >
      <StyledTop id="top">
        <div>
          <StyledRoomTitle>{roomName}</StyledRoomTitle>
          <ConnectedUsers connections={connections} />
        </div>
        <button
          onClick={() => {
            const arr = [...roomItems];
            arr.push({ id: "item-" + Math.random().toString(36) });
            setRoomItems(arr);
          }}
        >
          add item
        </button>
      </StyledTop>
      {/* <Cursors {...cursorsProps} /> */}
      {roomItems.map(item => {
        const changes =
          item.id === latestTextEditorChanges.roomItemId
            ? latestTextEditorChanges
            : {};
        const position = editorPosition[item.id]
          ? editorPosition[item.id]
          : item.editorPosition;
        return (
          <RoomItem
            key={item.id}
            id={item.id}
            ref={roomRef}
            draggableId={draggableId}
            setDraggableId={setDraggableId}
            textEditorProps={textEditorProps}
            emitTextEditorChanges={emitTextEditorChanges}
            latestTextEditorChanges={changes}
            initialRawContent={item.initialRawContent}
            editorPosition={position}
          />
        );
      })}
      {hasSyncErrors && (
        <StyledRoomErrors>
          <SyncErrors />
        </StyledRoomErrors>
      )}
    </StyledRoom>
  );
};

export default Room;
