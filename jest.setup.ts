// ============================================================
// Global test setup — mocks for native/external dependencies
// ============================================================

// --- expo-sqlite mock ---
jest.mock('expo-sqlite', () => {
  const mockDbInstance = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
    getFirstAsync: jest.fn().mockResolvedValue(null),
    getAllAsync: jest.fn().mockResolvedValue([]),
    prepareAsync: jest.fn().mockResolvedValue({
      executeAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1 }),
      finalizeAsync: jest.fn().mockResolvedValue(undefined),
    }),
  };

  const mockDb = { ...mockDbInstance };

  return {
    openDatabaseAsync: jest.fn().mockResolvedValue(mockDb),
    SQLiteDatabase: jest.fn(),
  };
});

// --- @google/genai mock ---
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockResolvedValue({
        text: JSON.stringify([{
          item: 'خبز',
          price: 50,
          currency: 'جنيه',
          subCategory: 'مخبوزات',
          mainCategory: 'أكل ومشروبات',
          description: 'شراء خبز',
          confidence: 0.95,
          merchant: null,
          priority: 'essential',
        }]),
      }),
    },
  })),
}));

// --- groq-sdk mock ---
jest.mock('groq-sdk', () => {
  const mockCreate = jest.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify([{
            item: 'حليب',
            price: 30,
            currency: 'جنيه',
            subCategory: 'ألبان',
            mainCategory: 'أكل ومشروبات',
            description: 'شراء حليب',
            confidence: 0.9,
            merchant: null,
            priority: 'essential',
          }]),
        },
      },
    ],
  });

  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  };
});

// --- expo-file-system mock ---
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/document/dir/',
  cacheDirectory: '/mock/cache/dir/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, size: 1000 }),
  readAsStringAsync: jest.fn().mockResolvedValue(''),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest.fn(),
    readAsStringAsync: jest.fn(),
    writeAsStringAsync: jest.fn(),
  },
}));

// --- expo-haptics mock ---
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

// --- expo-constants mock (provides app manifest) ---
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
    manifest: {},
  },
  expoConfig: {
    extra: {},
  },
}));

// --- expo-router mock (prevents TS global type error with router) ---
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() })),
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
  usePathname: jest.fn(() => '/'),
  Stack: { Screen: jest.fn(() => null) },
  Tabs: { Screen: jest.fn(() => null) },
  Link: jest.fn(({ children }: any) => children),
  Redirect: jest.fn(() => null),
}));

// --- react-native-reanimated mock ---
jest.mock('react-native-reanimated', () => ({
  default: {
    createAnimatedComponent: (component: unknown) => component,
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((toValue: number) => toValue),
    withSpring: jest.fn((toValue: number) => toValue),
    useDerivedValue: jest.fn((fn: () => unknown) => fn()),
    runOnJS: jest.fn((fn: (...args: unknown[]) => unknown) => fn),
    runOnUI: jest.fn((fn: (...args: unknown[]) => unknown) => fn),
  },
  useSharedValue: jest.fn(() => ({ value: 0 })),
  useAnimatedStyle: jest.fn(() => ({})),
  withTiming: jest.fn((toValue: number) => toValue),
  withSpring: jest.fn((toValue: number) => toValue),
  Easing: {
    in: jest.fn((e: unknown) => e),
    out: jest.fn((e: unknown) => e),
    inOut: jest.fn((e: unknown) => e),
    bezier: jest.fn(() => 0),
  },
  createAnimatedComponent: (component: unknown) => component,
}));

// --- Mock console to keep test output clean ---
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};
