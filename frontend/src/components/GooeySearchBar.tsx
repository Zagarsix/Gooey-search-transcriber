import { useState, useRef } from 'react';
import { AudioRecorder } from './AudioRecorder';
import './GooeySearchBar.css';

export default function GooeySearchBar() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [query, setQuery] = useState('');
  const recorderRef = useRef<AudioRecorder | null>(null);

  const toggleRecording = async () => {
    if (!recorderRef.current) {
      recorderRef.current = new AudioRecorder();
    }

    if (isRecording) {
      setIsRecording(false);
      const blob = await recorderRef.current.stopRecording();

      const formData = new FormData();
      formData.append('audio', blob, 'voice.webm');

      try {
        const res = await fetch('http://localhost:5000/transcribe', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        setTranscription(data.transcription);
        setQuery(data.transcription);
      } catch (err) {
        setTranscription('Error de conexión con el servidor');
      }
    } else {
      setIsRecording(true);
      await recorderRef.current.startRecording();
    }
  };

  return (
    <div className="gooey-container">
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Habla o escribe para buscar..."
          className="search-input"
        />
        <button onClick={toggleRecording} className={`mic-button ${isRecording ? 'recording' : ''}`}>
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path fill="white" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3s-3 1.34-3 3v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5h-2c0 3.53 2.61 6.43 6 6.92V22h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </button>
      </div>

      {isRecording && <p style={{color: 'white', marginTop: '20px'}}>Grabando... (máx 45 segundos)</p>}

      {transcription && (
        <div className="transcription-result">
          {transcription}
        </div>
      )}

      <svg className="gooey-filter">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur"/>
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo"/>
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
          </filter>
        </defs>
      </svg>
    </div>
  );
}