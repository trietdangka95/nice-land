# Kế hoạch triển khai: Tính năng Video (YouTube & S3) cho Gói Premium

Tài liệu này lưu trữ thiết kế kỹ thuật và các bước thực hiện để tích hợp tính năng thêm video dành riêng cho người dùng thuộc gói đăng ký cao cấp (Premium). Hệ thống sẽ hỗ trợ 2 phương thức: **Gắn link YouTube** hoặc **Upload trực tiếp (nén video trước khi lưu vào S3)**.

## 1. Thay Đổi Database Schema

Cập nhật `packages/database/prisma/schema.prisma` để hỗ trợ lưu trữ video cho mỗi bài đăng (`PropertyPost`). Chúng ta sẽ sử dụng trường `videoUrl` để lưu cả link YouTube hoặc link S3, và dùng `videoKey` để nhận biết file S3 cần quản lý.

```prisma
// packages/database/prisma/schema.prisma

model PropertyPost {
  // ... các trường hiện tại
  status      PostStatus        @default(DRAFT)
  publishedAt DateTime?
  
  // THÊM MỚI 2 TRƯỜNG NÀY:
  videoUrl    String?           // Đường dẫn URL công khai (YouTube URL hoặc S3 URL)
  videoKey    String?           // Object Key trên S3 (chỉ có giá trị nếu là video upload, dùng để xóa file)
  
  createdById String?
  // ...
}
```

Sau khi sửa file schema, chạy lệnh `prisma db push` (hoặc migrate) và generate lại Prisma client.

---

## 2. Cập Nhật API Contracts

Cập nhật thư viện `packages/contracts` để frontend và backend giao tiếp với nhau.

```typescript
// packages/contracts/src/index.ts

// 1. Cập nhật DTO của Post để nhận videoUrl
export const adminPostInputSchema = z.object({
  // ...
  videoUrl: z.string().url().nullable().optional(),
  videoKey: z.string().nullable().optional(), // Frontend có thể gửi lên null nếu đổi sang YouTube
});
```

---

## 3. Cập Nhật Backend API (Fastify) & Logic Xử Lý Video

Để đáp ứng yêu cầu **"Resize video trước khi lưu vào S3"**, chúng ta không thể dùng phương pháp Presigned URL (đẩy thẳng từ trình duyệt lên S3) như hình ảnh. Thay vào đó, video sẽ được đẩy lên Server tạm thời, Server dùng `FFmpeg` để nén lại, sau đó đẩy bản đã nén lên S3 và xóa file tạm.

### A. Cài đặt thư viện xử lý Video trên Server
- Cài đặt `fluent-ffmpeg` trong `apps/api` để điều khiển quá trình nén.
- Đảm bảo máy chủ (VPS/Docker) có cài đặt phần mềm `ffmpeg`.

### B. Tạo API Upload & Nén Video (POST `/v1/admin/posts/:id/videos/upload`)
- **Mục đích:** Nhận file video từ Client (`multipart/form-data`), nén lại với chất lượng tốt, sau đó lưu lên S3.
- **Quy trình xử lý:**
  1. **Upload:** Lưu file video gốc vào thư mục tạm trên server (ví dụ: `/tmp/uploads`).
  2. **Resize/Compress:** Dùng `fluent-ffmpeg` để nén video. Cấu hình đề xuất để cân bằng dung lượng và chất lượng (Độ phân giải tối đa 720p hoặc 1080p, bitrate khoảng 2-3Mbps, mã hóa H.264/AAC).
  3. **Đẩy lên S3:** Dùng AWS SDK `PutObjectCommand` đẩy file *đã nén* lên S3.
  4. **Dọn dẹp:** Xóa file gốc và file đã nén khỏi thư mục tạm trên Server.
  5. **Lưu Database:** Cập nhật `videoUrl` và `videoKey` vào `PropertyPost` qua Prisma. Trả về kết quả cho Frontend.

### C. API Xóa Video S3 (DELETE `/v1/admin/posts/:id/videos`)
- Gọi AWS SDK để xóa object khỏi S3 dựa trên `videoKey`, set `videoUrl` và `videoKey` thành `null`.

---

## 4. Cập Nhật Frontend (Next.js Admin)

### A. UI Cập Nhật (`apps/web/components/admin/property-form.tsx`)
Thêm khu vực "Video Giới Thiệu" với 2 Tabs (hoặc Toggle): **Gắn Link YouTube** và **Tải Video Lên**.

1. **Tab 1: Gắn Link YouTube**
   - Một ô Input text: "Nhập đường dẫn YouTube (VD: https://youtube.com/watch?v=...)".
   - Regex kiểm tra xem link có hợp lệ không.
   - Khi lưu tin đăng, gửi `videoUrl` là link YouTube và `videoKey` là `null` lên API.

2. **Tab 2: Tải Video Lên (Upload)**
   - Nút chọn file `accept="video/mp4,video/quicktime"`.
   - Giới hạn dung lượng ở Frontend (VD: tối đa 50MB hoặc 100MB).
   - Khi user chọn file, dùng `FormData` gửi file lên API `POST /v1/admin/posts/:id/videos/upload`.
   - Cần hiển thị **Loading Spinner** hoặc "Đang xử lý và nén video..." vì quá trình này trên Server sẽ mất một chút thời gian (vài chục giây đến vài phút tùy cấu hình máy chủ).

3. **Video Player (Xem trước):**
   - Viết một hàm nhận biết `videoUrl`.
   - Nếu `videoUrl` chứa `youtube.com` hoặc `youtu.be`: Render component `YouTubeEmbed` (dùng `<iframe>`).
   - Nếu `videoUrl` là link S3 thông thường: Render thẻ `<video src={videoUrl} controls>` của trình duyệt.

---

## 5. Rủi Ro & Lưu ý về Hiệu Suất

- **Quá tải Server API:** Việc chạy `FFmpeg` tốn rất nhiều CPU và RAM. Nếu nhiều admin upload video cùng lúc, server Fastify có thể bị treo (Out of Memory). 
- **Giải pháp mở rộng (Nếu lượng user lớn):** Thay vì xử lý đồng bộ trên Fastify, ta nên đẩy file gốc lên S3 (vào một bucket `raw-videos`), sau đó dùng **AWS Lambda** (hoặc một worker chạy nền bằng BullMQ) để tải về, nén bằng FFmpeg, đẩy lại lên S3 ở bucket `processed-videos`, và bắn webhook báo cho Frontend biết. Tuy nhiên, nếu lượng tải lên chưa nhiều, xử lý trực tiếp trên Fastify là cách nhanh nhất để khởi đầu.
