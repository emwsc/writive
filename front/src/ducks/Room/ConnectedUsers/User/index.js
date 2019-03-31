import React from "react";
import { getRandomInt } from "../../../../common/utils";
import { StyledPockemon } from "./styled";

const User = ({ client }) => {
  return (
    <div>
      <StyledPockemon
        color={client.color}
        src={client.imgSrc}
        alt={"pokemon_" + client.socketId}
      />
    </div>
  );
};

export default User;
