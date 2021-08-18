import React, { Component } from "react";

import LogoTitle from "../components/LogoTitle";

import {
  View,
  FlatList,
  Text,
  TextInput,
  Dimensions,
  StyleSheet, 
} from "react-native";

import {
  Button,
} from "react-native-elements";

import base64 from "react-native-base64";
import {BleHelpers} from "../tools/BleHelpers";
import Toast from "../custom_modules/Toast";

const UART_SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
const UART_WRITECHAR_UUID = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
const UART_READCHAR_UUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";

export default class CommunicationScreen extends Component {
  static navigationOptions = {
    headerTitle: () => <LogoTitle caption="Communication" />
  };

  constructor(props) {
    super(props);
    this.props.navigation.setOptions(CommunicationScreen.navigationOptions);
    this.commandInput = React.createRef();
    this.commandOutput = React.createRef();

    this.data = [];
    this.subcription = null;

    this.state = {
      dataholder: [],
      input: "",
      len: 0
    };
  }

  componentDidMount() {
    this.subcription = this.subscribe();
  }

  componentWillUnmount() {
    if (this.subcription != null) {
      this.subcription.remove();
      this.subcription = null;
    }
  }

  subscribe = () => {
    return BleHelpers.subscribeNotify(
      UART_SERVICE_UUID,
      UART_READCHAR_UUID, 
      (error, c) => {
        if(error) {
          console.log(error);
          Toast.show("Error " + error.reason,  Toast.LONG);
          this.subcription.remove();
          this.subcription = null;
        } else {
          this.addIncoming(c.value);
        }
      }
    );
  }

  onLayout = () => {
    this.setState({
      dimension: Dimensions.get("window")
    });
  }

  addOutgoing = (command) => {
    // push data object
    let l = this.data.length;
    this.data.push({text : command, key:l.toString(), dir:0});

    // set state
    this.setState({ input: "", dataholder: [...this.data] });
    
    this.commandOutput.current.scrollToEnd();
  }

  addIncoming = (encoded) => {
    let decoded = base64.decode(encoded).trim();
    console.log(decoded);

    // push data object
    let l = this.data.length;
    this.data.push({text: decoded, key:l.toString(), dir:1});

    // set state
    this.setState({dataholder: [...this.data] });

    this.commandOutput.current.scrollToEnd();
  }

  onSubmit = async (command) => {
    if (command != "") {
      this.addOutgoing(command);

      if (this.subcription == null) {
        this.subcription = this.subscribe();
      }

      // Clear input
      this.commandInput.current.clear();

      BleHelpers.writeWithoutNotify(
        UART_SERVICE_UUID,
        UART_WRITECHAR_UUID,
        command
      ).catch((error) => {
        // TODO: Show error on screen
        console.log(error);
      });
    }
  }

  _renderItem = (item) => {
    return (
      <Text style={{flex:1}}>{item.item.text}</Text>
    );
  }

  render() {
    return (
      <View style ={styles.container} onLayout = {this.onLayout.bind(this)}>
        <Text>Communication to: {this.props.route.params.name}</Text>
        <TextInput
          ref={this.commandInput}
          style={styles.input}
          autoFocus = {true}
          autoCorrect = {false}
          autoCapitalize = {"none"}
          disableFullscreenUI = {true}
          placeholder = {"Type command..."}
          onChangeText={(text) => this.setState({input: text})}
          onSubmitEditing = {
            (event) => {
              this.onSubmit(event.nativeEvent.text);
            }
          }
        />
        <Button 
          style={styles.button}
          title={"Send"}
          onPress={()=> {
            this.onSubmit(this.state.input);
          }}
        />
        <FlatList
          ref={this.commandOutput}
          style={styles.console}
          data={this.state.dataholder}
          renderItem={this._renderItem}
        />
      </View>
    );
  }
}

const dimensions = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex:1,
  },

  button: {
    flex:1,
    flexGrow:1,
  },

  input: {
    flex:2,
    flexGrow:2,
    minHeight: 50,
    maxHeight: 50,
    borderColor: "#000000", 
    borderWidth: 1,
  },

  console:{
    flex:10,
    flexGrow:10,
    
    borderColor: "#000000", 
    borderWidth: 1,
  }
});
