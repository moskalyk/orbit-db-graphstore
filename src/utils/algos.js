
function isIntersecting (fromVisited, toVisited, vertices){
	for (var i = vertices.length - 1; i >= 0; i--) {
		if(fromVisited[i] && toVisited[i]) 
            return true
	}
	return false
}

function traceBackPath (source, target, parents) {
	const path = []
	let current = target
	for (let key in Object.keys(parents)){
    	path.push(current)
    	current = parents[current]
	}
	path.push(source)
	return path.reverse()
}
	// TODO: Implement cuttoff
async function BFS(source, target, graph, cutoff) {
	const queue = [source];
	const parents = {};
	while(queue.length > 0){
		const current = queue.shift();
		if (current == target)
			return traceBackPath(source, target, parents)

		const children = await graph.getChildren(current);
		for(let child of children){
			if(!(child in parents)){
				parents[child] = current
				queue.push(child)
			}
		}
	}
	return []
}

function biDirectionalSearch(from, to, search = this.BFS) {
	console.log('Running BiDirectional Search');
	// TODO
}

module.exports = {
	BFS,
	biDirectionalSearch
}


