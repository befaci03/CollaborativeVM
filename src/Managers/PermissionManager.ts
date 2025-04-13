import { EventEmitter } from 'events';
import Config from '../Utils/Config';
import { User, Permission } from '../../colllibs/Interfaces/Identifiers';

export class PermissionManager extends EventEmitter {
    private permissions: Map<string, Permission> = new Map();
    private config = Config.get('auth');

    public checkPermission(user: User, permission: string): boolean {
        if (!user || !user.rank) return false;

        // Admin/Owner bypass
        if (user.rank[0] >= 3) return true;

        // Guest permissions
        if (user.rank[0] === 0) {
            return this.config.guestPermissions[permission] || false;
        }

        const perm = this.permissions.get(permission);
        return perm ? perm.ranks.includes(user.rank[0].toString()) : false;
    }

    public addPermission(permission: Permission): void {
        this.permissions.set(permission.id, permission);
        this.emit('permissionAdded', permission);
    }

    public removePermission(permissionId: string): void {
        this.permissions.delete(permissionId);
        this.emit('permissionRemoved', permissionId);
    }
}
