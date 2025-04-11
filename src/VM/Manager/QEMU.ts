import { spawn } from 'child_process';

interface QEMUConfig {
    executable: string;
    machine: string;
    memory: string;
    cpu: string;
    drive: string[];
    network: string[];
    additionalArgs?: string[];
}

export class QEMU {
    private process: any;
    private config: QEMUConfig;

    constructor(config: QEMUConfig) {
        this.config = config;
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            const args = this.buildArguments();
            
            this.process = spawn(this.config.executable, args);

            this.process.on('error', (err: Error) => {
                reject(new Error(`Failed to start QEMU: ${err.message}`));
            });

            this.process.on('exit', (code: number) => {
                if (code !== 0) {
                    reject(new Error(`QEMU exited with code ${code}`));
                } else {
                    resolve();
                }
            });
        });
    }

    private buildArguments(): string[] {
        const args = [
            '-machine', this.config.machine,
            '-m', this.config.memory,
            '-cpu', this.config.cpu
        ];

        // Add drive arguments
        this.config.drive.forEach(drive => {
            args.push('-drive', drive);
        });

        // Add network arguments
        this.config.network.forEach(net => {
            args.push('-netdev', net);
        });

        // Add any additional arguments
        if (this.config.additionalArgs) {
            args.push(...this.config.additionalArgs);
        }

        return args;
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.process) {
                resolve();
                return;
            }

            this.process.kill();
            this.process.on('exit', () => {
                resolve();
            });
        });
    }
}
