import { EventEmitter } from 'events';
import { User } from '../../colllibs/Interfaces/Identifiers';
import Logger from '../Utils/logger';

interface QueueItem {
    user: User;
    action: string;
    timestamp: number;
}

export class QueueManager extends EventEmitter {
    private queues: Map<string, QueueItem[]> = new Map();
    private processing: Map<string, boolean> = new Map();

    public addToQueue(vmId: string, user: User, action: string): void {
        const queue = this.queues.get(vmId) || [];
        queue.push({ user, action, timestamp: Date.now() });
        this.queues.set(vmId, queue);
        this.emit('queueUpdated', vmId, queue);
        
        if (!this.processing.get(vmId)) {
            this.processQueue(vmId);
        }
    }

    private async processQueue(vmId: string): Promise<void> {
        if (this.processing.get(vmId)) return;
        this.processing.set(vmId, true);

        while ((this.queues.get(vmId) || []).length > 0) {
            const queue = this.queues.get(vmId)!;
            const item = queue.shift()!;
            this.emit('processing', vmId, item);

            try {
                await this.executeAction(vmId, item);
                this.emit('actionCompleted', vmId, item);
            } catch (error) {
                Logger.error(`Queue action failed: ${error}`);
                this.emit('actionFailed', vmId, item, error);
            }
        }

        this.processing.set(vmId, false);
    }

    private async executeAction(vmId: string, item: QueueItem): Promise<void> {
        // Implémenter les actions spécifiques ici
        this.emit('actionExecuting', vmId, item);
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    public clearQueue(vmId: string): void {
        this.queues.delete(vmId);
        this.emit('queueCleared', vmId);
    }
}
