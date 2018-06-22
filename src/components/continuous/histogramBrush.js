/*
https://bl.ocks.org/mbostock/4341954
https://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
https://bl.ocks.org/SpaceActuary/2f004899ea1b2bd78d6f1dbb2febf771
*/
// jshint esversion: 6
import React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import FaPaintBrush from "react-icons/lib/fa/paint-brush";
import * as globals from "../../globals";

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
    colorAccessor: state.controls.colorAccessor,
    colorScale: state.controls.colorScale,
    cellsMetadata: state.controls.cellsMetadata,
    initializeRanges
  };
})
class HistogramBrush extends React.Component {
  constructor(props) {
    super(props);

    this.width = 300;
    this.height = 100;
    this.marginBottom = 20;
    this.histogramCache = {};

    this.state = {
      svg: null,
      ctx: null,
      axes: null,
      dimensions: null,
      brush: null
    };
  }

  componentWillMount() {
    this.calcHistogramCache(this.props);
  }
  calcHistogramCache(nextProps) {
    // cache
    const allValuesForContinuousFieldAsArray = _.map(
      nextProps.cellsMetadata,
      nextProps.field
    );

    this.histogramCache.x = d3
      .scaleLinear()
      .domain([nextProps.ranges.min, nextProps.ranges.max])
      .range([0, this.width]);

    this.histogramCache.y = d3
      .scaleLinear()
      .range([this.height - this.marginBottom, 0]);
    // .range([height - margin.bottom, margin.top]);

    this.histogramCache.bins = d3
      .histogram()
      .domain(this.histogramCache.x.domain())
      .thresholds(40)(allValuesForContinuousFieldAsArray);

    this.histogramCache.numValues = allValuesForContinuousFieldAsArray.length;
  }
  onBrush(selection, x) {
    return () => {
      if (d3.event.selection) {
        this.props.dispatch({
          type: "continuous metadata histogram brush",
          selection: this.props.field,
          range: [x(d3.event.selection[0]), x(d3.event.selection[1])]
        });
      } else {
        this.props.dispatch({
          type: "continuous metadata histogram brush",
          selection: this.props.field,
          range: null
        });
      }
    };
  }
  drawHistogram(svgRef) {
    const x = this.histogramCache.x;
    const y = this.histogramCache.y;
    const bins = this.histogramCache.bins;
    const numValues = this.histogramCache.numValues;

    d3
      .select(svgRef)
      .insert("g", "*")
      .attr("fill", "#bbb")
      .selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
      .attr("x", function(d) {
        return x(d.x0) + 1;
      })
      .attr("y", function(d) {
        return y(d.length / numValues);
      })
      .attr("width", function(d) {
        return Math.abs(x(d.x1) - x(d.x0) - 1);
      })
      .attr("height", function(d) {
        return y(0) - y(d.length / numValues);
      });

    if (!this.state.brush && !this.state.axis) {
      const brush = d3
        .select(svgRef)
        .append("g")
        .attr("class", "brush")
        .call(
          d3
            .brushX()
            .on("end", this.onBrush(this.props.field, x.invert).bind(this))
        );

      const xAxis = d3
        .select(svgRef)
        .append("g")
        .attr("class", "axis axis--x")
        .attr(
          "transform",
          "translate(0," + (this.height - this.marginBottom) + ")"
        )
        .call(d3.axisBottom(x).ticks(5))
        .append("text")
        .attr("x", this.width - 2)
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .text(this.props.field);

      this.setState({ brush, xAxis });
    }
  }
  render() {
    return (
      <div
        style={{ marginTop: 10, position: "relative" }}
        id={"histogram_" + this.props.field}
      >
        <span
          onClick={this.props.handleColorAction}
          style={{
            fontSize: 16,
            marginLeft: 4,
            // padding: this.props.colorAccessor === this.props.field ? 3 : "auto",
            borderRadius: 3,
            color:
              this.props.colorAccessor === this.props.field
                ? globals.brightBlue
                : "black",
            // backgroundColor: this.props.colorAccessor === this.props.field ? globals.brightBlue : "inherit",
            display: "inline-block",
            position: "relative",
            left: this.width,
            top: this.height - 22,
            cursor: "pointer"
          }}
        >
          <FaPaintBrush />
        </span>
        <svg
          width={this.width}
          height={this.height}
          ref={svgRef => {
            this.drawHistogram(svgRef);
          }}
        />
      </div>
    );
  }
}

export default HistogramBrush;
