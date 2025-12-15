export default function decodeHashToName(hash) {
    if (!hash) return '';
    try {
        let b64 = hash.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4 !== 0) b64 += '=';
        const shifted = atob(b64);
        return [...shifted].map(c => String.fromCharCode(c.charCodeAt(0) - 3)).join('');
    } catch {
        return '';
    }
}