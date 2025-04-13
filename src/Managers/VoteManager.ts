import { EventEmitter } from 'events';
import Config from '../Utils/Config';
import { User } from '../../colllibs/Interfaces/Identifiers';

interface Vote {
    type: 'reset' | 'kick';
    initiator: string;
    target?: string;
    votes: Set<string>;
    startTime: number;
}

export class VoteManager extends EventEmitter {
    private currentVote: Vote | null = null;
    private lastVoteTime: number = 0;
    private config: any;

    constructor() {
        super();
        this.config = Config.get('vm').webapp;
    }

    public startVote(type: 'reset' | 'kick', initiator: string, target?: string): boolean {
        if (this.currentVote) return false;
        
        if (Date.now() - this.lastVoteTime < this.config.voteCooldown * 1000) {
            return false;
        }

        this.currentVote = {
            type,
            initiator,
            target,
            votes: new Set([initiator]),
            startTime: Date.now()
        };

        this.emit('voteStarted', { type, initiator, target });
        
        setTimeout(() => this.endVote(), this.config.voteTime * 1000);
        return true;
    }

    public vote(username: string): boolean {
        if (!this.currentVote) return false;
        
        this.currentVote.votes.add(username);
        this.emit('voted', { username, count: this.currentVote.votes.size });
        return true;
    }

    private endVote(): void {
        if (!this.currentVote) return;

        const result = {
            type: this.currentVote.type,
            passed: this.currentVote.votes.size >= 3, // À adapter selon les besoins
            votes: this.currentVote.votes.size
        };

        this.emit('voteEnded', result);
        this.lastVoteTime = Date.now();
        this.currentVote = null;
    }
}
