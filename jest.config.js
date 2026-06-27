/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'commonjs',
        esModuleInterop: true,
        strict: true,
        paths: {
          '@/*': ['./src/*'],
          '@/assets/*': ['./assets/*'],
        },
        baseUrl: '.',
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|expo-.*|@expo.*|react-native-.*|@react-native-community|react-native-reanimated|nativewind|react-native-css|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|react-native-svg|react-native-web|react-native-worklets|whisper\\.rn)/)',
  ],
  setupFiles: ['./jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/', '/dist/', '/web-build/'],
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
};
