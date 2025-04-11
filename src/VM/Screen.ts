import { EventEmitter } from 'events';
import { spawn } from 'child_process';

interface ScreenConfig {
    width: number;
    height: number;
    fps: number;
    ffmpegPath: string;
    inputSource: string;
}

export class Screen extends EventEmitter {
    private config: ScreenConfig;
    private process: any;
    private isCapturing: boolean = false;

    constructor(config: ScreenConfig) {
        super();
        this.config = config;
    }

    public startCapture(): Promise<void> {
        return new Promise((resolve, reject) => {
            const args = [
                '-f', this.config.inputSource,
                '-framerate', this.config.fps.toString(),
                '-video_size', `${this.config.width}x${this.config.height}`,
                '-i', ':0.0',
                '-f', 'rawvideo',
                '-pix_fmt', 'rgb24',
                '-'
            ];

            this.process = spawn(this.config.ffmpegPath, args);
            this.isCapturing = true;

            this.process.stdout.on('data', (data: Buffer) => {
                this.emit('frame', data);
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
