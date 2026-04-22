import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { WhisperTranscriber } from './classes/WhisperTranscriber';
import * as path from 'path';
import * as fs from 'fs';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors({
  origin: "*",
}));
app.use(express.json());

// Ruta principal de prueba
app.get('/', (req, res) => {
  res.json({ message: 'Backend de transcripción con Whisper activo' });
});

// Ruta para transcribir
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió audio' });
  }

  console.log(`Audio recibido: ${req.file.path}, tamaño: ${req.file.size} bytes`);
  
  const inputPath = req.file.path;

  try {
    const transcriber = new WhisperTranscriber();
    const text = await transcriber.processAudio(inputPath);
    res.json({ transcription: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al transcribir el audio' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});