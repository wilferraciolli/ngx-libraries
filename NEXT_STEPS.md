# Next steps

Working notes on what's outstanding across the monorepo. Not published anywhere, just a
scratchpad so we don't lose track between sessions. Update as items land or priorities shift.

## Housekeeping (found while looking, not yet fixed)

- [ ] `CLAUDE.md` repo layout only lists `packages/api-client/` — `packages/forms/` exists and is
      under active development but isn't mentioned there.
- [x] Confirmed `@wiltech-labs/ngx-*` as the correct, current package scope everywhere it appears:
      both packages' `package.json`, `packages/api-client/README.md` + `CLAUDE.md`, root
      `CLAUDE.md` + `README.md`, and every reference in `apps/showcase` (`package.json`,
      `tsconfig.json` path mapping, `README.md`, and the imports in `main.ts`/`home.component.ts`/
      the api-client and forms demo components). `npm install` regenerated `package-lock.json`,
      and both packages were rebuilt so `dist/` picked up the correct fesm/typings filenames.

## packages/forms

- [ ] No tests yet. Unlike `api-client` (a straight port of exercised `insurly-ui` code), forms
      has grown real logic that isn't already covered elsewhere: `toSchema()` validation rules,
      date/time parsing (`business-date`/`business-time`/`instant-date-time`), `ZonedDateTimeService`
      DST gap/overlap handling, `FormConfigBuilder`. Worth unit tests before publishing.
- [ ] Not yet published to npm (`version: 0.1.0`, still under development per its own `CLAUDE.md`).
- [ ] No consumers yet — `insurly-ui` is the intended first real consumer but doesn't depend on it
      yet (only on `ngx-api-client` so far).
- [ ] Two more Angular projects are planned to eventually consume these libraries — not started.

## packages/api-client

- [ ] Already published and consumed by `insurly-ui`. No known outstanding work beyond routine
      version bumps as needed.

## Repo-wide

- [ ] No CI configured yet (build/typecheck/publish are all manual, per each package's README).
