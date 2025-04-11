import { spawn } from 'child_process';

interface VBoxConfig {
    vmName: string;
    memory: number;
    vram: number;
    cpus: number;
    osType: string;
    networkAdapter?: string;
}

export class VBox {
    private process: any;
    private config: VBoxConfig;
    private readonly vboxManage: string = 'VBoxManage';

    constructor(config: VBoxConfig) {
        this.config = config;
    }

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            const args = ['startvm', this.config.vmName, '--type', 'headless'];
            
            this.process = spawn(this.vboxManage, args);

            this.process.on('error', (err: Error) => {
                reject(new Error(`Failed to start VirtualBox: ${err.message}`));
            });

            this.process.on('exit', (code: number) => {
                if (code !== 0) {
                    reject(new Error(`VirtualBox exited with code ${code}`));
                } else {
                    resolve();
                }
            });
        });
    }

    private async createVM(): Promise<void> {
        const args = [
            'createvm',
            '--name', this.config.vmName,
            '--ostype', this.config.osType,
            '--register'
        ];

        await this.executeCommand(args);
        await this.configureVM();
    }

    private async configureVM(): Promise<void> {
        const modifyArgs = [
            'modifyvm', this.config.vmName,
            '--memory', this.config.memory.toString(),
            '--vram', this.config.vram.toString(),
            '--cpus', this.config.cpus.toString()
        ];

        if (this.config.networkAdapter) {
            modifyArgs.push('--nic1', this.config.networkAdapter);
        }

        await this.executeCommand(modifyArgs);
    }

    private executeCommand(args: string[]): Promise<void> {
        return new Promise((resolve, reject) => {
            const process = spawn(this.vboxManage, args);
            process.on('error', reject);
            process.on('exit', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Command failed with code ${code}`));
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve, reject) => {
            const args = ['controlvm', this.config.vmName, 'poweroff'];
            const process = spawn(this.vboxManage, args);
            
            process.on('error', reject);
            process.on('exit', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`Failed to stop VM with code ${code}`));
            });
        });
    }
}
