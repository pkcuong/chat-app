import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';

// Generate Identity Key Pair (IK)
export function generateIdentityKeyPair() {
    // Use nacl.sign.keyPair() for signing purposes
    return nacl.sign.keyPair();
}

// Generate Signed Prekey (SPK)
export function generateSignedPrekey(identityKeyPair) {
    const prekeyPair = nacl.box.keyPair(); // This is fine as this will be used for encryption
    const signature = nacl.sign.detached(
        prekeyPair.publicKey,
        identityKeyPair.secretKey
    );

    return {
        publicKey: prekeyPair.publicKey,
        secretKey: prekeyPair.secretKey,
        signature: signature,
    };
}

// Generate One-Time Prekeys (OPK)
export function generateOneTimePrekey(count = 1) {
    const oneTimePrekeys = [];
    for (let i = 0; i < count; i++) {
        oneTimePrekeys.push(nacl.box.keyPair());
    }
    return oneTimePrekeys;
}

// Perform X3DH Key Exchange
export function x3dhKeyExchange(
    senderIdentityKeyPair,
    receiverIdentityKey,
    receiverSignedPrekey,
    receiverOneTimePrekey
) {
    const dh1 = nacl.scalarMult(senderIdentityKeyPair.secretKey, receiverSignedPrekey.publicKey);
    const dh2 = nacl.scalarMult(nacl.box.keyPair().secretKey, receiverIdentityKey);
    const dh3 = nacl.scalarMult(nacl.box.keyPair().secretKey, receiverSignedPrekey.publicKey);
    const dh4 = nacl.scalarMult(senderIdentityKeyPair.secretKey, receiverOneTimePrekey.publicKey);

    // Combine the shared secrets to generate the final shared secret
    const sharedSecret = nacl.hash(
        naclUtil.concatUint8Arrays(dh1, dh2, dh3, dh4)
    );

    return sharedSecret;
}
