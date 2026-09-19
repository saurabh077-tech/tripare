module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/', '/.maestro/'],
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx|js)'],
  watchman: false,
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-gesture-handler|react-native-screens|react-native-safe-area-context|@react-native-async-storage|@reduxjs/toolkit|immer|react-redux)/)',
  ],
};
