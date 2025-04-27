import { Constants } from "../../backend/cookie-helper";
import cookieSignature from "cookie-signature";

let SECRET = process.env.COOKIE_SECRET_KEY!;

export function parseExpressCookie({ cookie }: any){
  const raw = cookie[Constants.orgSessionCookieName]?.value as
    | string
    | undefined;

  if (!raw?.startsWith("s:j:")) {
    // not signed json → ignore
    return;
  }
  const unsigned = cookieSignature.unsign(raw.slice(2), SECRET);

  if (unsigned === false) {
    return;
  }

  let orgSession = JSON.parse(unsigned.slice(2));
  return { orgSession };
};
