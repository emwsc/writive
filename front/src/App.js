import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Room from "./ducks/Room";

const NavigateToRoom = () => {
  const roomhash =
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15);
  window.location.href = window.location.origin + "/" + roomhash;
};

class App extends Component {
  render() {
    return (
      <Router>
        <Route path="/" exact component={NavigateToRoom} />
        <Route path="/:roomhash" exact component={Room} />
      </Router>
    );
  }
}

export default App;
