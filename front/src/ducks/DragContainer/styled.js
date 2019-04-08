import styled from "styled-components";

export const StyledDragContainer = styled.div`
  position: absolute;
  left: ${({ position }) =>
    position && position.x ? position.x + "px" : null};
  top: ${({ position }) => (position && position.y ? position.y + "px" : null)};
  min-width: 200px;
  min-height: 200px;
  border: ${props => (props.showBorder ? " 1px solid lightgray" : "none")};
  &:hover > div:first-child {
    display: block;
  }
  &:hover > div:nth-child(2) {
    resize: both;
    overflow: auto;
  }
  &:hover {
    border: 1px solid lightgray;
    border-top: none;
  }
`;

export const StyledHandler = styled.div`
  display: ${props => (props.showHandler ? "block" : "none")};
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
  resize: ${props => (props.showResizible ? "both" : "none")};
  overflow: ${props => (props.showResizible ? "auto" : "unset")};
  position: relative;
  min-width: 200px;
  min-height: 200px;
  padding: 5px;
`;
