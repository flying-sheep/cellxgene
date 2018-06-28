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
import { calcHistogram } from "./util";
import * as constants from "./constants";

@connect(state => {
  const initializeRanges =
    state.initialize.data && state.initialize.data.data.ranges
      ? state.initialize.data.data.ranges
      : null;

  const schema =
    state.initialize.data && state.initialize.data.data.schema
      ? state.initialize.data.data.schema
      : null;

  return {
    colorAccessor: state.controls.colorAccessor,
    colorScale: state.controls.colorScale,
    cellsMetadata: state.controls.cellsMetadata,
    initializeRanges,
    schema
  };
})
class HistogramBrush extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      svg: null,
      ctx: null,
      axes: null,
      dimensions: null,
      brush: null
    };
  }

  componentWillMount() {
    /*
      revisit this function.

      this isn't state because it doesn't change... we nuke left side bar and force
      a remount every time cells changes... if we stop doing that this pattern breaks
      which could be considered fragile... we could check on update if the length had changed etc
    */
    if (this.props.schema[this.props.field]) {
      /* this is an unfortunate branching spot and could live somewhere else / imply format or componetization changes
      we could do this above but really don't want to recompute every time... */
      const allValuesForContinuousFieldAsArray = _.map(
        this.props.cellsMetadata,
        this.props.field
      );
      this.histogramData = calcHistogram(
        this.props.ranges,
        allValuesForContinuousFieldAsArray
      );
    } else {
      /*
        we don't have a schema, so... we don't have ranges out of the box
      */
      const _ranges = d3.extent(this.props.geneExpressionPerCell, d => {
        return d.e[0];
      });
      const ranges = { max: _ranges[1], min: _ranges[0] };
      const allValuesForContinuousFieldAsArray = _.map(
        this.props.geneExpressionPerCell,
        d => {
          return d.e[0].toString();
        }
      );
      this.histogramData = calcHistogram(
        ranges,
        allValuesForContinuousFieldAsArray
      );
    }
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
    const x = this.histogramData.x;
    const y = this.histogramData.y;
    const bins = this.histogramData.bins;
    const numValues = this.histogramData.numValues;

    d3.select(svgRef)
      .insert("g", "*")
      .attr("fill", globals.brightBlue)
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
          "translate(0," + (constants.height - constants.marginBottom) + ")"
        )
        .call(d3.axisBottom(x).ticks(5))
        .append("text")
        .attr("x", constants.width - 2)
        .attr("y", -6)
        .attr("fill", "#000")
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .text(this.props.field);

      d3.select(svgRef)
        .selectAll(".axis--x text")
        .style("fill", "rgb(80,80,80)");
      d3.select(svgRef)
        .selectAll(".axis--x path")
        .style("stroke", "rgb(230,230,230)");
      d3.select(svgRef)
        .selectAll(".axis--x line")
        .style("stroke", "rgb(230,230,230)");

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
            // display: "inline-block",
            position: "relative",
            left: constants.width + 20,
            top: -29,
            cursor: "pointer"
          }}
        >
          <FaPaintBrush />
        </span>
        <svg
          width={constants.width}
          height={constants.height}
          ref={svgRef => {
            this.drawHistogram(svgRef);
          }}
        />
      </div>
    );
  }
}

export default HistogramBrush;
