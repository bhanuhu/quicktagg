import React, { useState, useEffect } from "react";
import { ImageBackground, ScrollView, View } from "react-native";
import { List } from "react-native-paper";
import CustomHeader from "../Components/CustomHeader";
import MyStyles from "../Styles/MyStyles";

const SettingsMenu = (props) => {
  return (
    <View style={MyStyles.container}>
      <ImageBackground source={require("../assets/login-bg.jpg")} style={{ flex: 1 }}>
        <ScrollView>
          <List.Item
            onPress={() => props.navigation.navigate("CustomerCategoryList")}
            style={{ borderBottomWidth: 0.5, borderBottomColor: "black" }}
            title="Customer Catagory"
            titleStyle={{ fontWeight: "bold" }}
            right={() => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            onPress={() => props.navigation.navigate("BranchAreaList")}
            style={{ borderBottomWidth: 0.5, borderBottomColor: "black" }}
            title="Branch Area"
            titleStyle={{ fontWeight: "bold" }}
            right={() => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            onPress={() => props.navigation.navigate("BranchStaffList")}
            style={{ borderBottomWidth: 0.5, borderBottomColor: "black" }}
            title="Branch Staff"
            titleStyle={{ fontWeight: "bold" }}
            right={() => <List.Icon {...props} icon="chevron-right" />}
          />
          <List.Item
            onPress={() => props.navigation.navigate("TabToScan")}
            style={{ borderBottomWidth: 0.5, borderBottomColor: "black" }}
            title="Tab To Scan"
            titleStyle={{ fontWeight: "bold" }}
            right={() => <List.Icon {...props} icon="chevron-right" />}
          />
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default SettingsMenu;
