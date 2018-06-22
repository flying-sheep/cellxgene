// jshint esversion: 6
const UserDefinedGenes = (
  state = {
    genes: {},
    loading: null,
    error: null
  },
  action
) => {
  switch (action.type) {
    case "getting user defined gene started":
      return Object.assign({}, state, {
        loading: true,
        error: null
      });
    case "add user defined gene":
      console.log("action", action);
      return Object.assign({}, state, {
        error: null,
        loading: false,
        genes: Object.assign({}, state.genes, {
          [action.gene]: action.data.data.cells
        })
      });
    case "add user defined gene error":
      return Object.assign({}, state, {
        loading: false,
        error: action.data
      });
    default:
      return state;
  }
};

export default UserDefinedGenes;
