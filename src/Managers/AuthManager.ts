import { EventEmitter } from 'events';
import { User, UserAuth, Rank } from '../../colllibs/Interfaces/Identifiers';
import Config from '../Utils/Config';
import * as crypto from 'crypto';

export class AuthManager extends EventEmitter {
    private config: any;
    private users: Map<string, UserAuth> = new Map();
    private ranks: Map<string, Rank> = new Map();

    constructor() {
        super();
        this.config = Config.get('auth');
        this.loadRanks();
    }

    private loadRanks(): void {
        if (!this.config.enabled) {
            // Load local ranks from config
            for (const rank of this.config.false.enabledranks) {
                this.ranks.set(rank, {
                    id: rank,
                    name: rank,
                    password: crypto.createHash('sha256').update(this.config.false.passwords[rank] || ''),
                    permissions: []
                });
            }
        }
    }

    public async authenticate(username: string, password: string): Promise<User | null> {
        if (!this.config.enabled) {
            // Local authentication
            const hash = crypto.createHash('sha256').update(password).digest('hex');
            for (const [rankId, rank] of this.ranks.entries()) {
                if (hash === this.config.false.passwords[rankId]) {
                    return {
                        username,
                        rank: new Int16Array([this.getRankLevel(rankId)])
                    };
                }
            }
            return null;
        }

        // API authentication
        try {
            const response = await fetch(this.config.apiEndpoint + '/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            if (response.ok) {
                const data = await response.json();
                return {
                    username: data.username,
                    rank: new Int16Array([data.rank])
                };
            }
        } catch (error) {
            this.emit('error', error);
        }
        return null;
    }

    private getRankLevel(rankId: string): number {
        const rankLevels: Record<string, number> = {
            'owner': 4,
            'admin': 3,
            'mod': 2,
            'user': 1,
            'guest': 0
        };
        return rankLevels[rankId] || 0;
    }

    public hasPermission(user: User, permission: string): boolean {
        if (!user || !user.rank) return false;
        const rankLevel = user.rank[0];
        
        if (rankLevel >= 3) return true; // Admin et Owner ont toutes les permissions
        
        const guestPerms = this.config.guestPermissions;
        if (rankLevel === 0) return guestPerms[permission] || false;
        
        return true; // Autres rangs authentifiés ont les permissions de base
    }
}
