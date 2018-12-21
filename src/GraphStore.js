'use strict';

const Store = require('orbit-db-store')
const GraphIndex = require('./GraphIndex')
const utils = require('./utils/utils')
const uuid = require('uuid');

class GraphStore extends Store {

  /**
   * Instantiates a GraphStore
   *
   * @param     {IPFS}        ipfs            An IPFS instance
   * @param     {String}      dbname          The DB name
   * @return    {GraphStore}                self
   */
  constructor(ipfs, id, dbname, options) {
    let opts = Object.assign({}, { Index: GraphIndex })
    Object.assign(opts, options)
    super(ipfs, id, dbname, opts)
    this._type = GraphStore.type;

    if(options.addressIdentifier)
      this.addressIdentifier = options.addressIdentifier
    else
      this.addressIdentifier = utils.defaultEdgeId

    this._autoGenIds = options.genIds
  }

  /**
   *  Returns an object of all the vertices
   *
   *  @returns    {Object}      
   */
  allVertices () {
    return this._index._vertexIndex
  }

  /**
   *  Returns a mapping of all the edges
   *
   *  @returns    {Object}      
   */
  allEdges () {
    return this._index._edgeIndex
  }

  /**
   *  Returns a vertex
   *
   *  @param      {String}    key         The from node id
   *  @returns    {Object}                Returns the value from the mapping
   */
  getVertex (key) {
    return this._index.getVertex(key)
  }

  /**
   *  Returns an edge
   *
   *  @param      {String}    key         The from edge id
   *  @returns    {Object}                Returns the value from the mapping
   */
  getEdge (from, to, id) {
    const key = this.edgeId(from, to, id)
    return this._index.getEdge(key)
  }

  /**
   *  Creates an edge connecting 2 nodes with some metadata a vertex
   *
   *  @param      {String}    from        The from node id
   *  @param      {String}    to          The from node id
   *  @param      {String}    key         The from node id
   *  @returns    {Object}                Returns the value from the mapping
   */
  createEdge (from, to, data, id) {
    if(!(this.hasVertex(from)))
      throw new Error('Vertex does not exist!')

    let uid;

    // Unique id
    if(this._genIds)
      uid = id || uuid();

    const key = this.edgeId(from, to, uid);

    if(!(this.hasEdge(key)))
      throw new Error("Edge Exists, include a unique id")

    return this._put(key, data, "ADD_EDGE")
  }

  /**
   *  Creates a vertex connecting 2 nodes with some metadata a vertex
   *
   *  @param      {String}    key         The from node id
   *  @param      {Object}    data        The data
   *  @returns    {String}                Returns the multihash
   */
  createVertex (key, data) {
    if(this.hasVertex(key))
      throw new Error("Vertex already exists")

    return this._put(key, data, "ADD_VERTEX")
  }

  /**
   *  Deletes a vertex and checks if the vertex is a head 
   *  of an edge.
   *
   *  @param      {String}    key         The from node id
   *  @returns    {String}                Returns the multihash
   */
  deleteVertex (key) {
    if(!this.hasVertex(key))
      throw new Error('Vertex does not exist.')

    return this._del(key, "REMOVE_VERTEX")
  }

  /**
   *  Deletes an edge connecting 2 nodes.
   *
   *  @param      {String}    key         The from node id
   *  @returns    {String}                Returns the multihash
   */
  deleteEdge (from, to, id) {
    const key = this._edgeId(from, to, id);

    if (!this.hasEdge(key))
      throw new Error(`No entry with key '${key}' in the database`)

    return this._del(key, "REMOVE_EDGE")
  }

  /**
   *  Updates an edge connecting 2 nodes.
   *
   *  @param      {String}    key         The from node id
   *  @returns    {String}                Returns the multihash
   */
  updateVertex(key) {
    return this._put(key, data, "UPDATE_VERTEX")
  }

  /**
   *  Updates an edge connecting 2 nodes.
   *
   *  @param      {String}    from        The from node id
   *  @param      {String}    to          The to node id
   *  @returns    {String}                Returns the multihash
   */
  updateEdge(from, to, data) {
    return this._put(key, data, "UPDATE_EDGE")
  }

  // Checks
  hasVertex(key) {
    // if Gen id == false
    if(this._genIds){
      Object.keys(this.allEdges()).map(e => { 
        if(e.split(':')[0] == key || e.split(':')[1] == key) {
          return true;
        }
      })
      return false;
    }else{
      return this._index.getVertex(key) != null
    }
  }

  /**
   *  Queries whether 2 node have a connecting edge
   *  
   *  @param      {String}    from        The from node key
   *  @param      {String}    to          The to node key
   *  @param      {String}    id          the unique id for the edge (Optional)
   *  @returns    {Array} 
   */
  hasEdge(from, to, id) {
    if (!this.hasVertex(from))
      throw new Error(`No entry with key '${from}' in the database`)

    if (!this.hasVertex(to))
      throw new Error(`No entry with key '${to}' in the database`)

    const key = this.edgeId(from, to, id);
    return this._index.getEdge(key) != null
  }

  /**
   *  Computes a unique edgeId
   *  
   *  @param      {String}    source      The source node
   *  @param      {String}    target      The target node
   *  @param      {String}    id          The from node id
   *  @returns    {Array} 
   */
  edgeId(source, target, id) {
    return this.addressIdentifier(source, target, id);
  }

  /**
   *  Queries whether a node is an edge head
   *  
   *  @param      {String}    from        The from node id
   *  @returns    {Array} 
   */
  getChildren(key) {
    return Object.keys(this.allEdges()).map(e => { 
      if(e.split(':')[0] == key) {
        return e.split(':')[1]
      }
    }).filter(c => c != null)
  }

  /**
   *  Queries whether a node is an edge head
   *  
   *  @param      {String}    from        The from node id
   *  @returns    {Array} 
   */
  isEdgeHead(key) {
    Object.keys(this.allEdges()).map(e => { 
      if(e.split(':')[0] == key) {
        return true;
      }
    })
    return false;
  }

  /**
   *  Find path from a node to another node, 
   *  with an optional cutoff with the number of nodes searched.
   *  
   *  @param      {String}    from        The from node id
   *  @param      {String}    to          The to node id
   *  @param      {Number}    cutoff      The Cutoff value
   *  @returns    {Array}                 The path of the array
   */
  simplePath(from, to, cutoff = Infinity) {
    return utils.BFS(from, to, this, cutoff);
  }

  /**
   *  Iterate over nodes
   *  
   *  @returns    {Array} - Each value yielded is a [key, value] pair.
   */
  *[Symbol.iterator]() {
    const vs = this._index._vertexIndex;
    for (const key in vs) {
        const value = this._index._vertexIndex[key];
        yield [key, value];
    }
  }

  /**
   *  Add Operation with data
   *  
   *  @param     {String}    key          The key
   *  @param     {Object}    data         The value
   *  @param     {String}    operation    The name of the operation
   *  @returns   {Boolean}     the success of the operation
   */
  _put (key, data, operation) {
    return this._addOperation({
      op: operation,
      key: key,
      value: data
    })
  }

  /**
   *  Add Operation
   *  
   *  @param     {String}    key          The key
   *  @param     {String}    operation    The name of the operation
   *  @returns   {Boolean}     the success of the operation
   */
  _del (key, operation) {
    return this._addOperation({
      op: operation,
      key: key,
      value: null
    })
  }

  /**
   *  Returns Store type
   *  
   *  @returns   {String}     The name of the store as a string.
   */
  static get type () {
    return 'GraphStore'
  }
}

module.exports = GraphStore