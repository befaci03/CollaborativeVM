import { EventEmitter } from 'events';
import Config from '../Utils/Config';
import { User } from '../../colllibs/Interfaces/Identifiers';

export class TurnManager extends EventEmitter {
    private currentTurn: string | null = null;
    private turnQueue: string[] = [];
    private turnStartTime: number = 0;
    private config: any;

    constructor() {
        super();
        this.config = Config.get('vm').webapp;
        this.startTurnTimer();
    }

    public requestTurn(username: string): boolean {
        if (this.turnQueue.includes(username)) return false;
        
        this.turnQueue.push(username);
        this.emit('queueUpdated', this.turnQueue);
        
        if (!this.currentTurn) {
            this.nextTurn();
        }
        
        return true;
    }

    private nextTurn(): void {
        if (this.turnQueue.length === 0) {
            this.currentTurn = null;
            this.emit('turnEnded', null);
            return;
        }

        this.currentTurn = this.turnQueue.shift()!;
        this.turnStartTime = Date.now();
        this.emit('turnStarted', this.currentTurn);
    }

    private startTurnTimer(): void {
        setInterval(() => {
            if (this.currentTurn && Date.now() - this.turnStartTime >= this.config.turnTime * 1000) {
                this.nextTurn();
            }
        }, 1000);
    }
}
