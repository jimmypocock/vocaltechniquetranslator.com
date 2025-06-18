import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    exclude: [
      'node_modules/**',
      'cdk/node_modules/**',
      'e2e/**',
      '.git/**',
      'dist/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'lib/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'app/**/*.{ts,tsx}'
      ],
      exclude: [
        'node_modules',
        'test',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData.ts',
        'app/**/layout.tsx',
        'app/**/page.tsx',
        // Exclude AWS/Cognito config files (not testable in CI)
        'lib/cognito-config.ts'
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 80,
          lines: 75,
          statements: 75
        },
        'lib/**/*.ts': {
          branches: 80,
          functions: 90,
          lines: 80,
          statements: 80
        },
        // Core business logic should have higher coverage
        'lib/vocal-translator.ts': {
          branches: 85,
          functions: 95,
          lines: 85,
          statements: 85
        },
        'lib/utils/syllable-splitter.ts': {
          branches: 90,
          functions: 100,
          lines: 90,
          statements: 90
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/components': path.resolve(__dirname, './components'),
      '@/app': path.resolve(__dirname, './app')
    }
  }
})