// Barrel — re-export the entire public surface
// Add exports here as the library grows

// Setup
export { provideAuth } from './lib/providers/provide-auth';

// Config
export { NGX_AUTH_CONFIG } from './lib/config/auth-config.token';
export type { NgxAuthConfig } from './lib/config/auth-config.token';

// Service
export { AuthStore } from './lib/services/auth.store';

// Route guard
export { authGuard } from './lib/guards/auth.guard';

// HTTP interceptor
export { authInterceptor } from './lib/interceptors/auth.interceptor';
