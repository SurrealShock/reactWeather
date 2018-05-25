import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  AsyncStorage,
} from "react-native";

import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import { SearchBar } from "react-native-elements";
const STATUS_BAR_HEIGHT = Platform.select({ ios: 20, android: 24 });
const backButtonSource = Platform.select({ ios: require('./Images/Back-Chevron.png'), android: require('./Images/Back-Arrow.png') });

class google_search extends React.Component {
  static navigationOptions = { header: null };

  constructor(props) {
    super(props);
    var passedColor = this.props.navigation.state.params.propsNavColor;
    var passedStatusColor = this.props.navigation.state.params.propsStatusColor;
    this.state = {
      navColor: passedColor,
      statusColor: passedStatusColor,
    };
  }

  searchPressed(location) {
      console.log(location);
    () => this.props.navigation.navigate("Home");
  }
  render() {
    return (
      <View style={[styles.container]}>
        <View
          style={{
            height: STATUS_BAR_HEIGHT,
            width: "100%",
            backgroundColor: this.state.statusColor
          }}
        />
        <View style={[styles.navbar, {backgroundColor: this.state.navColor}]}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignSelf: "flex-start",
              height: "100%",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => this.props.navigation.navigate("Home")}
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
            <Text style={[styles.title, { alignSelf: "center" }]}>Search</Text>
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
        <GooglePlacesAutocomplete
          placeholder="Search"
          minLength={1} // minimum length of text to search
          autoFocus={false}
          returnKeyType={"search"} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
          listViewDisplayed="auto" // true/false/undefined
          fetchDetails={true}
          renderDescription={row => row.description} // custom description render
          onPress={async (data, details = null) => {
            try {
                await AsyncStorage.setItem('@city-name', details.address_components[0].long_name);
                await AsyncStorage.setItem('@lat-long', String(details.geometry.location.lat + ',' + details.geometry.location.lng));
              } catch (error) {
                // Error saving data
              }
            // console.log();
            // console.log(details.geometry.location);
            this.props.navigation.goBack();
          }
        }
          getDefaultValue={() => ""}
          query={{
            // available options: https://developers.google.com/places/web-service/autocomplete
            key: "AIzaSyBcMkfhyfAssnYdizfmIQDJUG_m_5aI_Xc",
            language: "en", // language of the results
            types: "(cities)" // default: 'geocode'
          }}
          styles={{
            container: {
            //   marginTop: -10,                
                backgroundColor: 'white',
            },
            textInputContainer: {
              width: "100%",
              backgroundColor: this.state.navColor,
            },
            description: {
              fontWeight: "bold"
            },
            predefinedPlacesDescription: {
              color: "#1faadb"
            }
          }}
          currentLocation={false} // Will add a 'Current location' button at the top of the predefined places list
          // currentLocationLabel="Current location"
          nearbyPlacesAPI="GooglePlacesSearch" // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
          GoogleReverseGeocodingQuery={
            {
              // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
            }
          }
          GooglePlacesSearchQuery={{
            // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
            rankby: "distance",
            // types: "food"
          }}
          filterReverseGeocodingByTypes={[
            "locality",
            "administrative_area_level_3"
          ]} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
          debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
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
    height: 50,
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

// const GooglePlacesInput = () => {
//     return (

//     );
//   }

export default google_search;
