import { spawn } from 'child_process';

interface VMWareConfig {
    vmrunPath: string;
    vmxPath: string;
    gui?: boolean;
}

export class VMWare {
    private process: any;
    private config: VMWareConfig;

    constructor(config: VMWareConfig) {
        this.config = config;
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            const args = this.buildArguments();
            
            this.process = spawn(this.config.vmrunPath, args);

            this.process.on('error', (err: Error) => {
                reject(new Error(`Failed to start VMware: ${err.message}`));
            });

            this.process.on('exit', (code: number) => {
                if (code !== 0) {
                    reject(new Error(`VMware exited with code ${code}`));
                } else {
                    resolve();
                }
            });
        });
    }

    private buildArguments(): string[] {
        const args = [
            'start',
            this.config.vmxPath
        ];

        if (this.config.gui === false) {
            args.push('nogui');
        }

        return args;
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.process) {
                resolve();
                return;
            }

            const args = ['stop', this.config.vmxPath];
            spawn(this.config.vmrunPath, args);
            
            this.process.on('exit', () => {
                resolve();
            });
        });
    }
}
