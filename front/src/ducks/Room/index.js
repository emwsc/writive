import React, { useState, useRef } from "react";
import {
  StyledRoom,
  StyledEditorContainer,
  StyledTop,
  StyledRoomTitle,
  StyledCursor
} from "./styled";
import { useOnRoomLoad, getConnections, getTextWidth } from "./utils";
import TextEditor from "../Editor";
import ConnectedUsers from "./ConnectedUsers";

const Room = props => {
  const { match } = props;

  const editorRef = useRef(null);
  const cursorRef = useRef();

  const [socket, setSocket] = useState();
  const [initialRawContent, setInitialRawContent] = useState(null);
  const [latestTextEditorChanges, setTextEditorChanges] = useState();
  const [userColor, setUserColor] = useState(null);
  const [connections, setConnections] = useState({
    count: 0
  });

  /**
   * Check current connections to room
   */
  function checkConnections(socket) {
    getConnections(match.params.roomhash).then(connectionsJson => {
      if (connectionsJson) {
        const connections = JSON.parse(connectionsJson);
        setUserColor(connections.clients[socket.id].color);
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
    userColor
  };

  const setCursor = (focusKey) => {
    const el = document.querySelector(`[data-offset-key='${focusKey}-0-0']`);
    const position = el.getBoundingClientRect();
    var text = el.innerText;
    const textWidth = getTextWidth(text);
    cursorRef.current.style.left = textWidth + position.left + 14 + "px";
  };

  const events = [
    {
      eventName: "recieveTextEditorChanges",
      handler: (changes, socket) => {
        if (socket.id === changes.socketId) return;
        setTextEditorChanges(changes);
        //setCursor(changes.focusKey, changes.focusOffset);
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

  useOnRoomLoad(match.params.roomhash, setSocket, events);

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
      {/* <StyledCursor ref={cursorRef} /> */}
      <StyledEditorContainer>
        <TextEditor ref={editorRef} {...textEditorProps} />
      </StyledEditorContainer>
    </StyledRoom>
  );
};

export default Room;
