import React from "react";
import { StyledPockemon } from "./styled";

const User = ({ client, index }) => {
  return (
    <div title={client.name}>
      <StyledPockemon
        color={client.color}
        src={client.imgSrc}
        alt={"pokemon_" + client.socketId}
        right={index * -20}
      />
    </div>
  );
};

export default User;
