import { EventEmitter } from 'events';
import { spawn } from 'child_process';

interface AudioConfig {
    ffmpegPath: string;
    inputDevice: string;
    sampleRate: number;
    channels: number;
    format: string;
}

export class Audio extends EventEmitter {
    private config: AudioConfig;
    private process: any;
    private isCapturing: boolean = false;

    constructor(config: AudioConfig) {
        super();
        this.config = config;
    }

    public startCapture(): Promise<void> {
        return new Promise((resolve, reject) => {
            const args = [
                '-f', 'pulse',
                '-i', this.config.inputDevice,
                '-acodec', 'pcm_s16le',
                '-ar', this.config.sampleRate.toString(),
                '-ac', this.config.channels.toString(),
                '-f', this.config.format,
                '-'
            ];

            this.process = spawn(this.config.ffmpegPath, args);
            this.isCapturing = true;

            this.process.stdout.on('data', (data: Buffer) => {
                this.emit('audio', data);
            });

            this.process.stderr.on('data', (data: Buffer) => {
                this.emit('log', data.toString());
            });

            this.process.on('error', reject);
            this.process.on('exit', (code: number) => {
                this.isCapturing = false;
                if (code !== 0) reject(new Error(`FFmpeg exited with code ${code}`));
            });

            resolve();
        });
    }

    public stopCapture(): Promise<void> {
        return new Promise((resolve) => {
            if (this.process && this.isCapturing) {
                this.process.kill();
                this.process.on('exit', () => {
                    this.isCapturing = false;
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}
