import * as fs from 'fs';
import * as path from 'path';

import * as toml from 'toml';

class Config {
    private config: Record<string, any> = {};
    constructor() {
        this.loadConfig();
    }

    private static instance: Config | null = null;
    public static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }
    
    public loadConfig() {
        const configPath = path.join(__dirname, '../config.toml');
        if (fs.existsSync(configPath)) {
            const configFile = fs.readFileSync(configPath, 'utf-8');
            this.config = toml.parse(configFile);
        } else {
            console.error('Config file not found!');
            process.exit(1);
        }
    }
    
    public get(key: string): any {
        return this.config[key];
    }

    public getAll(): Record<string, any> {
        return this.config;
    }
}

export default Config.getInstance();
