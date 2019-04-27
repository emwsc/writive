import React, { useState, useRef } from "react";
import { StyledRoom, StyledRoomErrors, StyledRoomItems } from "./styled";
import {
  useOnRoomLoad,
  getConnections,
  calculateNewPositionOfRoomItemOnDrag,
  getEventHandlers,
  mapRoomItemProps
} from "./utils";

import SyncErrors from "./SyncErrors";
import RoomItem from "./RoomItem";

import Header from "./Header";

const prevPosition = {};

const Room = props => {
  const { match } = props;

  const [hasSyncErrors, setHasSyncErrors] = useState(false);
  const [socket, setSocket] = useState();
  const [latestTextEditorChanges, setTextEditorChanges] = useState({});
  const [userColor, setUserColor] = useState(null);
  const [connections, setConnections] = useState({
    count: 0
  });
  const [draggableId, setDraggableId] = useState(null);
  const [resizibleId, setResizibleId] = useState(null);
  const [editorPosition, setEditorPosition] = useState({});
  const [roomItems, setRoomItems] = useState([]);

  const roomRef = useRef(null);
  const connectionsRef = useRef(connections);

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

  const eventHandlers = getEventHandlers({
    setTextEditorChanges,
    checkConnections,
    emitCurrentEditorState,
    setRoomItems,
    roomItems,
    setDraggableId,
    setEditorPosition,
    setResizibleId
  });

  const roomName = match.params.roomhash.split("-").join(" ");

  useOnRoomLoad(match.params.roomhash, setSocket, eventHandlers);

  const onMouseMove = e => {
    if (!draggableId) return;
    const newPosition = {
      ...calculateNewPositionOfRoomItemOnDrag(
        e,
        draggableId,
        prevPosition,
        editorPosition
      )
    };
    // const elementPosition = document
    //   .getElementById("resize-" + draggableId)
    //   .getBoundingClientRect();
    // newPosition[draggableId] = {
    //   ...newPosition[draggableId]
    //   // width: document.getElementById("resize-" + draggableId).style.width,
    //   // height: document.getElementById("resize-" + draggableId).style.height
    // };
    console.log(newPosition);
    socket.emit("moveDraggable", { draggableId, newPosition });
    setEditorPosition(newPosition);
  };

  const onMouseUp = () => {
    if (draggableId) {
      setDraggableId(null);
      socket.emit("moveDraggable", {
        draggableId: null
      });
      prevPosition[draggableId].x = null;
      prevPosition[draggableId].y = null;
    }
    if (resizibleId) {
      const elementPosition = document
        .getElementById("resize-" + resizibleId)
        .getBoundingClientRect();

      editorPosition[resizibleId] = {
        ...editorPosition[resizibleId],
        width: elementPosition.width,
        height: elementPosition.height
      };
      socket.emit("moveDraggable", {
        resizibleId,
        newPosition: { ...editorPosition }
      });
      setResizibleId(null);
    }
  };

  const setSize = (id, width, height) => {
    setEditorPosition({
      ...editorPosition,
      id: { ...editorPosition[id], width, height }
    });
  };

  const textEditorProps = {
    userColor,
    setHasSyncErrors
  };

  const headerProps = {
    connections,
    roomName,
    roomItems,
    socket,
    setRoomItems
  };

  const roomItemCommonProps = {
    resizibleId,
    setResizibleId,
    draggableId,
    setDraggableId,
    textEditorProps,
    emitTextEditorChanges,
    connections,
    socketId: socket ? socket.id : null,
    setSize
  };

  return (
    <StyledRoom onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <Header {...headerProps} />
      <StyledRoomItems>
        {roomItems
          .map(item =>
            mapRoomItemProps(
              item,
              editorPosition,
              latestTextEditorChanges,
              roomItemCommonProps
            )
          )
          .map(itemProps => (
            <RoomItem key={itemProps.id} ref={roomRef} {...itemProps} />
          ))}
      </StyledRoomItems>
      {hasSyncErrors && (
        <StyledRoomErrors>
          <SyncErrors />
        </StyledRoomErrors>
      )}
    </StyledRoom>
  );
};

export default Room;
