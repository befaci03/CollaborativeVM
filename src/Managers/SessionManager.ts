import { EventEmitter } from 'events';
import { User } from '../../colllibs/Interfaces/Identifiers';
import Encryptor from '../Utils/ENCRYPTOR';

interface Session {
    id: string;
    user: User;
    createdAt: Date;
    lastActivity: Date;
}

export class SessionManager extends EventEmitter {
    private sessions: Map<string, Session> = new Map();
    private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    constructor() {
        super();
        this.startCleanupInterval();
    }

    public async createSession(user: User): Promise<string> {
        const sessionData = `${user.username}-${Date.now()}`;
        const { encoded: sessionId } = await Encryptor.encode(sessionData, 'session-key');
        
        this.sessions.set(sessionId, {
            id: sessionId,
            user,
            createdAt: new Date(),
            lastActivity: new Date()
        });

        return sessionId;
    }

    public getSession(sessionId: string): Session | undefined {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastActivity = new Date();
        }
        return session;
    }

    public removeSession(sessionId: string): void {
        this.sessions.delete(sessionId);
    }

    private startCleanupInterval(): void {
        setInterval(() => {
            const now = Date.now();
            this.sessions.forEach((session, id) => {
                if (now - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
                    this.sessions.delete(id);
                    this.emit('sessionExpired', session);
                }
            });
        }, 5 * 60 * 1000); // Check every 5 minutes
    }
}
