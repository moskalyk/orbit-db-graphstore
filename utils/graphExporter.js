
async function toGraphVis(graphStore) {

	const graph = {
		nodes: [],
		edges: []
	}

	const vertices = await graphStore.getVertices();
	const edges = await graphStore.getEdges();

	//Nodes
	for(let v of vertices){
		graph.nodes.push({id: v, node: v});
	}

	//Edges
	for(let e of edges){
		graph.edges.push({ from: e.from, to: e.to })
	}

	return graph
}

//TODO
async function toGraphML(graph){

}

async function toConsole(graph){
	const v = await graph.allVertices();

	v.map(async (vertex) => {
	    return (vertex + ' -> ' + (await graph.getEdges())[vertex].join(', ')).trim();
	  }, this).join(' | '));
	};
}

module.exports = {
	toGraphVis,
	toGraphML,
	toConsole
}