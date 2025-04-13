import { EventEmitter } from 'events';
import { User, ActionsID } from '../../colllibs/Interfaces/Identifiers';
import { VNC } from '../VM/Manager/VNC';
import Logger from '../Utils/logger';

interface Action {
    id: string;
    type: keyof ActionsID;
    data: any;
    user: User;
}

export class ActionManager extends EventEmitter {
    private vnc: VNC | null = null;
    private actionHistory: Action[] = [];
    private readonly MAX_HISTORY = 100;

    public setVNC(vnc: VNC): void {
        this.vnc = vnc;
    }

    public async executeAction(action: Action): Promise<boolean> {
        try {
            switch (action.type) {
                case 'control':
                    await this.handleControlAction(action.data);
                    break;
                case 'reset':
                    await this.handleResetAction(action.data);
                    break;
                case 'command':
                    await this.handleCommandAction(action.data);
                    break;
                default:
                    Logger.warn(`Unknown action type: ${action.type}`);
                    return false;
            }

            this.addToHistory(action);
            this.emit('actionExecuted', action);
            return true;
        } catch (error) {
            Logger.error(`Action execution failed: ${error}`);
            return false;
        }
    }

    private async handleControlAction(data: any): Promise<void> {
        if (!this.vnc) throw new Error('VNC not connected');
        
        if (data.type === 'keyboard') {
            this.vnc.sendKeyEvent(data.key, data.down);
        } else if (data.type === 'mouse') {
            this.vnc.sendPointerEvent(data.x, data.y, data.buttons);
        }
    }

    private async handleResetAction(data: any): Promise<void> {
        this.emit('reset', data);
    }

    private async handleCommandAction(data: any): Promise<void> {
        this.emit('command', data);
    }

    private addToHistory(action: Action): void {
        this.actionHistory.push(action);
        if (this.actionHistory.length > this.MAX_HISTORY) {
            this.actionHistory.shift();
        }
    }

    public getHistory(): Action[] {
        return [...this.actionHistory];
    }
}
