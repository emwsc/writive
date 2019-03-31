import styled from "styled-components";

export const StyledCursor = styled.div`
  background: ${props => props.color};
  position: absolute;
  width: 2px;
  height: 20px;
  left: ${props => props.left + "px"};
  top: ${props => props.top + "px"};
`;
