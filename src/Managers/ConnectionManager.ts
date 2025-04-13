import { EventEmitter } from 'events';
import Config from '../Utils/Config';
import { User } from '../../colllibs/Interfaces/Identifiers';

interface Connection {
    id: string;
    user: User;
    ip: string;
    connectionTime: Date;
}

export class ConnectionManager extends EventEmitter {
    private connections: Map<string, Connection[]> = new Map();
    private config = Config.get('vm').webapp;

    public addConnection(userId: string, user: User, ip: string): boolean {
        const userConnections = this.connections.get(userId) || [];
        
        if (userConnections.length >= this.config.maxConnections) {
            return false;
        }

        const connection: Connection = {
            id: Math.random().toString(36).substring(7),
            user,
            ip,
            connectionTime: new Date()
        };

        userConnections.push(connection);
        this.connections.set(userId, userConnections);
        this.emit('connectionAdded', connection);
        return true;
    }

    public removeConnection(userId: string, connectionId: string): void {
        const userConnections = this.connections.get(userId);
        if (!userConnections) return;

        const index = userConnections.findIndex(c => c.id === connectionId);
        if (index !== -1) {
            const removed = userConnections.splice(index, 1)[0];
            this.emit('connectionRemoved', removed);
        }

        if (userConnections.length === 0) {
            this.connections.delete(userId);
        }
    }

    public getConnectionCount(userId: string): number {
        return this.connections.get(userId)?.length || 0;
    }
}
