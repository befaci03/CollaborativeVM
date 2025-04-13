import { EventEmitter } from 'events';
import Logger from '../Utils/logger';
import { User, UserAuth } from '../../colllibs/Interfaces/Identifiers';
import Encryptor from '../Utils/ENCRYPTOR';

export class UserManager extends EventEmitter {
    private users: Map<string, UserAuth> = new Map();
    private onlineUsers: Map<string, User> = new Map();

    public async registerUser(username: string, email: string, password: string): Promise<boolean> {
        if (this.users.has(username)) {
            return false;
        }

        try {
            const { encoded: hashedPassword } = await Encryptor.encode(password, username);
            const user: UserAuth = {
                username,
                email,
                password: hashedPassword,
                rank: new Int16Array([1]),
                createdAt: new Date()
            };

            this.users.set(username, user);
            this.emit('userRegistered', username);
            Logger.info(`User registered: ${username}`);
            return true;
        } catch (error) {
            Logger.error(`Failed to register user: ${error}`);
            return false;
        }
    }

    public setUserOnline(user: User): void {
        this.onlineUsers.set(user.username, user);
        this.emit('userOnline', user);
    }

    public setUserOffline(username: string): void {
        const user = this.onlineUsers.get(username);
        if (user) {
            this.onlineUsers.delete(username);
            this.emit('userOffline', username);
        }
    }

    public isOnline(username: string): boolean {
        return this.onlineUsers.has(username);
    }
}
