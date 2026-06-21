# Implementation Plan: Public Theme Catalog

## Tasks

- [x] Mở rộng registry với `direction`, `homeRenderer` và `thumbnailRenderer`.
  - Verify: registry tests fail before implementation and pass afterward.
- [x] Xây bốn thumbnail bằng nội dung và ảnh bất động sản thực tế.
  - Verify: gallery thể hiện bốn composition khác nhau.
- [x] Tách homepage thành shared data model và bốn renderer presentation.
  - Verify: mỗi `themePreview` render đúng module, search state được giữ nguyên.
- [x] Hoàn thiện responsive và visual polish.
  - Verify: browser screenshots tại mobile/tablet/desktop; không có overflow.
- [x] Chạy test, typecheck, production build và cập nhật checklist.
- [x] Khóa quyền create/update theme bằng integration tests và actor audit contract.
- [x] Thay shared public header/footer bằng bốn header và bốn footer composition riêng.
- [x] Thu nhỏ property card; Search First dùng grid 4 cột desktop theo ảnh tham khảo.

## Risks

- CSS theme cũ có specificity cao: thay bằng class contract rõ ràng và giữ
  stylesheet cho property detail.
- Bốn renderer dễ lặp business logic: route chuẩn hóa data một lần rồi truyền
  cùng một view model vào renderer.
