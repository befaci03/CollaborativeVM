"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QEMUManager = void 0;
var child_process_1 = require("child_process");
var path = require("path");
var QEMUManager = /** @class */ (function () {
    function QEMUManager(_conf) {
        this.vmProcesses = new Map();
        this._conf = _conf;
    }
    QEMUManager.prototype.startVM = function (vmId) {
        var _this = this;
        if (this.vmProcesses.has(vmId)) {
            console.warn("VM ".concat(vmId, " is already in execution."));
            return;
        }
        var vmConfig = this._conf["vms.qemu"][vmId];
        if (!vmConfig) {
            console.error("Configuration didn't finded for the VM ".concat(vmId, "."));
            return;
        }
        var qemuConf = vmConfig.vm;
        var qemuType = qemuConf[0], kvm = qemuConf[1], extraOpt = qemuConf[2], ram = qemuConf[3], maindrive = qemuConf[4], mdrvFormat = qemuConf[5], cddvd = qemuConf[6], cores = qemuConf[7], net = qemuConf[8], display = qemuConf[9], vga = qemuConf[10], snapshots = qemuConf[11], port = qemuConf[12];
        var qemuArgs = [
            '-usbdevice', 'tablet',
            '-vnc',
            ":".concat(port - 5900),
            '-name',
            "".concat(vmId)
        ];
        if (kvm)
            qemuArgs.push('--enable-kvm');
        if (ram)
            qemuArgs.push('-m', ram);
        if (extraOpt)
            qemuArgs.push(extraOpt.split(' '));
        if (maindrive && mdrvFormat)
            qemuArgs.push('-drive', "file=".concat("".concat(path.join(__dirname, '..', '..', '_vms'), "/").concat(maindrive), ",format=").concat(mdrvFormat, ",snapshot=").concat(snapshots ? 'on' : 'off'));
        if (maindrive && !mdrvFormat)
            qemuArgs.push('-drive', "file=".concat("".concat(path.join(__dirname, '..', '..', '_vms'), "/").concat(maindrive), ",snapshot=").concat(snapshots ? 'on' : 'off'));
        if (cores)
            qemuArgs.push('-smp', "cores=".concat(cores));
        if (cddvd)
            qemuArgs.push('-cdrom', "".concat(path.join(__dirname, '..', '..', '_vms', 'isos'), "/").concat(cddvd));
        if (net)
            qemuArgs.push('-net', 'nic', '-net', 'user');
        if (!net)
            qemuArgs.push('-net', "none");
        if (display)
            qemuArgs.push('-display', display);
        if (vga)
            qemuArgs.push('-vga', vga);
        var launchQemuVm = function () {
            var qemuProcess = (0, child_process_1.spawn)("qemu-".concat(qemuType), qemuArgs);
            _this.vmProcesses.set(vmId, qemuProcess);
            qemuProcess.stdout.on('data', function (data) {
                console.log("[VM ".concat(vmId, "] ").concat(data));
            });
            qemuProcess.stderr.on('data', function (data) {
                console.error("[VM ".concat(vmId, "] ").concat(data));
            });
            qemuProcess.on('close', function (code) {
                console.warn("VM ".concat(vmId, " stopped working with the code ").concat(code));
                _this.vmProcesses.delete(vmId);
                launchQemuVm();
            });
        };
        launchQemuVm();
        var sockifyProcess = (0, child_process_1.spawn)('websockify', ["".concat(6000 + (port - 5900)), "localhost:".concat(port)]);
        sockifyProcess.stdout.on('data', function (data) {
            console.log("[WSockify ".concat(vmId, "] ").concat(data));
        });
        sockifyProcess.stderr.on('data', function (data) {
            console.error("[WSockify ".concat(vmId, "] ").concat(data));
        });
        sockifyProcess.on('close', function (code) {
            console.warn("Websockify for VM ".concat(vmId, " stopped working with the code ").concat(code));
        });
    };
    QEMUManager.prototype.stopVM = function (vmId) {
        var process = this.vmProcesses.get(vmId);
        if (process) {
            process.kill('SIGTERM');
            this.vmProcesses.delete(vmId);
            console.log("La VM ".concat(vmId, " a \u00E9t\u00E9 arr\u00EAt\u00E9e."));
        }
        else {
            console.warn("Aucune VM en cours d'ex\u00E9cution avec l'ID ".concat(vmId, "."));
        }
    };
    QEMUManager.prototype.listVMs = function () {
        return Array.from(this.vmProcesses.keys());
    };
    return QEMUManager;
}());
exports.QEMUManager = QEMUManager;
