import { spawn, ChildProcess } from 'child_process';

export class QEMUManager {
    private vmProcesses: Map<string, ChildProcess>;
    private _conf: any;
    constructor(_conf: any) {
        this.vmProcesses = new Map();
        this._conf = _conf;
    }

    startVM(vmId: string) {
        if (this.vmProcesses.has(vmId)) {
            console.warn(`VM ${vmId} is already in execution.`);
            return;
        }

        const vmConfig = this._conf["vms.qemu"][vmId];
        if (!vmConfig) {
            console.error(`Configuration didn't finded for the VM ${vmId}.`);
            return;
        }

        const qemuConf = vmConfig.vm;
        const [
            qemuType,
            kvm,
            extraOpt,
            ram,
            maindrive,
            mdrvFormat,
            cddvd,
            cores,
            net,
            display,
            vga,
            snapshots
        ] = qemuConf;

        let qemuArgs = [
            '-usbdevice', 'tablet',
            '-vnc', `:1`,
            '-name', `${vmId}`
        ];

        if (kvm) qemuArgs.push('--enable-kvm');
        if (ram) qemuArgs.push('-m', ram);
        if (extraOpt) qemuArgs.push(extraOpt.split(' '));
        if (maindrive && mdrvFormat) qemuArgs.push('-drive', `file=${maindrive},format=${mdrvFormat},snapshot=${snapshots ? 'on' : 'off'}`);
        if (maindrive && !mdrvFormat) qemuArgs.push('-drive', `file=${maindrive},snapshot=${snapshots ? 'on' : 'off'}`);
        if (cores) qemuArgs.push('-smp', `cores=${cores}`);
        if (cddvd) qemuArgs.push('-cdrom', cddvd);
        if (net) qemuArgs.push('-net', 'nic', '-net', 'user');
        if (!net) qemuArgs.push('-net', `none`);
        if (display) qemuArgs.push('-display', display);
        if (vga) qemuArgs.push('-vga', vga);

        const launchQemuVm = () => {
            const qemuProcess = spawn(`qemu-${qemuType}`, qemuArgs);
            this.vmProcesses.set(vmId, qemuProcess);

            qemuProcess.stdout.on('data', (data) => {
                console.log(`[VM ${vmId}] ${data}`);
            });

            qemuProcess.stderr.on('data', (data) => {
                console.error(`[VM ${vmId}] ${data}`);
            });

            qemuProcess.on('close', (code) => {
                console.warn(`VM ${vmId} stopped working with the code ${code}`);
                this.vmProcesses.delete(vmId);
                launchQemuVm();
            });
        }
        launchQemuVm();

        const sockifyProcess = spawn('websockify', ["5911", "localhost:5901"]);

        sockifyProcess.stdout.on('data', (data) => {
            console.log(`[WSockify ${vmId}] ${data}`);
        });

        sockifyProcess.stderr.on('data', (data) => {
            console.error(`[WSockify ${vmId}] ${data}`);
        });

        sockifyProcess.on('close', (code) => {
            console.warn(`Websockify for VM ${vmId} stopped working with the code ${code}`);
        });
    }

    stopVM(vmId: string) {
        const process = this.vmProcesses.get(vmId);
        if (process) {
            process.kill('SIGTERM');
            this.vmProcesses.delete(vmId);
            console.log(`La VM ${vmId} a été arrêtée.`);
        } else {
            console.warn(`Aucune VM en cours d'exécution avec l'ID ${vmId}.`);
        }
    }

    listVMs() {
        return Array.from(this.vmProcesses.keys());
    }
}
