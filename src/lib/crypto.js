import sodium from 'libsodium-wrappers';


const initializeSodium = async () => {
    await sodium.ready;
    return sodium;
};

export function generateKeyPair() {
    return sodium.crypto_box_keypair();
}

const encryptMessage = async (message, publicKey) => {
    const sodium = await initializeSodium();
    const encMessage = sodium.crypto_box_seal(message, sodium.from_base64(publicKey));
    return sodium.to_base64(encMessage);
};

const decryptMessage = async (encryptedMessage, privateKey) => {
    const sodium = await initializeSodium();
    const message = sodium.crypto_box_seal_open(sodium.from_base64(encryptedMessage), sodium.from_base64(privateKey));
    return sodium.to_string(message);
};

export { encryptMessage, decryptMessage };
export default initializeSodium;