export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL?.trim();
  const appId = import.meta.env.VITE_APP_ID?.trim();
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  console.log("[getLoginUrl] oauthPortalUrl:", oauthPortalUrl);

  if (!oauthPortalUrl) {
    console.error("VITE_OAUTH_PORTAL_URL is not defined or empty");
    return "#error-no-oauth-url";
  }

  try {
    let baseUrl = oauthPortalUrl;
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`;
      console.log("[getLoginUrl] Added https protocol to baseUrl:", baseUrl);
    }

    // Ensure baseUrl itself is a valid URL origin
    let url: URL;
    try {
      const normalizedBase = baseUrl.replace(/\/$/, '');
      url = new URL(`${normalizedBase}/app-auth`);
    } catch (e) {
      console.error("[getLoginUrl] baseUrl is not a valid URL base:", baseUrl);
      return "#error-invalid-base-url";
    }

    url.searchParams.set("appId", appId || "");
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    const finalUrl = url.toString();
    console.log("[getLoginUrl] Constructed URL:", finalUrl);
    return finalUrl;
  } catch (error) {
    console.error("Failed to construct login URL:", error);
    return "#error-invalid-oauth-url";
  }
};
