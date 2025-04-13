import * as crypto from 'crypto';
import * as zlib from 'zlib';
const bcrypt = require('bcryptjs');
const baseX = require('base-x');

// Base58 et Base85 Alphabets
const base85 = baseX('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!#$%&()*+-;<=>?@^_`{|}~');

class Encryptor {
  private static base52Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  private static base58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  public static async encode(plainText: string, aesKey: string): Promise<{ encoded: string; sha256: string }> {
    // Étape 1 : obfuscation de texte (inversé + ROT13)
    let step = Encryptor.reverseString(plainText);
    step = Encryptor.rot13(step);

    // Étape 2 : base64 → base64url → hex → base52
    step = Buffer.from(step, 'utf8').toString('base64');
    step = Encryptor.toBase64Url(step);
    step = Buffer.from(step, 'utf8').toString('hex');
    step = Encryptor.encodeBase52(step);

    // Étape 3 : binaire, inverse, complément
    let binaryStep = Encryptor.stringToBinary(step);
    binaryStep = Encryptor.binaryComplement(binaryStep);
    binaryStep = Encryptor.binaryReverse(binaryStep);

    // Étape 4 : compression zlib
    let compressed = zlib.deflateSync(Buffer.from(binaryStep, 'utf8'));

    // Étape 5 : bcrypt -> SHA256 pour obtenir une clé AES
    const salt = crypto.randomBytes(16).toString('hex');
    const bcryptHash = await bcrypt.hash(aesKey + salt, 12);
    const key = crypto.createHash('sha256').update(bcryptHash).digest();

    // Étape 6 : triple AES-256-CBC
    for (let i = 0; i < 3; i++) {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
      compressed = Buffer.concat([iv, encrypted]);
    }

    // Étape 7 : AES-256-GCM final
    const finalIv = crypto.randomBytes(12);
    const gcmCipher = crypto.createCipheriv('aes-256-gcm', key, finalIv);
    const finalEncrypted = Buffer.concat([gcmCipher.update(compressed), gcmCipher.final()]);
    const tag = gcmCipher.getAuthTag();

    // Concaténation des données
    const fullPayload = Buffer.concat([finalIv, tag, finalEncrypted]);

    // Étape 8 : base85 encode
    const base85Encoded = base85.encode(fullPayload);

    // Étape 9 : convertir en vrai binaire
    const finalBinary = Encryptor.stringToRealBinary(base85Encoded);
    const sha256 = crypto.createHash('sha256').update(fullPayload).digest('hex');

    return { encoded: finalBinary, sha256 };
  }

  public static async decode(encoded: string, aesKey: string, expectedSha256?: string): Promise<string> {
    const base85Str = Encryptor.realBinaryToString(encoded);
    const fullPayload = base85.decode(base85Str);

    const finalIv = fullPayload.slice(0, 12);
    const tag = fullPayload.slice(12, 28);
    const encryptedContent = fullPayload.slice(28);

    const bcryptHash = await bcrypt.hash(aesKey + fullPayload.toString('hex').slice(0, 32), 12);
    const key = crypto.createHash('sha256').update(bcryptHash).digest();

    // SHA256 check
    const calcHash = crypto.createHash('sha256').update(fullPayload).digest('hex');
    if (expectedSha256 && calcHash !== expectedSha256) {
      throw new Error('SHA256 mismatch: Données corrompues');
    }

    // Déchiffrement AES-GCM
    const gcmDecipher = crypto.createDecipheriv('aes-256-gcm', key, finalIv);
    gcmDecipher.setAuthTag(tag);
    let decrypted = Buffer.concat([gcmDecipher.update(encryptedContent), gcmDecipher.final()]);

    // Déchiffrement triple CBC (à l’envers)
    for (let i = 0; i < 3; i++) {
      const iv = decrypted.slice(0, 16);
      const content = decrypted.slice(16);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      decrypted = Buffer.concat([decipher.update(content), decipher.final()]);
    }

    // Décompression
    const decompressed = zlib.inflateSync(decrypted).toString('utf8');

    // Binaire reverse
    let binaryStep = Encryptor.binaryReverse(decompressed);
    binaryStep = Encryptor.binaryComplement(binaryStep);

    let step = Encryptor.binaryToString(binaryStep);
    step = Encryptor.decodeBase52(step);
    step = Buffer.from(step, 'hex').toString('utf8');
    step = Encryptor.fromBase64Url(step);
    step = Buffer.from(step, 'base64').toString('utf8');
    step = Encryptor.rot13(step);
    step = Encryptor.reverseString(step);

    return step;
  }

  // === Fonctions auxiliaires (inchangées) ===

  private static reverseString(str: string): string {
    return str.split('').reverse().join('');
  }

  private static rot13(str: string): string {
    return str.replace(/[a-zA-Z]/g, (char) => {
      const charCode = char.charCodeAt(0);
      return String.fromCharCode(
        (charCode <= 'Z'.charCodeAt(0) ? 90 : 122) >= (charCode + 13) ? charCode + 13 : charCode - 13
      );
    });
  }

  private static toBase64Url(base64: string): string {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private static fromBase64Url(base64url: string): string {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return base64;
  }

  private static stringToBinary(str: string): string {
    return str.split('').map(char =>
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join(' ');
  }

  private static binaryToString(binary: string): string {
    return binary.split(' ').map(bin =>
      String.fromCharCode(parseInt(bin, 2))
    ).join('');
  }

  private static binaryComplement(binary: string): string {
    return binary.split(' ').map(octet =>
      octet.split('').map(bit => bit === '0' ? '1' : '0').join('')
    ).join(' ');
  }

  private static binaryReverse(binary: string): string {
    return binary.split(' ').map(octet =>
      octet.split('').reverse().join('')
    ).join(' ');
  }

  private static encodeBase52(hexStr: string): string {
    let num = BigInt('0x' + hexStr);
    let result = '';
    const base = BigInt(52);
    while (num > 0) {
      const rem = num % base;
      result = Encryptor.base52Alphabet[Number(rem)] + result;
      num /= base;
    }
    return result || 'A';
  }

  private static decodeBase52(base52Str: string): string {
    let num = BigInt(0);
    const base = BigInt(52);
    for (let i = 0; i < base52Str.length; i++) {
      const value = BigInt(Encryptor.base52Alphabet.indexOf(base52Str[i]));
      num = num * base + value;
    }
    let hex = num.toString(16);
    if (hex.length % 2) hex = '0' + hex;
    return hex;
  }

  private static stringToRealBinary(str: string): string {
    return str.split('').map(char =>
      char.charCodeAt(0).toString(2).padStart(8, '0')
    ).join('');
  }

  private static realBinaryToString(binary: string): string {
    const chunks = binary.match(/.{1,8}/g) || [];
    return chunks.map(chunk => String.fromCharCode(parseInt(chunk, 2))).join('');
  }
}

module.exports = Encryptor;
export default Encryptor;
