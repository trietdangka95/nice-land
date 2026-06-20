# Đất Của Tôi

Monorepo cho nền tảng SaaS bất động sản đa tenant.

## Kiến trúc

```text
apps/
  web/          Next.js frontend — deploy trên Vercel
  api/          Fastify backend — deploy trên AWS Lightsail

packages/
  contracts/    Zod schemas, DTOs và domain types dùng chung
  api-client/   Typed HTTP client cho frontend
  database/     Prisma schema, migrations và database client
  config/       Shared project configuration
```

Backend được đóng gói dạng stateless Docker container, không phụ thuộc Lightsail.
Có thể chuyển sang một Linux server hoặc container platform khác mà không đổi
business code.

## Yêu cầu

- Node.js 20+
- Corepack
- PostgreSQL cho các phase kết nối database tiếp theo

## Cài đặt

```bash
corepack prepare pnpm@10.12.1 --activate
corepack pnpm install
```

## Chạy local

```bash
npm run dev
```

Lệnh trên chạy đồng thời:

- Frontend: `http://localhost:3002`
- Backend: `http://localhost:4000`
- API health: `http://localhost:4000/health/live`

Các page demo:

- `/` — landing page
- `/minhphat` — website tenant
- `/minhphat/admin` — tenant admin
- `/superadmin` — super admin

## Kiểm tra

```bash
npm test
npm run typecheck
npm run build
```

## Environment

Sao chép:

- `apps/web/.env.example` thành `apps/web/.env.local`
- `apps/api/.env.example` thành `apps/api/.env`

Production dự kiến:

```env
# Vercel
NEXT_PUBLIC_API_URL=https://api.datcuatoi.vn
NEXT_PUBLIC_APP_URL=https://datcuatoi.vn
NEXT_PUBLIC_ROOT_DOMAIN=datcuatoi.vn

# AWS Lightsail API
ROOT_DOMAIN=datcuatoi.vn
CORS_ORIGINS=https://datcuatoi.vn,https://*.datcuatoi.vn
DATABASE_URL=postgresql://...
```

## Trạng thái

Phase 1 monorepo foundation đã hoàn thành. Giao diện vẫn dùng một phần dữ liệu
demo.

Phase 2 database foundation đã có:

- Prisma schema production-oriented.
- Baseline migration.
- Idempotent seed.
- Fastify tenant resolver cho platform subdomain và custom domain.
- Tenant-scoped query helper.
- Database-aware readiness check.
- Public site config API.
- Public contact request persistence.
- Public property listing/detail API với filter, sort và pagination.

Storage ảnh đã chốt dùng AWS S3. Upload sẽ dùng presigned URL để browser tải
thẳng lên S3; Fastify chỉ cấp quyền và lưu metadata, không proxy file qua
Lightsail.

Auth foundation:

- Tenant Admin và Super Admin login tách theo hostname.
- Access token 15 phút.
- Refresh token HttpOnly có rotation/revoke.
- Cross-tenant token bị chặn.
- Bật guard thật ở frontend bằng `NEXT_PUBLIC_REQUIRE_AUTH=true`.

Database production dùng Prisma Postgres. Để apply migration:

```bash
corepack pnpm dlx @prisma/cli@latest auth login
corepack pnpm dlx @prisma/cli@latest project link proj_cmqllfy7j0qm2w0fathh7y2kb

# Dùng connection URL một lần của Primary database để chạy migration.
DATABASE_URL="postgresql://..." corepack pnpm --filter @datcuatoi/database db:deploy
```
