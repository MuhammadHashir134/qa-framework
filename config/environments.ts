// ─────────────────────────────────────────────────────────
// Environment Configuration
// Usage: ENV=staging npx playwright test
// ─────────────────────────────────────────────────────────

export type Environment = 'dev' | 'staging' | 'prod';

interface EnvConfig {
  baseURL:   string;
  apiURL:    string;
  timeout:   number;
  retries:   number;
  headless:  boolean;
}

const configs: Record<Environment, EnvConfig> = {
  dev: {
    baseURL:  process.env.DEV_URL     || 'https://dev.your-app.com',
    apiURL:   process.env.DEV_API_URL || 'https://dev-api.your-app.com',
    timeout:  60000,
    retries:  0,
    headless: false,
  },
  staging: {
    baseURL:  process.env.STAGING_URL     || 'https://uat-sp-frontoffice.sekaya.sa',
    apiURL:   process.env.STAGING_API_URL || 'https://dev-sp-cms.sekaya.sa/api/',
    timeout:  60000,
    retries:  1,
    headless: true,
  },
  prod: {
    baseURL:  process.env.PROD_URL     || 'https://your-app.com',
    apiURL:   process.env.PROD_API_URL || 'https://api.your-app.com',
    timeout:  90000,
    retries:  2,
    headless: true,
  },
};

const env = (process.env.ENV as Environment) || 'staging';

export const ENV_CONFIG: EnvConfig = configs[env];
export const CURRENT_ENV: Environment = env;
