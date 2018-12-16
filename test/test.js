const GraphStore = require('../src/GraphStore')
const loadIpfs = require('../utils/utils');
const OrbitDB = require('orbit-db')

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Graphstore', () => {
	// this.timeout(5000);
	it('should create vertices', async () => {
		const ipfs = await loadIpfs();

		OrbitDB.addDatabaseType(GraphStore.type, GraphStore)

		//TODO: fix create or load form db
		const orbitdb = new OrbitDB(ipfs, './orbit/graph' + Date.now());
		 graphStore = await orbitdb.create('graph', GraphStore.type)
		await graphStore.load();
		console.log(graphStore.type)
		// done()
	// });

	// it('should create vertices', async () => {

		await graphStore.createVertex('howdie', { date: 1 });
	// 	assert(await graphStore.hasVertex('howdie'))
	// });

	// it('should create an edge', async () => {
		// Edge
		await graphStore.createVertex('ho', {date: 2});
		await graphStore.createEdge('howdie', 'ho', { weight: 1 });
		await graphStore.hasEdge('howdie', 'ho');
		const edge = await graphStore.getEdge('howdie', 'ho');
		const check = isIPFS.multihash('QmYjtig7VJQ6XsnUjqqJvj7QaMcCAwtrgNdahSiFofrE7o')
		// assert(check)
	// });

	// it('should return children of vertex', async () => {
	// 	// Edge
	// 	await graphStore.createEdge('howdie', 'ho', { weight: 1 });
	// 	const check = await graphStore.hasEdge('howdie', 'ho');
	// 	assert(check)
	// 	const multiCheck = await graphStore.getEdge('howdie', 'ho');
	// 	assert(multiCheck)
	// });

	// it('should delete an edge', async () => {
		// Delete does not work
		console.log(await graphStore.deleteVertex('howdie'));
		console.log('waiting...')
		await graphStore.load();
		
		await sleep(3000);
		// setTimeout(async () => {
		console.log(await graphStore.hasVertex('howdie'));
		console.log(await graphStore.hasVertex('howdie'));
		console.log(await graphStore.getVertex('howdie'));
			
		// }, 1000);
		// assert(multiCheck)
	}).timeout(5000)
});