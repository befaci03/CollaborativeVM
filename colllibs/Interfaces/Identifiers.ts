import crypto from 'crypto';

export interface UserAuth {
    username: string;
    email: string;
    password: crypto.Hash;
    rank: Int16Array;
    createdAt: Date;
}
export interface User {
    username: string;
    rank: Int16Array;
}
