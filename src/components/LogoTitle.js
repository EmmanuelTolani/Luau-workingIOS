import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, StatusBar, Image } from 'react-native';


export default function LogoTitle(props) {
    const styles = StyleSheet.create({
        headContain: {
          width:"100%",
          backgroundColor: "#fff",
          flexDirection: "row",
          alignItems:"center",
        },
      
        headCaption: {
          color:"#000",
        },
      
        headImg: {
          width: 30, 
          height: 50,
          paddingLeft: 25,
          paddingRight: 50,
        },
      })
        return (
          <View style={styles.headContain}>
            <Image 
              style={styles.headImg}
              source={{ uri: 'https://i0.wp.com/www.myeyesonsite.com/wp-content/uploads/2018/08/Logo-small.png?w=150&ssl=1'}}
              resizeMode={"contain"}
            />
            <Text h4 style={styles.headCaption}>{props.caption}</Text>
          </View>
        );
      }
    
