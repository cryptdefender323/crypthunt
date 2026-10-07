type AuthorizedBrowserScope = {
  readonly origin: string
  readonly pathPrefix: string
}

const authorizedScopes = new Map<string, AuthorizedBrowserScope>()
const pendingBrowserTargets = new Map<string, AuthorizedBrowserScope>()
const lastBrowserPages = new Map<string, string>()
const authorizationPhrases = [
  /\b(?:i|we)\s+(?:explicitly\s+)?authori[sz]e(?:d)?\s+(?:(?:active|security)\s+)*(?:testing|test|scan|assessment)\b/i,
  /\b(?:written|explicit)\s+authori[sz]ation\b/i,
  /\b(?:authorized|authorised)\s+(?:to\s+)?(?:test|scan|assess)\b/i,
  /\b(?:saya|kami)\s+(?:mengizinkan|memberi\s+izin|punya\s+izin|sudah\s+mendapat\s+izin)\b/i,
] as const
const followUpAuthorizationPhrases = [
  /\b(?:yes|yeah|okay|confirmed)\b.{0,40}\b(?:authori[sz]ed|authori[sz]ation|permission)\b/i,
  /\b(?:ya|iya|benar|setuju)\b.{0,40}\b(?:izin|mengizinkan|diizinkan)\b/i,
] as const
const deniedAuthorizationPhrase =
  /\b(?:not|no|without|belum|tidak|tanpa)\b.{0,32}\b(?:authori[sz](?:ation|ed)|izin)\b|\b(?:authori[sz]ation|permission|izin)\b.{0,32}\b(?:isn't|is\s+not|not\s+available|unavailable|missing|belum|tidak|tanpa)\b/i

export function rememberBrowserAssessmentTarget(sessionID: string, target: string): boolean {
  let url: URL
  try {
    url = new URL(target)
  } catch (error) {
    if (error instanceof TypeError) return false
    throw error
  }
  if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) {
    return false
  }
  pendingBrowserTargets.set(sessionID, { origin: url.origin, pathPrefix: url.pathname })
  return true
}

export function recordBrowserAssessmentAuthorization(sessionID: string, text: string): boolean {
  if (deniedAuthorizationPhrase.test(text)) {
    authorizedScopes.delete(sessionID)
    pendingBrowserTargets.delete(sessionID)
    return false
  }
  const authorized = authorizationPhrases.some((phrase) => phrase.test(text))
    || followUpAuthorizationPhrases.some((phrase) => phrase.test(text))
  if (!authorized) {
    return false
  }

  const match = text.match(/https?:\/\/[^\s<>"']+/i)
  let scope: AuthorizedBrowserScope | undefined
  if (match) {
    const candidate = match[0].replace(/[),.;!?]+$/, "")
    let url: URL
    try {
      url = new URL(candidate)
    } catch (error) {
      if (error instanceof TypeError) return false
      throw error
    }
    if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) {
      return false
    }
    scope = { origin: url.origin, pathPrefix: url.pathname }
  } else {
    scope = pendingBrowserTargets.get(sessionID)
  }
  if (!scope) return false

  authorizedScopes.set(sessionID, scope)
  return true
}

export function isBrowserAssessmentAuthorized(sessionID: string, target: string): boolean {
  const scope = authorizedScopes.get(sessionID)
  if (!scope) return false

  let url: URL
  try {
    url = new URL(target)
  } catch (error) {
    if (error instanceof TypeError) return false
    throw error
  }
  if (url.origin !== scope.origin) return false
  if (scope.pathPrefix === "/" || url.pathname === scope.pathPrefix) return true

  const prefix = scope.pathPrefix.endsWith("/") ? scope.pathPrefix : `${scope.pathPrefix}/`
  return url.pathname.startsWith(prefix)
}

export function rememberBrowserAssessmentPage(sessionID: string, pageUrl: string): void {
  lastBrowserPages.set(sessionID, pageUrl)
}

export function getRememberedBrowserAssessmentPage(sessionID: string): string | undefined {
  return lastBrowserPages.get(sessionID)
}

export function clearBrowserAssessmentSession(sessionID: string): void {
  authorizedScopes.delete(sessionID)
  pendingBrowserTargets.delete(sessionID)
  lastBrowserPages.delete(sessionID)
}
