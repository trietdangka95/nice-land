import type { FastifyReply, FastifyRequest } from "fastify";
import type { AppConfig } from "../../config.js";
import {
  resolveTenant,
  TenantResolutionError,
  type TenantContext,
  type TenantSiteRepository,
} from "./tenant-resolver.js";

declare module "fastify" {
  interface FastifyRequest {
    tenant: TenantContext | null;
  }
}

export function createTenantPreHandler(
  config: AppConfig,
  repository: TenantSiteRepository,
  options: { allowExpired?: boolean } = {},
) {
  return async function tenantPreHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const tenantHostHeader = request.headers["x-tenant-host"];
    const host =
      typeof tenantHostHeader === "string"
        ? tenantHostHeader
        : request.headers.host ?? "";

    try {
      request.tenant = await resolveTenant({
        host,
      rootDomain: config.ROOT_DOMAIN,
      repository,
      allowExpired: options.allowExpired,
      });
    } catch (error) {
      if (error instanceof TenantResolutionError) {
        return reply.status(error.statusCode).send({
          code: error.code,
          message: error.message,
          requestId: request.id,
        });
      }

      throw error;
    }
  };
}

export function createOptionalTenantPreHandler(
  config: AppConfig,
  repository: TenantSiteRepository,
) {
  const requiredHandler = createTenantPreHandler(config, repository);

  return async function optionalTenantPreHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const tenantHostHeader = request.headers["x-tenant-host"];
    const rawHost =
      typeof tenantHostHeader === "string"
        ? tenantHostHeader
        : request.headers.host ?? "";
    const hostname = rawHost.toLowerCase().split(":")[0];
    const rootDomain = config.ROOT_DOMAIN.toLowerCase().split(":")[0];

    if (
      hostname === rootDomain ||
      hostname === `www.${rootDomain}` ||
      hostname === `api.${rootDomain}` ||
      (rootDomain === "localhost" && hostname === "localhost")
    ) {
      request.tenant = null;
      return;
    }

    return requiredHandler(request, reply);
  };
}
