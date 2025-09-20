const GIS_SRC = 'https://accounts.google.com/gsi/client'
// Public OAuth Client ID for Google Identity Services used in the browser.
// This is a public identifier (safe to expose in frontend bundles).
const GOOGLE_OAUTH_CLIENT_ID =
    '97231016307-dhbt66p60bd6s63loj6vsoat9pm299i6.apps.googleusercontent.com'

let gisLoaded: Promise<void> | null = null
let tokenClient: any | null = null
let accessToken: string | null = null

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
                accessToken = resp.access_token
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
}
