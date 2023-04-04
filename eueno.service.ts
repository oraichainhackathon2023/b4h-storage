import { InteractEuenoService } from './interact-eueno.service';
import { Injectable, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { BSignService } from '../../bsign/bsign.service';
import * as fs from 'fs';
import FormData from 'form-data';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class EuenoService {
  constructor(
    private readonly interactEuenoService: InteractEuenoService,
  ) // private readonly BSignService: BSignService,
  {}

  async uploadFile(folderPath: string, fileName: string) {
    const result = await this.interactEuenoService.uploadFileToEueno(
      folderPath,
      fileName,
    );
    return result;
  }

  async readFileFromEuenoByTorrentProtocol(torrentUrl: string) {
    const result =
      Buffer.from(await this.interactEuenoService.readFileFromEuenoByTorrentProtocol(
        torrentUrl,
      ))
    
    return result;
  }
}
