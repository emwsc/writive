import styled from "styled-components";

export const StyledPockemon = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  padding: 2px;
  border: ${props => "2px solid " + (props.color ? props.color : "lightgray")};
  margin: 0 5px;

  @media (max-width: 1300px) {
    width: 24px;
    height: 24px;
  }
`;
