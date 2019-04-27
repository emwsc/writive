import styled from "styled-components";

export const StyledFlex = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledTop = styled(StyledFlex)`
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 500;
  @media (max-width: 1300px) {
    margin-bottom: 10px;
    height: auto;
    min-height: 30px;
    align-items: center;
    justify-content: space-evenly;
  }
`;

export const StyledWritive = styled.div`
  font-weight: bold;
  font-size: 26px;
  margin-left: 45px;
  font-style: italic;
  @media (max-width: 1300px) {
    margin-left: 0px;
    font-size: 14px;
  }
`;

export const StyledRoomTitle = styled.div`
  font-size: 12px;
  font-weight: bold;
  color: dimgray;
`;

export const StyledBtn = styled.button`
  /* background: #8e2de2;
  background: -webkit-linear-gradient(to left, #4a00e0, #8e2de2);
  background: linear-gradient(to left, #4a00e0, #8e2de2); */
  background: black;
  height: 30px;
  border: none;
  color: white;
  font-weight: bold;
  padding: 5px 10px;
  /* transform: skewX(-25deg); */
  font-size: 12px;
  /* box-shadow: 5px 4px 9px 0px #03a9f4; */
  cursor: pointer;
  border-radius: 4px;
  margin-right: 20px;
`;
