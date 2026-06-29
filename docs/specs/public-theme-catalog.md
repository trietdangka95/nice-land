# Spec: Public Theme Catalog

## Objective

Nice Land cung cấp nhiều giao diện website bất động sản có cùng dữ liệu và
tính năng nhưng khác rõ về cách trình bày. Khách hàng phải nhận ra phong cách
của từng theme ngay từ thumbnail, có thể mở website mẫu đầy đủ trước khi chọn,
và superadmin có thể gán theme cho tenant mà không phải chạm code UI thủ công.

## Current Public Themes

1. `WARM_MINIMAL`
   - Preference: `warm`
   - Direction: Personal Broker
   - Character: ấm, gần gũi, nhấn mạnh độ tin cậy và liên hệ trực tiếp
2. `COLD_MODERN`
   - Preference: `cold`
   - Direction: Cold Modern
   - Character: navy/cyan sắc nét, bố cục chính xác, cảm giác chuyên nghiệp

## Registry Contract

Theme mới chỉ được xem là hoàn chỉnh khi có đủ metadata trong
`apps/web/lib/public-themes.ts`:

- `key`
- `preference`
- `preferenceLabel`
- `name`
- `description`
- `direction`
- `demoSlug`
- `demoSiteId`
- `demoDataSiteId`
- `previewSwatches`
- `stylesheetHref`
- `homeRenderer`
- `thumbnailRenderer`
- `headerComposition`
- `footerComposition`
- `detailComposition`
- `fontStyle`
- `density`
- `surfaces`

## Architecture

- Theme catalog metadata và theme runtime renderer là hai lớp riêng:
  - catalog metadata: tên, mô tả, preview, demo wiring, onboarding/admin labels
  - runtime renderer: home/detail/header/footer/broker-intro composition
- Registry theme là nguồn dữ liệu duy nhất cho metadata, stylesheet, homepage
  renderer, thumbnail renderer, preview wiring và admin selection.
- Mỗi theme có module presentation riêng.
- API, tenant data, search/filter, pagination và property detail dùng chung.
- Theme không thay đổi quyền hạn hoặc dữ liệu tenant.
- Thêm theme mới bằng cách tạo module và đăng ký một definition mới; không sửa
  business flow của public website.

## Testing Strategy

- Unit test xác nhận mọi theme có:
  - surface parity
  - preview metadata parity
  - home/detail/header/footer/broker-intro composition parity
- Typecheck và production build toàn web.
- Browser verification tại 320px, 768px, 1024px và desktop khi tạo theme mới.

## Boundaries

- Always: responsive, keyboard accessible, giữ nguyên URL/filter state.
- Ask first: đổi enum theme hoặc database schema.
- Never: sao chép nguyên thiết kế/asset có bản quyền từ website tham khảo.

## Success Criteria

- Mỗi theme có thumbnail mô phỏng website thật, không dùng placeholder chung.
- Mỗi theme có homepage, header, footer và detail composition riêng hoặc khai
  báo rõ composition dùng chung có chủ đích.
- Theme mới không yêu cầu thêm `if/else` vào route page public.
- Theme mới không yêu cầu hard-code card ở onboarding hay superadmin form.
- Registry có thể mở rộng mà không thêm override CSS tràn lan hoặc `!important`
  mới.
