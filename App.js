import 'react-native-gesture-handler';
import { StatusBar } from 'react-native';
import React, { useEffect, useState, useMemo, useReducer } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, DefaultTheme as PaperDefaultTheme, configureFonts} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { AuthContext } from './Components/Context';
import Login from './Screens/Auth/Login';
import DrawerComponent from './Components/DrawerComponent';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Load fonts manually (ensure fonts are linked properly)
        setFontsLoaded(true);
      } catch (e) {
        console.log('Error loading fonts:', e);
      }
    };
    loadFonts();
  }, []);

  const fontConfig = {
    default: {
      regular: { fontFamily: 'Poppins-Regular' },
      medium: { fontFamily: 'Poppins-Medium' },
      bold: { fontFamily: 'Poppins-Bold' },
    },
  };

  const PaperTheme = {
    ...PaperDefaultTheme,
    mode: 'adaptive',
    colors: {
      ...PaperDefaultTheme.colors,
      primary: '#ffba3c',
      accent: '#ffba3c',
    },
    fonts: configureFonts(fontConfig),
  };

  const initialLoginState = {
    isLoading: true,
    userName: null,
    userToken: null,
    branchId: null,
    branchImg: null,
    missCallUser: null,
  };

  const loginReducer = (prevState, action) => {
    switch (action.type) {
      case 'RETRIEVE_TOKEN':
      case 'LOGIN':
        return {
          ...prevState,
          userToken: action.token,
          branchId: action.branch_id,
          userName: action.user_name,
          branchImg: action.branch_img,
          missCallUser: action.miss_call_user,
          isLoading: false,
        };
      case 'LOGOUT':
        return {
          ...prevState,
          userName: null,
          userToken: null,
          branchId: null,
          branchImg: null,
          missCallUser: null,
          isLoading: false,
        };
      default:
        return prevState;
    }
  };

  const [loginState, dispatch] = useReducer(loginReducer, initialLoginState);

  const authContext = useMemo(() => ({
    signIn: async ({ userToken, userName, branchId, branchImg, missCallUser }) => {
      try {
        await AsyncStorage.setItem('userToken', userToken);
        await AsyncStorage.setItem('userName', userName);
        await AsyncStorage.setItem('branchId', String(branchId));
        await AsyncStorage.setItem('branchImg', String(branchImg));
        await AsyncStorage.setItem('missCallUser', String(missCallUser));
      } catch (e) {
        console.log(e);
      }
      dispatch({
        type: 'LOGIN',
        user_name: userName,
        token: userToken,
        branch_id: branchId,
        branch_img: branchImg,
        miss_call_user: missCallUser,
      });
    },
    signOut: async () => {
      try {
        await AsyncStorage.removeItem('userToken');
      } catch (e) {
        console.log(e);
      }
      dispatch({ type: 'LOGOUT' });
    },
    userToken: async () => {
      try {
        return await AsyncStorage.getItem('userToken');
      } catch (e) {
        console.log(e);
      }
    },
  }), []);

  useEffect(() => {
    setTimeout(async () => {
      let userToken = null;
      let userName = null;
      let branchId = null;
      let branchImg = null;
      let missCallUser = null;

      try {
        userToken = await AsyncStorage.getItem('userToken');
        userName = await AsyncStorage.getItem('userName');
        branchId = await AsyncStorage.getItem('branchId');
        branchImg = await AsyncStorage.getItem('branchImg');
        missCallUser = await AsyncStorage.getItem('missCallUser');
      } catch (e) {
        console.log(e);
      }

      if (userToken) {
        try {
          const { exp } = JSON.parse(Buffer.from(userToken.split('.')[1], 'base64').toString());
          if (Date.now() >= exp * 1000) {
            await AsyncStorage.removeItem('userToken');
            dispatch({ type: 'LOGOUT' });
            return;
          }
        } catch (e) {
          console.log('Error parsing token:', e);
        }
      }

      dispatch({
        type: 'RETRIEVE_TOKEN',
        token: userToken,
        user_name: userName,
        branch_id: branchId,
        branch_img: branchImg,
        miss_call_user: missCallUser,
      });
    }, 1000);
  }, []);

  if (loginState.isLoading || !fontsLoaded) {
    return null; // Show a loading indicator if needed
  }

  return (
    <PaperProvider theme={PaperTheme}>
      <AuthContext.Provider value={authContext}>
        <StatusBar hidden={false} barStyle="default" />
        <NavigationContainer>
          {loginState.userToken ? (
            <DrawerComponent userDetails={loginState} />
          ) : (
            <Login />
          )}
        </NavigationContainer>
      </AuthContext.Provider>
    </PaperProvider>
  );
}
