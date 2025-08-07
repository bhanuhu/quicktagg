import React, { useState, useEffect } from "react";
import { ImageBackground } from "react-native";
import { Button } from "react-native-paper";
import MyStyles from "../Styles/MyStyles";

const Catalogs = (props) => {
  return (
    <ImageBackground
      style={[MyStyles.container, { justifyContent: "center" }]}
      source={require("../assets/login-bg.jpg")}
    >
      <Button
        style={{ marginVertical: 10, marginHorizontal: 20, borderRadius: 5 }}
        labelStyle={{ color: "black" }}
        mode="contained"
        onPress={() => props.navigation.navigate("GeneralCatalogList")}
      >
        General Catalog
      </Button>
      <Button
         style={{ marginVertical: 10, marginHorizontal: 20, borderRadius: 5 }}
        labelStyle={{ color: "black" }}
        mode="contained"
        onPress={() => props.navigation.navigate("ExhibitionCatalogList")}
      >
        Exhibition Catalog
      </Button>
      <Button
         style={{ marginVertical: 10, marginHorizontal: 20, borderRadius: 5 }}
        labelStyle={{ color: "black" }}
        mode="contained"
        onPress={() => props.navigation.navigate("CustomerCatalogList")}
      >
        Customer Catalog
      </Button>
      <Button
         style={{ marginVertical: 10, marginHorizontal: 20, borderRadius: 5 }}
        labelStyle={{ color: "black" }}
        mode="contained"
        onPress={() => props.navigation.navigate("TryAndBuyCatalogList")}
      >
        Try And Buy Catalog
      </Button>
    </ImageBackground>
  );
};

export default Catalogs;
