// Solo para grabar (máximo 7 segundos)
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private onTimeUpdate?: (seconds: number) => void;

  async startRecording(onTimeUpdate?: (seconds: number) => void): Promise<void> {
    this.onTimeUpdate = onTimeUpdate;
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'audio/webm' });

    this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
    this.mediaRecorder.start();

    // Timer para mostrar tiempo transcurrido
    let seconds = 0;
    const timer = setInterval(() => {
      seconds++;
      this.onTimeUpdate?.(seconds);
      if (seconds >= 7) {
        this.stopRecording();
        clearInterval(timer);
      }
    }, 1000);

    // Parar automáticamente después de 7 segundos
    this.timeoutId = setTimeout(() => {
      if (this.mediaRecorder?.state === 'recording') {
        this.stopRecording();
      }
    }, 7000);
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder) return resolve(new Blob());

      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        this.chunks = [];
        this.stream?.getTracks().forEach(t => t.stop());
        if (this.timeoutId) clearTimeout(this.timeoutId);
        resolve(blob);
      };

      if (this.mediaRecorder!.state === 'recording') {
        this.mediaRecorder!.stop();
      }
    });
  }
}