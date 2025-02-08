"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = require("crypto");
var Encryptor = /** @class */ (function () {
    function Encryptor() {
        this.algorithm = 'aes-256-cbc';
        this.key = crypto.randomBytes(32);
        this.hmacKey = crypto.randomBytes(32);
    }
    Encryptor.prototype.encrypt = function (text) {
        var iv = crypto.randomBytes(16);
        var cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        var encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        var hmac = crypto.createHmac('sha256', this.hmacKey);
        hmac.update(iv.toString('hex') + encrypted);
        var hmacDigest = hmac.digest('hex');
        return "".concat(iv.toString('hex'), ":").concat(encrypted, ":").concat(hmacDigest);
    };
    Encryptor.prototype.decrypt = function (encryptedText) {
        var _a = encryptedText.split(':'), ivHex = _a[0], encrypted = _a[1], hmacDigest = _a[2];
        var ivBuffer = Buffer.from(ivHex, 'hex');
        var hmac = crypto.createHmac('sha256', this.hmacKey);
        hmac.update(ivHex + encrypted);
        var calculatedHmacDigest = hmac.digest('hex');
        if (calculatedHmacDigest !== hmacDigest) {
            throw new Error('Data integrity check failed');
        }
        var decipher = crypto.createDecipheriv(this.algorithm, this.key, ivBuffer);
        var decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    };
    return Encryptor;
}());
exports.default = Encryptor;
