function traceBackPath (source, target, parents) {
	const path = []
	let current = target
	Object.keys(parents).forEach( key => {
    	path.push(current)
    	current = parents[current]
	})
	path.push(source)
	return path.reverse()
}

function defaultEdgeId(source, target, id) {
  return `${source}:${target}:${id}`;
}

async function BFS(source, target, graph, cutoff) {
	const queue = [source];
	const parents = {};
	while(queue.length > 0){
		const current = queue.shift();
		if (current == target)
			return traceBackPath(source, target, parents)
		const children = await graph.getChildren(current);
		children.forEach(child => {
			if(!(child in parents)){
				parents[child] = current
				queue.push(child)
				if(queue.length > cutoff) // Cuttoff
					throw new Error("Search Path Exceeded");
			}
		})
	}
	return []
}

module.exports = {
	BFS,
	defaultEdgeId
}


