import styled from "styled-components";

export const StyledRoom = styled.div`
  font-family: "Montserrat", sans-serif;
  background: #ffffff;
  height: calc(100vh - 40px);
  width: calc(100vw - 25px);
  position: relative;
`;

export const StyledTop = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  position: relative;
  z-index: 500;
  @media (max-width: 1300px) {
    margin-bottom: 10px;
    height: auto;
    min-height: 30px;
    align-items: center;
    justify-content: center;
  }
`;

export const StyledRoomTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: dimgray;
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

export const StyledAddTextBlockBtn = styled.button`
  background: #8e2de2;
  background: -webkit-linear-gradient(to left, #4a00e0, #8e2de2);
  background: linear-gradient(to left, #4a00e0, #8e2de2);
  height: 30px;
  border: none;
  color: white;
  font-weight: bold;
  padding: 5px 10px;
  transform: skewX(-25deg);
  font-size: 12px;
  box-shadow: 5px 4px 9px 0px #03a9f4;
  cursor: pointer;
  border-radius: 4px;
  margin-right: 20px;
`;
