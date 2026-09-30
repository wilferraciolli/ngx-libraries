#!/usr/bin/env node
// Every package that depends on a sibling via the "file:../x/dist" mechanism (see root CLAUDE.md's
// "Inter-package deps") needs that reference rewritten to a real semver range in its OWN dist/
// output before `npm publish` — ng-packagr copies `dependencies` verbatim, and a `file:` path is
// meaningless outside this monorepo. Previously a manual dist/package.json hand-edit per package;
// automated here now that a third package (ngx-region-settings) reuses the pattern.
//
// Usage: node scripts/fix-dist-file-deps.js [package-dir ...]
// With no args, scans every packages/*/dist/package.json that exists.

const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '..');
const packagesDir = path.join(repoRoot, 'packages');

const targets =
  process.argv.length > 2
    ? process.argv.slice(2).map((p) => path.resolve(repoRoot, p))
    : fs
        .readdirSync(packagesDir)
        .map((name) => path.join(packagesDir, name))
        .filter((dir) => fs.existsSync(path.join(dir, 'dist', 'package.json')));

let changedAny = false;

for (const packageDir of targets) {
  const distManifestPath = path.join(packageDir, 'dist', 'package.json');
  if (!fs.existsSync(distManifestPath)) {
    console.warn(`Skipping ${packageDir}: no dist/package.json (build it first)`);
    continue;
  }

  const manifest = JSON.parse(fs.readFileSync(distManifestPath, 'utf8'));
  const dependencies = manifest.dependencies ?? {};
  let changed = false;

  for (const [depName, depRange] of Object.entries(dependencies)) {
    const match = /^file:\.\.\/([^/]+)\/dist$/.exec(depRange);
    if (!match) continue;

    const siblingManifestPath = path.join(packagesDir, match[1], 'package.json');
    const siblingVersion = JSON.parse(fs.readFileSync(siblingManifestPath, 'utf8')).version;

    dependencies[depName] = `^${siblingVersion}`;
    changed = true;
    console.log(
      `${path.basename(packageDir)}: ${depName} file:../${match[1]}/dist -> ^${siblingVersion}`,
    );
  }

  if (changed) {
    fs.writeFileSync(distManifestPath, JSON.stringify(manifest, null, 2) + '\n');
    changedAny = true;
  }
}

if (!changedAny) {
  console.log('No file: dependencies found in any dist/package.json.');
}
