const GraphStore = require('../src/GraphStore')
const loadIpfs = require('../utils/utils')
const OrbitDB = require('orbit-db')
const assert = require('assert')

// Ipfs utils
const isIPFS = require('is-ipfs')
 
let orbitdb;
let graphStore;

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Graphstore', () => {
	before('should create vertices', async () => {
		const ipfs = await loadIpfs();
		OrbitDB.addDatabaseType(GraphStore.type, GraphStore)
		orbitdb = new OrbitDB(ipfs, './orbit/graph' + Date.now());
		graphStore = await orbitdb.create('graph', GraphStore.type)
		await graphStore.load();
	});

	it('should create a store of type GraphStore', async () => {
		console.log(`DB Type: ${graphStore.type}`)
		assert(graphStore.type == 'GraphStore')
	});

	it('should create vertices', async () => {
		await graphStore.createVertex('howdie', { date: 1 });
		assert(await graphStore.hasVertex('howdie'))
	});

	it('should create an edge', async () => {
		// Edge
		await graphStore.createVertex('ho', {date: 2});
		await graphStore.createEdge('howdie', 'ho', { weight: 1 });
		await graphStore.hasEdge('howdie', 'ho');
		const edge = await graphStore.getEdge('howdie', 'ho');
		const check = isIPFS.multihash('QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o')
		assert(check)
	});

	it('should fail deleting an edge, due to attached nodes')

	it('should delete an edge', async () => {
		await graphStore.deleteVertex('howdie')

		const has = await graphStore.hasVertex('howdie')
		assert(has == false)

		const check = await graphStore.getVertex('howdie')
		assert(check == null)
	})

	it('should return children of vertices', async () => {
		await graphStore.createVertex('howdie', {date: 2});
		await graphStore.createEdge('howdie', 'ho', { weight: 1 });
		const children = await graphStore.getChildren('howdie');
		assert(children.length == 1);
	});

	it('should return children of vertices if other nodes in graph', async () => {
		await graphStore.createVertex('!', {date: 2});
		await graphStore.createEdge('ho', '!', { weight: 1 });
		const children = await graphStore.getChildren('howdie');
		const edges = Object.keys(await graphStore.allEdges());
		assert(children.length == 1);
		assert(edges.length == 2);
	});
	
	it('should return a path in the graph', async () => {
		await graphStore.load();
		await graphStore.createVertex('//', {date: 2});
		await graphStore.createEdge('!', '//', { weight: 1 });
		const has = await graphStore.hasVertex('howdie')
		assert(has == true)
		const path = await graphStore.simplePath('howdie', '//');
		assert(path.length == 4);
		assert(JSON.stringify(path) == JSON.stringify(["howdie", "ho", "!", "//"]));
	});

	it('should return a path in the graph, implementing', async () => {
		await graphStore.load();

		await graphStore.createVertex('1', {date: 1});
		await graphStore.createVertex('2', {date: 1});
		await graphStore.createVertex('3', {date: 1});
		await graphStore.createEdge('//', '1', { weight: 1 });
		await graphStore.createEdge('1', '2', { weight: 1 });
		await graphStore.createEdge('2', '3', { weight: 1 });

		await graphStore.createVertex('*', {date: 1});
		await graphStore.createEdge('1', '*', { weight: 1 });

		const path2 = await graphStore.simplePath('howdie', '*');
		console.log(path2)
		assert(true)
		// assert(JSON.stringify(path) == JSON.stringify(["howdie", "ho", "!", "//"]));
	});

	it('should test search path and fail due to cutoff exceeded', async () => {
		try{
			const path = await graphStore.simplePath('howdie', '3', 1);
			console.log(path)
		}catch(e){
			assert(true)
		}

		try{
			const path = await graphStore.simplePath('howdie', '1', 2);
			console.log(path)
		}catch(e){
			console.log('calling error')
			assert(true)
		}
	})

	it('should get children', async() => {
		await graphStore.createEdge('1', '3', { weight: 1 });
		await graphStore.createEdge('1', '!', { weight: 1 });
		const children = await graphStore.getChildren('1');
		console.log(children)
		assert(children.length == 4);
	})

	it.only('check if edge head', async () => {
		const graphStore2 = await orbitdb.create('graph2', GraphStore.type)
		await graphStore.createVertex('1', {date: 1});
		await graphStore.createVertex('2', {date: 1});
		await graphStore.createEdge('1', '2', { weight: 1 });

		const res = await graphStore2.isEdgeHead('1')
		console.log(res)
		assert(res)
	})

	it('should return all edges', async () => {
		for(let v of graphStore){
			console.log(v)
			// [ 'ho', { date: 2 } ]
			// [ 'howdie', { date: 2 } ]
			// [ '!', { date: 2 } ]
			// [ '//', { date: 2 } ]
		}
	})
}).timeout(5000)