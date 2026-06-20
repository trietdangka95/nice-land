# Spec: DatCuaToi MVP

## Objective

Xây dựng website SaaS bất động sản đa tenant có bốn khu vực: landing page,
website công khai của tenant, admin tenant và super admin. Bản MVP phải chạy
ngay với dữ liệu demo, responsive và thể hiện rõ tenant isolation.

## Tech Stack

Next.js App Router, React, TypeScript, Tailwind CSS, Vitest; Fastify chạy bằng
Node.js; Prisma ORM với Prisma Postgres làm primary database.

## Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Test: `npm test`

## Project Structure

- `app/`: pages và route handlers
- `components/`: UI dùng lại
- `lib/`: data demo, tenant resolution, formatters
- `prisma/`: database schema
- `tests/`: unit tests

## Code Style

```tsx
export function SectionTitle({ eyebrow, children }: Props) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider">{eyebrow}</p>
      <h2 className="font-display text-4xl">{children}</h2>
    </div>
  );
}
```

Component dùng PascalCase, utility dùng camelCase, ưu tiên semantic HTML và
composition.

## Testing Strategy

Vitest kiểm thử hostname parser, tenant access và public post filtering. Build
Next.js là checkpoint tích hợp.

## Boundaries

- Always: tenant query có `siteId`; guest chỉ thấy `PUBLISHED`; UI dùng semantic HTML.
- Ask first: kết nối database production, thêm payment hoặc thay đổi DNS.
- Never: tin `siteId` từ client; lộ secret; cho admin đọc tenant khác.

## Infrastructure

- Frontend: Vercel.
- Backend: AWS Lightsail; Fastify stateless và không phụ thuộc provider.
- Database: Prisma Postgres primary database, region `ap-southeast-1`.
- Storage: AWS S3 bằng presigned URL.
- Prisma project: `nice-land` (`proj_cmqllfy7j0qm2w0fathh7y2kb`).

## Success Criteria

- Landing page đủ hero, tính năng, quy trình, pricing, demo, FAQ, contact.
- Tenant guest page có search/filter, listing và detail.
- Admin và super admin có dashboard, navigation và bảng quản lý chính.
- Subdomain middleware map hostname sang slug.
- Tests và production build thành công.

## Current Slice: Tenant Admin Post CRUD

- Admin chỉ đọc và mutate bài thuộc tenant từ hostname + access token.
- Tạo bài mặc định `DRAFT`; chỉ `DRAFT`, `PUBLISHED`, `HIDDEN`, `SOLD` được chọn.
- Update bắt buộc gửi `version`; version cũ trả conflict.
- Xóa từ giao diện là archive/soft-delete, không hard delete.
- Mỗi create/update/archive ghi audit log.
- Danh sách, form tạo và form sửa dùng API thật; có loading, error và empty state.

## Current Slice: Post Image Management

- `sortOrder = 0` là ảnh bìa; reorder phải gửi đúng toàn bộ image IDs của bài.
- Chỉ ADMIN đúng tenant được reorder hoặc xóa ảnh.
- Xóa metadata trong database trước; lỗi cleanup S3 được log để retry.
- UI có nút đặt ảnh bìa, di chuyển trái/phải và xóa với xác nhận.

## Current Slice: Tenant Settings and Subscription

- Tenant admin chỉ đọc/sửa branding của `siteId` được resolve từ host và JWT.
- Branding gồm tên, slogan, logo, banner, màu chủ đạo, liên hệ và social links; mỗi lần sửa có audit log.
- Public web đọc branding qua API tenant nên cấu hình mới xuất hiện sau khi tải lại.
- Usage lấy từ số post chưa soft-delete và tổng image thuộc tenant.
- Mỗi tenant chỉ có một renewal request `NEW` hoặc `IN_PROGRESS` tại một thời điểm.
- Tenant hết hạn bị khóa public và API nội dung, nhưng vẫn đăng nhập, xem subscription và gửi renewal request được.

## Current Slice: Super Admin Operations

- Route `/v1/superadmin/*` chỉ chấp nhận `SUPER_ADMIN` có JWT `siteId = null`; tenant admin không thể gọi route cross-tenant.
- Tạo website chạy transaction gồm Site, platform domain, admin user, subscription history và audit log.
- Reset password tạo mật khẩu tạm ngẫu nhiên, hash trước khi lưu, revoke refresh session và chỉ trả plaintext một lần.
- Duyệt renewal cập nhật site subscription, tạo subscription history và audit log trong cùng transaction.
- Plan đang được tenant sử dụng không thể xóa; chỉnh plan không tự thay đổi lịch sử/quota của tenant cho đến khi được gán.
- Super Admin có thể khóa site, khóa admin, xử lý contact, renewal và tra cứu audit log từ giao diện.

## Current Slice: SEO, Analytics and Leads

- Property detail dùng slug công khai, canonical, Open Graph và JSON-LD `RealEstateListing`.
- Mỗi tenant có sitemap tại `/{slug}/sitemap.xml`; robots chặn các khu admin.
- View chỉ ghi cho post public đúng tenant; bot phổ biến bị bỏ qua và một visitor/post chỉ tính một lần trong 24 giờ.
- Visitor hash là SHA-256 của IP, user-agent và server secret; không lưu IP thô trong analytics.
- Lead form khóa theo post + tenant từ host. Tenant Admin chỉ đọc/cập nhật lead và analytics của chính tenant.
- Dashboard analytics tổng hợp 30 ngày, gồm views, leads và top posts.
- Click Gọi/Zalo tạo conversion event gắn với property và tenant.
- Lead form gửi email qua Resend khi có `RESEND_API_KEY` và `EMAIL_FROM`; lỗi provider không rollback lead.
