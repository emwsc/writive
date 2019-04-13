import styled from "styled-components";

export const StyledCursor = styled.div`
  background: ${props => props.color};
  position: absolute;
  width: 2px;
  height: 20px;
  left: ${props => (props.left ? props.left + "px" : null)};
  top: ${props => (props.top ? props.top + "px" : null)};
  &:after {
    content: '${props => props.name}';
    position: absolute;
    font-size: 10px;
    padding: 0 5px;
    color: white;
    z-index: 100;
    background: ${props => props.color};
  }
`;
