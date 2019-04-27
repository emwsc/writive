import React from "react";
import ConnectedUsers from "../ConnectedUsers";
import { EditorState, convertToRaw } from "draft-js";
import {
  StyledTop,
  StyledRoomTitle,
  StyledBtn,
  StyledFlex,
  StyledWritive
} from "./styled";

const Header = ({ connections, roomName, roomItems, socket, setRoomItems }) => {
  const handleOnAddTextBlockClick = () => {
    const updatedRoomItems = [...roomItems];
    const id = "item-" + Math.random().toString(36);
    const initialRawContent = {
      rawContent: convertToRaw(EditorState.createEmpty().getCurrentContent())
    };
    updatedRoomItems.push({ id, initialRawContent });
    setRoomItems(updatedRoomItems);
    socket.emit("emitNewRoomItem", {
      id,
      initialRawContent
    });
  };

  return (
    <StyledTop id="top">
      <StyledWritive>writive</StyledWritive>
      <StyledFlex>
        <StyledBtn onClick={handleOnAddTextBlockClick}>
          Add text block
        </StyledBtn>
        <StyledBtn>Add canvas</StyledBtn>
        <div>
          <StyledRoomTitle>{roomName}</StyledRoomTitle>
          <ConnectedUsers connections={connections} />
        </div>
      </StyledFlex>
    </StyledTop>
  );
};
export default Header;
