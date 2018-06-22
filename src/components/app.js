// jshint esversion: 6
import React from "react";
import _ from "lodash";
import Helmet from "react-helmet";
import Container from "./framework/container";
import { connect } from "react-redux";
import PulseLoader from "halogen/PulseLoader";

import LeftSideBar from "./leftsidebar";
import Parallel from "./continuous/parallel";
import Legend from "./continuousLegend";
import Joy from "./joy/joy";
import Graph from "./graph/graph";
import * as globals from "../globals";
import actions from "../actions";

import SectionHeader from "./framework/sectionHeader";

@connect(state => {
  return {
    cells: state.cells
  };
})
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  _onURLChanged() {
    this.props.dispatch({ type: "url changed", url: document.location.href });
  }
  componentDidMount() {
    /* listen for url changes, fire one when we start the app up */
    window.addEventListener("popstate", this._onURLChanged);
    this._onURLChanged();

    this.props.dispatch(actions.initialize());

    /*
      first request includes query straight off the url bar for now
    */
    this.props.dispatch(actions.requestCells(window.location.search));
    /* listen for resize events */
    window.addEventListener("resize", () => {
      this.props.dispatch({
        type: "window resize",
        data: {
          height: window.innerHeight,
          width: window.innerWidth
        }
      });
    });
    this.props.dispatch({
      type: "window resize",
      data: {
        height: window.innerHeight,
        width: window.innerWidth
      }
    });
  }

  render() {
    // console.log('app:', this.props, this.state)

    return (
      <Container>
        <Helmet title="cellxgene" />
        {this.props.cells.loading ? (
          <div
            style={{ position: "fixed", left: window.innerWidth / 2, top: 150 }}
          >
            <PulseLoader color="rgb(0,0,0)" size="10px" margin="4px" />
            <span
              style={{ fontFamily: globals.accentFont, fontStyle: "italic" }}
            >
              loading cells
            </span>
          </div>
        ) : null}
        {this.props.cells.error ? "Error loading cells" : null}
        {false ? (
          <Joy data={this.state.expressions && this.state.expressions.data} />
        ) : (
          ""
        )}
        <div>
          {this.props.cells.loading ? null : <LeftSideBar />}
          <div
            style={{
              padding: 15,
              width: 1440 - 410 /* but responsive */,
              marginLeft: 350 /* but responsive */
            }}
          >
            <Graph />
            <Legend />
            {/*<Parallel/>*/}
          </div>
        </div>
      </Container>
    );
  }
}

export default App;
