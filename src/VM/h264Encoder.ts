import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

interface H264EncoderConfig {
    ffmpegPath: string;
    inputFormat: string;
    width: number;
    height: number;
    framerate: number;
    preset?: string;
    crf?: number;
    tune?: string;
}

export class H264Encoder extends EventEmitter {
    private process: ChildProcess | null = null;
    private config: H264EncoderConfig;

    constructor(config: H264EncoderConfig) {
        super();
        this.config = {
            preset: 'ultrafast',
            crf: 23,
            tune: 'zerolatency',
            ...config
        };
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            const args = this.buildFFmpegArgs();
            
            this.process = spawn(this.config.ffmpegPath, args);
            
            this.process.stdout.on('data', (data) => {
                this.emit('data', data);
            });

            this.process.stderr.on('data', (data) => {
                this.emit('log', data.toString());
            });

            this.process.on('error', (err) => {
                reject(new Error(`FFmpeg error: ${err.message}`));
            });

            this.process.on('exit', (code) => {
                if (code !== 0 && code !== null) {
                    reject(new Error(`FFmpeg exited with code ${code}`));
                }
                this.process = null;
            });

            resolve();
        });
    }

    private buildFFmpegArgs(): string[] {
        return [
            '-f', this.config.inputFormat,
            '-framerate', this.config.framerate.toString(),
            '-video_size', `${this.config.width}x${this.config.height}`,
            '-i', '-',
            '-c:v', 'libx264',
            '-preset', this.config.preset!,
            '-tune', this.config.tune!,
            '-crf', this.config.crf!.toString(),
            '-f', 'h264',
            '-'
        ];
    }

    public encode(frame: Buffer): void {
        if (this.process && this.process.stdin.writable) {
            this.process.stdin.write(frame);
        }
    }

    public stop(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.process) {
                resolve();
                return;
            }

            this.process.stdin.end();
            this.process.once('exit', () => {
                this.process = null;
                resolve();
            });
            
            setTimeout(() => {
                if (this.process) {
                    this.process.kill();
                }
            }, 1000);
        });
    }
}
