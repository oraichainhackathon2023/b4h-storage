import { WEB_TORRENT_TIMEOUT } from "src/assets/constants";
const WebTorrent = require("webtorrent-hybrid");

export async function clientAddPromise(torrentId: string) {
  return new Promise((resolve, reject) => {
    const client = new WebTorrent();

    client.on("error", (e) => {
      client.destroy();
      reject(`client.on_error: error: ${e}`);
    });

    let torrent = client.get(torrentId) ?? client.add(torrentId);

    torrent.on("done", () => {
      resolve(torrent);
    });

    torrent.on("error", (err) => {
      reject(`torrent.on --> err: ${err}`);
    });

    setTimeout(() => {
      if (torrent.progress === 0) reject(`Load ${torrentId} timeout!`);
    }, Number(WEB_TORRENT_TIMEOUT) * 1000 || 10000);
  });
}

export async function fileGetBufferPromise(torrentFile) {
  
  return new Promise((resolve, reject) => {
    torrentFile.getBuffer((err, buffer) => {
      if (err) {
        reject(`fileGetBufferPromise: ${err}`);
      } else resolve(buffer);
    });
  });
}

