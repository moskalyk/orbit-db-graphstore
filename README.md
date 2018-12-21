# GraphStore
Graph implemented with the OrbitDB distributed db, residing the data on IPFS. Valuable properties is that the database is an a CRDT.

options
```
{
	genId: {true|false}
	addressIdentifier: function(source, target, id);
}
```

## API
addEdge(from, to, id)
The head (i.e. from) vertex must exist, but the to vertex does not.

## Types of In-Memory Data Structure
Current implementation uses an Adjacency List (Implemented as 2 Javascript Associative Arrays). Viewed within the `GraphIndex.js` file.

__Adjacency list (Curent Implementation)__
Storage 	Add Vertex  Add Edge  	Query
O(|V|+|E|)  O(1)  		O(1) 	 	O(|V|)

__Adjacency matrix__
Storage 	Add Vertex  Add Edge  	Query
O(|V|^2)  	O(|V|^2)  	O(1)  		O(1)

Note: It has fast lookups to check for presence or absence

## Concurrent Add + remove


## Nodes Uniqueness
To ensure nodes and edges are unique, a default id function is used from uuid as v4.

_Node_:
_Id_:

## Path Finding Algorithm
__Uninformed:__
Search for graphs can be performed using the following methods: uniformed or informed. The default search method uses a bi-directional DFS (assuming that the graph network would be large). If the network is small and trivial, on average, fork and use a BFS.

BFS/DFS searching complexity would be O(b^d)
2 Simultaneous searchs would be O(b^{d/2}+b^{d/2})

__Informed Search:__
* Informed  accept a heuristic to find the path from A -> B

Currently assumes that the graph is directional when implementing an edge, which is only done within the path finding. By adding the type of relationship, one can specify whether this is a bi-directional directed edge.

Use cases:
The graph can be used to represent analysis on a p2p network. I.e. Network Analysis, Markov Chain, etc.

## Centrality Algorithms
TODO

##TODOs
* Create Unique Vertex IDs
* Graph CRDT Semantics
* Benchmarks
* Add Batch


