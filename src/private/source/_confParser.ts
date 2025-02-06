import { parse } from 'jsonc-parser';
import * as fs from 'fs';

export class ProjectConfig {
    constructor() {}

    loadConfig(fp: fs.PathOrFileDescriptor) {
        const CONFIG = parse(fs.readFileSync(fp, { encoding: 'utf-8' }));
        return CONFIG;
    }
}
