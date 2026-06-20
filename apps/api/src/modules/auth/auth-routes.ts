import type { FastifyInstance } from "fastify";
import type { AuthResponse } from "@datcuatoi/contracts";
import { loginInputSchema } from "@datcuatoi/contracts";
import type { AppConfig } from "../../config.js";
import {
  createOptionalTenantPreHandler,
  createTenantPreHandler,
} from "../tenancy/tenant-context.js";
import type { TenantSiteRepository } from "../tenancy/tenant-resolver.js";
import { AuthError, type AuthService } from "./auth-service.js";
import { createRequireAuth } from "./auth-guards.js";
import type { AccessTokenService } from "./token-service.js";

interface RegisterAuthRoutesOptions {
  config: AppConfig;
  authService: AuthService;
  accessTokens: AccessTokenService;
  tenantRepository: TenantSiteRepository;
}

function cookieOptions(config: AppConfig) {
  return {
    path: "/v1/auth",
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: config.REFRESH_TOKEN_TTL_DAYS * 86_400,
  };
}

function toAuthResponse(
  result: Awaited<ReturnType<AuthService["login"]>>,
  expiresIn: number,
): AuthResponse {
  return {
    accessToken: result.accessToken,
    expiresIn,
    user: result.user,
  };
}

export async function registerAuthRoutes(
  app: FastifyInstance,
  options: RegisterAuthRoutesOptions,
) {
  const optionalTenant = createOptionalTenantPreHandler(
    options.config,
    options.tenantRepository,
  );
  const requireAuth = createRequireAuth(options.accessTokens);

  app.post(
    "/v1/auth/login",
    { preHandler: optionalTenant },
    async (request, reply) => {
      const input = loginInputSchema.parse(request.body);
      try {
        const result = await options.authService.login({
          ...input,
          siteId: request.tenant?.siteId ?? null,
          userAgent: request.headers["user-agent"],
          ipAddress: request.ip,
        });

        reply.setCookie(
          options.config.REFRESH_COOKIE_NAME,
          result.refreshToken,
          cookieOptions(options.config),
        );

        return toAuthResponse(result, options.config.ACCESS_TOKEN_TTL_SECONDS);
      } catch (error) {
        if (error instanceof AuthError) {
          return reply.status(error.statusCode).send({
            code: error.code,
            message: error.message,
            requestId: request.id,
          });
        }
        throw error;
      }
    },
  );

  app.post("/v1/auth/refresh", async (request, reply) => {
    const refreshToken =
      request.cookies[options.config.REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      return reply.status(401).send({
        code: "INVALID_REFRESH_TOKEN",
        message: "Không tìm thấy phiên đăng nhập.",
        requestId: request.id,
      });
    }

    try {
      const result = await options.authService.refresh(refreshToken);
      reply.setCookie(
        options.config.REFRESH_COOKIE_NAME,
        result.refreshToken,
        cookieOptions(options.config),
      );
      return toAuthResponse(result, options.config.ACCESS_TOKEN_TTL_SECONDS);
    } catch (error) {
      reply.clearCookie(
        options.config.REFRESH_COOKIE_NAME,
        cookieOptions(options.config),
      );
      if (error instanceof AuthError) {
        return reply.status(error.statusCode).send({
          code: error.code,
          message: error.message,
          requestId: request.id,
        });
      }
      throw error;
    }
  });

  app.post("/v1/auth/logout", async (request, reply) => {
    const refreshToken =
      request.cookies[options.config.REFRESH_COOKIE_NAME];
    if (refreshToken) {
      await options.authService.logout(refreshToken);
    }
    reply.clearCookie(
      options.config.REFRESH_COOKIE_NAME,
      cookieOptions(options.config),
    );
    return reply.status(204).send();
  });

  app.get(
    "/v1/auth/me",
    { preHandler: requireAuth },
    async (request, reply) => {
      try {
        return await options.authService.getCurrentUser(request.auth!.sub);
      } catch (error) {
        if (error instanceof AuthError) {
          return reply.status(error.statusCode).send({
            code: error.code,
            message: error.message,
            requestId: request.id,
          });
        }
        throw error;
      }
    },
  );

  app.get(
    "/v1/auth/tenant-check",
    {
      preHandler: [
        createTenantPreHandler(options.config, options.tenantRepository, {
          allowExpired: true,
        }),
        requireAuth,
      ],
    },
    async (request, reply) => {
      if (
        request.auth!.role !== "ADMIN" ||
        request.auth!.siteId !== request.tenant!.siteId
      ) {
        return reply.status(403).send({
          code: "TENANT_MISMATCH",
          message: "Tài khoản không thuộc website này.",
          requestId: request.id,
        });
      }
      return { ok: true };
    },
  );
}
