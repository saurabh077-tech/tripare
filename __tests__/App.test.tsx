/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/navigation/Application', () => {
  const ReactNative = require('react-native');
  return {
    __esModule: true,
    default: function ApplicationNavigator() {
      return (
        <ReactNative.View>
          <ReactNative.Text>Breed Explorer</ReactNative.Text>
        </ReactNative.View>
      );
    },
  };
});

import App from '../src/App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
