import {
  AppRegistry
} from 'react-native';

import { TabNavigator } from 'react-navigation'

import App from './App'
import Categorize from './Categorize'
import Recommend from './Recommend'
import Similar from './Similar'

const Navigation = TabNavigator({
  Recommend: { screen: Recommend},
  Categorize: { screen: Categorize },
  App: {screen: App },
 },{
   animationEnabled: true,
   swipeEnabled:true,
   tabBarOptions: {
     activeTintColor: "#3b3b3b",
   },
 });

AppRegistry.registerComponent('AwesomeProject', () => Navigation);
