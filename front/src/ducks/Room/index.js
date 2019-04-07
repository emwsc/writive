import React, { useState, useRef } from "react";
import {
  StyledRoom,
  StyledEditorContainer,
  StyledTop,
  StyledRoomTitle,
  StyledCursor,
  StyledRoomErrors
} from "./styled";
import { useOnRoomLoad, getConnections } from "./utils";
import TextEditor from "../Editor";
import ConnectedUsers from "./ConnectedUsers";
import Cursors from "./Cursors";
import SyncErrors from "./SyncErrors";
import DragContainer from "../DragContainer";

const prevPosition = {};

const Room = props => {
  const { match } = props;

  const editorRef = useRef(null);
  const handlerRef = useRef();

  const [hasSyncErrors, setHasSyncErrors] = useState(false);
  const [socket, setSocket] = useState();
  const [initialRawContent, setInitialRawContent] = useState(null);
  const [latestTextEditorChanges, setTextEditorChanges] = useState({});
  const [userColor, setUserColor] = useState(null);
  const [connections, setConnections] = useState({
    count: 0
  });

  const [positions, setPositions] = useState({});

  const [isDraggable, setIsDraggable] = useState(false);
  const [editorPosition, setEditorPosition] = useState({ x: null, y: null });

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
    if (!socket) return;
    socket.emit("sendCurrentEditorState", {
      to: socketId,
      editorJson: JSON.stringify(editorRef.current.rawContent)
    });
  }

  const textEditorProps = {
    emitTextEditorChanges,
    latestTextEditorChanges,
    initialRawContent,
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
        if (data) setInitialRawContent(JSON.parse(data));
      }
    }
  ];

  const roomName = match.params.roomhash.split("-").join(" ");

  useOnRoomLoad(match.params.roomhash, setSocket, events);

  const onMouseMove = e => {
    const handlerBounding = handlerRef.current.getBoundingClientRect();
    if (isDraggable) {
      if (!prevPosition.x) prevPosition.x = e.pageX - handlerBounding.x;
      if (!prevPosition.y) prevPosition.y = e.pageY - handlerBounding.y;
      const diffX = e.pageX - handlerBounding.x - prevPosition.x;
      const diffY = e.pageY - handlerBounding.y - prevPosition.y;
      setEditorPosition({
        x: handlerBounding.x + diffX,
        y: handlerBounding.y + diffY - 65
      });
    }
  };

  return (
    <StyledRoom
      onMouseMove={onMouseMove}
      onMouseUp={() => {
        if (isDraggable) {
          setIsDraggable(false);
          prevPosition.x = null;
          prevPosition.y = null;
        }
      }}
    >
      <StyledTop>
        <div>
          <StyledRoomTitle>{roomName}</StyledRoomTitle>
          <ConnectedUsers connections={connections} />
        </div>
      </StyledTop>
      <Cursors {...cursorsProps} />
      <DragContainer
        ref={handlerRef}
        position={editorPosition}
        isDraggable={isDraggable}
        setIsDraggable={setIsDraggable}
      >
        <StyledEditorContainer id="editor">
          <TextEditor ref={editorRef} {...textEditorProps} />
        </StyledEditorContainer>
      </DragContainer>
      {hasSyncErrors && (
        <StyledRoomErrors>
          <SyncErrors />
        </StyledRoomErrors>
      )}
    </StyledRoom>
  );
};

export default Room;
