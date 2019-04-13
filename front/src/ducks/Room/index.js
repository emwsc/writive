import React, { useState, useRef } from "react";
import {
  StyledRoom,
  StyledTop,
  StyledRoomTitle,
  StyledRoomErrors,
  StyledRoomItems,
  StyledAddTextBlockBtn
} from "./styled";
import {
  useOnRoomLoad,
  getConnections,
  calculateNewPositionOfRoomItemOnDrag,
  getEventHandlers
} from "./utils";
import ConnectedUsers from "./ConnectedUsers";
import SyncErrors from "./SyncErrors";
import RoomItem from "./RoomItem";
import { EditorState, convertToRaw } from "draft-js";

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
  const [draggableId, setDraggableId] = useState(null);
  const [resizibleId, setResizibleId] = useState(null);
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
    newPosition[draggableId] = {
      ...newPosition[draggableId]
      // width: document.getElementById("resize-" + draggableId).style.width,
      // height: document.getElementById("resize-" + draggableId).style.height
    };
    socket.emit("moveDraggable", { draggableId, newPosition });
    setEditorPosition(newPosition);
  };

  return (
    <StyledRoom
      onMouseMove={onMouseMove}
      onMouseUp={() => {
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
      }}
    >
      <StyledTop id="top">
        <div>
          <StyledRoomTitle>{roomName}</StyledRoomTitle>
          <ConnectedUsers connections={connections} />
        </div>
        <StyledAddTextBlockBtn
          onClick={() => {
            const updatedRoomItems = [...roomItems];
            const id = "item-" + Math.random().toString(36);
            const initialRawContent = {
              rawContent: convertToRaw(
                EditorState.createEmpty().getCurrentContent()
              )
            };
            updatedRoomItems.push({ id, initialRawContent });
            setRoomItems(updatedRoomItems);
            socket.emit("emitNewRoomItem", {
              id,
              initialRawContent
            });
          }}
        >
          Add text block
        </StyledAddTextBlockBtn>
      </StyledTop>
      <StyledRoomItems>
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
              resizibleId={resizibleId}
              setResizibleId={setResizibleId}
              draggableId={draggableId}
              setDraggableId={setDraggableId}
              textEditorProps={textEditorProps}
              emitTextEditorChanges={emitTextEditorChanges}
              latestTextEditorChanges={changes}
              initialRawContent={item.initialRawContent}
              editorPosition={position}
              connections={connections}
              socketId={socket ? socket.id : null}
              setSize={(id, width, height) => {
                setEditorPosition({
                  ...editorPosition,
                  id: { ...editorPosition[id], width, height }
                });
              }}
            />
          );
        })}
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
