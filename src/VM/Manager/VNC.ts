import { EventEmitter } from 'events';
import * as net from 'net';

interface VNCConfig {
    host: string;
    port: number;
    password?: string;
}

export class VNC extends EventEmitter {
    private config: VNCConfig;
    private socket: net.Socket | null = null;
    private connected: boolean = false;
    private buffer: Buffer = Buffer.alloc(0);

    constructor(config: VNCConfig) {
        super();
        this.config = config;
    }

    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = new net.Socket();

            this.socket.on('data', (data: Buffer) => {
                this.handleData(data);
            });

            this.socket.on('error', (error: Error) => {
                this.emit('error', error);
                reject(error);
            });

            this.socket.connect(this.config.port, this.config.host, () => {
                this.connected = true;
                this.emit('connected');
                resolve();
            });
        });
    }

    private handleData(data: Buffer): void {
        this.buffer = Buffer.concat([this.buffer, data]);
        this.emit('data', data);
    }

    public sendKeyEvent(key: number, down: boolean): void {
        if (!this.connected || !this.socket) return;
        const buffer = Buffer.alloc(8);
        buffer.writeUInt8(4, 0); // key event
        buffer.writeUInt8(down ? 1 : 0, 1);
        buffer.writeUInt16BE(0, 2);
        buffer.writeUInt32BE(key, 4);
        this.socket.write(buffer);
    }

    public sendPointerEvent(x: number, y: number, buttons: number): void {
        if (!this.connected || !this.socket) return;
        const buffer = Buffer.alloc(6);
        buffer.writeUInt8(5, 0); // pointer event
        buffer.writeUInt8(buttons, 1);
        buffer.writeUInt16BE(x, 2);
        buffer.writeUInt16BE(y, 4);
        this.socket.write(buffer);
    }

    public disconnect(): Promise<void> {
        return new Promise((resolve) => {
            if (this.socket) {
                this.socket.end(() => {
                    this.connected = false;
                    this.socket = null;
                    this.emit('disconnected');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}
