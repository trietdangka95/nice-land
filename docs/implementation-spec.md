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
