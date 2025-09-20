const GIS_SRC = 'https://accounts.google.com/gsi/client'
// Public OAuth Client ID for Google Identity Services used in the browser.
// This is a public identifier (safe to expose in frontend bundles).
const GOOGLE_OAUTH_CLIENT_ID =
    '97231016307-dhbt66p60bd6s63loj6vsoat9pm299i6.apps.googleusercontent.com'

let gisLoaded: Promise<void> | null = null
let tokenClient: any | null = null
let accessToken: string | null = null
const TOKEN_STORAGE_KEY = 'ytp.google.token'

type StoredToken = {
    accessToken: string
    expiresAt: number // epoch ms
    scope: string // space-separated scopes granted
}

function loadStoredToken(): string | null {
    try {
        const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
        if (!raw) return null
        const data = JSON.parse(raw) as StoredToken
        if (!data?.accessToken || !data?.expiresAt) return null
        const now = Date.now()
        // 60s clock skew to reduce edge 401s
        if (now < data.expiresAt - 60_000) {
            accessToken = data.accessToken
            return accessToken
        }
    } catch {}
    return null
}

function storeToken(token: string, expiresInSec: number, scope: string) {
    accessToken = token
    const expiresAt = Date.now() + Math.max(1, expiresInSec) * 1000
    const data: StoredToken = { accessToken: token, expiresAt, scope }
    try {
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(data))
    } catch {}
}

function loadGis(): Promise<void> {
    if (gisLoaded) return gisLoaded
    gisLoaded = new Promise<void>((resolve, reject) => {
        const s = document.createElement('script')
        s.src = GIS_SRC
        s.async = true
        s.defer = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('GIS load failed'))
        document.head.appendChild(s)
    })
    return gisLoaded
}

export async function getAccessToken(scopes: string[]): Promise<string> {
    const clientId = GOOGLE_OAUTH_CLIENT_ID
    if (!clientId) throw new Error('permission-denied')
    // try load cached token first
    const cached = loadStoredToken()
    if (cached) return cached
    await loadGis()
    const google = (window as any).google
    if (!tokenClient) {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: scopes.join(' '),
            callback: (resp: any) => {
                if (resp.error) {
                    console.error(resp)
                    return
                }
                // Persist token and expiry when received
                const token = resp.access_token as string
                const expiresIn = Number(resp.expires_in ?? 3600)
                const scope = (resp.scope as string) || scopes.join(' ')
                storeToken(token, expiresIn, scope)
            },
        })
    }
    if (!accessToken) {
        tokenClient.requestAccessToken({ prompt: 'consent' })
        // Poll briefly for token; GIS uses callback
        const start = Date.now()
        while (!accessToken) {
            await new Promise((r) => setTimeout(r, 50))
            if (Date.now() - start > 20000) throw new Error('permission-denied')
        }
    }
    return accessToken
}

export function clearAccessToken() {
    accessToken = null
    try {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
    } catch {}
}

export function hasCachedAccessToken(): boolean {
    const token = loadStoredToken()
    return Boolean(token)
}

export async function revokeAccess(): Promise<void> {
    await loadGis()
    const google = (window as any).google
    const token = accessToken || loadStoredToken()
    if (token && google?.accounts?.oauth2?.revoke) {
        await new Promise<void>((resolve) => {
            try {
                google.accounts.oauth2.revoke(token, () => resolve())
            } catch {
                resolve()
            }
        })
    }
    clearAccessToken()
}
