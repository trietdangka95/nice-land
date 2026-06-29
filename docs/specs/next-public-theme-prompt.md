# Prompt Guide: Add The Next Public Theme

Dung prompt nay khi muon tao theme public tiep theo cho Nice Land. Prompt nay
co y de giu scope o theme/presentation, khong dong vao business logic.

## Recommended Prompt

```md
Act as a senior frontend engineer working in the Nice Land monorepo.

I need you to add a new public tenant theme to the existing theme system.

Important constraints:
- This is a presentation/theme task only.
- Do not change tenant business logic, listing logic, filters, pagination, auth, subscription, or lead flow.
- Do not override existing Warm or Cold theme behavior unless a presentation bug is required to fix the new theme wiring.
- Do not rely on broad CSS overrides or add new `!important` rules unless there is a documented exception.

Follow the existing theme architecture already used in the repo:
- `themeKey` remains the source of truth
- `apps/web/lib/public-themes.ts` is the registry
- public rendering uses theme composition/helpers
- landing/admin/superadmin selection must read from registry metadata

New theme requirements:
- Theme key: `<NEW_THEME_KEY>`
- Preference label: `<Warm/Cold/Other if approved>`
- Visual direction: `<describe the design language clearly>`
- It must have its own:
  - stylesheet
  - registry metadata
  - homepage renderer
  - preview/demo slug
  - preview swatches
  - header/footer/detail/broker-intro composition wiring

Implementation checklist:
1. Update contracts and database enum only if this theme key does not already exist.
2. Add registry metadata in `apps/web/lib/public-themes.ts`.
3. Add or wire the theme stylesheet in `apps/web/public/themes/`.
4. Add the homepage renderer and required composition mapping.
5. Add demo wiring so landing showcase and `/themes` open the correct demo.
6. Ensure onboarding/admin/superadmin theme selectors read the new metadata automatically.
7. Extend parity tests so the new theme fails fast if any required surface is missing.
8. Update docs/specs if the theme system contract changes.

Verification required:
- `corepack pnpm --filter @nice-land/web typecheck`
- `corepack pnpm --filter @nice-land/web test`
- plus any additional build/test command required by contract or enum changes

When done, summarize:
- which files were touched
- which registry/composition surfaces were added
- which tests prove the new theme is expansion-safe
```

## Human Review Checklist

Truoc khi merge theme moi, kiem tra:

- Theme co khac biet ro ve visual hierarchy, khong chi doi mau.
- Preview card mo dung demo slug.
- Detail page khong can them `if/else` rieng trong route page.
- Admin va superadmin thay theme moi ma khong can hard-code card.
- Khong co `!important` moi neu khong co ly do duoc ghi ro.
- Warm va Cold khong bi regression.

## Scope Reminder

Theme moi duoc phep thay doi:

- registry metadata
- public presentation components
- theme-specific CSS
- demo/preview wiring
- admin/onboarding selection metadata
- tests va docs lien quan den theme system

Theme moi khong duoc phep tu y thay doi:

- auth
- subscription logic
- lead logic
- search/filter/pagination behavior
- tenant isolation
- API behavior khong lien quan den `themeKey`
