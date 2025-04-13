import { EventEmitter } from 'events';
import Logger from '../Utils/logger';

interface VMMetrics {
    uptime: number;
    connectedUsers: number;
    cpuUsage: number;
    memoryUsage: number;
    networkUsage: {
        rx: number;
        tx: number;
    };
}

export class MetricsManager extends EventEmitter {
    private metrics: Map<string, VMMetrics> = new Map();
    private updateInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();
        this.startMetricsCollection();
    }

    private startMetricsCollection(): void {
        this.updateInterval = setInterval(() => {
            this.collectMetrics();
        }, 5000); // Collecter toutes les 5 secondes
    }

    private async collectMetrics(): Promise<void> {
        for (const [vmId, currentMetrics] of this.metrics) {
            try {
                const newMetrics = await this.gatherVMMetrics(vmId);
                this.metrics.set(vmId, newMetrics);
                this.emit('metricsUpdated', vmId, newMetrics);
            } catch (error) {
                Logger.error(`Failed to collect metrics for VM ${vmId}: ${error}`);
            }
        }
    }

    private async gatherVMMetrics(vmId: string): Promise<VMMetrics> {
        // Implémenter la collecte réelle des métriques ici
        return {
            uptime: this.metrics.get(vmId)?.uptime || 0 + 5,
            connectedUsers: this.metrics.get(vmId)?.connectedUsers || 0,
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 100,
            networkUsage: {
                rx: Math.random() * 1000,
                tx: Math.random() * 1000
            }
        };
    }

    public startTracking(vmId: string): void {
        this.metrics.set(vmId, {
            uptime: 0,
            connectedUsers: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            networkUsage: { rx: 0, tx: 0 }
        });
    }

    public stopTracking(vmId: string): void {
        this.metrics.delete(vmId);
    }
}
