# cellxgene

### An interactive, performant explorer for single cell transcriptomics data.

<img align="right" width="350" height="218" src="./example-dataset/cellxgene-demo.gif" pad="50px">
cellxgene is an open-source experiment in how to bring powerful tools from modern web development to visualize and explore large single-cell transcriptomics datasets.
Started in the context of the Human Cell Atlas Consortium, cellxgene hopes to both enable scientists to explore their data and to equip developers with scalable, reusable patterns and frameworks for visualizing large scientific datasets.

## Features

* **Visualization at scale:** built with [WebGL](https://www.khronos.org/webgl/), [React](https://reactjs.org/) & [Redux](https://redux.js.org/) to handle visualization of at least 1 million cells.

* **Interactive exploration:** select, cross-filter, and compare subsets of your data with performant indexing and data handling.

* **Flexible API:** the cellxgene client-server model is designed to support a range of existing analysis packages for backend computational tasks (eg scanpy), integrated with client-side visualization via a [REST API](https://restfulapi.net/).


## Getting Started

**Requirements**
- OS: OSX, Windows, Linux -- the developers are currently testing on OSX and Windows (via WSL using Ubuntu). It should work on other platforms but if you are using something different and need help, please let us know. 
- python 3.6
- python3 tkinter 
- npm
- Google Chrome

**Clone project**

    git clone https://github.com/chanzuckerberg/cellxgene.git

**Install client**

    cd cellxgene
    ./bin/build-client

**To use with virtual env for python**
(optional, but recommended)

    ENV_NAME=cellxgene
    python3 -m venv ${ENV_NAME}
    source ${ENV_NAME}/bin/activate

**Install server**


     pip install -e .

**Run (with demo data)**

    cellxgene --title PBMC3K scanpy example-dataset/
*In google chrome, navigate to the viewer via the web address printed in your console.
E.g.,* `Running on http://0.0.0.0:5005/`

**Help**

    cellxgene --help
_For help with the scanpy engine_

    cellxgene scanpy --help

## Using your own data

### Scanpy

To prepare your data you will need to format your data into AnnData format using scanpy and calculate PCA and nearest neighbors and save in h5ad format.

1. [Load data into scanpy](https://scanpy.readthedocs.io/en/latest/api/index.html#reading)

	- Ensure that `obs`'s index is the cell names: `print(data.obs_names)` should show your cell indices. If it shows gene names, you may need to just call `data.transpose()`.

2. Calculate PCA

    sc.pp.pca(data) ## sc is scanpy.api

3. Calculate nearest neighbors  (depending on layout algorithm)

    ```
    # For umap layout algorithm, you need to use the "umap" method for neighbors
    sc.pp.neighbors(data, method="umap", metric="euclidean", use_rep="X_pca")

    # For tsne layout algorithm, you can use either "umap" or "gauss"; we recommend "gauss"
    sc.pp.neighbors(data, method="gauss", metric="euclidean", use_rep="X_pca")
    ```

4. Save file

    ```
    # cellxgene requires file to be named data.h5ad
    data.write("data.h5ad")
    ```

5. Create config file (optional)

	If you do not have a config file, the schema (metadata names, types, and categorical/continuous) will be inferred from the observations in the data file. Config file is required to be named 'data_schema.json' and located in the same directory as data file.
	- The config file is a JSON format file with information on the metadata associated with the cells. The key is the column name in obs. The value is an object
	```
    type: string, int, or float (what type the values are),
	  variabletype: categorical or continuous (categorical values are displayed as checkboxes, continuous values are displayed as a histogram)
	  displayname: (what the heading should be displayed as)
	  include: True/False (whether to display values on web interface)
	```

	```
	Example
    {
        "CellName": {
            "type": "string",
            "variabletype": "categorical",
            "displayname": "Name",
            "include": true
        },
        "clusters": {
            "type": "string",
            "variabletype": "categorical",
            "displayname": "Clusters",
            "include": true
        },
        "num_genes": {
            "type": "int",
            "variabletype": "continuous",
            "displayname": "Number Genes",
            "include": true
        }
    }
    ```

## Contributing
We warmly welcome contributions from the community. Please submit any bug reports and feature requests through github issues. Please submit any direct contributions via a branch + pull request.

## Inspiration and collaboration
We’ve been inspired by several other related efforts in this space, including the [UCSC Cell Browswer](http://cells.ucsc.edu/), [Cytoscape](http://www.cytoscape.org/), [Xena](https://xena.ucsc.edu/), [ASAP](https://asap.epfl.ch/), [Gene Pattern](http://genepattern-notebook.org/), & many others; we hope to explore collaborations where useful.

## Help/Contact
Please submit any help requests, suggestions, or comments as an issue in github. We'd love to hear from you!

## Reuse
This project was started with the sole goal of empowering the scientific community to explore and understand their data. As such, we whole-heartedly encourage other scientific tool builders to adopt the patterns, tools, and code from this project, and reach out to us with ideas or questions using Github Issues or Pull Requests. All code is freely available for reuse under the [MIT license](https://opensource.org/licenses/MIT).

*We thank Alex Wolf for the demo dataset.*
