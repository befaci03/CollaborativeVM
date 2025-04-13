import * as WebSocket from 'ws';
import { EventEmitter } from 'events';
import Logger from './Utils/logger';
import Config from './Utils/Config';
import { User, VM, Permission } from '../colllibs/Interfaces/Identifiers';
import { QEMU } from './VM/Manager/QEMU';
import { VBox } from './VM/Manager/VBox';
import { VMWare } from './VM/Manager/VMWare';
import { VNC } from './VM/Manager/VNC';
import { Screen } from './VM/Screen';
import { H264Encoder } from './VM/h264Encoder';

interface ClientConnection {
    ws: WebSocket;
    user: User | null;
    vmId: string | null;
}

export class VMServer extends EventEmitter {
    private wss!: WebSocket.Server;
    private clients: Map<WebSocket, ClientConnection> = new Map();
    private vms: Map<string, VM> = new Map();
    private activeVMs: Map<string, { 
        manager: QEMU | VBox | VMWare,
        vnc: VNC,
        screen: Screen,
        encoder: H264Encoder,
        users: Set<WebSocket>
    }> = new Map();

    constructor() {
        super();
        this.initializeServer();
        this.loadVMs();
    }

    private initializeServer(): void {
        const port = Config.get('server').port || 8080;
        this.wss = new WebSocket.Server({ port });

        this.wss.on('connection', this.handleConnection.bind(this));
        Logger.info(`Server starting on port ${port}`);
    }

    private handleConnection(ws: WebSocket): void {
        const client: ClientConnection = { ws, user: null, vmId: null };
        this.clients.set(ws, client);

        ws.on('message', (data: string) => this.handleMessage(ws, data));
        ws.on('close', () => this.handleDisconnection(ws));
        ws.on('error', (error) => {
            Logger.error(`WebSocket error: ${error.message}`);
            ws.close();
        });
    }

    private async handleMessage(ws: WebSocket, data: string): Promise<void> {
        try {
            const message = JSON.parse(data);
            const client = this.clients.get(ws);

            switch (message.type) {
                case 'auth':
                    await this.handleAuth(ws, message.data);
                    break;
                case 'connectVM':
                    await this.handleVMConnect(ws, message.data.vmId);
                    break;
                case 'control':
                    await this.handleVMConnect(ws, message.data.vmId);
                    break;
                case 'chat':
                    this.broadcastChat(client!, message.data);
                    break;
                case 'disconnect':
                    await this.handleVMDisconnect(ws);
                    break;
                default:
                    ws.send(JSON.stringify({ type: 'error', message: 'Unknown command' }));
            }
        } catch (error) {
            if (error instanceof Error) {
                Logger.error(`Message handling error: ${error.message}`);
            } else {
                Logger.error('Message handling error: Unknown error');
            }
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
    }

    private async handleAuth(ws: WebSocket, authData: { username: string, password: string }): Promise<void> {
        // Authentification à implémenter
        const client = this.clients.get(ws)!;
        client.user = { username: authData.username, rank: new Int16Array([1]) };
        ws.send(JSON.stringify({ type: 'auth', success: true }));
    }

    private async handleVMConnect(ws: WebSocket, vmId: string): Promise<void> {
        const vm = this.vms.get(vmId);
        if (!vm) {
            ws.send(JSON.stringify({ type: 'error', message: 'VM not found' }));
            return;
        }

        const client = this.clients.get(ws)!;
        client.vmId = vmId;

        if (!this.activeVMs.has(vmId)) {
            await this.startVM(vmId);
        }

        const activeVM = this.activeVMs.get(vmId)!;
        activeVM.users.add(ws);

        ws.send(JSON.stringify({ type: 'vmConnected', vm }));
    }

    private async startVM(vmId: string): Promise<void> {
        // Configuration et démarrage de la VM
        // À adapter selon le type de VM (QEMU, VBox, VMWare)
    }

    private async handleVMDisconnect(ws: WebSocket): Promise<void> {
        const client = this.clients.get(ws);
        if (client?.vmId) {
            const activeVM = this.activeVMs.get(client.vmId);
            if (activeVM) {
                activeVM.users.delete(ws);
                if (activeVM.users.size === 0) {
                    await activeVM.manager.stop();
                    this.activeVMs.delete(client.vmId);
                }
            }
        }
        client!.vmId = null;
        ws.send(JSON.stringify({ type: 'vmDisconnected' }));
    }

    private handleDisconnection(ws: WebSocket): void {
        const client = this.clients.get(ws);
        if (client?.vmId) {
            const activeVM = this.activeVMs.get(client.vmId);
            activeVM?.users.delete(ws);
        }
        this.clients.delete(ws);
    }

    private broadcastChat(client: ClientConnection, chatData: { message: string }): void {
        const vmId = client.vmId;
        if (!vmId) {
            client.ws.send(JSON.stringify({ type: 'error', message: 'Not connected to any VM' }));
            return;
        }

        const activeVM = this.activeVMs.get(vmId);
        if (activeVM) {
            const chatMessage = {
                type: 'chat',
                user: client.user?.username || 'Unknown',
                message: chatData.message,
            };
            activeVM.users.forEach(userWs => {
                userWs.send(JSON.stringify(chatMessage));
            });
        }
    }

    private broadcastToVM(vmId: string, message: any): void {
        const activeVM = this.activeVMs.get(vmId);
        if (activeVM) {
            activeVM.users.forEach(client => {
                client.send(JSON.stringify(message));
            });
        }
    }

    private loadVMs(): void {
        // Chargement des configurations VM depuis Config
        const vmsConfig = Config.get('vms') || [];
        vmsConfig.forEach((vmConfig: any) => {
            this.vms.set(vmConfig.id, vmConfig);
        });
    }

    public stop(): void {
        this.wss.close();
        this.activeVMs.forEach(async (vm, id) => {
            await vm.manager.stop();
        });
        Logger.info('Server stopped');
    }
}
