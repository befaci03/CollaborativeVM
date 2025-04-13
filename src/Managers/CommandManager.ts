import { EventEmitter } from 'events';
import { User } from '../../colllibs/Interfaces/Identifiers';
import Logger from '../Utils/logger';

interface Command {
    name: string;
    description: string;
    minRank: number;
    handler: (user: User, args: string[]) => Promise<void>;
}

export class CommandManager extends EventEmitter {
    private commands: Map<string, Command> = new Map();

    constructor() {
        super();
        this.registerDefaultCommands();
    }

    private registerDefaultCommands(): void {
        // Commandes de base
        this.registerCommand({
            name: 'help',
            description: 'Show available commands',
            minRank: 0,
            handler: async (user, args) => {
                const availableCommands = Array.from(this.commands.entries())
                    .filter(([_, cmd]) => user.rank[0] >= cmd.minRank)
                    .map(([name, cmd]) => `${name}: ${cmd.description}`);
                
                this.emit('commandResponse', {
                    user,
                    message: 'Available commands:\n' + availableCommands.join('\n')
                });
            }
        });

        // Commandes VM
        this.registerCommand({
            name: 'reset',
            description: 'Start a vote to reset the VM',
            minRank: 1,
            handler: async (user) => {
                this.emit('voteRequest', { type: 'reset', initiator: user });
            }
        });

        this.registerCommand({
            name: 'reboot',
            description: 'Force reboot the VM (admin only)',
            minRank: 3,
            handler: async (user) => {
                this.emit('vmAction', { type: 'reboot', user });
            }
        });

        // Commandes de modération
        this.registerCommand({
            name: 'kick',
            description: 'Kick a user from the VM',
            minRank: 2,
            handler: async (user, [target]) => {
                if (!target) {
                    throw new Error('Usage: /kick <username>');
                }
                this.emit('moderationAction', { type: 'kick', user, target });
            }
        });

        this.registerCommand({
            name: 'ban',
            description: 'Ban a user from the VM',
            minRank: 3,
            handler: async (user, [target, duration, ...reason]) => {
                if (!target || !duration) {
                    throw new Error('Usage: /ban <username> <duration> [reason]');
                }
                this.emit('moderationAction', {
                    type: 'ban',
                    user,
                    target,
                    duration,
                    reason: reason.join(' ')
                });
            }
        });

        // Commandes d'administration
        this.registerCommand({
            name: 'setrank',
            description: 'Change user rank',
            minRank: 4,
            handler: async (user, [target, rank]) => {
                if (!target || !rank) {
                    throw new Error('Usage: /setrank <username> <rank>');
                }
                this.emit('adminAction', {
                    type: 'setrank',
                    user,
                    target,
                    rank: parseInt(rank, 10)
                });
            }
        });

        // Commandes utilisateur
        this.registerCommand({
            name: 'turn',
            description: 'Request a turn to control the VM',
            minRank: 1,
            handler: async (user) => {
                this.emit('turnRequest', { user });
            }
        });

        this.registerCommand({
            name: 'queue',
            description: 'Show current turn queue',
            minRank: 0,
            handler: async (user) => {
                this.emit('queueRequest', { user });
            }
        });

        // Commandes système
        this.registerCommand({
            name: 'status',
            description: 'Show VM status',
            minRank: 0,
            handler: async (user) => {
                this.emit('statusRequest', { user });
            }
        });

        this.registerCommand({
            name: 'clear',
            description: 'Clear chat messages',
            minRank: 2,
            handler: async (user) => {
                this.emit('chatAction', { type: 'clear', user });
            }
        });
    }

    public registerCommand(command: Command): void {
        this.commands.set(command.name.toLowerCase(), command);
    }

    public async executeCommand(user: User, commandLine: string): Promise<void> {
        const [cmdName, ...args] = commandLine.trim().split(/\s+/);
        const command = this.commands.get(cmdName.toLowerCase());

        if (!command) {
            this.emit('commandError', {
                user,
                error: `Unknown command: ${cmdName}`
            });
            return;
        }

        if (user.rank[0] < command.minRank) {
            this.emit('commandError', {
                user,
                error: 'Insufficient permissions'
            });
            return;
        }

        try {
            await command.handler(user, args);
        } catch (error) {
            Logger.error(`Command execution failed: ${error}`);
            this.emit('commandError', {
                user,
                error: `Command execution failed: ${error}`
            });
        }
    }
}
