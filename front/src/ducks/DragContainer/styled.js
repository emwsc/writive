import styled from "styled-components";

export const StyledDragContainer = styled.div`
  position: absolute;
  left: ${({ position }) =>
    position && position.x ? position.x + "px" : null};
  top: ${({ position }) => (position && position.y ? position.y + "px" : null)};
  /* width: 800px;
  height: 900px; */

  min-width: 200px;
  min-height: 200px;

  &:hover > div:first-child {
    display: block;
  }
  &:hover {
    border: 1px solid lightgray;
    border-top: none;
  }
`;

export const StyledHandler = styled.div`
  display: ${props => (props.isVisible ? "block" : "none")};
  position: absolute;
  background: #e0e0e0;
  height: 15px;
  width: 100%;
  cursor: pointer;
  z-index: 100;
  top: -15px;
  border-radius: 5px;
  border: 1px solid #ceacac;
  &:after {
    content: "";
    position: absolute;
    width: 100%;
    border-top: 1px dashed #9e9e9e;
    top: 7px;
  }
`;

export const StyledOverflowContainer = styled.div`
  resize: both;
  overflow: auto;
  position: relative;
  min-width: 200px;
  min-height: 200px;
`;
