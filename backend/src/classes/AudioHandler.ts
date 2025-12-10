import * as fs from 'fs';
import * as path from 'path';

export abstract class AudioHandler {
  protected audioDir = path.join(__dirname, '../../audios');

  constructor() {
    if (!fs.existsSync(this.audioDir)) {
      fs.mkdirSync(this.audioDir, { recursive: true });
    }
  }

  protected saveAudioLocally(fileName: string, data: Buffer) {
    const filePath = path.join(this.audioDir, fileName);
    fs.writeFileSync(filePath, data);
    console.log(`Audio guardado: ${filePath}`);
  }

  abstract processAudio(inputPath: string): Promise<string>;
}