import 'dotenv/config';
import { AudioCompressor } from './AudioCompressor';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class WhisperTranscriber extends AudioCompressor {
  async processAudio(inputPath: string): Promise<string> {
    console.log(`Iniciando transcripción desde: ${inputPath}`);

    try {
      const webmPath = inputPath + '.webm';
      const mp3Path = webmPath.replace(/\.webm$/, '.mp3');

      let compressedPath: string;

      if (fs.existsSync(mp3Path)) {
        console.log('Usando MP3 ya comprimido');
        compressedPath = mp3Path;
      }
      else {
        console.log('Comprimiendo ahora...');
        compressedPath = await super.processAudio(inputPath);
      }


      // Transcribir con el archivo MP3 (o webm si falló la compresión)
      const finalAudioPath = fs.existsSync(compressedPath) ? compressedPath : webmPath;
      console.log(`Enviando a Whisper: ${finalAudioPath}`);
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(finalAudioPath) as any,
        model: 'whisper-1',
        language: 'es', // Especificar el idioma español
        temperature: 0, // Menor temperatura para mayor precisión
        prompt: 'Transcribe el audio en español de la mejor manera posible.',
      });
      console.log('Transcripción exitosa:', transcription.text);

      // Limpieza final
      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      if (fs.existsSync(webmPath)) fs.unlinkSync(webmPath);
      if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);

      return transcription.text.trim();


    } catch (error: any) {
      console.error('Error en Whisper:', error.message);
      throw error;
    }
  }
}