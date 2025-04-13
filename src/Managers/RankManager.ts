import { EventEmitter } from 'events';
import { User, Rank } from '../../colllibs/Interfaces/Identifiers';
import Config from '../Utils/Config';
import Logger from '../Utils/logger';

export class RankManager extends EventEmitter {
    private ranks: Map<string, Rank> = new Map();
    private readonly defaultRanks = {
        owner: 4,
        admin: 3,
        mod: 2,
        user: 1,
        guest: 0
    };

    constructor() {
        super();
        this.initializeRanks();
    }

    private initializeRanks(): void {
        const config = Config.get('auth');
        if (!config.enabled) {
            config.false.enabledranks.forEach((rankId) => {
                this.ranks.set(rankId, {
                    id: rankId,
                    name: rankId.charAt(0).toUpperCase() + rankId.slice(1),
                    password: config.false.passwords[rankId] || '',
                    permissions: this.getDefaultPermissions(rankId)
                });
            });
        }
        Logger.info('Ranks initialized');
    }

    private getDefaultPermissions(rankId: string): string[] {
        const level = this.defaultRanks[rankId as keyof typeof this.defaultRanks] || 0;
        const permissions: string[] = ['chat', 'viewVM'];
        
        if (level >= 1) permissions.push('takeTurn', 'voteReset');
        if (level >= 2) permissions.push('kick', 'tempBan');
        if (level >= 3) permissions.push('permanentBan', 'configure');
        if (level >= 4) permissions.push('manageRanks', 'manageVMs');
        
        return permissions;
    }

    public getRank(rankId: string): Rank | undefined {
        return this.ranks.get(rankId);
    }

    public getRankLevel(rankId: string): number {
        return this.defaultRanks[rankId as keyof typeof this.defaultRanks] || 0;
    }

    public hasPermission(user: User, permission: string): boolean {
        if (!user || !user.rank) return false;
        const rankLevel = user.rank[0];
        return rankLevel >= (this.getMinimumRankForPermission(permission) || 0);
    }

    private getMinimumRankForPermission(permission: string): number {
        const permissionRanks: Record<string, number> = {
            chat: 0,
            viewVM: 0,
            takeTurn: 1,
            voteReset: 1,
            kick: 2,
            tempBan: 2,
            permanentBan: 3,
            configure: 3,
            manageRanks: 4,
            manageVMs: 4
        };
        return permissionRanks[permission] || 4;
    }
}
