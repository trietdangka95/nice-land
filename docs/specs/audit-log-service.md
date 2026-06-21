# Spec: Audit Log Service

## Objective

Chuẩn hóa cách mutation backend ghi audit log để mọi event có cùng contract:
tenant, actor, action, entity và details. Audit write phải có thể dùng cả trong
Prisma transaction lẫn sau một mutation độc lập.

## Contract

- `siteId`: optional cho platform-wide actions, bắt buộc với tenant actions.
- `userId`: actor thực hiện mutation.
- `action`: stable uppercase action code.
- `entityType` và `entityId`: đối tượng bị thay đổi.
- `details`: JSON không chứa password, token hoặc secret.

## Testing

- Unit test service map chính xác event sang Prisma create input.
- Unit test platform action không tự thêm `siteId`.
- Existing route/repository tests phải tiếp tục pass.

## Success Criteria

- Tenant post/category/site/image mutations dùng service chung.
- Upload ảnh tạo `IMAGE_UPLOADED` audit event.
- Super Admin mutations có thể dùng cùng service.
- Không thay đổi response contract của API.

