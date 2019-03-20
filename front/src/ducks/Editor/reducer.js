import TYPES from "./types";

function editorState(state, action) {
  switch (action.type) {
    case TYPES.ON_CHANGE: {
      const { editorState } = action.payload;
      return editorState;
    }
    default:
      return state;
  }
}

export default {
  editorState
};
