
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Paths } from './paths';
import { RootStackParamList } from './types';
import { Example } from '../screens';





const Stack = createStackNavigator<RootStackParamList>();
type Props = {
  isAuthenticated: boolean;
};

function ApplicationNavigator({ isAuthenticated }: Props) {

  return (

    <SafeAreaProvider>
      <NavigationContainer >
       <Stack.Navigator  screenOptions={{ headerShown: false }}>
       <Stack.Screen component={Example} name={Paths.Example} />
            
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default ApplicationNavigator;
