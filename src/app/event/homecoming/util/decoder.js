export default function decodeHashToName(hash) {
    if (!hash) return '';
    try {
        // base64url -> base64
        let b64 = hash.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4 !== 0) b64 += '=';

        // base64 -> UTF-8 bytes -> string
        const bin = atob(b64);
        const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
        const shifted = new TextDecoder('utf-8').decode(bytes);

        // 문자 단위로 -3 시프트
        return [...shifted]
            .map((c) => String.fromCharCode(c.charCodeAt(0) - 3))
            .join('');
    } catch {
        return '';
    }
}