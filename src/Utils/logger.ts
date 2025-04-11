import * as chalk from 'chalk';

const COLORS = new chalk.Chalk();

class Logger {
    private constructor() {}

    private static instance: Logger | null = null;
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    
    
    public error(message: string): void {
        console.error(COLORS.red(`[${new Date().toLocaleString().split(' ').join('-')}] [ERR] ${message}`));
    }
    public success(message: string): void {
        console.log(COLORS.green(`[${new Date().toLocaleString().split(' ').join('-')}] [SUCCESS] ${message}`));
    }
    public warn(message: string): void {
        console.warn(COLORS.yellow(`[${new Date().toLocaleString().split(' ').join('-')}] [WARN] ${message}`));
    }
    
    public info(message: string): void {
        console.info(COLORS.green(`[${new Date().toLocaleString().split(' ').join('-')}] [INFO] ${message}`));
    }
    public log(message: string): void {
        console.log(COLORS.blue(`[${new Date().toLocaleString().split(' ').join('-')}] ${message}`));
    }

    public debug(message: string): void {
        console.debug(COLORS.cyan(`[${new Date().toLocaleString().split(' ').join('-')}] [DEBUG] ${message}`));
    }

    public clear(): void {
        console.clear();
    }
}

export default Logger.getInstance();
