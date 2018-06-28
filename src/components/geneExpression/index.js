// jshint esversion: 6
/* rc slider https://www.npmjs.com/package/rc-slider */

import React from "react";
import _ from "lodash";
import { connect } from "react-redux";
import HistogramBrush from "../brushableHistogram";
import CirclePlus from "react-icons/lib/fa/plus-circle";
import * as globals from "../../globals";
// import ReactAutocomplete from "react-autocomplete"; /* http://emilebres.github.io/react-virtualized-checkbox/ */
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
    userDefinedGenes: state.userDefinedGenes,
    colorAccessor: state.controls.colorAccessor,
    allGeneNames: state.controls.allGeneNames
  };
})
class GeneExpression extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      svg: null,
      ctx: null,
      axes: null,
      dimensions: null,
      gene: null
    };
  }

  componentDidMount() {}
  handleBrushAction(selection) {
    this.props.dispatch({
      type: "continuous selection using parallel coords brushing",
      data: selection
    });
  }
  handleColorAction(key) {
    return () => {};
    const indexOfGene = 0; /* we only get one, this comes from server as needed now */

    const expressionMap = {};
    /*
      converts [{cellname: cell123, e}, ...]

      expressionMap = {
        cell123: [123, 2],
        cell789: [0, 8]
      }
    */
    // _.each(data.data.cells, cell => {
    //   /* this action is coming directly from the server */
    //   expressionMap[cell.cellname] = cell.e;
    // });
    //
    // const minExpressionCell = _.minBy(data.data.cells, cell => {
    //   return cell.e[indexOfGene];
    // });
    //
    // const maxExpressionCell = _.maxBy(data.data.cells, cell => {
    //   return cell.e[indexOfGene];
    // });
    // dispatch({
    // type: "color by expression"
    //   gene: gene,
    //   colorAccessor: gene,
    //   data,
    //   expressionMap,
    //   minExpressionCell,
    //   maxExpressionCell,
    //   indexOfGene
    // });
  }

  render() {
    return (
      <div>
        <div style={{ marginLeft: 5, marginTop: 15 }}>
          <input
            onChange={e => {
              this.setState({ gene: e.target.value });
            }}
            type="text"
          />
          <button
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              outline: "none",
              margin: "0px 0px 0px 10px",
              padding: 0,
              position: "relative",
              top: -1
            }}
            onClick={() => {
              this.props.dispatch(actions.addUserDefinedGene(this.state.gene));
            }}
          >
            <CirclePlus
              style={{
                display: "inline-block",
                color: globals.brightBlue,
                fontSize: 22
              }}
            />{" "}
            <span style={{ position: "relative", top: 1, left: -2 }}>
              {" "}
              add gene{" "}
            </span>
          </button>
        </div>
        {_.map(this.props.userDefinedGenes.genes, (value, key) => {
          return (
            <HistogramBrush
              key={key}
              field={key}
              geneExpressionPerCell={value}
              handleColorAction={this.handleColorAction(key).bind(this)}
            />
          );
        })}
      </div>
    );
  }
}

export default GeneExpression;

// <ReactAutocomplete
//   items={this.props.allGeneNames}
//   shouldItemRender={(item, value) =>
//     item.toLowerCase().indexOf(value.toLowerCase()) > -1
//   }
//   getItemValue={item => item}
//   renderItem={(item, highlighted) => (
//     <div
//       key={item}
//       style={{
//         backgroundColor: highlighted ? "#eee" : "transparent"
//       }}
//     >
//       {item}
//     </div>
//   )}
//   value={this.state.value}
//   onChange={e => this.setState({ value: e.target.value })}
//   onSelect={value => {
//     this.setState({ value });
//     this.props.dispatch(
//       actions.requestSingleGeneExpressionCountsPOST(
//         value
//       )
//     );
//   }}
// />

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
