'use strict';

const Store = require('orbit-db-store')
const GraphIndex = require('./GraphIndex')
const algos = require('./utils/algos')

function defaultEdgeId(source, target, id) {
  return `${source}:${target}:${id}`;
}

class GraphStore extends Store {

  constructor(ipfs, id, dbname, options) {
    let opts = Object.assign({}, { Index: GraphIndex })
    Object.assign(opts, options)
    super(ipfs, id, dbname, opts)
    this._type = GraphStore.type;

    if(options.addressIdentifier)
      this.addressIdentifier = options.addressIdentifier
    else
      this.addressIdentifier = defaultEdgeId
  }

  // All
  allVertices () {
    return this._index._vertexIndex
  }

  allEdges () {
    return this._index._edgeIndex
  }

  // Lookup
  getVertex (key) {
    return this._index.getVertex(key)
  }

  getEdge (from, to) {
    const key = this.edgeId(from, to)
    return this._index.getEdge(key)
  }

  // Creation
  createEdge (from, to, data) {
    if(!(this.hasVertex(from) && this.hasVertex(to)))
      throw new Error('Vertex does not exist!')

    //TODO: Check for uniqueness
    const key = this.edgeId(from, to);
    return this.put(key, data, "ADD_EDGE")
  }

  createVertex (key, data) {
    return this.put(key, data, "ADD_VERTEX")
  }

  // Deletion
  deleteVertex (key, data) {
    if(!this.hasVertex(key))
      throw new Error('Vertex does not exist.')

    return this.del(key, "REMOVE_VERTEX")
  }

  deleteEdge (from, to, data) {
    // TODO: Check if Edge has connecting nodes
    const key = this._edgeId(from, to);

    if (!this.hasEdge(key))
      throw new Error(`No entry with key '${key}' in the database`)

    return this.del(key, "REMOVE_EDGE")
  }

  // Updates
  updateVertex(key){
    return this.put(key, data, "UPDATE_VERTEX")
  }

  updateEdge(from, to, data){
    return this.put(key, data, "UPDATE_EDGE")
  }

  // Checks
  hasVertex(key){
    return this._index.getVertex(key) != null
  }

  hasEdge(from, to){
    const key = this.edgeId(from, to);
    return this._index.getEdge(key) != null
  }

  edgeId(source, target, id){
    return this.addressIdentifier(source, target, id);
  }

  // TODO: Optimize?
  getChildren(key){
    return Object.keys(this.allEdges()).map(e => { 
      if(e.split(':')[0] == key) {
        return e.split(':')[1]
      }
    }).filter(c => c != null)
  }

  // Uninformed Search using BFS
  simplePath(from, to, cutoff = Infinity) {
    return algos.BFS(from, to, this, cutoff);
  }

  unInformedPath(from, to, cutoff = Infinity) {
    return algos.biDirectionalSearch(from, to, this, cutoff)
  }

  //TODO: A* or other?
  // informedPath(from, to, cutoff = Infinity){

  // }

  put (key, data, operation) {
    return this._addOperation({
      op: operation,
      key: key,
      value: data
    })
  }

  del (key, operation) {
    return this._addOperation({
      op: operation,
      key: key,
      value: null
    })
  }

  /**
   * Iterate over nodes
   * @return {Array} - Each value yielded is a [key, value] pair.
   */
  *[Symbol.iterator]() {
    const vs = this._index._vertexIndex;
    for (const key in vs) {
        const value = this._index._vertexIndex[key];
        yield [key, value];
    }
  }

  static get type () {
    return 'GraphStore'
  }
}

module.exports = GraphStore