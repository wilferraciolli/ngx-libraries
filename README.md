# ngx-libraries

Angular ngx libraries

Each package under `packages/*` is a standalone Angular library, published
independently to npm under the `@wiltech-labs` scope.

## Building locally

This is an npm workspaces monorepo (`packages/*` + `apps/*`), so one `npm install` at the repo
root installs every package's dependencies:

```bash
npm install
```

To build, from the repo root:

```bash
npm run build            # every package, plus the showcase app
npm run build:packages   # every package only — skips the showcase app, much faster
```

Both skip anything without a `build` script, and are no substitute for `cd`-ing into a single
package when you're only working on that one (see "Publishing a package" below).

## Publishing a package

1. **Log in once** (per machine) — needs an npm account able to publish
   under the `@wiltech-labs` scope (the first publish of a package claims it):
   ```bash
   npm login
   ```
2. **`cd` into the package you're releasing** (the directory name under
   `packages/`, not the npm name — e.g. `packages/api-client`, which
   publishes as `@wiltech-labs/ngx-api-client`) and bump its version:
   ```bash
   cd packages/<package-dir>
   npm version patch   # or minor / major
   ```
3. **Build it** (still in that directory) — `ng-packagr` compiles the
   Angular library and writes a ready-to-publish `package.json` into
   `dist/`:
   ```bash
   npm i
   npm run build
   ```
4. **Publish the built output**, not the source folder:
   ```bash
   cd dist
   npm publish
   ```

`publishConfig.access` is already set to `public` on each scoped package,
so a plain `npm publish` is enough — no `--access public` flag needed.

See each package's own README for its exact npm name.
