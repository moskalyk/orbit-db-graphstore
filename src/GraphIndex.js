'use strict'

class GraphIndex {

  constructor() {
    this._vertexIndex = {}
    this._edgeIndex = {}
  }

  getEdge(key) {
    return this._edgeIndex[key]
  }

  getVertex(key) {
    return this._vertexIndex[key]
  }

  updateIndex(oplog) {
    const reducer = (handled, item) => {
      if(!handled.includes(item.payload.key)) {
        handled.push(item.payload.key)
        if(item.payload.op === 'ADD_VERTEX') {
          this._vertexIndex[item.payload.key] = item.payload.value
        } else if(item.payload.op === 'REMOVE_VERTEX') {
          delete this._vertexIndex[item.payload.key]
        } else if(item.payload.op === 'UPDATE_VERTEX') {
          this._vertexIndex[item.payload.key] = item.payload.value
        } else if(item.payload.op === 'ADD_EDGE') {
          this._edgeIndex[item.payload.key] = item.payload.value
        } else if(item.payload.op === 'REMOVE_EDGE') {
          delete this._edgeIndex[item.payload.key]
        } else if(item.payload.op === 'UPDATE_EDGE') {
          this._edgeIndex[item.payload.key] = item.payload.value
        }
      }
      return handled
    }

    oplog.values
      .slice()
      .reverse()
      .reduce(reducer, [])
  }
}

module.exports = GraphIndex