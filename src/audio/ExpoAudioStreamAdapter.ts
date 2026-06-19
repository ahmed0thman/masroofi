import { AudioModule } from 'expo-audio';
import type {
  AudioStreamInterface,
  AudioStreamConfig,
  AudioStreamData,
} from 'whisper.rn/realtime-transcription/index.js';

export class ExpoAudioStreamAdapter implements AudioStreamInterface {
  private stream: InstanceType<typeof AudioModule.AudioStream> | null = null;
  private dataCallback: ((data: AudioStreamData) => void) | undefined;
  private errorCallback: ((error: string) => void) | undefined;
  private statusCallback: ((isRecording: boolean) => void) | undefined;

  async initialize(config: AudioStreamConfig): Promise<void> {
    await this.release();

    this.stream = new AudioModule.AudioStream({
      sampleRate: config.sampleRate ?? 16000,
      channels: config.channels ?? 1,
      encoding: 'int16',
    });

    this.stream.addListener('audioStreamBuffer', (buffer) => {
      if (!this.dataCallback) return;
      this.dataCallback({
        data: new Uint8Array(buffer.data),
        sampleRate: buffer.sampleRate,
        channels: buffer.channels,
        timestamp: Date.now(),
      });
    });

    this.stream.addListener('audioStreamStatus', (status) => {
      this.statusCallback?.(status.isStreaming);
    });
  }

  async start(): Promise<void> {
    if (!this.stream) throw new Error('AudioStream not initialized');
    await this.stream.start();
  }

  async stop(): Promise<void> {
    this.stream?.stop();
  }

  isRecording(): boolean {
    return this.stream?.isStreaming ?? false;
  }

  onData(callback: (data: AudioStreamData) => void): void {
    this.dataCallback = callback;
  }

  onError(callback: (error: string) => void): void {
    this.errorCallback = callback;
  }

  onStatusChange(callback: (isRecording: boolean) => void): void {
    this.statusCallback = callback;
  }

  async release(): Promise<void> {
    if (this.stream) {
      this.stream.stop();
      this.stream = null;
    }
    this.dataCallback = undefined;
    this.errorCallback = undefined;
    this.statusCallback = undefined;
  }
}
