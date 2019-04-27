import styled from "styled-components";

export const StyledConnectedUsers = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-top: 10px;
  max-width: 200px;
  overflow: hidden;
  position: relative;
  &:hover {
    overflow-x: overlay;
  }
  @media (max-width: 1300px) {
    flex-direction: row;
    max-width: 90vw;
  }

  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #f5f5f5;
  }

  &::-webkit-scrollbar {
    height: 5px;
    background-color: #f5f5f5;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #9c27b0;
    border-top: 1px solid #e1bee7;
  }
`;
