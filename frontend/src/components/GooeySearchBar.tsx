import { useState, useRef } from 'react';
import { AudioRecorder } from './AudioRecorder';
import './GooeySearchBar.css';

export default function GooeySearchBar() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [query, setQuery] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);
  const recorderRef = useRef<AudioRecorder | null>(null);

  const toggleRecording = async () => {
    if (!recorderRef.current) {
      recorderRef.current = new AudioRecorder();
    }

    if (isRecording) {
      setIsRecording(false);
      setRecordingTime(0);
      setQuery('');
      const blob = await recorderRef.current.stopRecording();

      const formData = new FormData();
      formData.append('audio', blob, 'voice.webm');

      try {
        const res = await fetch(import.meta.env.VITE_BACKEND_HOST+'/transcribe', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.transcription) {
          setTranscription(data.transcription);
          setQuery(data.transcription);
        }
      } catch (err) {
        setTranscription('Error de conexión o sin créditos OpenAI');
        alert('Error de conexión o sin créditos OpenAI');
      }
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      setQuery('');
      setTranscription('');
      await recorderRef.current.startRecording((seconds) => {
        setRecordingTime(seconds);
      });
    }
  };

  // Placeholder dinámico
  const getPlaceholder = () => {
    if (isRecording) {
      return `Grabando... ${recordingTime}s`;
    }
    return 'Buscar o hablar...';
  };

  return (
    <div className="gooey-container">
      <div className="search-bar-stack">
        {/* Capa Gooey */}
        <div className="gooey-layer">
          <div className={`bar-shape ${isRecording ? 'recording' : ''}`} />
          <div className={`button-shape ${isRecording ? 'recording' : ''}`} />
        </div>

        {/* Capa de contenido */}
        <div className="content-layer">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getPlaceholder()}
            className="search-input"
            readOnly={isRecording}
          />

          <button
            onClick={toggleRecording}
            className="mic-button-trigger"
            aria-label={isRecording ? "Detener grabación" : "Iniciar grabación"}
          >
            <svg viewBox="0 0 24 24">
              <path fill="white" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3s-3 1.34-3 3v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5h-2c0 3.53 2.61 6.43 6 6.92V22h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
        </div>
      </div>

      {transcription && (
        <div className="transcription-result">
          {transcription}
        </div>
      )}

      {/* Filtro Gooey */}
      <svg className="gooey-svg">
        <defs>
          <filter id="gooey">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
