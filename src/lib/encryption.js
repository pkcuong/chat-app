// encryption.js
import CryptoJS from 'crypto-js';

// Function to encrypt a message
export function encryptMessage(message, secretKey) {
    const ciphertext = CryptoJS.AES.encrypt(message, secretKey).toString();
    return ciphertext;
}

// Function to decrypt a message
export function decryptMessage(ciphertext, secretKey) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    const originalMessage = bytes.toString(CryptoJS.enc.Utf8);
    return originalMessage;
}
