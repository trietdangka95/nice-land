# Spec: Expired Subscription Renewal Request Modal

## Assumptions I'm Making
1. Đây là thay đổi cho web admin tenant hiện có, không áp dụng cho public site hoặc superadmin UI ngoài phần nhận request.
2. Khi gói đã hết hạn, admin vẫn đăng nhập được và bị điều hướng về `/admin/subscription`, đúng với luồng hiện tại.
3. Popup auto-open ngay trong màn expired/subscription để thúc đẩy hành động nhanh, thay vì tạo route mới.
4. Popup không cần field nhập tay vì tenant đã được xác định từ domain/slug hiện tại và requested user đã có trong session.
5. Superadmin không cần thêm field mới để nhận diện; dữ liệu `site` và `requestedBy` trong renewal request hiện tại là đủ để xử lý.
6. Chúng ta chưa thêm gửi email trong scope này; “handle tiếp” của superadmin tiếp tục dùng màn `Liên hệ & gia hạn` hiện có.

## Objective
Khi website đã hết hạn gói dịch vụ, admin cần thấy một popup request gia hạn rõ ràng và cực nhanh để thao tác. Popup chỉ có một hành động chính là `Request` để gửi yêu cầu gia hạn tới hệ thống. Superadmin tiếp tục nhìn thấy request đó trong màn quản lý hiện có để xử lý.

Success from the user perspective:
- Admin hết hạn vẫn có một hành động nổi bật để gửi yêu cầu gia hạn ngay, không phải điền form.
- Request gửi đi gắn với tenant hiện tại nên superadmin không phải suy đoán website nào đang cần xử lý.
- Superadmin thấy request mới trong màn quản lý hiện có và có thể tiếp tục workflow đang dùng.

## Tech Stack
- Frontend: Next.js 16 + React 19 + TypeScript
- Backend: Fastify + TypeScript
- Database: Prisma
- Shared contracts: `packages/contracts`
- Notifications/toasts: UI toast provider hiện có

## Commands
- Dev: `corepack pnpm dev`
- Dev web only: `corepack pnpm --filter @nice-land/web dev`
- Dev api only: `corepack pnpm --filter @nice-land/api dev`
- Typecheck: `corepack pnpm typecheck`
- Test: `corepack pnpm test`
- Web tests only: `corepack pnpm --filter @nice-land/web test`
- API tests only: `corepack pnpm --filter @nice-land/api test`

## Project Structure
- `apps/web/components/admin/` -> tenant admin UI, gồm màn subscription hiện tại
- `apps/web/components/superadmin/` -> màn superadmin xem và xử lý renewal requests
- `apps/web/lib/` -> helper hiển thị lỗi, API client wiring
- `apps/api/src/modules/sites/` -> API tenant admin, gồm create renewal request
- `apps/api/src/modules/superadmin/` -> API và repository superadmin
- `packages/contracts/src/` -> schema input/output dùng chung giữa web và api
- `docs/specs/` -> nơi lưu spec cho thay đổi này

## Code Style
Ưu tiên mở rộng đúng mô hình hiện có: contract trước, repository/API sau, UI cuối cùng. Giữ naming rõ nghĩa theo domain.

```ts
if (error instanceof ApiClientError && error.status === 402) {
  return "Gói dịch vụ đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng hệ thống.";
}
```

Conventions:
- Dùng English cho type/interface/schema ids, Vietnamese cho copy hiển thị.
- Không thêm dependency UI mới nếu modal có thể xây từ component/pattern sẵn có.
- Reuse toast/error handling hiện tại thay vì tạo cơ chế báo lỗi riêng.

## Testing Strategy
- Contracts: giữ request contract gọn, không thêm field thừa cho popup expired
- API tests: thêm hoặc sửa test cho `POST /v1/admin/renewal-requests` để xác nhận popup flow vẫn tạo request thành công cho tenant expired
- Repository tests: xác nhận superadmin list request tiếp tục hiển thị đúng `site` và `requestedBy`
- Web tests: nếu repo chưa có test component phù hợp, tối thiểu chạy typecheck; nếu có thể, thêm test render/submit cho popup
- Manual verification:
  - Tenant expired vào `/admin/subscription` thấy popup
  - Submit thành công tạo renewal request mới
  - Superadmin vào màn requests thấy đúng tenant và người gửi request

## Boundaries
- Always: giữ luồng điều hướng expired hiện tại, reuse API renewal request hiện có, typecheck trước khi kết thúc
- Ask first: thay đổi schema database, đổi workflow xử lý của superadmin, thêm gửi email hoặc notification ngoài luồng hiện có
- Never: bypass trạng thái expired để mở lại toàn bộ admin area, hard-code tenant info giả, xóa luồng pending renewal hiện tại

## Success Criteria
- Khi `subscription.status` là `EXPIRED`, admin thấy một popup renewal request nổi bật trong màn subscription.
- Popup không yêu cầu nhập field nào; chỉ cần một CTA chính để gửi yêu cầu.
- CTA chính dùng nhãn `Yêu cầu gia hạn`.
- Submit popup gọi API renewal request thành công và hiển thị trạng thái “đang được xử lý”.
- Request được gắn với tenant hiện tại và `requestedBy` hiện tại thông qua session/context đang có.
- Superadmin nhìn thấy request mới trong màn renewal requests hiện có mà không cần thay đổi workflow xử lý.
- Không làm hỏng luồng pending request hiện tại và không cho tạo trùng request đang `NEW`/`IN_PROGRESS`.
