const GraphStore = require('../src/GraphStore')
const loadIpfs = require('../utils/utils')
const OrbitDB = require('orbit-db')
const assert = require('assert')

// Ipfs utils
const isIPFS = require('is-ipfs')
 
// Configuration for the database
const dbConfig = {
  // If database doesn't exist, create it
  create: true,
  // Don't wait to load from the network
  sync: false,
  // Load only the local version of the database
  localOnly: true,
  // Allow anyone to write to the database,
  // otherwise only the creator of the database can write
  admin: ["*"],
  write: ["*"]
};

let graphStore;

const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Graphstore', () => {
	before('should create vertices', async () => {
		const ipfs = await loadIpfs();

		OrbitDB.addDatabaseType(GraphStore.type, GraphStore)

		//TODO: fix create or load form db
		const orbitdb = new OrbitDB(ipfs, './orbit/graph' + Date.now());
		graphStore = await orbitdb.create('graph', GraphStore.type)
		await graphStore.load();
	});

	it('should create a store of type GraphStore', async () => {
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