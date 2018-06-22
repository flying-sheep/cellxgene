// jshint esversion: 6
/* rc slider https://www.npmjs.com/package/rc-slider */

import React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import HistogramBrush from "./histogramBrush";

import { margin, width, height, createDimensions } from "./util";

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
    colorScale: state.controls.colorScale,
    graphBrushSelection: state.controls.graphBrushSelection,
    axesHaveBeenDrawn: state.controls.axesHaveBeenDrawn
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
  handleColorAction(key) {
    return () => {
      this.props.dispatch({
        type: "color by continuous metadata",
        colorAccessor: key,
        rangeMaxForColorAccessor: this.props.initializeRanges[key].range.max
      });
    };
  }

  render() {
    return (
      <div>
        {_.map(this.props.ranges, (value, key) => {
          const isColorField = key.includes("color") || key.includes("Color");
          if (value.range && key !== "CellName" && !isColorField) {
            return (
              <HistogramBrush
                key={key}
                field={key}
                ranges={value.range}
                handleColorAction={this.handleColorAction(key).bind(this)}
              />
            );
          }
        })}
      </div>
    );
  }
}

export default Continuous;

// <SectionHeader text="Continuous Metadata"/>
