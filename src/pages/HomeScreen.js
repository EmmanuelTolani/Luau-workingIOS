import React, { Component } from "react";
import {
  StyleSheet,
  View,
  PermissionsAndroid,
} from "react-native";

import Geolocation from "react-native-geolocation-service";

import LogoTitle from "../components/LogoTitle";
import BleList from "../components/BleList";

export async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        "title": "TikiController",
        "message": "TikiController requests access to your location "
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the location");
    } else {
      console.log("Location permission denied");
    }
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
}

export default class HomeScreen extends Component {
  static navigationOptions = {
    headerTitle: () => <LogoTitle caption="TikiController" />
  };

  constructor(props) {
    super(props);
    this.props.navigation.setOptions(HomeScreen.navigationOptions);
    this.state = {
      currentLongitude: 0,//Initial Longitude
      currentLatitude: 0,//Initial Latitude
      currentSpeed: 0,
    };
    global.connected_device = null;
  }

  async componentDidMount() {
    await requestLocationPermission();
  }

  setPosition = (position) => {
    this.setState({
      currentLongitude:position.coords.longitude,
      currentLatitude:position.coords.latitude,
    });
  }

  getPosition = () => {
    Geolocation.getCurrentPosition(
      this.setPosition,
      (error) => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
    this.watchID = Geolocation.watchPosition(this.setPosition);
  }

  _onPressGPS = () => {
    this.getPosition();
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    return (
      <View style={styles.contain}> 
        <BleList navigation={this.props.navigation}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  contain: {
    flex:1,
    backgroundColor: "#222",
    color: "#ddd",
  },
});
