import ffmpeg from 'fluent-ffmpeg';
import { AudioHandler } from './AudioHandler';
import * as path from 'path';
import * as fs from 'fs';

ffmpeg.setFfmpegPath('C:\\ffmpeg\\bin\\ffmpeg.exe');

export class AudioCompressor extends AudioHandler {
  async processAudio(inputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const fixedInputPath = inputPath + '.webm';
      if (!fs.existsSync(fixedInputPath)) {
        fs.renameSync(inputPath, fixedInputPath);
      }

      const outputPath = fixedInputPath.replace(/\.webm$/, '.mp3');
      const fileName = `audio_${Date.now()}.mp3`;

      console.log(`Comprimiendo: ${fixedInputPath} → ${outputPath}`);

      ffmpeg(fixedInputPath)
        .audioCodec('libmp3lame')
        .audioBitrate('64k')
        .outputOptions('-f mp3')
        .on('end', () => {
          console.log(`Compresión exitosa: ${outputPath}`);
          const buffer = fs.readFileSync(outputPath);
          this.saveAudioLocally(fileName, buffer);
          resolve(outputPath);
        })
        .on('error', (err: any) => {
          console.error('Error FFmpeg:', err.message);
          reject(err);
        })
        .save(outputPath);
    });
  }
}