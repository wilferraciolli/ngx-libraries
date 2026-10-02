// Never built or served — this file (and the `build` architect target that points at it in
// angular.json) exists only because `@storybook/angular`'s builders require a `browserTarget`
// referencing a real `@angular-devkit/build-angular:browser` target. Without one, startup/build
// both fail with `SB_FRAMEWORK_ANGULAR_0001 (AngularLegacyBuildOptionsError)`, since that's where
// Storybook's own webpack config reads `styles`/`assets`/`stylePreprocessorOptions`/`tsConfig`
// from (see docs/Storybook.md). Storybook's actual entry point is `.storybook/preview.ts`.
export {};
