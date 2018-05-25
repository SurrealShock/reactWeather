import React from "react";
import {
  Platform,
  TouchableOpacity,
  LayoutAnimation,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Image,
  StatusBar,
  AsyncStorage,
  UIManager
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
const STATUS_BAR_HEIGHT = Platform.select({ ios: 20, android: 24 });
const weatherURL =
  "https://api.darksky.net/forecast/c31aefaf46b8e74e58b701419d7b88e5/";
UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

class home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      navTitle: "",
      bounce: false,
      forecast: [],
      image: [],
      date: [],
      temperature: [],
      loading: true,
      pressed: [false, false, false, false, false, false, false],
      cardExpandText: [],
      displayedText: [],
      navColor: "#000000",
      statusColor: "#000000"
    };
    this._focusScreen = this._focusScreen.bind(this);
    this.loadColor();
  }
  async loadColor() {
    var color = await AsyncStorage.getItem("@color");
    color = color || setDefault("Blue", "@color");

    this.setState({ navColor: this._returnColor(color) });
    this.setState({
      statusColor: this._LightenDarkenColor(this._returnColor(color), -20)
    });
  }

  _onPressButton(cardIndex) {
    var pressedArr = this.state.pressed;
    var cardTextArr = this.state.cardExpandText;
    var displayedTextArr = this.state.displayedText;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    // LayoutAnimation.spring();
    if (!pressedArr[cardIndex]) {
      displayedTextArr[cardIndex] = cardTextArr[cardIndex];
      pressedArr[cardIndex] = true;
      this.setState({ pressed: pressedArr });
      this.setState({ displayedText: displayedTextArr });
    } else {
      pressedArr[cardIndex] = false;
      displayedTextArr[cardIndex] = "";
      this.setState({ pressed: pressedArr });
      this.setState({ displayedText: displayedTextArr });
    }
    this._focusScreen = this._focusScreen.bind(this);
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

  componentDidMount() {
    this._sub = this.props.navigation.addListener(
      "didFocus",
      this._focusScreen
    );
  }

  componentWillUnmount() {
    this._sub.remove();
  }

  _focusScreen() {
    this._readData();
    // console.log("appeared");
    console.log(this.props.propsNavColor);
  }

  async _readData() {
    try {
      // var passedColor = this.props.navigation.state.params.propsNavColor;
      // var passedStatusColor = this.props.navigation.state.params.propsStatusColor;
      // this.setState({navColor: passedColor});
      // this.setState({statusColor: passedStatusColor});
      this.loadColor();

      var title = await AsyncStorage.getItem("@city-name");
      title = title || setDefault("New York", "@city-name");

      var units = await AsyncStorage.getItem("@saved-units");
      units = units || setDefault("Auto", "@saved-units");

      switch (units) {
        case "International":
          units = "?units=si";
          break;
        case "Imperial":
          units = "?units=us";
          break;
        case "Metric":
          units = "?units=ca";
          break;
        case "Auto":
          units = "?units=auto";
          break;
      }

      var latlong = await AsyncStorage.getItem("@lat-long");
      latlong = latlong || setDefault("40.785091,-73.968285", "@lat-long");
      const url = weatherURL + latlong + units;
      var displayDate = await AsyncStorage.getItem("@display-date");
      // console.log("Displaydate: " + displayDate);

      console.log("url: " + url);

      fetch(url)
        .then(Response => Response.json())
        .then(findresponse => {
          var weekday = new Array(7);
          weekday[0] = "Sunday";
          weekday[1] = "Monday";
          weekday[2] = "Tuesday";
          weekday[3] = "Wednesday";
          weekday[4] = "Thursday";
          weekday[5] = "Friday";
          weekday[6] = "Saturday";

          var forecastArr = [];
          var imagesArr = [];
          var dateArr = [];
          var temperatureArr = [];
          var cardExpandTextArr = [];
          var locale = "en-us";
          temperatureArr.push(
            findresponse.currently.temperature.toFixed(1) + "°"
          );
          for (var i = 0; i < 7; i++) {
            forecastArr.push(findresponse.daily.data[i].summary);
            imagesArr.push(findImage(findresponse.daily.data[i].icon));
            var date = new Date(
              (findresponse.daily.data[i + 1].time - 86400) * 1000
            );
            dateArr.push(weekday[date.getDay()]);

            if (displayDate === "true") {
              month = date.toLocaleString(locale, { month: "long" });
              dateArr[i] += " - " + month + " " + date.getDate();
            }

            temperatureArr.push(
              (
                (findresponse.daily.data[i].temperatureHigh +
                  findresponse.daily.data[i].temperatureLow) /
                2
              ).toFixed(1) + "°"
            );

            cardExpandTextArr.push(
              "\nChance of rain: " +
                (findresponse.daily.data[i].precipProbability * 100).toFixed(
                  0
                ) +
                "%\n" +
                "UV Index: " +
                findresponse.daily.data[i].uvIndex +
                "\nPressure: " +
                findresponse.daily.data[i].pressure
            );
          }

          function findImage(icon) {
            switch (icon) {
              case "clear-day":
                imageName = require("./Images/Sun.png");
                break;
              case "clear-night":
                imageName = require("./Images/Moon.png");
                break;
              case "rain":
                imageName = require("./Images/Cloud-Rain.png");
                break;
              case "snow":
                imageName = require("./Images/Cloud-Snow.png");
                break;
              case "sleet":
                imageName = require("./Images/Cloud-Hail-Alt.png");
                break;
              case "wind":
                imageName = require("./Images/Wind.png");
                break;
              case "fog":
                imageName = require("./Images/Cloud-Fog.png");
                break;
              case "cloudy":
                imageName = require("./Images/Cloud.png");
                break;
              case "partly-cloudy-day":
                imageName = require("./Images/Cloud-Sun.png");
                break;
              case "partly-cloudy-night":
                imageName = require("./Images/Cloud-Moon.png");
                break;
              case "hail":
                imageName = require("./Images/Cloud-Hail.png");
                break;
              case "thunderstorm":
                imageName = require("./Images/Cloud-Lightning.png");
                break;
              case "tornado":
                imageName = require("./Images/Tornado.png");
                break;
            }
            return imageName;
          }
          this.setState({
            loading: false,
            forecast: forecastArr,
            image: imagesArr,
            date: dateArr,
            temperature: temperatureArr,
            cardExpandText: cardExpandTextArr
          });
        });

      this.setState({ navTitle: title });
    } catch (error) {
      console.log(error);
    }

    async function setDefault(defaultVal, key) {
      console.log("ran");
      await AsyncStorage.setItem(key, defaultVal);
      return defaultVal;
    }
  }

  render() {
    StatusBar.setBarStyle("light-content", true);
    return (
      <View style={styles.container}>
        <View
          style={{
            height: STATUS_BAR_HEIGHT,
            width: "100%",
            backgroundColor: this.state.statusColor
          }}
        />
        <ScrollView
          bounces={this.state.bounce}
          contentContainerStyle={[styles.contentContainer]}
        >
          <View
            style={[styles.navbar, { backgroundColor: this.state.navColor }]}
          >
            <View style={{ flex: 1 }} />

            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
              }}
            >
              <Text style={[styles.title]}>{this.state.navTitle}</Text>
            </View>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                justifyContent: "flex-end",
                height: "100%"
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={() =>
                  this.props.navigation.navigate("Search", {
                    propsNavColor: this.state.navColor,
                    propsStatusColor: this.state.statusColor
                  })
                }
                style={{ justifyContent: "center", marginRight: 20 }}
              >
                <Image
                  source={require("./Images/Search.png")}
                  style={{
                    height: 25,
                    width: 25,
                    resizeMode: "contain",
                    alignSelf: "center"
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() =>
                  this.props.navigation.navigate("Settings", {
                    propsNavColor: this.state.navColor,
                    propsStatusColor: this.state.statusColor
                  })
                }
                style={{ justifyContent: "center", marginRight: 20 }}
              >
                <Image
                  source={require("./Images/Settings.png")}
                  style={{
                    height: 25,
                    width: 25,
                    resizeMode: "contain",
                    alignSelf: "center"
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ActivityIndicator
            style={{ alignSelf: "center", justifyContent: "center" }}
            animating={this.state.loading}
            size="small"
            color="black"
          />

          <View style={[styles.card, { marginTop: 15 }]}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this._onPressButton(0)}
              style={[styles.touchableCard]}
            >
              <View
                style={[
                  styles.floatingTextContainer,
                  { backgroundColor: this.state.navColor }
                ]}
              >
                <Text style={{ alignSelf: "center", color: "white" }}>
                  {this.state.date[0]}
                </Text>
              </View>
              <Text style={[styles.text]}>
                {this.state.temperature[0] + "\n" + this.state.forecast[0]}
                <Text>{this.state.displayedText[0]}</Text>
              </Text>
              <Image
                source={this.state.image[0]}
                style={[styles.weatherImage]}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { marginTop: 25 }]}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this._onPressButton(1)}
              style={[styles.touchableCard]}
            >
              <View
                style={[
                  styles.floatingTextContainer,
                  { backgroundColor: this.state.navColor }
                ]}
              >
                <Text style={{ alignSelf: "center", color: "white" }}>
                  {this.state.date[1]}
                </Text>
              </View>
              <Text style={[styles.text]}>
                {this.state.temperature[2] + "\n" + this.state.forecast[1]}
                <Text>{this.state.displayedText[1]}</Text>
              </Text>
              <Image
                source={this.state.image[1]}
                style={[styles.weatherImage]}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { marginTop: 25 }]}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this._onPressButton(2)}
              style={[styles.touchableCard]}
            >
              <View
                style={[
                  styles.floatingTextContainer,
                  { backgroundColor: this.state.navColor }
                ]}
              >
                <Text style={{ alignSelf: "center", color: "white" }}>
                  {this.state.date[2]}
                </Text>
              </View>
              <Text style={[styles.text]}>
                {this.state.temperature[3] + "\n" + this.state.forecast[2]}
                <Text>{this.state.displayedText[2]}</Text>
              </Text>
              <Image
                source={this.state.image[2]}
                style={[styles.weatherImage]}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { marginTop: 25 }]}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this._onPressButton(3)}
              style={[styles.touchableCard]}
            >
              <View
                style={[
                  styles.floatingTextContainer,
                  { backgroundColor: this.state.navColor }
                ]}
              >
                <Text style={{ alignSelf: "center", color: "white" }}>
                  {this.state.date[3]}
                </Text>
              </View>
              <Text style={[styles.text]}>
                {this.state.temperature[4] + "\n" + this.state.forecast[3]}
                <Text>{this.state.displayedText[3]}</Text>
              </Text>
              <Image
                source={this.state.image[3]}
                style={[styles.weatherImage]}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { marginTop: 25 }]}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this._onPressButton(4)}
              style={[styles.touchableCard]}
            >
              <View
                style={[
                  styles.floatingTextContainer,
                  { backgroundColor: this.state.navColor }
                ]}
              >
                <Text style={{ alignSelf: "center", color: "white" }}>
                  {this.state.date[4]}
                </Text>
              </View>
              <Text style={[styles.text]}>
                {this.state.temperature[5] + "\n" + this.state.forecast[4]}
                <Text>{this.state.displayedText[4]}</Text>
              </Text>
              <Image
                source={this.state.image[4]}
                style={[styles.weatherImage]}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { marginTop: 25 }]}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this._onPressButton(5)}
              style={[styles.touchableCard]}
            >
              <View
                style={[
                  styles.floatingTextContainer,
                  { backgroundColor: this.state.navColor }
                ]}
              >
                <Text style={{ alignSelf: "center", color: "white" }}>
                  {this.state.date[5]}
                </Text>
              </View>
              <Text style={[styles.text]}>
                {this.state.temperature[6] + "\n" + this.state.forecast[5]}
                <Text>{this.state.displayedText[5]}</Text>
              </Text>
              <Image
                source={this.state.image[5]}
                style={[styles.weatherImage]}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.card,
              {
                marginTop: 25,
                marginBottom: 45
              }
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this._onPressButton(6)}
              style={[styles.touchableCard]}
            >
              <View
                style={[
                  styles.floatingTextContainer,
                  { backgroundColor: this.state.navColor }
                ]}
              >
                <Text style={{ alignSelf: "center", color: "white" }}>
                  {this.state.date[6]}
                </Text>
              </View>
              <Text style={[styles.text]}>
                {this.state.temperature[7] + "\n" + this.state.forecast[6]}
                <Text>{this.state.displayedText[6]}</Text>
              </Text>
              <Image
                source={this.state.image[6]}
                style={[styles.weatherImage]}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f4f4f4"
  },
  weatherImage: {
    marginRight: 10,
    height: 60,
    width: 60,
    resizeMode: "contain",
    alignSelf: "center"
  },
  text: {
    alignSelf: "center",
    width: "65%",
    marginLeft: 20,
    fontSize: 16,
    marginTop: 10
  },
  title: {
    color: "white",
    fontSize: 22
  },
  touchableCard: {
    height: "100%",
    width: "100%",
    flex: 1,
    justifyContent: "space-between",
    flexDirection: "row"
  },
  navbar: {
    width: "100%",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    height: 55,
    elevation: 6,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowColor: "black",
    shadowOffset: { height: 5, width: 0 }
  },
  floatingTextContainer: {
    width: "auto",
    paddingLeft: 10,
    paddingRight: 10,
    height: 35,
    position: "absolute",
    borderRadius: 5,
    justifyContent: "center",
    marginTop: -35,
    marginLeft: 10,
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowColor: "black",
    shadowOffset: { height: 0, width: 0 }
  },

  card: {
    flex: 1,
    height: "auto",
    justifyContent: "space-between",
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingTop: 20,
    paddingBottom: 20,
    width: "90%",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowColor: "black",
    shadowOffset: { height: 0, width: 0 },
    elevation: 5,
    borderRadius: 5
  },

  contentContainer: {
    alignItems: "center"
  }
});

export default home;
