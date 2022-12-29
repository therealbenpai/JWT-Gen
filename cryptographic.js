import pkg from 'jsonwebtoken';
const { sign, verify, decode } = pkg;
import { v5 } from 'uuid'
import createHash from 'crypto'

export function generateUUID(userID, encryptionKey) {
    const userIDHash = createHash.createHmac('sha512', encryptionKey)
        // @ts-ignore
        .update(userID)
        .digest('hex');
    const userUUID = v5(
        userIDHash, // User ID hash
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8' // UUID v5 OID_NAMESPACE
    );
    return userUUID;
}

export async function generateToken(userData, signature) {
    const idHash = await createHash.createHmac('sha512', signature).update(userData.id).digest('hex');
    const userUUID = await v5(idHash, '6ba7b810-9dad-11d1-80b4-00c04fd430c8');
    const finalUserData = {
        name: userData.name,
        uuid: userUUID
    }
    const token = await sign(
        finalUserData,
        signature,
        { algorithm: 'HS512' }
    )
    return token;
}

export async function verifyToken(token, signature) {
    let valid;
    const output = await verify(
        token,
        signature,
        {
            algorithms: ['HS512']
        },
        (error, _) => {
            if (error) { valid = false; return }
            valid = true;
            return;
        })
    return valid;
}

export async function decodeToken(token) {
    // @ts-ignore
    return decode(token);
}