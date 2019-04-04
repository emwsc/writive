import styled from "styled-components";

export const StyledConnectedUsers = styled.div`
  display: flex;
  flex-direction: row-reverse;
  margin-top: 10px;
  max-width: 200px;
  flex-wrap: wrap;
  @media (max-width: 1300px) {
    flex-direction: row;
    max-width: 90vw;
  }
`;
