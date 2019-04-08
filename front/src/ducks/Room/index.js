import React, { useState, useRef } from "react";
import {
  StyledRoom,
  StyledEditorContainer,
  StyledTop,
  StyledRoomTitle,
  StyledRoomErrors
} from "./styled";
import { useOnRoomLoad, getConnections } from "./utils";
import TextEditor from "../Editor";
import ConnectedUsers from "./ConnectedUsers";
import Cursors from "./Cursors";
import SyncErrors from "./SyncErrors";
import DragContainer from "../DragContainer";
import RoomItem from "./RoomItem";

const prevPosition = {};

const Room = props => {
  const { match } = props;

  const editorRef = useRef(null);
  //const handlerRef = useRef();

  const [hasSyncErrors, setHasSyncErrors] = useState(false);
  const [socket, setSocket] = useState();
  const [initialRawContent, setInitialRawContent] = useState({});
  const [latestTextEditorChanges, setTextEditorChanges] = useState({});
  const [userColor, setUserColor] = useState(null);
  const [connections, setConnections] = useState({
    count: 0
  });

  const [positions, setPositions] = useState({});

  const [draggableId, setDraggableId] = useState(false);
  const [editorPosition, setEditorPosition] = useState({});

  const [roomItems, setRoomItems] = useState([]);

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

  const emitTextEditorChanges = textEditorChanges => {
    if (!socket || !textEditorChanges.command) return;
    socket.emit("emitTextEditorChanges", {
      ...textEditorChanges,
      socketId: socket.id
    });
  };

  function emitCurrentEditorState(socketId, socket) {
    if (!socket || !editorRef || !editorRef.current) return;
    socket.emit("sendCurrentEditorState", {
      to: socketId,
      editorJson: JSON.stringify(editorRef.current)
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
          const parsed = JSON.parse(data);
          const ids = Object.keys(parsed);
          const roomItems = ids.map(id => ({ id }));
          setRoomItems(roomItems);
          setInitialRawContent(parsed);
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
      {/* <DragContainer
        ref={handlerRef}
        position={editorPosition}
        draggableId={draggableId}
        setDraggableId={setDraggableId}
      >
        <StyledEditorContainer id="editor">
          <TextEditor ref={editorRef} {...textEditorProps} />
        </StyledEditorContainer>
      </DragContainer> */}
      {/* <RoomItem
        ref={editorRef}
        draggableId={draggableId}
        setDraggableId={setDraggableId}
        textEditorProps={textEditorProps}
      /> */}
      {roomItems.map(item => (
        <RoomItem
          key={item.id}
          id={item.id}
          ref={editorRef}
          draggableId={draggableId}
          setDraggableId={setDraggableId}
          textEditorProps={textEditorProps}
          emitTextEditorChanges={emitTextEditorChanges}
          latestTextEditorChanges={
            item.id === latestTextEditorChanges.roomItemId
              ? latestTextEditorChanges
              : {}
          }
          initialRawContent={initialRawContent[item.id]}
          editorPosition={editorPosition[item.id]}
        />
      ))}
      {hasSyncErrors && (
        <StyledRoomErrors>
          <SyncErrors />
        </StyledRoomErrors>
      )}
    </StyledRoom>
  );
};

export default Room;
