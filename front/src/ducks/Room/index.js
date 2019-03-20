import React, { useState } from "react";
import {
  StyledRoom,
  StyledEditorContainer,
  StyledTop,
  StyledRoomTitle
} from "./styled";
import { useOnRoomLoad } from "./utils";
import TextEditor from "../Editor";

const Room = props => {
  const { match } = props;
  const [socket, setSocket] = useState();
  const [latestTextEditorChanges, setTextEditorChanges] = useState();

  const emitTextEditorChanges = textEditorChanges => {
    if (!socket) return;
    socket.emit("emitTextEditorChanges", textEditorChanges);
  };

  const recieveTextEditorChanges = textEditorChanges => {
    setTextEditorChanges(textEditorChanges);
  };

  const textEditorProps = {
    emitTextEditorChanges,
    latestTextEditorChanges
  };

  useOnRoomLoad(match.params.roomhash, setSocket, [
    {
      eventName: "recieveTextEditorChanges",
      handler: recieveTextEditorChanges
    }
  ]);

  return (
    <StyledRoom>
      <StyledTop>
        <StyledRoomTitle>
          You are now in room "{match.params.roomhash}"
        </StyledRoomTitle>
      </StyledTop>
      <StyledEditorContainer>
        <TextEditor {...textEditorProps} />
      </StyledEditorContainer>
    </StyledRoom>
  );
};

export default Room;
