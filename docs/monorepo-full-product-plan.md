# Nice Land — Monorepo Migration & Full Product Plan

## 1. Mục tiêu

Chuyển codebase hiện tại từ một Next.js full-stack demo thành monorepo có:

- Frontend Next.js deploy độc lập.
- Backend Fastify deploy độc lập.
- PostgreSQL + Prisma làm nguồn dữ liệu thật.
- Shared contracts giúp FE và BE dùng chung type, enum và validation.
- Multi-tenancy an toàn theo `siteId`.
- Đầy đủ luồng Guest, Tenant Admin và Super Admin.
- Có kiểm thử, logging, monitoring, backup và quy trình deploy production.

## 2. Các giả định đang dùng

1. Giữ một Git repository, không tách thành hai repository.
2. Dùng `pnpm workspace` để quản lý monorepo.
3. Frontend tiếp tục dùng Next.js App Router, React, TypeScript và Tailwind.
4. Backend dùng Fastify, TypeScript, Zod/JSON Schema và Prisma.
5. Database là PostgreSQL.
6. File storage dùng **AWS S3**. ✅ Đã chốt
7. FE public chạy tại `nice-land.vn` và `*.nice-land.vn`.
8. API chạy tại `api.nice-land.vn`.
9. Auth dùng access token ngắn hạn và refresh token trong cookie `HttpOnly`.
10. Giai đoạn đầu chưa tự động thanh toán; Super Admin quản lý gói và gia hạn thủ công.
11. Mỗi tenant chọn một trong 4 public theme cố định; theme không thay đổi tính
    năng, dữ liệu hay API.
12. Theme chỉ áp dụng cho website public. Admin, Super Admin và landing page giữ
    giao diện chung.

Các giả định này phải được xác nhận trước Phase 2.

## 3. Hiện trạng

### Đã có

- Landing page hoàn chỉnh về giao diện.
- Guest tenant homepage, danh sách và chi tiết bất động sản.
- Tenant Admin dashboard, danh sách tin, form tạo tin, cấu hình và subscription UI.
- Super Admin dashboard, site list, plan list, contact request và audit log UI.
- Responsive layout và scroll motion.
- Hostname parser và một số test tenant isolation cơ bản.
- Prisma schema nháp.
- Một vài Next.js Route Handler demo.

### Khoảng trống còn lại

- Forgot/reset password đã có code; còn cấu hình Resend và smoke test email thật trên production.
- Landing page và development fallback vẫn còn một phần dữ liệu trình diễn.
- Logo/banner chưa có luồng upload S3 riêng.
- Google Map và tin liên quan chưa triển khai.
- Chưa có critical E2E suite, contract tests và accessibility audit đầy đủ.
- Chưa smoke test upload với AWS S3 production.
- Public theme system 4 mẫu chưa triển khai.
- Chưa có CI/CD, monitoring, backup drill và production security hardening.

## 4. Kiến trúc đích

```text
nice-land/
├── apps/
│   ├── web/                       # Next.js frontend
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   └── tests/
│   └── api/                       # Fastify backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── sites/
│       │   │   ├── posts/
│       │   │   ├── media/
│       │   │   ├── subscriptions/
│       │   │   ├── contacts/
│       │   │   └── audit/
│       │   ├── plugins/
│       │   ├── middleware/
│       │   ├── services/
│       │   └── server.ts
│       └── tests/
├── packages/
│   ├── database/                  # Prisma schema, migrations, client, seed
│   ├── contracts/                 # Zod schemas, DTOs, enums
│   ├── api-client/                # Typed fetch client cho web
│   ├── config/                    # Shared TypeScript/ESLint/Prettier config
│   └── test-utils/                # Factories và test helpers
├── docs/
├── pnpm-workspace.yaml
├── package.json
└── pnpm-lock.yaml
```

### Dependency rules

```text
apps/web ───────► packages/contracts
    │            packages/api-client
    │
    └──────────► HTTP ─────────────► apps/api
                                      │
apps/api ──────► packages/contracts   │
                 packages/database ◄──┘
```

- `apps/web` không import Prisma hoặc code nội bộ của API.
- `apps/api` không import component/frontend code.
- `packages/contracts` không phụ thuộc framework.
- Chỉ `packages/database` được tạo Prisma client.

## 5. Luồng tenant khi FE và BE tách domain

### Public request

1. Người dùng mở `minhphat.nice-land.vn`.
2. Next.js đọc hostname để render đúng tenant.
3. FE gọi `https://api.nice-land.vn/public/...`.
4. FE gửi `X-Tenant-Host: minhphat.nice-land.vn`.
5. API kiểm tra host có đúng root domain hoặc custom domain đã xác minh.
6. API resolve `Site` từ host, kiểm tra active/subscription và tạo `TenantContext`.
7. Repository bắt buộc dùng `tenantContext.siteId`.

### Admin request

Ngoài tenant resolution:

1. API xác minh access token.
2. Token ADMIN phải có `siteId`.
3. `token.siteId` phải khớp `TenantContext.siteId`.
4. SUPER_ADMIN được phép chỉ định site qua route param sau authorization.

### Security invariant

Không endpoint nào nhận `siteId` từ body/query rồi tin trực tiếp. `siteId` phải đến từ:

- Hostname đã được API xác minh, hoặc
- Token đã ký, hoặc
- Route Super Admin đã qua authorization.

## 6. Auth đề xuất

- Password hash: Argon2id.
- Access token: 10–15 phút.
- Refresh token: random opaque token, hash lưu database.
- Cookie: `HttpOnly`, `Secure`, `SameSite=Lax` hoặc `None` nếu kiến trúc domain yêu cầu.
- Refresh rotation sau mỗi lần refresh.
- Logout thu hồi refresh session.
- Rate limit login theo IP + username.
- Lock/throttle tạm thời khi đăng nhập sai liên tục.
- Password reset bằng token một lần, có thời hạn.
- Audit log cho login thất bại, reset password và thay đổi quyền.

## 7. API contract chính

### Public

```text
GET    /v1/public/site
GET    /v1/public/categories
GET    /v1/public/posts
GET    /v1/public/posts/:postId
POST   /v1/public/contact-requests
```

### Auth

```text
POST   /v1/auth/login
POST   /v1/auth/refresh
POST   /v1/auth/logout
GET    /v1/auth/me
POST   /v1/auth/forgot-password
POST   /v1/auth/reset-password
```

### Tenant Admin

```text
GET    /v1/admin/dashboard
GET    /v1/admin/posts
POST   /v1/admin/posts
GET    /v1/admin/posts/:postId
PATCH  /v1/admin/posts/:postId
DELETE /v1/admin/posts/:postId
PATCH  /v1/admin/posts/:postId/status

POST   /v1/admin/posts/:postId/images/presign
POST   /v1/admin/posts/:postId/images/complete
DELETE /v1/admin/images/:imageId
PATCH  /v1/admin/images/order

GET    /v1/admin/site
PATCH  /v1/admin/site
GET    /v1/admin/subscription
POST   /v1/admin/renewal-requests
```

### Super Admin

```text
GET    /v1/superadmin/dashboard
GET    /v1/superadmin/sites
POST   /v1/superadmin/sites
GET    /v1/superadmin/sites/:siteId
PATCH  /v1/superadmin/sites/:siteId
PATCH  /v1/superadmin/sites/:siteId/status
POST   /v1/superadmin/sites/:siteId/reset-admin-password

GET    /v1/superadmin/plans
POST   /v1/superadmin/plans
PATCH  /v1/superadmin/plans/:planId
DELETE /v1/superadmin/plans/:planId

GET    /v1/superadmin/contact-requests
PATCH  /v1/superadmin/contact-requests/:requestId
GET    /v1/superadmin/renewal-requests
PATCH  /v1/superadmin/renewal-requests/:requestId
GET    /v1/superadmin/audit-logs
```

## 8. Database cần hoàn thiện

### Model hiện có cần giữ

- Site
- User
- PropertyCategory
- PropertyPost
- PropertyImage
- SubscriptionPlan
- AuditLog
- ContactRequest

### Model/field cần bổ sung

- `RefreshSession`: quản lý refresh token và thiết bị.
- `PasswordResetToken`: reset password một lần.
- `RenewalRequest`: yêu cầu gia hạn.
- `SubscriptionHistory`: lịch sử đổi gói/gia hạn.
- `SiteDomain`: root subdomain và custom domain đã xác minh.
- `Lead`: liên hệ từ từng property/tenant.
- `PropertyView`: thống kê lượt xem đã aggregate hoặc raw event có TTL.
- `User.lastLoginAt`, `User.isActive`.
- `PropertyPost.slug`, `publishedAt`, `createdById`, `updatedById`.
- `PropertyImage.storageKey`, `mimeType`, `size`, `width`, `height`.
- `AuditLog.ipAddress`, `userAgent`, `requestId`.
- Soft delete hoặc archive policy cho dữ liệu quan trọng.

### Ràng buộc bắt buộc

- Composite indexes theo `siteId`.
- Unique slug trong phạm vi site.
- Cascade/restrict rõ ràng cho từng relation.
- Transaction khi tạo site + admin + subscription.
- Decimal cho giá tiền.
- UTC trong database; format timezone tại FE.

## 9. Kế hoạch triển khai theo phase

## Phase 0 — Xác nhận quyết định sản phẩm

### Công việc

- Chọn FE host.
- Chọn API host.
- Chọn PostgreSQL provider.
- Chọn AWS region, bucket và CDN/public URL.
- Chọn email provider.
- Chọn map provider.
- Chốt payment có nằm trong bản launch hay không.
- Chốt custom domain có nằm trong bản launch hay không.

### Acceptance

- Có document quyết định và environment matrix.
- Không còn câu hỏi kiến trúc blocking.

### Verify

- Review `Open Questions` ở cuối tài liệu.

---

## Phase 1 — Chuyển sang monorepo

**Trạng thái: Hoàn thành foundation ngày 19/06/2026.**

- [x] Tạo pnpm workspace.
- [x] Di chuyển frontend vào `apps/web`.
- [x] Khởi tạo Fastify trong `apps/api`.
- [x] Tạo `contracts`, `api-client`, `database`, `config`.
- [x] Tách Next.js Route Handlers khỏi frontend.
- [x] FE và API chạy đồng thời trên cổng riêng.
- [x] Typecheck, tests và build toàn workspace thành công.
- [ ] Docker image chưa build local vì môi trường hiện tại chưa cài Docker.

### Task 1.1: Tạo workspace root

- Thêm `pnpm-workspace.yaml`.
- Root scripts: `dev`, `build`, `test`, `lint`, `typecheck`.
- Chuyển npm lock sang pnpm lock.

Acceptance:

- `pnpm install` chạy từ root.
- Workspace nhận diện được web, api và packages.

Verify:

```bash
pnpm install
pnpm -r list --depth -1
```

### Task 1.2: Di chuyển frontend sang `apps/web`

- Di chuyển `app`, `components`, CSS, public assets và Next config.
- Giữ nguyên URL và giao diện hiện tại.
- Xóa Next Route Handlers khỏi frontend sau khi API đã thay thế.

Acceptance:

- Tất cả page hiện tại render giống trước migration.
- `apps/web` build độc lập.

Verify:

```bash
pnpm --filter web test
pnpm --filter web build
```

### Task 1.3: Khởi tạo `apps/api`

- Fastify server.
- Config validation.
- Health/readiness endpoint.
- Error handler chuẩn.
- Request ID và structured logging.

Acceptance:

- `/health/live` và `/health/ready` trả kết quả đúng.
- API fail fast nếu thiếu environment variable.

### Task 1.4: Tạo shared packages

- `contracts`: enums, Zod schemas, DTOs.
- `database`: Prisma schema/client.
- `api-client`: typed fetch wrapper.
- `config`: shared TypeScript/ESLint.

Acceptance:

- FE và API import package bằng `workspace:*`.
- Không có duplicate domain types.

### Checkpoint Phase 1

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

---

## Phase 2 — Database thật và tenant foundation

**Trạng thái hiện tại: foundation hoàn thành; Prisma Postgres primary database
đã được tạo ở `ap-southeast-1` và baseline migration đã được apply.**

- [x] Hoàn thiện Prisma schema, indexes và relation policy.
- [x] Tạo baseline migration PostgreSQL.
- [x] Tạo seed idempotent cho plans, Super Admin, hai tenant và demo posts.
- [x] Tenant resolver hỗ trợ platform subdomain, localhost và verified custom domain.
- [x] Chặn inactive, suspended và expired tenant.
- [x] Tenant-scoped query helper chống override `siteId`.
- [x] Unit/integration tests cho tenant context.
- [x] Public site config repository/API dùng tenant context.
- [x] Landing và tenant contact request repository/API.
- [x] Public property listing/detail API với search, filter, sort và pagination.
- [x] Public post chỉ trả `PUBLISHED`/`SOLD` trong đúng tenant.
- [x] Apply migration lên Prisma Postgres primary database.
- [ ] Chạy seed an toàn trên Prisma Postgres với mật khẩu production do người
  vận hành cung cấp.

### Task 2.1: Hoàn thiện Prisma schema

- Bổ sung model/field ở phần 8.
- Tạo indexes, constraints và relation policy.
- Tạo migration đầu tiên.

### Task 2.2: Seed dữ liệu

- Super Admin.
- Subscription plans.
- Hai demo tenants.
- Admin account.
- Categories, posts và images.

### Task 2.3: Tenant resolution plugin

- Resolve từ `X-Tenant-Host`.
- Allowlist root domain.
- Hỗ trợ localhost.
- Hỗ trợ custom domain verified.
- Check active và subscription.

### Task 2.4: Tenant-safe repositories

- Repository nhận `TenantContext`, không nhận `siteId` tùy ý.
- Test đọc/sửa/xóa chéo tenant.

### Checkpoint Phase 2

- Migration chạy trên database sạch.
- Seed idempotent hoặc có reset workflow rõ ràng.
- Admin A không thể đọc/update/delete dữ liệu Admin B.

---

## Phase 3 — Authentication & authorization

**Trạng thái hiện tại: core auth hoàn thành ở mức code, chờ Prisma Postgres để
smoke test với user thật.**

- [x] Password hash bằng bcrypt.
- [x] Access token HS256, issuer/audience và TTL 15 phút.
- [x] Opaque refresh token được SHA-256 trước khi lưu database.
- [x] Refresh rotation và revoke khi logout.
- [x] Login phân biệt root Super Admin và tenant Admin.
- [x] ADMIN token bắt buộc khớp tenant resolve từ hostname.
- [x] `/login`, `/refresh`, `/logout`, `/me`.
- [x] HttpOnly refresh cookie.
- [x] FE login form, session access token và auth guard cấu hình bằng environment.
- [x] Logout action.
- [x] Unit/integration tests cho credential, rotation và cross-tenant access.
- [ ] Apply database migration/seed trên Prisma Postgres rồi smoke test user thật.
- [x] Forgot/reset password bằng token một lần, tenant-aware, có UI và thu hồi session.
- [ ] Cấu hình Resend production và smoke test email reset thật.

### Vertical slice 3.1: Tenant Admin login

- Login API.
- Access/refresh token.
- Login form nối API.
- Auth store và auto refresh.
- Protected admin routes.

### Vertical slice 3.2: Super Admin login

- Role guard.
- Super Admin protected routes.
- Forbidden state.

### Vertical slice 3.3: Logout và session management

- Revoke refresh session.
- Logout toàn bộ thiết bị nếu cần.
- Current user endpoint.

### Vertical slice 3.4: Password reset

- [x] Forgot password.
- [x] One-time reset token.
- [x] Email qua Resend khi provider được cấu hình.
- [x] Reset tenant admin từ Super Admin.

### Checkpoint Phase 3

- Login/logout/refresh chạy E2E.
- ADMIN không vào Super Admin.
- Token tenant A không gọi API tenant B.
- Cookie hoạt động đúng trên staging FE/API domain.

---

## Phase 4 — Public website nối API thật

### Kiến trúc public theme

- Một codebase frontend và một bộ API dùng chung cho mọi tenant.
- `Site.themeKey` chọn presentation layer từ registry có type.
- Feature/container dùng chung chịu trách nhiệm fetch dữ liệu, filter,
  pagination, lead form và analytics.
- Mỗi theme chỉ định nghĩa design tokens và các presentation components cho
  header, hero, listing, property card, detail và footer.
- Logo, banner và `themeColor` tiếp tục là branding override trên theme.
- Theme không được thay đổi URL, quyền truy cập, trạng thái tin hoặc tính năng.
- Theme key không hợp lệ phải fallback về `CLASSIC_ESTATE`.

Bốn theme launch:

1. `CLASSIC_ESTATE`: cao cấp, serif, bố cục bất động sản truyền thống.
2. `MODERN_GRID`: sans-serif, grid rõ ràng, ưu tiên tìm kiếm và danh sách.
3. `EDITORIAL`: ảnh lớn, nhịp bố cục như tạp chí.
4. `WARM_MINIMAL`: màu ấm, thoáng, gần gũi với môi giới cá nhân.

### Vertical slice 4.1: Site config

- Public site endpoint.
- Branding động.
- Inactive/expired states.
- Cache invalidation khi admin cập nhật.

### Vertical slice 4.2: Property listing

- Pagination cursor hoặc offset.
- Search.
- Type, price, area, province, district filters.
- Sort newest/price.
- URL search params để share và back/forward đúng.

### Vertical slice 4.3: Property detail

- Published-only access.
- Gallery.
- Map.
- Related properties.
- Contact CTA và lead capture.

### Vertical slice 4.4: Landing contact

- Lưu ContactRequest.
- Spam protection.
- Super Admin nhận và xử lý request.

### Vertical slice 4.5: Public theme rendering

- [x] Thêm `PublicTheme` và `Site.themeKey` với default `CLASSIC_ESTATE`.
- [x] Public site contract trả `themeKey`.
- [x] Tạo typed theme registry và fallback an toàn.
- [x] Giữ public data containers và business behavior dùng chung giữa các theme.
- [x] Implement 4 theme cho homepage/listing/detail với cùng feature parity.
- [x] Theme presentation stylesheet tải theo tenant; không ship CSS của cả bốn theme.
- [x] Branding variables và typography tokens được giới hạn theo theme đang dùng.
- [x] Không fork route, API client hoặc business logic theo theme.

### Checkpoint Public Theme Rendering

- [x] Cùng một tenant fixture render được đủ 4 theme.
- [x] Search, filter, pagination, detail, CTA và lead form hoạt động giống nhau.
- [x] Không có horizontal overflow ở 360px, 768px, 1024px và desktop.
- [x] Theme không hợp lệ fallback đúng.
- [x] Chuyển theme không làm mất bài đăng hoặc cấu hình branding.
- Lighthouse/performance budget không giảm đáng kể do font hoặc bundle theme.

### Checkpoint Phase 4

- Không còn public data hard-code.
- Draft/hidden post không thể truy cập bằng URL.
- Inactive và expired tenant bị chặn.

---

## Phase 5 — Tenant Admin post management

**Trạng thái hiện tại: CRUD tin đăng tenant-safe, pagination, categories và
tài khoản seed local đã hoạt động; production smoke test vẫn còn.**

### Vertical slice 5.1: Dashboard

- [x] API tổng hợp tenant-safe cho dashboard.
- [x] Counts thật, gồm tổng tin, đang đăng, bản nháp và đã bán.
- [x] Plan usage.
- [x] Recent posts.
- [x] View/lead statistics 30 ngày.

### Vertical slice 5.2: Create post

- [x] Shared Zod schema và form nối API thật.
- [x] Plan limit.
- [x] Draft/publish.
- [x] Audit log.

### Vertical slice 5.3: Edit post

- [x] Load detail.
- [x] Optimistic concurrency bằng version.
- [x] Status transitions.
- [x] Audit fields/status.

### Vertical slice 5.4: Delete/archive post

- [x] Confirm dialog.
- [x] Archive/soft-delete policy.
- [x] Cleanup ảnh theo orphan cleanup job.
- [x] Audit log.

### Vertical slice 5.5: Categories

- [x] CRUD categories theo tenant, có audit log.
- [x] Tenant-scoped slug.
- [x] Không xóa category đang được sử dụng.
- [x] Form tin đăng và public filter dùng category từ API thật.
- [x] Chặn gán category thuộc tenant khác vào tin đăng.

### Checkpoint Phase 5

- Tenant Admin CRUD đầy đủ.
- Refresh page không mất dữ liệu.
- Mọi mutation đều có audit log.

---

## Phase 6 — Image upload

**Trạng thái hiện tại: presign, direct PUT, metadata, reorder, delete và orphan
cleanup đã hoàn thành ở mức code; còn AWS production smoke test và image
optimization.**

### Task 6.1: Presigned upload

- [x] API tạo presigned URL.
- [x] FE upload trực tiếp lên AWS S3.
- [x] API complete upload và lưu metadata.

### Task 6.2: Validation

- [x] MIME allowlist.
- [x] File size tối đa 8 MB.
- Image dimensions.
- [x] Max images theo plan.
- [x] Tenant-scoped object key.

### Task 6.3: Image management

- [x] Reorder bằng thao tác trái/phải; có thể nâng cấp drag-and-drop sau.
- [x] Set cover image bằng `sortOrder = 0`.
- [x] Delete metadata và cleanup S3.
- [x] Orphan cleanup job dry-run mặc định, grace period 24 giờ.

### Task 6.4: Image optimization

- Thumbnail variants hoặc image CDN.
- WebP/AVIF.
- Lazy loading và responsive sizes.

### Checkpoint Phase 6

- [x] Upload nhiều ảnh tuần tự ổn định ở mức code.
- [x] Tenant A không reorder/xóa object tenant B.
- [x] Có job xử lý orphan file sau failure/retry.
- [ ] Smoke test với AWS bucket thật và CORS production.

---

## Phase 7 — Tenant settings & subscription

### Vertical slice 7.1: Branding

- [x] Logo, banner, theme color.
- [x] Contact info.
- [x] Social links.
- [x] Preview trước khi lưu.

### Vertical slice 7.1.1: Theme selection

- [x] Landing có CTA `Xem website mẫu`.
- [x] Landing và `/themes` hiển thị gallery 4 theme.
- [x] Khách có thể mở full sample website cho từng theme.
- [x] Lựa chọn gói/theme được chuyển vào form tư vấn.
- [x] Tenant Admin không có quyền đổi theme qua UI hoặc API.
- [x] Theme chỉ áp dụng cho website public.

### Vertical slice 7.2: Subscription usage

- [x] Current plan.
- [x] Limits.
- [x] End date.
- [x] Grace period/expired behavior.

### Vertical slice 7.3: Renewal request

- [x] Admin gửi request.
- [x] Super Admin duyệt/từ chối.
- [x] Ghi subscription history khi Super Admin duyệt.
- [x] Audit log khi tenant gửi yêu cầu.

### Checkpoint Phase 7

- [x] Branding cập nhật lên guest site.
- [x] Limit post và image được enforce ở API, không chỉ FE.

---

## Phase 8 — Super Admin operations

### Vertical slice 8.1: Manage sites

- [x] Chọn initial public theme khi Super Admin tạo site.
- [x] Hiển thị và đổi theme trong tenant detail khi cần hỗ trợ khách hàng.

- [x] Search/filter/pagination.
- [x] Create site transaction.
- [x] Edit site.
- [x] Activate/deactivate.
- [x] View usage.

### Vertical slice 8.2: Manage plans

- [x] CRUD plans.
- [x] Không xóa plan đang được sử dụng.
- [x] Thay đổi plan chỉ áp dụng khi gán/gia hạn tenant.

### Vertical slice 8.3: Admin account management

- [x] Reset password.
- [x] Disable account và revoke session.
- [x] View last login.

### Vertical slice 8.4: Contacts and renewals

- [x] Status workflow: NEW, IN_PROGRESS, DONE, REJECTED.
- Notes và assignee nếu cần.

### Vertical slice 8.5: Audit logs

- [x] Filter theo site/user/action/date.
- [x] Detail JSON.
- Export CSV nếu cần.

### Checkpoint Phase 8

- [x] Super Admin có thể vận hành toàn bộ tenant mà không cần thao tác database thủ công.

---

## Phase 9 — SEO, analytics và lead features

### SEO

- [x] Dynamic metadata.
- [x] Canonical URL.
- [x] Open Graph.
- [x] JSON-LD.
- [x] Tenant sitemap.
- [x] robots.txt.
- [x] Property slug thân thiện.

### Analytics

- [x] Property view tracking.
- [x] Deduplicate bot/repeated events.
- [x] Dashboard 30 ngày.
- [x] Top posts.

### Lead

- [x] Contact form theo property.
- [x] Click phone/Zalo tracking.
- [x] Lead inbox cho Tenant Admin.
- [x] Lead status và notes.
- [x] Email notification qua provider cấu hình (Resend).

### Checkpoint Phase 9

- [x] Property được index đúng.
- [x] Tenant xem được nguồn lead và tin hiệu quả.

---

## Phase 10 — Production quality

### Testing

- Unit: validation, tenant resolver, auth, plan limits.
- Integration: API + test database.
- Security: cross-tenant matrix.
- E2E: Playwright cho các critical flows.
- Contract tests giữa FE và API.

Critical E2E flows:

1. Super Admin login → create tenant.
2. Tenant Admin login → create post → upload images → publish.
3. Guest search → open detail → submit lead.
4. Super Admin deactivate tenant → public site blocked.
5. Subscription expires → public blocked, admin renewal page accessible.

### Security

- CORS allowlist.
- Helmet/security headers.
- Rate limiting.
- Request body limits.
- SQL injection protected by ORM and validation.
- XSS sanitization cho rich text.
- CSRF strategy cho cookie endpoints.
- Secret rotation.
- Dependency audit.
- Upload malware/content policy nếu cần.

### Reliability

- Structured logs.
- Error tracking.
- Metrics và uptime monitor.
- Database backup + restore drill.
- Migration rollback/forward policy.
- AWS S3 lifecycle.
- Scheduled orphan cleanup.

### Performance

- API pagination.
- Query analysis.
- Database connection pooling.
- Cache public site config.
- CDN cho ảnh.
- Web Vitals budgets:
  - LCP < 2.5s.
  - CLS < 0.1.
  - INP < 200ms.

### Accessibility

- Keyboard navigation.
- Focus management.
- Color contrast.
- Accessible forms/errors.
- Reduced motion.
- Automated axe checks cho critical pages.

---

## Phase 11 — CI/CD và deployment

### CI

Trên mỗi pull request:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Thêm:

- API integration tests với PostgreSQL service.
- E2E smoke test trên preview/staging.
- Migration validation.

### FE deployment

- Root directory: `apps/web`.
- Environment:
  - `NEXT_PUBLIC_API_URL`
  - `NEXT_PUBLIC_ROOT_DOMAIN`
  - `NEXT_PUBLIC_APP_URL`
- Wildcard domain: `*.nice-land.vn`.

### API deployment

- Fastify deploy trên AWS Lightsail bằng Node.js/Docker.
- Production database: Prisma Postgres primary database.
- Environment:
  - `DATABASE_URL`
  - `JWT_ACCESS_SECRET`
  - `COOKIE_SECRET`
  - `CORS_ORIGINS`
  - `ROOT_DOMAIN`
  - Storage credentials
  - Email credentials
- Health check: `/health/ready`.

### Release order

1. Apply backward-compatible migration.
2. Deploy API.
3. Run smoke tests.
4. Deploy FE.
5. Verify root domain + tenant subdomain.
6. Monitor errors/latency.

## 10. Tính năng “full” nên chia thành ba mốc

### Mốc A — Production MVP

Bắt buộc để có khách hàng thật:

- Monorepo.
- PostgreSQL/Prisma thật.
- Auth + RBAC.
- Tenant isolation.
- Guest listing/detail.
- Admin post CRUD.
- Upload ảnh.
- Branding.
- 4 public themes có feature parity và cho phép chọn khi tạo site.
- Super Admin site/plan management.
- Subscription enforcement thủ công.
- Audit logs.
- Tests, backup, monitoring, deploy.

### Mốc B — Complete SaaS

- Renewal workflow.
- Lead inbox.
- Analytics.
- Email notifications.
- Custom domain.
- Import/export posts.
- Better SEO.
- Staff/agent accounts trong mỗi tenant.
- Activity/session management.

### Mốc C — Advanced product

- Payment gateway và invoice.
- Auto renewal.
- CRM pipeline.
- Appointment booking.
- Favorites.
- Property comparison.
- Advanced map search.
- Nearby amenities.
- Messaging integrations.
- Mobile/PWA.

Không nên đưa toàn bộ Mốc C vào launch đầu tiên; nó làm chậm việc kiểm chứng sản phẩm và tăng mạnh phạm vi security/operations.

## 11. Ước lượng thô

Với một developer full-time, đã có UI hiện tại:

- Phase 1–3: 2–3 tuần.
- Phase 4–6: 3–4 tuần.
- Phase 7–8: 2–3 tuần.
- Phase 9–11: 2–4 tuần.

Production MVP hợp lý: khoảng 9–14 tuần, tùy auth, upload, deployment và mức test.

Complete SaaS thường cần thêm 4–8 tuần.

Đây là ước lượng kỹ thuật, chưa gồm thời gian thay đổi yêu cầu, chuẩn bị nội dung, tích hợp payment phức tạp hoặc quy trình duyệt custom domain.

## 12. Definition of Done cho web hoàn chỉnh

- Không còn data nghiệp vụ hard-code.
- FE và API build/deploy độc lập.
- Tất cả form chính nối API và lưu database.
- Auth refresh/logout/reset password hoạt động.
- RBAC và tenant isolation có test tự động.
- Admin CRUD post + ảnh + branding hoàn chỉnh.
- Khách chọn theme từ landing/onboarding; Super Admin gán theme khi tạo site.
- Tất cả public themes có cùng tính năng, responsive và fallback an toàn.
- Super Admin vận hành site/plan/subscription/account hoàn chỉnh.
- Guest chỉ thấy published posts của tenant hợp lệ.
- Inactive/expired tenant bị chặn đúng policy.
- Audit log bao phủ mutation quan trọng.
- Public pages đạt SEO và performance budget.
- Critical E2E tests pass.
- Backup, restore, monitoring và alert đã được kiểm tra.
- Staging và production có environment tách biệt.
- Có runbook xử lý deploy, migration và incident.

## 13. Open Questions cần chốt

1. FE deploy ở **Vercel**. ✅ Đã chốt
2. API Fastify deploy trên **AWS Lightsail**. ✅ Đã chốt
3. PostgreSQL dùng **Prisma Postgres primary database**. ✅ Đã chốt
4. Storage dùng **AWS S3**. ✅ Đã chốt
5. Payment có nằm trong bản launch đầu tiên không?
6. Custom domain có nằm trong bản launch đầu tiên không?
7. Một tenant chỉ có một ADMIN hay có nhiều nhân viên/agent?
8. Tin đăng cần workflow duyệt nội bộ hay admin publish trực tiếp?
9. Xóa post là hard delete hay archive/soft delete?
10. Có cần map trả phí và tìm kiếm theo bán kính ngay ở launch không?
11. Lead cần gửi email, Zalo, Telegram hay chỉ lưu dashboard?
12. Có cần import dữ liệu từ Excel ngay ở launch không?

## 13.1 Deployment decisions đã chốt

### Frontend — Vercel

- Deploy `apps/web`.
- Root domain: `nice-land.vn`.
- Wildcard domain: `*.nice-land.vn`.
- Preview deployment cho pull request.
- Environment production:
  - `NEXT_PUBLIC_API_URL=https://api.nice-land.vn`
  - `NEXT_PUBLIC_APP_URL=https://nice-land.vn`
  - `NEXT_PUBLIC_ROOT_DOMAIN=nice-land.vn`

### Backend — AWS Lightsail

- Deploy `apps/api` dưới dạng Docker container chạy Node.js.
- Lightsail là hạ tầng hiện tại, không phải dependency kiến trúc.
- Primary database: Prisma Postgres, region `ap-southeast-1`.
- Business code không được gọi metadata API của provider hoặc phụ thuộc filesystem cố định.
- Config, database, storage, email và domain đều được inject qua environment variables.
- File upload không lưu lâu dài trên disk của instance; dùng AWS S3.
- Health check, graceful shutdown và stateless API là yêu cầu bắt buộc để chuyển host không đổi code.
- Public domain: `api.nice-land.vn`.
- Reverse proxy bằng Caddy hoặc Nginx; HTTPS bằng Let's Encrypt.
- Fastify listen trên `0.0.0.0` và port do environment/runtime cung cấp.
- Health checks:
  - `/health/live`
  - `/health/ready`
- Log JSON gửi ra stdout và được rotate/ship tới monitoring.
- Database và storage credentials chỉ nằm trong environment/secrets trên server.
- Staging và production có environment tách biệt.

### CI/CD dự kiến

```text
GitHub push/merge
      │
      ├── Vercel tự build và deploy apps/web
      └── GitHub Actions
              ├── test/build apps/api
              ├── build và push Docker image
              └── deploy image lên AWS Lightsail
```

### Các quyết định deployment còn thiếu

- Custom domain `api.nice-land.vn` và DNS.
- Container registry: GitHub Container Registry hay AWS ECR.
- AWS S3 bucket đặt cùng `ap-southeast-1` hoặc region gần người dùng.

## 13.2 AWS S3 upload decision

### Luồng upload

```text
Admin Web
   │ 1. POST presign metadata
   ▼
Fastify API
   │ 2. Validate tenant, post, plan, MIME, size
   │ 3. Return presigned PUT URL + objectKey
   ▼
Admin Web ───── 4. PUT file trực tiếp ─────► AWS S3
   │
   │ 5. POST complete(objectKey, metadata)
   ▼
Fastify API
   │ 6. HEAD object trên S3
   │ 7. Lưu PropertyImage và AuditLog
   ▼
Post edit UI
```

### Object key

```text
sites/{siteId}/posts/{postId}/{imageId}/original.{ext}
```

Không nhận object key tùy ý từ client. API tự tạo key chứa `siteId` đã resolve.

### Bucket policy

- Block Public Access bật mặc định.
- Upload/download private qua presigned URL, hoặc public delivery qua CloudFront.
- Không dùng ACL per-object; dùng bucket ownership enforced.
- CORS chỉ cho Vercel production/preview domains cần thiết.
- Presigned upload hết hạn sau 5–10 phút.
- Giới hạn MIME: JPEG, PNG, WebP, AVIF.
- Giới hạn kích thước ban đầu: 10 MB/ảnh.
- Lifecycle dọn object tạm/orphan.
- IAM user/role chỉ có quyền cần thiết trên bucket/prefix.

### Environment

```env
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=nice-land-media
AWS_S3_PUBLIC_URL=https://cdn.nice-land.vn
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

Trên Lightsail, credentials để trong secrets/environment, không commit. Khi
chuyển sang ECS/EC2 có thể thay access key bằng IAM role mà không đổi storage
service interface.
- Monitoring: Sentry + uptime monitor hay AWS CloudWatch.

## 14. Bước triển khai tiếp theo

Sau khi duyệt plan:

1. Trả lời 12 Open Questions.
2. Chốt Mốc A là phạm vi implementation đầu tiên.
3. Bắt đầu Phase 1: chuyển code hiện tại sang `apps/web`.
4. Khởi tạo `apps/api`, `packages/contracts` và `packages/database`.
5. Giữ giao diện hiện tại hoạt động trong suốt migration.
