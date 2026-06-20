# Social Post Import — Facebook/Zalo → Property Draft

## 1. Kết luận khả thi

### Mục tiêu sản phẩm

Người bán bất động sản thường đăng nội dung lên Facebook và Zalo trước. Hệ
thống giúp họ tái sử dụng nội dung đó để tạo `PropertyPost` trên website mà
không phải nhập lại toàn bộ.

### Kết luận

**Khả thi nếu sản phẩm được thiết kế là “đồng bộ theo yêu cầu và chuẩn hóa bài
social”.**

**Không nên thiết kế là “server bí mật crawl mọi bài Facebook/Zalo cá nhân”.**

Lý do:

- Facebook hạn chế thu thập dữ liệu bằng phương thức tự động nếu không được cho
  phép.
- API chính thức của Meta phù hợp hơn với Facebook Page do người dùng quản lý,
  không phải toàn bộ bài trên profile cá nhân.
- Quyền đọc Page thường cần Meta App, OAuth, permission và App Review.
- Zalo Official Account có hệ API riêng; timeline tài khoản Zalo cá nhân không
  có API public ổn định để đồng bộ bài đăng.
- HTML, login flow, anti-bot và media URL của mạng xã hội có thể thay đổi bất cứ
  lúc nào.
- Hotlink ảnh social không đáng tin cậy; URL có thể hết hạn hoặc bị chặn.

## 2. Phương án đề xuất

Xây một **Social Import Pipeline** với nhiều nguồn:

| Nguồn | Cách import | Tự động | Độ bền |
|---|---|---:|---:|
| Facebook Page | Meta Graph API sau OAuth | Cao | Cao |
| Facebook profile cá nhân | Người dùng paste nội dung/link hoặc dùng Share Extension | Thấp/Trung bình | Cao |
| Zalo Official Account | Zalo OA API nếu scope hỗ trợ | Trung bình/Cao | Trung bình |
| Zalo cá nhân | Copy nội dung + tải/chia sẻ ảnh vào website | Thấp | Cao |
| File/clipboard | Paste text, upload ảnh, import JSON/Excel | Thấp | Rất cao |

### Khuyến nghị launch

1. Làm **Quick Import** trước.
2. Sau đó làm Facebook Page connector.
3. Chỉ nghiên cứu Zalo OA connector khi đã xác nhận API/scope trên một OA thật.
4. Không chạy lịch đồng bộ hoặc crawler chạy nền. Chỉ thực hiện khi admin bấm
   nút.

## 3. Trải nghiệm người dùng đề xuất

### Luồng A — Quick Import, phù hợp mọi tài khoản

1. Admin mở `Đăng tin → Nhập từ Facebook/Zalo`.
2. Paste nguyên nội dung bài đăng.
3. Upload hoặc kéo thả các ảnh đã dùng trên social.
4. Có thể paste URL bài gốc để lưu nguồn.
5. Bấm `Phân tích bài đăng`.
6. AI/parser trích xuất:
   - Tiêu đề.
   - Loại bất động sản.
   - Giá.
   - Diện tích.
   - Địa chỉ.
   - Tỉnh/quận/phường.
   - Số phòng.
   - Pháp lý.
   - Nội dung mô tả.
   - Số điện thoại.
7. Hệ thống tạo **DRAFT**, không publish ngay.
8. Admin kiểm tra các trường có độ tin cậy thấp.
9. Admin sửa, chọn ảnh bìa rồi publish.

Mục tiêu UX: tạo draft trong dưới 60 giây.

### Luồng B — Facebook Page connector, đồng bộ theo yêu cầu

1. Admin chọn `Kết nối Facebook Page`.
2. OAuth với Meta.
3. Admin chọn Page mình quản lý.
4. Hệ thống lưu token đã mã hóa và Page ID.
5. Sau khi đăng bài Facebook, admin mở website và bấm `Đồng bộ bài mới`.
6. API chỉ lấy bài mới hơn `lastSyncedAt` hoặc cursor gần nhất.
7. Hệ thống hiển thị các bài chưa từng import.
8. Admin có thể để hệ thống import tất cả bài mới, hoặc chọn từng bài.
9. Worker tải text/media được API cho phép.
10. Parser tạo draft.
11. Admin duyệt rồi publish.

Không có cron job. Nếu admin không bấm nút thì hệ thống không gọi API mạng xã
hội và không phát sinh import.

Nút đồng bộ có thể hỗ trợ:

- `Đồng bộ bài mới`: lấy từ cursor gần nhất.
- `Chọn bài để nhập`: hiển thị bài gần đây.
- `Thử lại`: chạy lại bài lỗi.
- Lọc bằng hashtag như `#dangtin` để tránh nhập nhầm nội dung cá nhân của Page.

### Luồng C — Share to DatCuaToi

Giai đoạn sau có thể làm:

- PWA share target trên Android.
- Mobile app share extension.
- Browser extension/bookmarklet do chính người dùng kích hoạt trên bài của họ.

Người dùng đang xem bài social chọn `Chia sẻ → Đất Của Tôi`; app nhận text,
link và ảnh được hệ điều hành cung cấp rồi tạo draft.

Không để extension tự động quét timeline hoặc thu thập bài của người khác.

## 4. Kiến trúc

```text
Admin bấm Đồng bộ ───────────┐
Facebook Page API ───────────┤
Quick Paste/Share ───────────┼──► ImportSource
Zalo OA API ─────────────────┘         │
                             ▼
                       ImportJob Queue
                             │
                 ┌───────────┴───────────┐
                 ▼                       ▼
          Media Ingestion          Text Normalizer
          AWS S3 storage           AI/Rule Parser
                 │                       │
                 └───────────┬───────────┘
                             ▼
                      Property Draft
                             │
                       Admin Review
                             │
                          Publish
```

### Backend modules

```text
apps/api/src/modules/
  social-connections/
  social-imports/
  import-jobs/
  property-extraction/
  media-ingestion/
  posts/
```

### Worker

Không chạy tác vụ download/parse dài trong HTTP request. Nút đồng bộ chỉ tạo
job; UI theo dõi trạng thái qua polling hoặc server-sent events.

Khuyến nghị:

- Redis + BullMQ, hoặc
- PostgreSQL job queue ở bản đầu để giảm hạ tầng.

Worker có thể chạy cùng Docker image với command khác:

```text
node dist/server.js
node dist/worker.js
```

Như vậy vẫn portable khi chuyển khỏi Lightsail.

## 5. Database bổ sung

```prisma
enum SocialProvider {
  FACEBOOK_PAGE
  ZALO_OA
  MANUAL
  SHARE_EXTENSION
}

enum ImportStatus {
  QUEUED
  FETCHING
  PARSING
  NEEDS_REVIEW
  COMPLETED
  FAILED
  DUPLICATE
}

model SocialConnection {
  id                 String   @id @default(uuid())
  siteId             String
  provider           SocialProvider
  externalAccountId  String
  displayName        String?
  encryptedToken     String?
  tokenExpiresAt     DateTime?
  scopes             String[]
  isActive           Boolean  @default(true)
  lastSyncedAt       DateTime?
  syncCursor         String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  @@unique([siteId, provider, externalAccountId])
  @@index([siteId, provider])
}

model SocialImport {
  id                 String       @id @default(uuid())
  siteId             String
  connectionId       String?
  provider           SocialProvider
  externalPostId     String?
  sourceUrl          String?
  sourcePublishedAt  DateTime?
  rawText            String
  rawPayload         Json?
  contentHash        String
  status             ImportStatus
  errorCode          String?
  errorMessage       String?
  confidence         Json?
  createdPostId      String?
  createdById        String
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  @@unique([siteId, provider, externalPostId])
  @@index([siteId, status, createdAt])
  @@index([siteId, contentHash])
}

model ImportedMedia {
  id              String   @id @default(uuid())
  socialImportId  String
  sourceUrl       String?
  storageKey      String
  mimeType        String
  size            Int
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())

  @@index([socialImportId, sortOrder])
}
```

`SocialConnection`, `SocialImport`, media và post đều phải tenant-scoped.

## 6. Chuẩn hóa nội dung bất động sản

### Rule parser trước

Các bài bán bất động sản thường có pattern khá rõ:

```text
Giá: 3 tỷ 250
DT: 5x20
Diện tích: 100m2
Địa chỉ: Hòa Xuân, Cẩm Lệ
Pháp lý: sổ đỏ
LH: 090...
```

Nên dùng rule/regex deterministic cho:

- Giá và đơn vị.
- Diện tích/kích thước.
- Số điện thoại.
- Số phòng.
- Pháp lý.
- Hashtag.

### AI parser sau

AI dùng để:

- Viết lại tiêu đề.
- Tóm tắt mô tả.
- Phân loại property type.
- Xác định địa điểm từ văn phong tự nhiên.
- Loại bỏ câu kêu gọi tương tác không phù hợp website.

Không để AI tự quyết dữ liệu quan trọng nếu không có bằng chứng.

Mỗi field nên trả:

```ts
{
  value: "3.25 tỷ",
  normalizedValue: 3250000000,
  confidence: 0.96,
  sourceText: "Giá 3 tỷ 250"
}
```

Field confidence thấp phải được highlight để admin kiểm tra.

## 7. Media ingestion

Không lưu URL ảnh Facebook/Zalo trực tiếp vào `PropertyImage`.

Pipeline:

1. Download media khi nguồn/API cho phép.
2. Kiểm tra MIME, size và magic bytes.
3. Resize/normalize.
4. Lưu vào AWS S3 theo tenant:

```text
sites/{siteId}/imports/{importId}/{imageId}.webp
```

5. Tạo thumbnail.
6. Loại ảnh trùng bằng SHA-256 hoặc perceptual hash.
7. Xóa orphan media nếu import bị hủy.

Với Quick Import, admin upload file trực tiếp bằng presigned URL.

## 8. Duplicate detection

Một bài có thể được đăng lại nhiều lần hoặc có mặt trên cả Facebook và Zalo.

Kiểm tra:

- `externalPostId` trong cùng provider.
- Hash của normalized text.
- Hash/perceptual hash ảnh.
- So sánh giá + diện tích + địa chỉ.

Khi nghi trùng:

- Không tạo post mới tự động.
- Hiển thị post có thể trùng.
- Cho phép `Bỏ qua`, `Cập nhật post cũ`, hoặc `Tạo mới`.

## 9. API đề xuất

### Quick Import

```text
POST   /v1/admin/social-imports/parse
POST   /v1/admin/social-imports
GET    /v1/admin/social-imports
GET    /v1/admin/social-imports/:importId
POST   /v1/admin/social-imports/:importId/retry
POST   /v1/admin/social-imports/:importId/create-draft
DELETE /v1/admin/social-imports/:importId
```

### Connections

```text
GET    /v1/admin/social-connections
GET    /v1/admin/social-connections/facebook/start
GET    /v1/admin/social-connections/facebook/callback
DELETE /v1/admin/social-connections/:connectionId
POST   /v1/admin/social-connections/:connectionId/sync-new
GET    /v1/admin/social-connections/:connectionId/sync-jobs/:jobId
```

### Imported posts

```text
GET    /v1/admin/social-connections/:connectionId/posts
POST   /v1/admin/social-connections/:connectionId/posts/import
```

## 10. UI đề xuất

```text
Admin
├── Tin đăng
│   ├── Đăng tin thủ công
│   └── Nhập từ Facebook/Zalo
├── Bài social đã nhập
│   ├── Chờ duyệt
│   ├── Đã tạo tin
│   ├── Trùng lặp
│   └── Lỗi
└── Kết nối mạng xã hội
    ├── Facebook Page
    │   ├── Đồng bộ bài mới
    │   ├── Lần đồng bộ gần nhất
    │   └── Các bài chưa nhập
    └── Zalo OA (sau)
```

Trang review chia hai cột:

- Trái: bài social gốc + ảnh.
- Phải: form PropertyPost đã được điền.

Các field confidence thấp có màu cảnh báo và ghi nguồn text.

## 11. Phạm vi triển khai

## Phase A — Proof of Concept

Mục tiêu: xác nhận parser có tạo draft hữu ích từ 30–50 bài thật.

### Công việc

1. Thu thập bài mẫu do chính người bán cung cấp.
2. Xây rule parser.
3. Thêm AI extraction dạng adapter.
4. Tạo màn hình paste text + upload ảnh.
5. Preview dữ liệu trích xuất.
6. Chưa lưu database thật nếu muốn thử nhanh.

### Acceptance

- Trích xuất đúng giá, diện tích, địa điểm trên ít nhất 80% bài mẫu rõ ràng.
- Admin tạo draft nhanh hơn nhập thủ công ít nhất 50%.
- Không publish tự động.

### Ước lượng

3–5 ngày.

---

## Phase B — Production Quick Import

### Công việc

1. Thêm schema import.
2. API create/list/retry/create-draft.
3. Presigned image upload vào AWS S3.
4. Duplicate detection.
5. Audit logs.
6. Quota/usage limit.
7. UI review hoàn chỉnh.

### Acceptance

- Import text + ảnh tạo PropertyPost DRAFT thật.
- Retry an toàn, không tạo duplicate.
- Tenant isolation có test.
- Media được copy về storage của hệ thống.

### Ước lượng

1–2 tuần sau khi database/auth/post CRUD đã hoàn thành.

---

## Phase C — Facebook Page Connector

### Công việc

1. Tạo Meta App.
2. OAuth và Page selection.
3. Xin permission cần thiết.
4. App Review.
5. Token encryption/refresh.
6. Page post list.
7. Nút `Đồng bộ bài mới`.
8. Cursor-based incremental sync.
9. Import có hashtag/keyword filter.

### Acceptance

- Chỉ đọc Page mà admin đã cấp quyền.
- Revoke connector xóa hoặc vô hiệu token.
- Chỉ đồng bộ khi admin bấm nút.
- Bài mới tạo draft, không tự publish.
- Sync idempotent.

### Ước lượng kỹ thuật

1–2 tuần; thời gian Meta App Review nằm ngoài kiểm soát.

---

## Phase D — Zalo OA Connector

Chỉ bắt đầu sau khi:

- Có Zalo OA test thật.
- Xác nhận scope có thể đọc loại nội dung mong muốn.
- Xác nhận quy trình cấp token và giới hạn rate.

Nếu API không cho đọc timeline/bài theo nhu cầu, giữ Quick Import/Share flow làm
phương án chính.

## 12. Những cách không đề xuất

### Server crawler đăng nhập bằng username/password

Không làm vì:

- Rủi ro khóa tài khoản.
- Phải lưu credential/OTP/cookie nhạy cảm.
- Dễ vỡ do CAPTCHA/2FA/UI thay đổi.
- Vi phạm hoặc có nguy cơ vi phạm điều khoản nền tảng.
- Chi phí bảo trì cao.

### Selenium/Playwright chạy nền để quét timeline

Chỉ có thể dùng cho nghiên cứu nội bộ ngắn hạn với tài khoản test và xem xét
điều khoản; không phù hợp core production feature.

### Hotlink ảnh social

Không làm vì URL có thể hết hạn, bị chặn hoặc thay đổi quyền riêng tư.

### Tự động publish không qua review

Không làm ở bản đầu vì parser có thể hiểu sai giá, địa chỉ hoặc trạng thái pháp lý.

## 13. Security và privacy

- Chỉ import nội dung mà tenant xác nhận họ sở hữu hoặc có quyền sử dụng.
- Ghi consent khi kết nối account/Page.
- Token được mã hóa at rest.
- Không log access token hoặc raw cookies.
- Có disconnect/revoke.
- Có retention policy cho raw social payload.
- Xóa dữ liệu nguồn khi tenant yêu cầu.
- Audit log cho connect, sync, import và publish.
- Rate limit và quota theo tenant.
- Debounce/lock nút đồng bộ để tránh tạo nhiều job song song.
- Không thu thập comment, friend list hoặc dữ liệu người tương tác nếu không cần.

## 14. Chi phí

### Quick Import

- Hạ tầng thấp.
- Chi phí chủ yếu là AI extraction và image storage.
- Có thể giới hạn số lần AI parse theo gói.

### Connector

- Tăng chi phí vận hành token, queue, retry và platform review.
- Cần monitoring riêng cho provider error/rate limit.

Gợi ý gói:

- Basic: Quick Import.
- Professional: AI extraction + batch import.
- Business: Facebook Page connector + scheduled sync.

## 15. Quyết định sản phẩm đề xuất

Đưa feature này vào roadmap theo thứ tự:

1. **Quick Import từ text + ảnh** — chắc chắn làm được và dùng được cho cả
   Facebook/Zalo cá nhân.
2. **AI tạo Property Draft** — giá trị khác biệt cao.
3. **Facebook Page connector on-demand** — admin bấm nút sau khi đăng bài.
4. **Share Extension/PWA share target** — giảm thao tác copy.
5. **Zalo OA connector** — chỉ sau khi xác minh API thực tế.

## 16. Câu hỏi cần người dùng xác nhận

1. Phần lớn khách hàng đăng bằng Facebook profile cá nhân hay Facebook Page?
2. Họ thường dùng Zalo cá nhân hay Zalo Official Account?
3. Có chấp nhận bước admin kiểm tra draft trước khi publish không?
4. Họ có thể upload lại ảnh gốc, hay bắt buộc hệ thống lấy ảnh từ social?
5. Có 30–50 bài mẫu thật để đánh giá parser không?
6. Khi admin bấm đồng bộ lại, có cần cập nhật bài đã import nếu nội dung social
   đã sửa không?
7. Một bài social có thể chứa nhiều bất động sản hay luôn là một bất động sản?

## 17. Bước tiếp theo

Không triển khai connector ngay.

Làm PoC `Quick Import` với 30–50 bài thật trước. Sau đó triển khai connector với
nút `Đồng bộ bài mới`; không cần scheduler/cron. Nếu extraction accuracy và thời
gian tiết kiệm đạt tiêu chí, đưa schema/import workflow vào sau Phase Database,
Auth và Property CRUD của roadmap chính.
