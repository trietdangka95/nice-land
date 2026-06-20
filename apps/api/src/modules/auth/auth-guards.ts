import type { FastifyReply, FastifyRequest } from "fastify";
import type { UserRole } from "@datcuatoi/contracts";
import type {
  AccessTokenClaims,
  AccessTokenService,
} from "./token-service.js";

declare module "fastify" {
  interface FastifyRequest {
    auth: AccessTokenClaims | null;
  }
}

export function createRequireAuth(accessTokens: AccessTokenService) {
  return async function requireAuth(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      return reply.status(401).send({
        code: "AUTH_REQUIRED",
        message: "Bạn cần đăng nhập.",
        requestId: request.id,
      });
    }

    try {
      request.auth = await accessTokens.verify(authorization.slice(7));
    } catch {
      return reply.status(401).send({
        code: "INVALID_ACCESS_TOKEN",
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
        requestId: request.id,
      });
    }
  };
}

export function requireRole(...roles: UserRole[]) {
  return async function roleGuard(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    if (!request.auth || !roles.includes(request.auth.role)) {
      return reply.status(403).send({
        code: "FORBIDDEN",
        message: "Bạn không có quyền truy cập.",
        requestId: request.id,
      });
    }
  };
}

export async function requireTenantMatch(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (
    !request.auth ||
    request.auth.role !== "ADMIN" ||
    !request.tenant ||
    request.auth.siteId !== request.tenant.siteId
  ) {
    return reply.status(403).send({
      code: "TENANT_MISMATCH",
      message: "Tài khoản không thuộc website này.",
      requestId: request.id,
    });
  }
}
