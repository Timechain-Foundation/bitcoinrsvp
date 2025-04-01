import cookieSignature from 'cookie-signature';

export const Constants = {
  orgSessionCookieName: 'org-session',
};

export default class CookieHelper {
  static setSignedCookie(res, cookieName: string, cookieValue: any) {
    const cookieParams = {
      httpOnly: true,
      signed: true,
    };

    res.cookie(cookieName, cookieValue, cookieParams);
  }

  static getSignedCookie(req, cookieName): any {
    return req.signedCookies[cookieName];
  }

  static clearSignedCookie(res, cookieName) {
    res.clearCookie(cookieName);
  }

  static setOrgCookie(res, org_id: number) {
    CookieHelper.setSignedCookie(res, Constants.orgSessionCookieName, {
      org_id,
    });
  }

  static getOrgCookie(req): any {
    return req.signedCookies[Constants.orgSessionCookieName];
  }

  static generateSignedCookie(
    cookieName: string,
    cookieValue: any,
    secretKey: string
  ): string {
    const valueStr =
      typeof cookieValue === 'string'
        ? cookieValue
        : JSON.stringify(cookieValue);
    const signedValue = 's:' + cookieSignature.sign(valueStr, secretKey);
    return `${cookieName}=${signedValue}`;
  }
}
