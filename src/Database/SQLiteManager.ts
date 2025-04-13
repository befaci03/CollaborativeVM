import sqlite3 from 'sqlite3';
import { User, UserAuth, Rank, Permission } from '../../colllibs/Interfaces/Identifiers';
import Logger from '../Utils/logger';

export class SQLiteManager {
    private db: sqlite3.Database;
    private static instance: SQLiteManager;

    private constructor() {
        this.db = new sqlite3.Database('database.sqlite');
        this.initializeTables();
    }

    public static getInstance(): SQLiteManager {
        if (!SQLiteManager.instance) {
            SQLiteManager.instance = new SQLiteManager();
        }
        return SQLiteManager.instance;
    }

    private async initializeTables(): Promise<void> {
        await this.db.run(`CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            password TEXT,
            rank INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        await this.db.run(`CREATE TABLE IF NOT EXISTS ranks (
            id INTEGER PRIMARY KEY,
            name TEXT UNIQUE,
            permissions TEXT
        )`);
    }
}
