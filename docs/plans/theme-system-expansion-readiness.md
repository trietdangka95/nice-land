# Implementation Plan: Theme System Expansion Readiness

## Overview

Muc tieu cua ke hoach nay la bien he theme hien tai tu muc "co the them theme moi nhung con thu cong" thanh "co the them theme moi theo checklist ro rang, it cham code chung, it regression". Ke hoach nay tap trung vao public tenant themes, demo flow, registry theme, admin authoring, va test parity.

## Architecture Decisions

- Giu `themeKey` lam source of truth xuyen suot tu database den frontend public rendering.
- Dung `publicThemes` lam registry trung tam cho metadata, renderer mapping, demo slug, va cac surface bat buoc.
- Uu tien composition theo theme cho `header`, `home`, `detail`, `footer`, `broker-intro` thay vi tiep tuc tang nhanh `if/else` trong page chung.
- Theme moi phai di qua cung mot checklist ky thuat: contract, DB, registry, renderer, CSS, demo, admin selection, test parity.

## Guardrails

- Khong thay doi business logic cua tenant, listing, lead flow, pagination, auth, hay subscription trong ke hoach nay. Chi duoc phep thay doi wiring/theme composition va presentation layer phuc vu mo rong theme.
- Khong sua hanh vi cua Warm va Cold theme dang chay, tru khi co bug presentation ro rang va co test bao ve.
- CSS moi phai duoc co lap theo namespace theme hoac semantic class ro rang. Khong dua theme moi bang cach override lan rong vao class chung.
- Khong dung `!important` cho thuoc tinh CSS moi, tru khi dang bao ve mot surface cu bat kha khang va co ghi chu ly do. Mac dinh xem `!important` la khong duoc phep.
- Uu tien them semantic class cho theme-specific surface thay vi tang do uu tien selector.
- Moi thay doi presentation quan trong phai co verification bang `typecheck`, `test`, va manual check tren Warm + Cold de tranh regression.

## Current Assessment

- Co san:
  - `themeKey` da co trong DB, contracts, API, admin, superadmin.
  - Theme registry da ton tai o `apps/web/lib/public-themes.ts`.
  - Da co pattern theme rieng cho Warm va Cold: stylesheet, thumbnail, homepage renderer, demo slug.
- Chua toi uu cho scale:
  - Mot so helper van hardcode theme keys.
  - Detail page va mot vai man public van phai render theo nhanh theme cu the.
  - Demo/theme preview van can wiring rieng theo slug.
  - Admin theme selection va public composition chua hoan toan driven by registry.

## Task List

### Phase 1: Registry Hardening

- [x] Task 1: Chuan hoa `resolvePublicTheme` va helper lien quan de dua tren registry thay vi hardcode tung theme key.
- [x] Task 2: Chuan hoa `getPublicThemeHomeRenderer`, `thumbnailRenderer`, `demoHref` bang map/registry thay vi `if/else`.

Acceptance criteria:
- [x] Them theme moi khong can sua nhieu helper rieng le.
- [x] Theme key khong hop le van fallback ve default an toan.
- [x] Khong co thay doi nao lam anh huong business logic ngoai he theme registry.

Verification:
- [x] `corepack pnpm --filter @nice-land/web test`
- [x] `corepack pnpm --filter @nice-land/web typecheck`

Dependencies: None

Files likely touched:
- `apps/web/lib/public-themes.ts`
- `apps/web/components/site/public-theme-home/index.ts`
- `apps/web/components/site/theme-thumbnail.tsx`

Estimated scope: Medium

### Phase 2: Public Composition Cleanup

- [x] Task 3: Dinh nghia ro cac slot theme cho `header`, `home`, `detail`, `footer`, `broker-intro`.
- [x] Task 4: Giam nhanh `renderedTheme === ...` trong page/detail bang composition hoac theme-specific components.

Acceptance criteria:
- [x] Theme moi khong can sua nhieu logic trong public pages chung.
- [x] Home va detail cung dung cung he composition/theme slots.
- [x] Theme composition moi khong thay doi hanh vi listing, lead form, hay public filtering.

Verification:
- [x] `corepack pnpm --filter @nice-land/web typecheck`
- [x] `corepack pnpm --filter @nice-land/web test`

Dependencies:
- Phase 1

Files likely touched:
- `apps/web/app/[slug]/page.tsx`
- `apps/web/app/[slug]/posts/[id]/page.tsx`
- `apps/web/components/site/public-theme-home/types.ts`

Estimated scope: Medium

### Checkpoint: Core Theme Architecture

- [x] Them theme moi khong can sua qua 4-6 file loi.
- [x] Home/detail/footer path da di qua composition on dinh.
- [x] Test hien co van pass.

### Phase 3: Demo and Preview Standardization

- [x] Task 5: Dua `demoSlug` vao registry de moi theme co convention preview rieng.
- [x] Task 6: Tach mock demo data/theme demo setup ro rang de them theme moi khong phai va tay nhieu cho.

Acceptance criteria:
- [x] Moi theme co preview rieng tu registry.
- [x] Landing showcase va `/themes` luon mo dung demo cua theme.
- [x] Demo wiring moi khong can them override CSS ngoai namespace cua theme.

Verification:
- [x] `corepack pnpm --filter @nice-land/web test`
- [x] Manual check logic duoc bao ve boi registry/demo tests va `tenant.test` cho cold demo slug

Dependencies:
- Phase 1

Files likely touched:
- `apps/web/lib/public-themes.ts`
- `apps/web/lib/data.ts`
- `apps/web/lib/server-api.ts`

Estimated scope: Medium

### Phase 4: Admin Authoring Readiness

- [x] Task 7: Kiem tra tenant admin va superadmin form chi render options tu registry thay vi hardcode cards/theme list.
- [x] Task 8: Chuan hoa metadata hien thi theme trong dashboard (ten, mo ta, thumbnail, preview).

Acceptance criteria:
- [x] Them theme moi khong can chen hardcoded theme card o nhieu noi.
- [x] Theme metadata dung chung mot nguon cho onboarding, tenant admin va superadmin.
- [x] Admin flow chi them metadata theme, khong sua logic luu/truy van ngoai pham vi field theme.

Verification:
- [x] `corepack pnpm --filter @nice-land/web typecheck`
- [x] `corepack pnpm --filter @nice-land/web test`
- [x] Manual check logic duoc bao ve boi registry-driven metadata va component selection chung

Dependencies:
- Phase 1

Files likely touched:
- `apps/web/components/marketing/contact-form.tsx`
- `apps/web/components/marketing/theme-showcase.tsx`
- `apps/web/components/superadmin/superadmin-site-form.tsx`

Estimated scope: Small-Medium

### Phase 5: Theme Scaffold and Parity Tests

- [x] Task 9: Tao scaffold/checklist cho theme moi: CSS, home renderer, thumbnail, demo slug, admin label, tests.
- [x] Task 10: Tang cuong parity test de fail ngay neu theme moi thieu surface bat buoc.

Acceptance criteria:
- [x] Team co checklist ro rang de them theme thu 3, 4, 5.
- [x] Test fail neu theme moi thieu surface hoac metadata bat buoc.
- [x] Checklist bat buoc xac nhan khong them `!important` moi neu khong co ly do duoc review.

Verification:
- [x] `corepack pnpm --filter @nice-land/web test`
- [x] `corepack pnpm --filter @nice-land/web typecheck`
- [x] Prompt guide va catalog spec da duoc cap nhat de huong dan theme tiep theo

Dependencies:
- Phase 1-4

Files likely touched:
- `apps/web/tests/public-themes.test.ts`
- `docs/specs/public-theme-catalog.md`
- `docs/plans/public-theme-catalog.md`

Estimated scope: Small

## Expansion Checklist

Su dung checklist nay moi khi them mot theme public moi:

- [ ] Xac nhan scope chi la theme/presentation, khong dong vao business logic khac.
- [ ] Them key moi vao `publicThemeSchema` trong contracts.
- [ ] Cap nhat enum `PublicTheme` trong Prisma schema va migration.
- [ ] Them metadata theme vao `publicThemes`.
- [ ] Them stylesheet rieng trong `apps/web/public/themes/`.
- [ ] Dung namespace/theme semantic classes, khong override tran lan vao class chung.
- [ ] Them thumbnail renderer hoac map thumbnail vao registry.
- [ ] Them homepage renderer cho theme moi.
- [ ] Kiem tra detail/header/footer composition cua theme moi.
- [ ] Tao demo slug va mock/demo data cho preview theme.
- [ ] Hien thi theme moi trong landing showcase va `/themes`.
- [ ] Hien thi theme moi trong tenant admin / superadmin selection.
- [ ] Kiem tra khong them `!important` moi, hoac neu bat buoc phai ghi ro ly do va surface can bao ve.
- [ ] Bo sung test parity cho registry, demo href, va fallback behavior.
- [ ] Verify `contracts build`, `database build`, `api-client build`, `api build`, `web typecheck`, `web test`.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Theme moi lam lech detail page | High | Tach composition sớm cho detail va footer |
| Preview/demo mo sai theme | Medium | Dua `demoSlug` vao registry thay vi mapping ngoai le |
| Admin UI hardcode theme cards | Medium | Render theme selection tu registry |
| CSS theme moi dung style chung sai muc | Medium | Tang semantic classes cho theme-specific surfaces, tranh selector uu tien cao va tranh `!important` |
| Contract / DB / frontend lech nhau | High | Build theo thu tu: contracts -> database -> api-client -> api -> web |
| Refactor theme vo tinh tac dong business logic | High | Giu scope presentation-only, test lai Warm + Cold sau moi phase |

## Open Questions

- Team muon toi uu cho viec them 1 theme nua ngay bay gio, hay muon chuan hoa de them nhieu theme trong tuong lai?
- Theme moi sap toi co can structure khac manh o listing/detail, hay van nam trong bo cuc current tenant themes?
- Co muon dua ca broker intro, footer, va detail aside vao checklist parity bat buoc cho moi theme khong?

## Verification Before Implementation

- [ ] Moi task deu co acceptance criteria va verification ro rang.
- [ ] Thu tu dependency da ro tu foundation toi UI.
- [ ] Khong co task nao vuot qua scope Medium.
- [ ] Co checkpoint sau moi phase lon.
- [ ] Human da review va dong y plan truoc khi refactor theme architecture.
