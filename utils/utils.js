const IPFS = require("ipfs");

// Configuration for IPFS instance
const ipfsConfig = {
  repo: "/orbitdb/",
  EXPERIMENTAL: {
    pubsub: false
  },
  config: {
    Addresses: {
      Swarm: [
        // Use IPFS dev signal server
        "/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star"
      ]
    }
  }
};

const store = async () => {
  return new Promise((resolve, reject) => {
    // Create IPFS instance
    const ipfs = new IPFS(ipfsConfig);

    ipfs.on("error", e => console.error(e));
    ipfs.on("ready", async () => {
      try {
        resolve(ipfs);
      } catch (e) {
        reject(e);
      }
    });
  });
};

module.exports = store;