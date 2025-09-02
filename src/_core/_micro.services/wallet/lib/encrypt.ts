import crypto from 'node:crypto';
import Hashids from 'hashids';

const hashOptions = {
  salt: process.env.HASH_ID_SALT, // salt
  length: 10, // length
  alphabet: process.env.HASH_ID_ALPHABET // alphabet
}

class Hash {
    private hash;
    
    constructor() {
        this.hash = new Hashids(
            hashOptions.salt,
            hashOptions.length,
            hashOptions.alphabet
        )
    }

    public encodeHex(val: string) {
        if (isNaN(Number(val))) {
            throw new Error('val must cast to a number or be a number')
        }
        return this.hash.encode(val);
    }

    public decodeHex(encodeVal: string) {
        return this.hash.decode(encodeVal);
    }
}
export const hashId = new Hash();

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    }, 
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
})

class CryptoEncrypter {
    constructor() {}

    get encryptionKey() {
        return process.env.ENCRYPTION_KEY;
    }

    public generateKeyPair() {
        const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            }, 
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        })

        return ({
            privateKey,
            publicKey
        })
    }

    public encrypt(val: string) {
        const buffer = Buffer.from(val, 'utf8')
        const encrypted = crypto.publicEncrypt(publicKey, buffer);
        return encrypted.toString('hex');   
    }

    public decrypt(encryptVal: string) {
        const buffer = Buffer.from(encryptVal, 'hex');
        const decrypted = crypto.privateDecrypt(privateKey, buffer);
        return decrypted.toString('utf8'); 
    }
}
export const cryptoEncrypter = new CryptoEncrypter();