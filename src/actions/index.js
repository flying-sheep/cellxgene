// jshint esversion: 6
import * as globals from "../globals";
import store from "../reducers";
import URI from "urijs";
import _ from "lodash";

const requestCells = (query = "") => {
  return dispatch => {
    dispatch({ type: "request cells started" });
    return fetch(`${globals.API.prefix}${globals.API.version}cells${query}`, {
      method: "get",
      headers: new Headers({
        "Content-Type": "application/json"
      })
    })
      .then(res => res.json())
      .then(
        data => dispatch({ type: "request cells success", data }),
        error => dispatch({ type: "request cells error", error })
      );
  };
};

/* SELECT */
const regraph = () => {
  return (dispatch, getState) => {
    dispatch({ type: "regraph started" });

    const state = getState();
    const selectedMetadata = {};

    _.each(state.controls.categoricalAsBooleansMap, (options, field) => {
      let atLeastOneOptionDeselected = false;

      _.each(options, (isActive, option) => {
        if (!isActive) {
          atLeastOneOptionDeselected = true;
        }
      });

      if (atLeastOneOptionDeselected) {
        _.each(options, (isActive, option) => {
          if (isActive) {
            if (selectedMetadata[field]) {
              selectedMetadata[field].push(option);
            } else if (!selectedMetadata[field]) {
              selectedMetadata[field] = [option];
            }
          }
        });
      }
    });

    let uri = new URI();
    uri.setSearch(selectedMetadata);
    console.log(uri.search(), selectedMetadata);

    dispatch(requestCells(uri.search())).then(res => {
      if (res.error) {
        dispatch({ type: "regraph error" });
      } else {
        dispatch({ type: "regraph success" });
      }
    });
  };
};

const resetGraph = () => {
  return (dispatch, getState) => {
    dispatch({ type: "reset graph" });
  };
};

const initialize = () => {
  return (dispatch, getState) => {
    dispatch({ type: "initialize started" });
    fetch(`${globals.API.prefix}${globals.API.version}initialize`, {
      method: "get",
      headers: new Headers({
        "Content-Type": "application/json"
      })
    })
      .then(res => res.json())
      .then(
        data => dispatch({ type: "initialize success", data }),
        error => dispatch({ type: "initialize error", error })
      );
  };
};

// This code defends against the case where /expression returns a cellname
// never seen before (ie, not returned by /cells).   This should not happen
// (see https://github.com/chanzuckerberg/cellxgene-rest-api/issues/34) but
// occasionally does.
//
function cleanupExpressionResponse(data) {
  const s = store.getState();
  const metadata = s.controls.allCellsMetadataMap;
  let errorFound = false;
  data.data.cells = _.filter(data.data.cells, cell => {
    if (!errorFound && !metadata[cell.cellname]) {
      errorFound = true;
      console.error(
        "Warning: /expression REST API returned unexpected cell names -- discarding surprises."
      );
    }
    return metadata[cell.cellname];
  });

  return data;
}

const requestGeneExpressionCounts = () => {
  return (dispatch, getState) => {
    dispatch({ type: "get expression started" });
    fetch(`${globals.API.prefix}${globals.API.version}expression`, {
      method: "get",
      headers: new Headers({
        accept: "application/json"
      })
    })
      .then(res => res.json())
      .then(data => cleanupExpressionResponse(data))
      .then(
        data => dispatch({ type: "get expression success", data }),
        error => dispatch({ type: "get expression error", error })
      );
  };
};

const requestSingleGeneExpressionCountsPOST = gene => {
  return (dispatch, getState) => {
    dispatch({ type: "get single gene expression for coloring started" });
    fetch(`${globals.API.prefix}${globals.API.version}expression`, {
      method: "POST",
      body: JSON.stringify({
        genelist: [gene]
      }),
      headers: new Headers({
        accept: "application/json",
        "Content-Type": "application/json"
      })
    })
      .then(res => res.json())
      .then(data => cleanupExpressionResponse(data))
      .then(
        data => {
          const indexOfGene = 0; /* we only get one, this comes from server as needed now */

          const expressionMap = {};
          /*
            converts [{cellname: cell123, e}, ...]

            expressionMap = {
              cell123: [123, 2],
              cell789: [0, 8]
            }
          */
          _.each(data.data.cells, cell => {
            /* this action is coming directly from the server */
            expressionMap[cell.cellname] = cell.e;
          });

          const minExpressionCell = _.minBy(data.data.cells, cell => {
            return cell.e[indexOfGene];
          });

          const maxExpressionCell = _.maxBy(data.data.cells, cell => {
            return cell.e[indexOfGene];
          });
          dispatch({
            type: "color by expression",
            gene: gene,
            data,
            expressionMap,
            minExpressionCell,
            maxExpressionCell,
            indexOfGene
          });
        },
        error =>
          dispatch({
            type: "get single gene expression for coloring error",
            error
          })
      );
  };
};

const addUserDefinedGene = gene => {
  return (dispatch, getState) => {
    dispatch({ type: "getting user defined gene started" });
    /* same api call as requestSingleGene... could be composed */
    fetch(`${globals.API.prefix}${globals.API.version}expression`, {
      method: "POST",
      body: JSON.stringify({
        genelist: [gene]
      }),
      headers: new Headers({
        accept: "application/json",
        "Content-Type": "application/json"
      })
    })
      .then(res => res.json())
      .then(data => cleanupExpressionResponse(data))
      .then(
        data =>
          dispatch({
            type: "add user defined gene",
            gene: gene,
            data
          }),
        error =>
          dispatch({
            type: "add user defined gene error",
            error
          })
      );
  };
};

const requestGeneExpressionCountsPOST = genes => {
  return (dispatch, getState) => {
    dispatch({ type: "get expression started" });
    fetch(`${globals.API.prefix}${globals.API.version}expression`, {
      method: "POST",
      body: JSON.stringify({
        genelist: genes
      }),
      headers: new Headers({
        accept: "application/json",
        "Content-Type": "application/json"
      })
    })
      .then(res => res.json())
      .then(data => cleanupExpressionResponse(data))
      .then(
        data => dispatch({ type: "get expression success", data }),
        error => dispatch({ type: "get expression error", error })
      );
  };
};

const requestDifferentialExpression = (celllist1, celllist2, num_genes = 7) => {
  return (dispatch, getState) => {
    dispatch({ type: "request differential expression started" });
    fetch(`${globals.API.prefix}${globals.API.version}diffexpression`, {
      method: "POST",
      body: JSON.stringify({
        celllist1,
        celllist2,
        num_genes
      }),
      headers: new Headers({
        accept: "application/json",
        "Content-Type": "application/json"
      })
    })
      .then(res => res.json())
      .then(
        data => {
          /* kick off a secondary action to get all expression counts for all cells now that we know what the top expressed are */
          dispatch(
            requestGeneExpressionCountsPOST(
              _.union(
                data.data.celllist1.topgenes,
                data.data.celllist2.topgenes
              ) // ["GPM6B", "FEZ1", "TSPAN31", "PCSK1N", "TUBA1A", "GPM6A", "CLU", "FCER1G", "TYROBP", "C1QB", "CD74", "CYBA", "GPX1", "TMSB4X"]
            )
          );
          /* then send the success case action through */
          return dispatch({
            type: "request differential expression success",
            data
          });
        },
        error =>
          dispatch({ type: "request differential expression error", error })
      );
  };
};

export default {
  initialize,
  requestCells,
  regraph,
  resetGraph,
  requestGeneExpressionCounts,
  requestGeneExpressionCountsPOST,
  requestSingleGeneExpressionCountsPOST,
  requestDifferentialExpression,
  addUserDefinedGene
};
