import 'react-native-gesture-handler';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {  useState } from 'react';
import { Provider } from 'react-redux';
import ApplicationNavigator from './navigation/Application';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './store';

// export const storage = new createAsyncStorage();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);




  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1 }}>
              <ApplicationNavigator
                isAuthenticated={isAuthenticated}
              />
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
}

export default App;