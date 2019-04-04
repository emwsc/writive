import React from "react";
import { StyledPockemon } from "./styled";

const User = ({ client }) => {
  return (
    <div title={client.name}>
      <StyledPockemon
        color={client.color}
        src={client.imgSrc}
        alt={"pokemon_" + client.socketId}
      />
    </div>
  );
};

export default User;
