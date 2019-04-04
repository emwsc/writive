import styled from "styled-components";

export const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

export const StyledReloadButton = styled.button`
  /* background: #2196f3; */
  background: #8e2de2; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to left,
    #4a00e0,
    #8e2de2
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to left,
    #4a00e0,
    #8e2de2
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

  border: none;
  color: white;
  font-weight: bold;
  padding: 5px 10px;
  transform: skewX(-25deg);
  font-size: 16px;
  box-shadow: 5px 4px 9px 0px #03a9f4;
  cursor: pointer;
  border-radius: 4px;
`;
