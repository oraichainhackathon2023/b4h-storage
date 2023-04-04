import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';

import axios, { AxiosPromise, AxiosResponse } from 'axios';
const createTorrent = require("create-torrent");


export function prepareFileMetadata(folder: string, filename: string, action: string = "write", encryption: string = "no") {
  const content_type = mime.lookup(filename);
  const filePath = path.join(folder, filename);
  const fileInfo = fs.statSync(filePath);
  const content_length = fileInfo.size;
  const payload = { metadata: { content_length, content_type, filename, action, encryption } };
  // console.log("🚧 --> prepareFileMetadata --> payload", payload);
  return payload;
}

export async function createTorrentFile(filePath: string, webSeed: string) {
  return new Promise((resolve, reject) => {
    // console.log("filePath:", filePath);
    
    createTorrent(
      filePath,
      {
        private: true,
        announce: ["wss://tracker.eueno.io", "https://tracker.eueno.io/announce"],
        pieceLength: 104857600, //100MB
        urlList: webSeed,
      },
      async (err, torrent) => {
        if (err) {
          reject(err);
        }
        // console.log("torrent:", torrent);
        resolve(torrent);
      }
    );
  });
}

export const uploadToCloud = async (url: string, fileType: string, data: any) => {
  const config = {
    method: "PUT",
    url,
    headers: {
      "Content-Type": fileType,
    },
    data,
  };

  try {
    return axios(config);
  } catch (error) {
    console.log(error);
    return (error as { response: AxiosPromise<any> }).response;
  }
};

