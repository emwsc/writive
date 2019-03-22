import React, { useState, useEffect, useRef } from "react";
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
      debugger;
      if (connectionsJson) setConnections(JSON.parse(connectionsJson));
    });
  }

  const emitTextEditorChanges = textEditorChanges => {
    if (!socket) return;
    socket.emit("emitTextEditorChanges", textEditorChanges);
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
      handler: textEditorChanges => {
        setTextEditorChanges(textEditorChanges);
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
            You are now in story "{match.params.roomhash}"
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
