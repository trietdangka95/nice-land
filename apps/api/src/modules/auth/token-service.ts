import { jwtVerify, SignJWT } from "jose";
import type { UserRole } from "@nice-land/contracts";

export interface AccessTokenClaims {
  sub: string;
  siteId: string | null;
  role: UserRole;
  username: string;
}

export class AccessTokenService {
  private readonly secret: Uint8Array;

  constructor(
    secret: string,
    private readonly ttlSeconds: number,
  ) {
    this.secret = new TextEncoder().encode(secret);
  }

  async sign(claims: AccessTokenClaims) {
    return new SignJWT({
      siteId: claims.siteId,
      role: claims.role,
      username: claims.username,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(claims.sub)
      .setIssuedAt()
      .setExpirationTime(`${this.ttlSeconds}s`)
      .setIssuer("nice-land-api")
      .setAudience("nice-land-web")
      .sign(this.secret);
  }

  async verify(token: string): Promise<AccessTokenClaims> {
    const { payload } = await jwtVerify(token, this.secret, {
      issuer: "nice-land-api",
      audience: "nice-land-web",
    });

    if (
      !payload.sub ||
      typeof payload.username !== "string" ||
      !["SUPER_ADMIN", "ADMIN", "GUEST"].includes(String(payload.role)) ||
      (payload.siteId !== null && typeof payload.siteId !== "string")
    ) {
      throw new Error("Invalid access token claims");
    }

    return {
      sub: payload.sub,
      siteId: payload.siteId as string | null,
      role: payload.role as UserRole,
      username: payload.username,
    };
  }
}
