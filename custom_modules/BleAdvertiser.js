import {NativeModules} from "react-native";
const BleAdvertise = NativeModules.BleAdvertise;
import { BleAdvertiser } from "react-native-ble-advertiser";

export class BleAdvertiser {
  constructor() {
    BleAdvertise.enable();
  }

  start = () => {
    BleAdvertise.start();
    return BleAdvertise.isStarted();
  };

  stop = () => {
    BleAdvertise.stop();
    return BleAdvertise.isStarted();
  };
}

module.exports = BleAdvertiser;
