import React, { useState, useRef } from "react";
import {
  StyledRoom,
  StyledEditorContainer,
  StyledTop,
  StyledRoomTitle
} from "./styled";
import { useOnRoomLoad, getConnections } from "./utils";
import TextEditor from "../Editor";
import ConnectedUsers from "./ConnectedUsers";

const Room = props => {
  const { match } = props;
  const editorRef = useRef(null);
  const [socket, setSocket] = useState();
  const [initialRawContent, setInitialRawContent] = useState(null);
  const [latestTextEditorChanges, setTextEditorChanges] = useState();
  const [connections, setConnections] = useState({
    count: 0
  });

  function checkConnections() {
    getConnections(match.params.roomhash).then(connectionsJson => {
      if (connectionsJson) setConnections(JSON.parse(connectionsJson));
    });
  }

  const emitTextEditorChanges = textEditorChanges => {
    if (!socket || !textEditorChanges.command) return;
    debugger;
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
    initialRawContent
  };

  const events = [
    {
      eventName: "recieveTextEditorChanges",
      handler: (changes, socket) => {
        debugger;
        if (socket.id === changes.socketId) return;
        setTextEditorChanges(changes);
      }
    },
    {
      eventName: "connectionsCountChanges",
      handler: checkConnections
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

  useOnRoomLoad(match.params.roomhash, setSocket, events, checkConnections);

  return (
    <StyledRoom>
      <StyledTop>
        <div>
          <StyledRoomTitle>
            {match.params.roomhash.split("-").join(" ")}
          </StyledRoomTitle>
          <ConnectedUsers connections={connections} />
        </div>
      </StyledTop>
      <StyledEditorContainer>
        <TextEditor ref={editorRef} {...textEditorProps} />
      </StyledEditorContainer>
    </StyledRoom>
  );
};

export default Room;
