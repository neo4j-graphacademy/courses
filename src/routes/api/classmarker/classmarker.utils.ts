import forge from 'node-forge'

export function verifyData(body: object, headerHmacSignature: string, secret: string): boolean {
    const jsonHmac = computeHmac(body, secret);
    return jsonHmac === headerHmacSignature;
}

export function computeHmac(body: object, secret: string): string {
    const hmac = forge.hmac.create();
    hmac.start('sha256', secret);
    const jsonString = JSON.stringify(body)
    const jsonBytes = Buffer.from(jsonString, 'ascii');

    hmac.update(jsonBytes);
    return forge.util.encode64(hmac.digest().bytes());
}

export const CLASSMARKER_SIGNATURE_HEADER = 'X-Classmarker-Hmac-Sha256'
