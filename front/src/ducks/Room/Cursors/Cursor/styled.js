import styled from "styled-components";

export const StyledCursor = styled.div`
  background: ${props => props.color};
  position: absolute;
  width: 2px;
  height: 20px;
  left: ${props => props.left + "px"};
  top: ${props => props.top + "px"};
  &::after {
    content: '${props => props.name}';
    position: absolute;
    font-size: 10px;
    padding: 0 5px;
    color: white;
    z-index: 100;
    background: ${props => props.color};
  }
`;
