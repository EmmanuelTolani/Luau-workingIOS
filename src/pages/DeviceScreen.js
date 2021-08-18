import React, { Component } from "react";

import LogoTitle from "../components/LogoTitle";

import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback, 
  LayoutAnimation,
  Button
} from "react-native";

import * as Progress from "react-native-progress";
import "jspack";

import Image from "react-native-scalable-image";
import base64 from "react-native-base64";
import {BleErrorCode}  from "react-native-ble-plx";

import Toast from "../custom_modules/Toast";
import {BleHelpers, depacketize} from "../tools/BleHelpers";
import { jspack } from "jspack";
import { Base64Binary } from "../tools/Base64Binary";

const LUAU_SERVICE_UUID = "610d8300-7e3d-4ed6-a458-ed0ce3e9aec2";
const LUAU_WRITECHAR_UUID = "610d8301-7e3d-4ed6-a458-ed0ce3e9aec2";
const LUAU_READCHAR_UUID = "610d8302-7e3d-4ed6-a458-ed0ce3e9aec2";
const LUAU_INFOCHAR_UUID = "610d8303-7e3d-4ed6-a458-ed0ce3e9aec2";

const commands = {
  "picture": "preview",
  "picturehq": "previewhq"
};

class AsyncImage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      loading: false,
      data: "",
      progress: 0,
      indeterminate: true,
    };
  }

  _clearSource = () => {
    this.setState({
      loaded: false,
      loading: false,
      data: "",
      progress: 0,
      indeterminate: true,
    });
  }

  _setLoading = () => {
    this.setState({
      indeterminate: true,
      loading: true
    });
  }

  _setProgress = (x) => {
    this.setState({
      progress: x,
      indeterminate: false,
    });
  }

  _setSource = data => {
    let decoded = "";
    data.forEach(function(item){
      decoded = decoded + base64.decode(item);
    });

    this.setState({
      datastr: "data:image/jpeg;base64," +  base64.encode(decoded),
      loaded:true,
      loading:false,
      progress:1,
      indeterminate: false,
    });
  }

  render() {
    if (this.state.loaded) {
      return (
        <Image
          width={this.props.width}
          resizeMode="contain"
          source={{uri: this.state.datastr}}
        />
      );
    } else if (!this.state.loading) {
      return (
        <TouchableWithoutFeedback onPress={this.props.onPress}>
          <View style={this.props.style} >
            <Text style={[this.props.textStyle, {color: this.props.color}]}>Press Take A Picture</Text>
          </View>
        </TouchableWithoutFeedback>
      );
    } else {
      return (
        <View style={this.props.style}>
          <Progress.Circle progress={this.state.progress} size={50} color={this.props.color} showsText={true} indeterminate={this.state.indeterminate}/>
        </View>
      );
    }
  }
}

export default class DeviceScreen extends Component {
  static navigationOptions = {
    headerTitle: () => <LogoTitle caption="Device Details" />
  };

  constructor(props) {
    super(props);
    this.props.navigation.setOptions(DeviceScreen.navigationOptions);
    this.state = {
      image_loading: false,
      subscribed: false,
      dimension: Dimensions.get("window"),
      device_info: {
        label: this.props.route.params.name,
        latitude:"Unknown",
        longitude:"Unknown",
        altitude:"Unknown",
        battery:"Unknown",
        time: "Unknown",
        uptime: "Unknown",
        reset:"Unknown", 
        iccid: "Unknown",
        signal:"Unknown",
        network:"Unknown"
      }
    };
    this.n_packets = 0;
    this.total_packets = 0;
    this.packets = [];
    this.imageComponent = React.createRef();
    this.subscription = null;
    this.timeout = null;
  }

  readInfo = (characteristic) => {
    let value = characteristic.value;
    let byteArray = Base64Binary.decode(value);

    let format = "<6sxxiiiiqqI22shB";
    let unpacked = jspack.Unpack(format, byteArray, 0);

    var [c, lat, lng, alt, batt, utc, raw, reset, brio, ss, network] = unpacked;

    // TODO: Deal with LONG data type
    var date = new Date(utc[0]*1000).toLocaleString();

    var uptime = "";
    // TODO: Deal with LONG data type
    if(raw[0] > 3600){
      uptime = (Math.round(raw[0]*100/3600)/100).toString() + " hours";
    } else if (raw[0] > 60) {
      uptime = (Math.round(raw[0]*100/60)/100).toString() + " minutes";
    } else {
      uptime = raw[0].toString() + " seconds";
    }

    var reason = "";
    if (reset == 0) {
      reason = "Power On";
    } else {
      if (reset & 0x00000001) reason += "Reset Pin";
      if (reset & 0x00000002) reason += "Watchdog";
      if (reset & 0x00000004) reason += "SoftReset";
      if (reset & 0x00000008) reason += "CpuLock";
      if (reset & 0x00010000) reason += "GpioDetect";
      if (reset & 0x00020000) reason += "AnaDetect";
      if (reset & 0x00040000) reason += "DEBUG";
      if (reset & 0x00080000) reason += "NfcDetect";
      if (reset & 0x00100000) reason += "VBusValid";
    }

    this.setState({device_info:{
      label:c,
      latitude:lat/1000000,
      longitude:lng/1000000,
      altitude:alt/1000,
      battery:batt,
      time: date,
      uptime: uptime,
      reset:reason, 
      iccid: brio,
      signal:ss,
      network:network
    }});

    this.timeout = setTimeout(this.doread, 10000);
  }

  doread = () => {
    BleHelpers.read(
      LUAU_SERVICE_UUID,
      LUAU_INFOCHAR_UUID,
      this.readInfo, 
      (data) => {
        console.log("Read Error:", data);
      });
  }

  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener("beforeRemove", () => {
      BleHelpers.disconnect();
      if (this.timeout != null) {
        clearTimeout(this.timeout);
      }
    });

    this.doread();
    //this.takepic();
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  takepic = async () => {
    console.log("Taking Picture");
    Toast.show("Taking Picture", Toast.LONG);
    if (this.subcription != null) {
      this.subcription.remove();
      this.subscription = null;
    }

    this.imageComponent.current._clearSource();
    this.imageComponent.current._setLoading();

    this.setState({
      subscribed: true
    });

    this.subcription = await BleHelpers.subscribeNotify(
      LUAU_SERVICE_UUID,
      LUAU_READCHAR_UUID, 
      (error, c) => {
        if(error) {
          console.log(error);
          Toast.show("Error " + error.reason,  Toast.LONG);
          this.setState({
            image_loading: false, 
            subscribed: false
          });
          this.subcription.remove();
          this.props.navigation.goBack();
          return;
        }
        let encoded = c.value;
        if (!this.state.image_loading) {
          this.packets = [];
          this.n_packets = 0;
          this.setState({
            image_loading: true, 
            subscribed: true
          });
          // First packet has number of upcoming packets
          let packet = depacketize(encoded);
          this.total_packets = parseInt(packet);
        } else {
          // Concatenate image data
          this.packets.push(encoded);
          this.imageComponent.current._setProgress(this.n_packets/this.total_packets);
          if (this.n_packets == this.total_packets) {
            // Image complete, update image component
            this.imageComponent.current._setSource(this.packets);

            this.subcription.remove();
            this.subcription = null;
            this.setState({
              image_loading: false, 
              subscribed: false
            });
          }
          this.n_packets += 1;
        }
      }
    );

    BleHelpers.writeWithoutNotify(
      LUAU_SERVICE_UUID,
      LUAU_WRITECHAR_UUID,
      commands.picture
    ).catch((error) => {
      // TODO: Show error on screen
      console.log(error);
    });
  }

  onLayout = () => {
    this.setState({
      dimension: Dimensions.get("window")
    });
  }

  onCommunication = () => {
    this.props.navigation.navigate("Communication", {name:this.state.device_info["label"]});
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const navigate = this.props.navigation;
    return (
      <ScrollView style ={{flex:1}} onLayout = {this.onLayout.bind(this)}>
        <AsyncImage
          style={styles.image}
          onPress={this.takepic}
          textStyle={styles.imageText}
          color="#4388d6"
          width={Dimensions.get("window").width}
          ref={this.imageComponent}
        />
        <Button
          disabled={this.state.subscribed}
          style={styles.button}
          title={this.state.subscribed ? "Loading Picture" : "Take A Picture"}
          onPress={this.takepic}
        />
        <View style={styles.details}>
          <Text style={styles.header}>Device Information</Text>
          <Text style={styles.itemLabel}>Device</Text>
          <Text style={styles.itemValue}>{this.state.device_info["label"]}</Text>
          <Text style={styles.itemLabel}>Location</Text>
          <Text style={styles.itemValue}>{this.state.device_info["latitude"]},{this.state.device_info["longitude"]}</Text>
          <Text style={styles.itemLabel}>Altitude</Text>
          <Text style={styles.itemValue}>{this.state.device_info["altitude"]} m</Text>
          <Text style={styles.itemLabel}>Battery</Text>
          <Text style={styles.itemValue}>{this.state.device_info["battery"]}%</Text>
          <Text style={styles.itemLabel}>Device Time</Text>
          <Text style={styles.itemValue}>{this.state.device_info["time"]}</Text>
          <Text style={styles.itemLabel}>Uptime</Text>
          <Text style={styles.itemValue}>{this.state.device_info["uptime"]}</Text>
          <Text style={styles.itemLabel}>Reset Reason</Text>
          <Text style={styles.itemValue}>{this.state.device_info["reset"]}</Text>
          <Text style={styles.header}>Network Information</Text>
          <Text style={styles.itemLabel}>Network Connection</Text>
          <Text style={styles.itemValue}>{this.state.device_info["network"]==1?"Registered":"Not Registered"}</Text>
          <Text style={styles.itemLabel}>ICCID</Text>
          <Text style={styles.itemValue}>{this.state.device_info["iccid"]}</Text>
          <Text style={styles.itemLabel}>Cell Signal Strength</Text>
          <Text style={styles.itemValue}>{this.state.device_info["signal"]} dBm</Text>
        </View>
        <Button
          style={styles.button}
          title={"Communication"}
          navigation={this.props.navigation}
          onPress={this.onCommunication}
        />
      </ScrollView>
    );
  }
}

const dimensions  = Dimensions.get("window");
const styles = StyleSheet.create({
  button: {
    flex:1, 
    borderWidth:1, 
    borderColor:"#000000",
  },
  details: {
    marginTop:5,
    borderWidth:1, 
    borderColor:"#000000",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start"
  },
  header: {
    width:"100%",
    backgroundColor:"#4388d6",
  },  
  itemLabel: {
    width: "50%",
  },
  itemValue: {
    width: "50%",
  },
  image: {
    flex: 4,
    // alignSelf: "stretch",
    width: Math.round(dimensions.width),
    height: Math.round(dimensions.width * 9 / 16),
    backgroundColor: "#222",
    alignItems:"center",
    justifyContent:"center",
  },
  imageText: {
    fontWeight: "bold", 
  },
});
