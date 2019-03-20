import React, { useState, useEffect, useRef } from "react";
import {
  StyledRoom,
  StyledEditorContainer,
  StyledTop,
  StyledRoomTitle
} from "./styled";
import { useOnRoomLoad, getConnectionCount } from "./utils";
import TextEditor from "../Editor";
import ConnectedUsers from "./ConnectedUsers";

const Room = props => {
  const { match } = props;
  const editorRef = useRef(null);
  const [socket, setSocket] = useState();
  const [initialRawContent, setInitialRawContent] = useState(null);
  const [latestTextEditorChanges, setTextEditorChanges] = useState();
  const [connectionCount, setCount] = useState(0);

  useEffect(() => {
    getConnectionCount(match.params.roomhash).then(currentCount => {
      setCount(parseInt(currentCount) + 1);
    });
  }, []);

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
      handler: () => {
        getConnectionCount(match.params.roomhash).then(currentCount => {
          setCount(parseInt(currentCount));
        });
      }
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

  useOnRoomLoad(match.params.roomhash, setSocket, events);

  return (
    <StyledRoom>
      <StyledTop>
        <div>
          <StyledRoomTitle>
            You are now in story "{match.params.roomhash}"
          </StyledRoomTitle>
          <ConnectedUsers connectionCount={connectionCount} />
        </div>
      </StyledTop>
      <StyledEditorContainer>
        <TextEditor ref={editorRef} {...textEditorProps} />
      </StyledEditorContainer>
    </StyledRoom>
  );
};

export default Room;
