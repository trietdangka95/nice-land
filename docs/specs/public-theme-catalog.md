# Spec: Public Theme Catalog

## Objective

Nice Land cung cấp nhiều giao diện website bất động sản có cùng dữ liệu và
tính năng nhưng khác rõ về cách trình bày. Khách hàng phải nhận ra phong cách
của từng theme ngay từ thumbnail và có thể mở website mẫu đầy đủ trước khi
chọn.

## Confirmed Theme Directions

1. `CLASSIC_ESTATE` — Luxury Showcase: ảnh bất động sản toàn màn hình, nhịp
   chữ sang trọng, phù hợp môi giới phân khúc cao cấp.
2. `MODERN_GRID` — Search First: tìm kiếm và bộ lọc là trọng tâm, mật độ tin
   cao, phù hợp môi giới có nhiều sản phẩm.
3. `EDITORIAL` — Property Editorial: bố cục tạp chí bất đối xứng, ảnh lớn,
   phù hợp bộ sưu tập bất động sản tuyển chọn.
4. `WARM_MINIMAL` — Personal Broker: lấy thương hiệu và sự tin cậy của môi
   giới cá nhân làm trọng tâm.

## Architecture

- Registry theme là nguồn dữ liệu duy nhất cho metadata, stylesheet, homepage
  renderer và thumbnail renderer.
- Mỗi theme có module presentation riêng.
- API, tenant data, search/filter, pagination và property detail dùng chung.
- Theme không thay đổi quyền hạn hoặc dữ liệu tenant.
- Thêm theme mới bằng cách tạo module và đăng ký một definition mới; không sửa
  business flow của public website.

## Testing Strategy

- Unit test xác nhận mọi theme có direction, renderer và thumbnail riêng.
- Typecheck và production build toàn web.
- Browser verification tại 320px, 768px, 1024px và desktop.

## Boundaries

- Always: responsive, keyboard accessible, giữ nguyên URL/filter state.
- Ask first: đổi enum theme hoặc database schema.
- Never: sao chép nguyên thiết kế/asset có bản quyền từ website tham khảo.

## Success Criteria

- Bốn thumbnail mô phỏng một phần website thật, không dùng chung wireframe.
- Bốn homepage có header và footer composition riêng; không dùng cùng markup
  rồi chỉ thay màu/font.
- Bốn homepage khác rõ ở hero/search/listing hierarchy và typography.
- Listing card compact, ưu tiên ảnh, tiêu đề, giá, diện tích và vị trí; Search
  First hiển thị 4 cột desktop theo ảnh tham khảo.
- Tất cả theme vẫn tìm kiếm, lọc, phân trang và mở chi tiết tin được.
- Registry có thể mở rộng mà không thêm nhánh điều kiện vào route page.
