// jshint esversion: 6
/* rc slider https://www.npmjs.com/package/rc-slider */

import React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import HistogramBrush from "../continuous/histogramBrush";
import CirclePlus from "react-icons/lib/fa/plus-circle";
import * as globals from "../../globals";
import ReactAutocomplete from "react-autocomplete"; /* http://emilebres.github.io/react-virtualized-checkbox/ */
import actions from "../../actions/";

@connect(state => {
  const ranges =
    state.cells.cells && state.cells.cells.data.ranges
      ? state.cells.cells.data.ranges
      : null;
  const metadata =
    state.cells.cells && state.cells.cells.data.metadata
      ? state.cells.cells.data.metadata
      : null;

  const initializeRanges =
    state.initialize.data && state.initialize.data.data.ranges
      ? state.initialize.data.data.ranges
      : null;

  return {
    ranges,
    metadata,
    initializeRanges,
    colorAccessor: state.controls.colorAccessor,
    allGeneNames: state.controls.allGeneNames
  };
})
class Continuous extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      svg: null,
      ctx: null,
      axes: null,
      dimensions: null
    };
  }
  componentDidMount() {}
  componentWillReceiveProps(nextProps) {}

  componentDidMount() {}
  handleBrushAction(selection) {
    this.props.dispatch({
      type: "continuous selection using parallel coords brushing",
      data: selection
    });
  }
  handleColorAction(key) {
    this.props.dispatch({
      type: "color by continuous metadata",
      colorAccessor: key,
      rangeMaxForColorAccessor: this.props.initializeRanges[key].range.max
    });
  }

  render() {
    return (
      <div>
        {this.props.allGeneNames ? (
          <button
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              outline: "none",
              margin: "none",
              padding: 0
            }}
          >
            <ReactAutocomplete
              items={this.props.allGeneNames}
              shouldItemRender={(item, value) =>
                item.toLowerCase().indexOf(value.toLowerCase()) > -1
              }
              getItemValue={item => item}
              renderItem={(item, highlighted) => (
                <div
                  key={item}
                  style={{
                    backgroundColor: highlighted ? "#eee" : "transparent"
                  }}
                >
                  {item}
                </div>
              )}
              value={this.state.value}
              onChange={e => this.setState({ value: e.target.value })}
              onSelect={value => {
                this.setState({ value });
                this.props.dispatch(
                  actions.requestSingleGeneExpressionCountsForColoringPOST(
                    value
                  )
                );
              }}
            />
            <CirclePlus
              style={{
                display: "inline-block",
                color: globals.brightBlue,
                fontSize: 22
              }}
            />{" "}
            add gene{" "}
          </button>
        ) : null}
      </div>
    );
  }
}

export default Continuous;

// <div>
//   {_.map(this.props.ranges, (value, key) => {
//     const isColorField = key.includes("color") || key.includes("Color");
//     if (value.range && key !== "CellName" && !isColorField) {
//       return (
//         <HistogramBrush
//           key={key}
//           metadataField={key}
//           ranges={value.range}
//         />
//       );
//     }
//   })}
//   </div>
