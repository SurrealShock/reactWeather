import React from "react";
import {
  StatusBar,
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  AsyncStorage,
  Image,
  Switch
} from "react-native";
const STATUS_BAR_HEIGHT = Platform.select({ ios: 20, android: 24 });
import { Dropdown } from "react-native-material-dropdown";
const backButtonSource = Platform.select({
  ios: require("./Images/Back-Chevron.png"),
  android: require("./Images/Back-Arrow.png")
});

class settings extends React.Component {
  static navigationOptions = { header: null };

  constructor(props) {
    super(props);
    var passedColor = this.props.navigation.state.params.propsNavColor;
    var passedStatusColor = this.props.navigation.state.params.propsStatusColor;
    var defaultUnits = "Auto";
    var displayDate = false;
    this.state = {
      text: defaultUnits,
      showDate: false,
      color: "",
      navColor: passedColor,
      statusColor: passedStatusColor,
    };
    this.loadSaved();
  }

  async loadSaved() {
    defaultUnits = await AsyncStorage.getItem("@saved-units");
    this.setState({ text: defaultUnits });
    displayDate = await AsyncStorage.getItem("@display-date");
    var isTrueSet = displayDate == "true";
    this.setState({ showDate: isTrueSet });
    var color = await AsyncStorage.getItem("@color");
    this.setState({ color: color });
    this.setState({navColor: this._returnColor(color)});
    this.setState({statusColor: this._LightenDarkenColor(this._returnColor(color), -20)});
  }

  _LightenDarkenColor(col, amt) {
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

  _returnColor(index) {
      var newColor = "";
    switch (index) {
        case 'Orange':
            newColor = "#EF6C00"
            break;
        case 'Red':
            newColor = "#FF1744"
            break;
        case 'Purple':
            newColor = "#9C27B0"
            break;
        case 'Green':
            newColor = "#43A047"
            break;
        case 'Blue':
            newColor = "#278EF5"
            break;
        case 'Teal':
            newColor = "#26A69A"
            break;
    }
    return newColor;
  }
  

  render() {
    let data = [
      {
        value: "Auto"
      },
      {
        value: "Imperial"
      },
      {
        value: "Metric"
      },
      {
        value: "International"
      }
    ];
    let colors = [
      {
        value: "Blue"
      },
      {
        value: "Orange"
      },
      {
        value: "Red"
      },
      {
        value: "Green"
      },
      {
        value: "Purple"
      },
      {
        value: "Teal"
      }
    ];

    StatusBar.setBarStyle("light-content", true);
    return (
      // Create container to hold everything
      <View style={styles.container}>
        {/* Generate status bar background */}
        <View
          style={{
            height: STATUS_BAR_HEIGHT,
            width: "100%",
            backgroundColor: this.state.statusColor
          }}
        />
        {/* Generate navbar */}
        <View style={[styles.navbar, {backgroundColor: this.state.navColor,}]}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignSelf: "flex-start",
              height: "100%"
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this.props.navigation.navigate("Home", {
                propsNavColor: this.state.navColor,
                propsStatusColor: this.state.statusColor
              })}
              style={{ justifyContent: "center", marginLeft: 10 }}
            >
              <Image
                source={backButtonSource}
                style={{
                  height: 25,
                  width: 25,
                  resizeMode: "contain",
                  alignSelf: "center"
                }}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
              height: "100%"
            }}
          >
            <Text style={[styles.title, { alignSelf: "center" }]}>
              Settings
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "center",
              alignSelf: "flex-end"
            }}
          />
        </View>
        {/* Create thin separator for components */}
        <View
          style={{
            alignSelf: "center",
            backgroundColor: "#BDBDBD",
            width: "90%",
            height: 1,
            marginTop: 25
          }}
        />
        {/* Generate dropdown to select units to use for weather data */}
        <Dropdown
          containerStyle={{ width: "90%", alignSelf: "center", marginTop: -5 }}
          label="Select Units"
          labelFontSize={14}
          fontSize={16}
          dropdownPosition={0}
          data={data}
          value={this.state.text}
          onChangeText={async index => {
            await AsyncStorage.setItem("@saved-units", index);
          }}
        />
        {/* Create dropdown to choose app accent color */}
        <Dropdown
          containerStyle={{ width: "90%", alignSelf: "center", marginTop: -5 }}
          label="Select Color"
          labelFontSize={14}
          fontSize={16}
          dropdownPosition={0}
          itemCount={colors.length}
          data={colors}
          value={this.state.color}
          onChangeText={async index => {
            await AsyncStorage.setItem("@color", index);
            var newColor = this._returnColor(index);
            
            this.setState({navColor: newColor});
            this.setState({statusColor: this._LightenDarkenColor(newColor, -20)});
          }}
        />
        {/* Create view to align text with switch */}
        <View
          style={{ flexDirection: "row", width: "90%", alignSelf: "center" }}
        >
          <View style={{ flex: 2, justifyContent: "center" }}>
            <Text style={{ fontSize: 16 }}>Display date next to day</Text>
          </View>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Switch
              style={{ alignSelf: "flex-end" }}
              onValueChange={async value => {
                this.setState({ showDate: value });
                console.log("value: " + value);
                await AsyncStorage.setItem("@display-date", String(value));
              }}
              value={this.state.showDate}
              onTintColor={this.state.navColor}
            />
          </View>
        </View>
        <View
          style={{
            alignSelf: "center",
            backgroundColor: "#BDBDBD",
            width: "90%",
            height: 1,
            marginTop: 5
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    backgroundColor: "#f4f4f4"
  },
  navbar: {
    width: "100%",
    height: 55,
    flexDirection: "row",
    elevation: 6,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowColor: "black",
    shadowOffset: { height: 5, width: 0 }
  },
  title: {
    color: "white",
    fontSize: 22
  }
});

export default settings;
