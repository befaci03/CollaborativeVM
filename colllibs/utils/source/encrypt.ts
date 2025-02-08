import * as crypto from 'crypto';

class Encryptor {
    private algorithm: string;
    private key: Buffer;
    private hmacKey: Buffer;

    constructor() {
        this.algorithm = 'aes-256-cbc';
        this.key = crypto.randomBytes(32);
        this.hmacKey = crypto.randomBytes(32);
    }

    public encrypt(text: string): string {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const hmac = crypto.createHmac('sha256', this.hmacKey);
        hmac.update(iv.toString('hex') + encrypted);
        const hmacDigest = hmac.digest('hex');

        return `${iv.toString('hex')}:${encrypted}:${hmacDigest}`;
    }

    public decrypt(encryptedText: string): string {
        const [ivHex, encrypted, hmacDigest] = encryptedText.split(':');
        const ivBuffer = Buffer.from(ivHex, 'hex');

        const hmac = crypto.createHmac('sha256', this.hmacKey);
        hmac.update(ivHex + encrypted);
        const calculatedHmacDigest = hmac.digest('hex');

        if (calculatedHmacDigest !== hmacDigest) {
            throw new Error('Data integrity check failed');
        }

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, ivBuffer);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

export default Encryptor;
