import React from "react";
import { StyledReloadButton, StyledButtonContainer } from "./styled";

const SyncErrors = () => (
  <div>
    <div>
      Oops... Something went wrong{" "}
      <span role="img" aria-label="sad">
        😟
      </span>
    </div>
    <StyledButtonContainer>
      <StyledReloadButton onClick={() => window.location.reload()}>
        Press me to reload
      </StyledReloadButton>
    </StyledButtonContainer>
  </div>
);

export default SyncErrors;
