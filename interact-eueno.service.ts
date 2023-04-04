import { ConfigService } from "@nestjs/config";
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';
import { prepareFileMetadata, createTorrentFile, uploadToCloud } from './helper';
import { clientAddPromise, fileGetBufferPromise } from "./torrent-utils";
import axios, { AxiosPromise, AxiosResponse } from 'axios';
import { ConfigVariables, EuenoConfig } from "config/config-variables";
import { Injectable } from "@nestjs/common";

// axios.defaults.baseURL = "https://developers.eueno.io";
// axios.defaults.headers.common["x-api-project-key"] = process.env.BUCKET_KEY;

@Injectable()
export class InteractEuenoService {
  private readonly euenoConfig: EuenoConfig;

  constructor(config: ConfigService) {
    this.euenoConfig = config.get<EuenoConfig>('eueno')!;
  }

  async requestAuthUpload(folder, filename) {
    const payload = prepareFileMetadata(folder, filename);
    axios.defaults.headers.common["x-api-project-key"] = this.euenoConfig.key.bucketKey;
    try {
      const response = (await axios.post(
        this.euenoConfig.domain.backend + this.euenoConfig.route.requestAuthUpload,
        payload
      )).data;
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async uploadFileContent(url_upload_file, folder, filename) {
    const content_type = mime.lookup(filename);
    const data = fs.readFileSync(path.join(folder, filename));
    try {
      return uploadToCloud(url_upload_file, content_type, data);
    } catch (error) {
      console.error(error);
      return (error as { response: Promise<AxiosResponse<any, any>> }).response;
    }
  }

  async uploadFileTorrent(url_upload_torrent, webSeed, folder, filename) {
    try {
      const torrent = await createTorrentFile(path.join(folder, filename), webSeed);
      // console.log("🚧 --> uploadFileTorrent --> torrent", torrent);
      const content_type = "application/x-bittorrent";
      return uploadToCloud(url_upload_torrent, content_type, torrent);
    } catch (error) {
      console.error(error);
      return (error as { response: Promise<AxiosResponse<any, any>> }).response;
    }
  }


  async uploadFileToEueno(folder, filename) {
    // console.log(folder, filename);
    try {
      const reqAuthUploadRes = await this.requestAuthUpload(folder, filename);
      // console.log("🚧 --> test --> reqAuthUploadRes", reqAuthUploadRes);
      console.log(reqAuthUploadRes.torrent_url)
      const uploadFileRes = await this.uploadFileContent(reqAuthUploadRes.url_upload_file, folder, filename);
      // console.log("🚧 --> test --> uploadFileRes", uploadFileRes.data);
      const uploadTorrentRes = await this.uploadFileTorrent(
        reqAuthUploadRes.url_upload_torrent,
        reqAuthUploadRes.webseed,
        folder,
        filename
      );
      // console.log("🚧 --> test --> uploadTorrentRes", uploadTorrentRes.data);
      return { torrent_url: reqAuthUploadRes.torrent_url, webseed: reqAuthUploadRes.webseed };
    } catch (error) {
      console.error(error);
      return (error as { response: {torrent_url: string, webseed: Array<string>} }).response;
    }
  }

  async readFileFromEuenoByTorrentProtocol(torrent_url) {
    const torrentFile = await clientAddPromise(torrent_url);
    const buffer: Buffer = (await fileGetBufferPromise(torrentFile!["files"][0])) as Buffer;
    return buffer;
  }
  
  async readFileFromEuenoByWebseed(webseed: string) {
    return axios.get(webseed[0]);
  }

  
}





