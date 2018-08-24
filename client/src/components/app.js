// jshint esversion: 6
import React from "react";
import _ from "lodash";
import Helmet from "react-helmet";
import Container from "./framework/container";
import { connect } from "react-redux";
// import PulseLoader from "halogen/PulseLoader";

import LeftSideBar from "./leftsidebar";
import Legend from "./continuousLegend";
import Graph from "./graph/graph";
import * as globals from "../globals";
import actions from "../actions";

import SectionHeader from "./framework/sectionHeader";

@connect(state => {
  return {
    dataframe: state.dataframe
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

    this.props.dispatch(actions.doInitialDataLoad(window.location.search));

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
    return (
      <Container>
        <Helmet title="cellxgene" />
        {this.props.dataframe.loading ? (
          <div
            style={{
              position: "fixed",
              fontWeight: 500,
              top: window.innerHeight / 2,
              left: window.innerWidth / 2 - 50
            }}
          >
            loading cellxgene
          </div>
        ) : null}
        {this.props.dataframe.error ? "Error loading cells" : null}
        <div>
          {this.props.dataframe.loading ? null : <LeftSideBar />}
          <div
            style={{
              padding: 15,
              width: 1440 - 410 /* but responsive */,
              marginLeft: 350 /* but responsive */
            }}
          >
            {this.props.dataframe.loading ? null : <Graph />}

            <Legend />
            {}
          </div>
        </div>
      </Container>
    );
  }
}

export default App;

// <Joy data={this.state.expressions && this.state.expressions.data} />
