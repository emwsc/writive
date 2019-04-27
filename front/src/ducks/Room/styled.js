import styled from "styled-components";

export const StyledRoom = styled.div`
  font-family: "Montserrat", sans-serif;
  background: #ffffff;
  height: calc(100vh - 40px);
  width: calc(100vw - 25px);
  position: relative;
`;

export const StyledEditorContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  height: 90vh;
  overflow-y: auto;
  font-size: 14px;
`;

export const StyledRoomErrors = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(238, 238, 238, 0.75);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledRoomItems = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  position: absolute;
  width: 100%;
  height: calc(100% - 70px);
  top: 70px;
`;


