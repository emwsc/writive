import styled from "styled-components";

export const StyledDragContainer = styled.div.attrs(
  ({ position, showBorder }) => ({
    style: {
      left: position && position.x ? position.x + "px" : null,
      top: position && position.y ? position.y + "px" : null,
      border: showBorder ? " 1px solid lightgray" : "none"
    }
  })
)`
  position: absolute;
  /* left: ${({ position }) =>
    position && position.x ? position.x + "px" : null};
  top: ${({ position }) =>
    position && position.y ? position.y + "px" : null}; */
  min-width: 200px;
  min-height: 200px;
  /* border: ${props =>
    props.showBorder ? " 1px solid lightgray" : "none"}; */
  &:hover > div:first-child {
    display: block!important;
  }
  &:hover > div:nth-child(2) {
    resize: both!important;
    overflow: auto!important;
  }
  &:hover {
    border: 1px solid lightgray!important;
    border-top: none!important;
  }
`;

/*
.attrs({
  style: props => ({
    display: props.showHandler ? "block" : "none"
  })
})
*/

export const StyledHandler = styled.div.attrs(({ showHandler }) => {
  return {
    style: {
      display: showHandler ? "block" : "none"
    }
  };
})`
  /* display: ${props => (props.showHandler ? "block" : "none")}; */
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

export const StyledOverflowContainer = styled.div.attrs(
  ({ width, height, showResizible }) => ({
    style: {
      width: width + "px",
      height: height + "px",
      resize: showResizible ? "both" : "none",
      overflow: showResizible ? "auto" : "unset"
    }
  })
)`
  /* resize: ${props => (props.showResizible ? "both" : "none")};
  overflow: ${props => (props.showResizible ? "auto" : "unset")}; */
  position: relative;
  min-width: 200px;
  min-height: 200px;
  padding: 5px;
  /* width: ${props => props.width + "px"};
  height: ${props => props.height + "px"}; */
`;
