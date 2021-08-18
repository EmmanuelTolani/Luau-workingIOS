// import React, { Component } from "react";
// import {
//   StyleSheet,
//   View,
//   FlatList,
//   RefreshControl,
//   ListItem,
//   Button,
//   Text,
// } from "react-native";

// import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
// import MaterialCommunityIcon from "react-native-vector-icons/MaterialCommunityIcons";

// // import Toast from "../../custom_modules/Toast";
// // import {BleHelpers} from "../tools/BleHelpers";


// // class BleListItem extends ListItem {
// //   constructor() {
// //     super()
// //     this.state = {
      
// //     };
// //   }
//   // _connect = async () =>  {
//   //   if (this.state.connecting) {
//   //     return;
//   //   }

//   //   this.setState({
//   //     buttonText: "Connecting...", 
//   //     connecting: true,
//   //   });
//   //   let connected = await BleHelpers.connect(this.state.id);
    
//   //   if (connected) {
//   //     await this.props.navigation.navigate("Device", {name:this.state.name});
//   //   }
//   //   this.setState({
//   //     buttonText: "Connect", 
//   //     connecting: false
//   //   });
//   // }

// // }

// export default class BleList extends React.Component {
//   constructor() {
//     super()
//     this.state = {
//       devices: ['ipod 6', 'Samsung galaxy 10', 'Ipad 8th gen'],
//       refreshing: false,
//       beaconing: false,
//       buttonText: "Connect",
//       rssi: [-85,-65,-100],
//       name: ['Tolanis phone', 'Lomas Phone', 'Sultz phone'],
//       id: [11123, 54665, 9969],
//       connecting: false,
//       connected: false,
    
//     };
//   }

//   // async componentDidMount() {
//   //   BleHelpers.enable(
//   //     "ENABLEBLE"
//   //   ).then(this.doRefresh);
//   // }

//   // clear = () => {
//   //   this.setData([]);
//   // }

//   // setData = (devices) => {
//   //   this.setState({
//   //     devices: devices
//   //   });
//   // }

//   // addDevice = (device) => {
//   //   this.setState({
//   //     refreshing: false
//   //   });
//   //   this.setState(prev => {
//   //     let copy = [];
//   //     let in_arr = false;
//   //     if (prev.devices) {
//   //       copy = Array.from(prev.devices);
//   //     }
//   //     for (let u of copy) {
//   //       if (device.key === u.key) {
//   //         in_arr = true;
//   //         u.rssi.push(...device.rssi);
//   //         break;
//   //       }
//   //     }
//   //     if (!in_arr) {
//   //       console.log("Found device", device.name);
//   //       copy.push(device);
//   //       copy.sort((a,b) => a.name.localeCompare(b.name));
//   //     }

//   //     return {devices: copy};
//   //   });
//   // }

//   // stopBeacon = () => {
//   //   console.log("Beacon Stop");
//   //   this.setState({beaconing: false});
//   //   // BleHelpers.stopAdvertise();
//   // }

//   // doBeacon = () => {
//   //   console.log("Beacon Start");
//   //   // Toast.show("Beacon Start", Toast.SHORT);
//   //   // clearTimeout(this.beactimeout);
//   //   // this.setState({beaconing: true});
//   //   // BleHelpers.startAdvertise();
//   //   // this.beactimeout = setTimeout(this.stopBeacon, 20000);
//   // }

//   // doRefresh =  () => {
//   //   this.clear();
//   //   this.setState({refreshing: true});
//   //   // clearTimeout(this.timeout);
//   //   // return BleHelpers.refresh(this);
//   // }

//   // _renderListItem = ({item}) => {
//   //   return (
//   //     <>
//   //     <View>
//   //       <Text>Luau Data</Text>
//   //     </View>
//   //     <BleListItem 
//   //       rssi={item.rssi}
//   //       name={item.name}
//   //       id={item.id}
//   //       navigation={this.props.navigation}>
//   //     </BleListItem>
//   //     </>
//   //   );
//   // }
  

//   render() {
//     return (
//       <View style={styles.bleList}>
//         <View style={styles.bleHead}>
//           <Button
//             onPress={this.doBeacon}
//             title=" Beacon"
//             buttonStyle={styles.bleButton}
//             disabled={this.state.beaconing}
//             accessibilityLabel="Beacon"
//             icon={
//               <FontAwesomeIcon
//                 name="bullhorn"
//                 size={15}
//                 color="white"
//               />
//             }
//           />
//           <Button
//             onPress={this.doRefresh}
//             title=" Refresh List"
//             disabled={this.state.refreshing}
//             accessibilityLabel="ScanBLE"
//             icon={
//               <FontAwesomeIcon
//                 name="refresh"
//                 size={15}
//                 color="white"
//               />
//             }
//           />
//         </View>
//         <Text h4 style={styles.bleCaption}>Available Devices</Text>
//         <BleListItem/>
//         <FlatList
//           data={this.state.devices}
//           renderItem={this._renderListItem}
//           refreshControl={
//             <RefreshControl
//               refreshing={this.state.refreshing}
//               onRefresh={this.doRefresh}
//             />
//           }
//         />
//       </View>
//     );
//   }
// }

// function BleListItem() {
//     const rssi = this.state.rssi;
//     var rssiIcon;
//     if (rssi >= -70) {
//       rssiIcon = "signal-cellular-3";
//     } else if (rssi > -80) {
//       rssiIcon = "signal-cellular-2";
//     } else if (rssi >= -90) {
//       rssiIcon = "signal-cellular-1";
//     } else {
//       rssiIcon = "signal-cellular-outline";
//     }
//     return (
//       <View>
//         <Text style={styles.bleCaption}>
//           {this.state.rssi}
//         </Text>
//         {/* <ListItem
//           leftIcon={<MaterialCommunityIcon name={rssiIcon} size={24}/>}
//           title={this.state.name}
//           onPress={console.log('show')}
//           containerStyle={styles.bleListItem}
//           buttonGroup={{
//             buttons: [this.state.buttonText],
//             disabled: this.state.connecting,
//           }}
//         /> */}
//       </View>
//     );
   
//   }


// const styles = StyleSheet.create({
//   bleList: {
//     width:"100%",
//     height:"100%",
//     color: "#ddd",
//   },
//   bleListItem: {
//     borderBottomColor:"#333",
//     borderBottomWidth:1,
//     borderTopWidth:1,
//     borderTopColor:"#333",
//   },
//   bleCaption: {
//     alignSelf:"center",
//     marginLeft: 5,
//     color: "#ddd",
//   },
//   bleHead:{
//     flexDirection:"row",
//     justifyContent:"space-between",
//     alignContent:"center",
//     backgroundColor: "#555",
//   },
//   bleButton: {
//   }
// });


