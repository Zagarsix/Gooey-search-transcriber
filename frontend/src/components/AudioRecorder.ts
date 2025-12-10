// Solo para grabar (máximo 45 segundos)
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  async startRecording(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType: 'audio/webm' });

    this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
    this.mediaRecorder.start();

    // Parar automáticamente a los 45 segundos
    this.timeoutId = setTimeout(() => {
      this.stopRecording();
    }, 45000);
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