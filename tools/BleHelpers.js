import Toast from '../custom_modules/Toast'
import { BleManager, State as BleState } from "react-native-ble-plx";
import BleAdvertiser from "../custom_modules/BleAdvertiser";

import base64 from "react-native-base64";

const packetize = (payload) => {
  return base64.encode(payload);
};

export const depacketize = (raw) => {
  return base64.decode(raw);
};

const LUAU_SERVICE_UUID = "610d8300-7e3d-4ed6-a458-ed0ce3e9aec2";
const LUAU_WRITECHAR_UUID = "610d8301-7e3d-4ed6-a458-ed0ce3e9aec2";
const LUAU_READCHAR_UUID = "610d8302-7e3d-4ed6-a458-ed0ce3e9aec2";
const LUAU_INFOCHAR_UUID = "610d8303-7e3d-4ed6-a458-ed0ce3e9aec2";


export var BleHelpers = { 
  manager: new BleManager(),
  advertiser:  new BleAdvertiser(),
  device: null,
  enable: async (transaction) => {
    console.log("BLE enable");
    try {
      let state = await BleHelpers.manager.state();
      if (state === BleState.PoweredOn) {
        // BLE is enabled
        return BleHelpers.manager;
      } else if (state === BleState.PoweredOff) {
        // Enable BLE
        return BleHelpers.manager.enable(transaction);
      }
    } catch (err) {
    
    }
  },
  disconnect: async () => {
    console.log("ble disconnect");
    let connected = false;
    try{
      await BleHelpers.device.cancelConnection();
    }
    catch(err) {
      console.log("Already Disconnected");
    }

    connected = await BleHelpers.device.isConnected();
    console.log("Disconnected", !connected);
    BleHelpers.device = null;
    return !connected;
  },
  connect: async (id) => {
    if (BleHelpers.device != null){
      // already connected
      return true;
    }

    console.log("Connecting to device", id);
    BleHelpers.manager.stopDeviceScan();
    let devices = await BleHelpers.manager.devices([id]);
    let device = devices[0];
    
    try {
      await device.connect();
    } catch(err) {
      console.log(err);
      Toast.show("Connection Error", Toast.SHORT);
    }

    let connected = await device.isConnected();
    if (connected) {
      device = await device.discoverAllServicesAndCharacteristics("discover");
      console.log("Connected to device", device.id);
      Toast.show("Connected", Toast.SHORT);
      BleHelpers.device = device;
    }
    return connected;
  },
  refresh: (component) => {
    new Promise(function(resolve, reject) {
      BleHelpers.manager.startDeviceScan(
        null,
        null,
        (error, device) => {
          if (error) {
            BleHelpers.manager.stopDeviceScan();
            component.setState({refreshing: false});
            console.log("BLEERROR:", error);
            reject(error);
          }
          if (device && device.name) {
            component.addDevice({
              name:device.name,
              id:device.id,
              key:device.id,
              rssi:[device.rssi]
            });
          }
        }
      );

      component.timeout = setTimeout(function() {
        BleHelpers.manager.stopDeviceScan();
        component.setState({refreshing: false});
        resolve(component.state.devices);
      }, 20000);
    });
  },
  startAdvertise: () => {
    BleHelpers.advertiser.start();
  },
  stopAdvertise: () => {
    BleHelpers.advertiser.stop();
  },
  subscribeNotify: (service_uuid, characteristic_uuid, callback) => {
    return BleHelpers.device.monitorCharacteristicForService(
      service_uuid,
      characteristic_uuid,
      callback,
      "MONITOR"
    );

  },
  writeWithoutNotify: (service_uuid, characteristic_uuid, payload) => {
    let packet = packetize(payload);
    return BleHelpers.device.writeCharacteristicWithoutResponseForService(
      service_uuid,
      characteristic_uuid,
      packet,
      "WRITE"
    );
  },
  read: (service_uuid, characteristic_uuid, success_callback, error_callback) => {
    if (BleHelpers.device == null){
      // not connected
      error_callback("Not connected.");
      return;
    }
    let readchar = BleHelpers.device.readCharacteristicForService(service_uuid, characteristic_uuid, "READ");
    readchar.then(success_callback, error_callback);
  }
};
