import React from "react";
import { getRandomInt } from "../../../../common/utils";
import { StyledPockemon } from "./styled";

const User = ({ userIndex }) => {
  const pokemonIndex = getRandomInt(userIndex, 50);
  return (
    <div>
      <StyledPockemon
        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonIndex}.png`}
        alt={"pokemon_" + userIndex}
      />
    </div>
  );
};

export default User;
