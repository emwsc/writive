import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Room from "./ducks/Room";
import NavigateToRoom from "./ducks/NavigateToRoom";

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
