import { EventEmitter } from 'events';
import Config from '../Utils/Config';
import { User } from '../../colllibs/Interfaces/Identifiers';

interface ChatMessage {
    user: User;
    message: string;
    timestamp: number;
}

export class ChatManager extends EventEmitter {
    private messages: ChatMessage[] = [];
    private userMessageCounts: Map<string, { count: number, lastReset: number }> = new Map();
    private mutedUsers: Map<string, number> = new Map();
    private config: any;

    constructor() {
        super();
        this.config = Config.get('vm').webapp;
    }

    public addMessage(user: User, message: string): boolean {
        if (this.isUserMuted(user.username)) {
            return false;
        }

        if (message.length > this.config.messageMaxLength) {
            return false;
        }

        if (this.isSpamming(user.username)) {
            this.muteUser(user.username);
            return false;
        }

        const chatMessage = {
            user,
            message,
            timestamp: Date.now()
        };

        this.messages.push(chatMessage);
        if (this.messages.length > this.config.messageHistory) {
            this.messages.shift();
        }

        this.emit('message', chatMessage);
        return true;
    }

    private isSpamming(username: string): boolean {
        if (!this.config.antispam) return false;

        const now = Date.now();
        const userCount = this.userMessageCounts.get(username) || { count: 0, lastReset: now };

        if (now - userCount.lastReset > this.config.antispam.seconds * 1000) {
            userCount.count = 1;
            userCount.lastReset = now;
        } else {
            userCount.count++;
        }

        this.userMessageCounts.set(username, userCount);
        return userCount.count > this.config.antispam.messages;
    }

    private muteUser(username: string): void {
        this.mutedUsers.set(username, Date.now() + this.config.tempMuteTime * 1000);
    }

    private isUserMuted(username: string): boolean {
        const muteExpiry = this.mutedUsers.get(username);
        if (!muteExpiry) return false;

        if (Date.now() > muteExpiry) {
            this.mutedUsers.delete(username);
            return false;
        }
        return true;
    }
}
