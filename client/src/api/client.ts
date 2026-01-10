import { decode } from '@msgpack/msgpack';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function apiRequest<T = any>(endpoint: string, body: any): Promise<T> {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    console.log(`[API] Requesting ${url}`);

    const response = await fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/x-msgpack'
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        let errorMsg = response.statusText;
        try {
            // Try to parse error detail from JSON
            const errData = await response.json();
            if (errData.message || errData.detail) {
                errorMsg = errData.message || errData.detail;
            }
        } catch (e) {
            // ignore
        }
        throw new Error(`Request failed (${response.status}): ${errorMsg}`);
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    
    let buffer = await response.arrayBuffer();
    const view = new Uint8Array(buffer);

    // Fallback: Check for JSON Magic Byte '{' (0x7B)
    if (view.length > 0 && view[0] === 0x7B) {
        console.warn("[API] Received JSON (detected via magic byte). Parsing as JSON.");
        const text = new TextDecoder().decode(view);
        return JSON.parse(text);
    }
    
    // Check for GZIP header (0x1F 0x8B) -> Manual Decompression
    if (view.length >= 2 && view[0] === 0x1F && view[1] === 0x8B) {
        try {
            const ds = new DecompressionStream('gzip');
            const decompressedStream = new Response(buffer).body?.pipeThrough(ds);
            if (decompressedStream) {
                buffer = await new Response(decompressedStream).arrayBuffer();
            }
        } catch (gzipErr) {
            console.error("Manual GZIP decompression failed", gzipErr);
        }
    }

    try {
        return decode(buffer) as T;
    } catch (decodeErr: any) {
         // HEX DUMP for Debugging
        const v = new Uint8Array(buffer).slice(0, 4);
        const hex = Array.from(v).map(b => b.toString(16).padStart(2, '0')).join(' ');
        throw new Error(`Decode Fail. Header: [${hex.toUpperCase()}] Len: ${buffer.byteLength}. ${decodeErr.message}`);
    }
}
