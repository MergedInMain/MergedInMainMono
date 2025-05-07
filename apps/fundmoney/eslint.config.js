// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from 'eslint/config';
import expoConfig from 'eslint-config-expo/flat';
import { config as baseConfig } from "@repo/eslint-config/react-internal";

export default defineConfig([
  ...baseConfig,
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*'],
  },
]);
