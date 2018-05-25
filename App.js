import React from "react";
import { Navigator, StyleSheet, YellowBox } from "react-native";
import HomeScreen from "./home";
import SettingsScreen from "./settings";
import SearchScreen from "./google_search";
import { createStackNavigator } from "react-navigation";

YellowBox.ignoreWarnings([
  "Warning: isMounted(...) is deprecated",
  "Module RCTImageLoader"
]);

export default class App extends React.Component {
  render() {
    return <AppNavigator />;
  }
}

const AppNavigator = createStackNavigator(
  {
    Home: {
      screen: props => (
        <HomeScreen {...props} propsNavColor="#FFFFFF" propsStatusColor="#FFFFFF" />
      ),
      navigationOptions: ({ navigation }) => ({
        header: null
      })
    },
    Settings: { screen: SettingsScreen },
    Search: { screen: SearchScreen }
  },
  {
    headerMode: "screen"
  }
);

async function loadColor() {
  var color = await AsyncStorage.getItem("@color");
  color = color || setDefault("Blue", "@color");

  this.setState({ navColor: this._returnColor(color) });
  this.setState({
    statusColor: this._LightenDarkenColor(this._returnColor(color), -20)
  });
}

function _LightenDarkenColor(col, amt) {
  var usePound = false;

  if (col[0] == "#") {
    col = col.slice(1);
    usePound = true;
  }

  var num = parseInt(col, 16);

  var r = (num >> 16) + amt;

  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  var b = ((num >> 8) & 0x00ff) + amt;

  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  var g = (num & 0x0000ff) + amt;

  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

function _returnColor(index) {
  var newColor = "";
  switch (index) {
    case "Orange":
      newColor = "#EF6C00";
      break;
    case "Red":
      newColor = "#FF1744";
      break;
    case "Purple":
      newColor = "#9C27B0";
      break;
    case "Green":
      newColor = "#43A047";
      break;
    case "Blue":
      newColor = "#278EF5";
      break;
    case "Teal":
      newColor = "#26A69A";
      break;
  }
  return newColor;
}

const styles = StyleSheet.create({});
