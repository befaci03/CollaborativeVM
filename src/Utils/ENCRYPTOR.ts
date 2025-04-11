import * as crypto from 'crypto'; // Pour AES et SHA256

class Encryptor {
  private static base52Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  private static base58Alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  public static encode(plainText: string, aesKey: string): { encoded: string; sha256: string } {
    let step = Encryptor.reverseString(plainText);
    step = Encryptor.rot13(step);
    step = Buffer.from(step, 'utf8').toString('base64');
    step = Encryptor.toBase64Url(step);
    step = Buffer.from(step, 'utf8').toString('hex');
    step = Encryptor.encodeBase52(step);

    let binaryStep = Encryptor.stringToBinary(step);

    binaryStep = Encryptor.binaryComplement(binaryStep);
    binaryStep = Encryptor.binaryReverse(binaryStep);
    
    const key = crypto.createHash('sha256').update(aesKey).digest();
    let dataForEncryption = Buffer.from(binaryStep, 'utf8');
    for (let i = 0; i < 3; i++) {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      const encrypted = Buffer.concat([cipher.update(dataForEncryption), cipher.final()]);
      dataForEncryption = Buffer.concat([iv, encrypted]);
    }
    
    const sha256 = crypto.createHash('sha256').update(dataForEncryption).digest('hex');

    const base58Str = Encryptor.encodeBase58(dataForEncryption);
    const finalBinary = Encryptor.stringToRealBinary(base58Str);
    
    return { encoded: finalBinary, sha256 };
  }

  public static decode(encoded: string, aesKey: string, expectedSha256?: string): string {
    const base58Str = Encryptor.realBinaryToString(encoded);
    const finalBuffer = Encryptor.decodeBase58(base58Str);
    
    if (expectedSha256) {
      const sha256Check = crypto.createHash('sha256').update(finalBuffer).digest('hex');
      if (sha256Check !== expectedSha256) {
        throw new Error('SHA256 mismatch: data integrity compromised');
      }
    }
    
    const key = crypto.createHash('sha256').update(aesKey).digest();
    let dataForDecryption = finalBuffer;
    for (let i = 0; i < 3; i++) {
      const iv = dataForDecryption.slice(0, 16);
      const cipherText = dataForDecryption.slice(16);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
      dataForDecryption = decrypted;
    }
    
    const decryptedBinary = dataForDecryption.toString('utf8');
    
    let binaryStep = Encryptor.binaryReverse(decryptedBinary);
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
    // Pour chaque octet, inverse chaque bit (0 devient 1 et vice versa)
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
    if (hex.length % 2) { hex = '0' + hex; }
    return hex;
  }

  private static encodeBase58(buffer: Buffer): string {
    let num = BigInt('0x' + buffer.toString('hex'));
    const base = BigInt(58);
    let result = '';
    while (num > 0) {
      const rem = num % base;
      result = Encryptor.base58Alphabet[Number(rem)] + result;
      num /= base;
    }
    for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
      result = '1' + result;
    }
    return result;
  }
  
  private static decodeBase58(str: string): Buffer {
    let num = BigInt(0);
    const base = BigInt(58);
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const digit = BigInt(Encryptor.base58Alphabet.indexOf(char));
      num = num * base + digit;
    }
    let hex = num.toString(16);
    if (hex.length % 2) { hex = '0' + hex; }
    return Buffer.from(hex, 'hex');
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
