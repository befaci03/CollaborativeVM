import { VMServer } from './Server';
import Logger from './Utils/logger';

async function main() {
    try {
        const server = new VMServer();
        process.on('SIGINT', () => {
            Logger.info('Shutting down server...');
            server.stop();
            process.exit(0);
        });
    } catch (error) {
        Logger.error(`Failed to start server: ${error}`);
        process.exit(1);
    }
}

main();
