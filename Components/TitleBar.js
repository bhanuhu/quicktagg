import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";

import { Alert, Image, SafeAreaView, View } from "react-native";
import { IconButton, Text, TextInput } from "react-native-paper";
import MyStyles from "../Styles/MyStyles";
import { AuthContext } from "./Context";

const TitleBar = (props) => {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState(false);
  const { signOut } = React.useContext(AuthContext);
  const navigation = useNavigation();
  const route = useRoute();
  
  return (
    <SafeAreaView
      style={{
        paddingTop: MyStyles.barHeight,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 5,
        backgroundColor: MyStyles.primaryColor.backgroundColor,
        zIndex: 10,
        elevation: 10,
      }}
    >
      <IconButton
        icon="arrow-left"
        size={25}
        onPress={() => navigation.goBack()}
      />

      {show ? (
        <TextInput
          mode="flat"
          theme={{ colors: { primary: "black" } }}
          style={{
            backgroundColor: "rgba(0,0,0,0)",
            height: 40,
            width: "60%",
            marginBottom: 10,
          }}
          autoFocus={true}
          left={<TextInput.Icon name="magnify" />}
          value={route.params?.search || ""}
          onChangeText={(text) => {
            navigation.setParams({ search: text });
          }}
          placeholder="Search"
        />
      ) : (
        <Text
          style={{
            fontSize: 20,
            alignSelf: "center",
            flexGrow: 1,
            //marginLeft: 20,
            textAlign: "center",
            fontWeight: 'bold'
          }}
        >
          {props.title}
        </Text>
      )}

      {!props.disableSearch ? (
        <IconButton
          icon={show ? "close" : "magnify"}
          size={25}
          onPress={() => {
            if (show) {
              navigation.setParams({ search: "" });
            }
            setShow(!show);
          }}
        />
      ) : (
        <IconButton size={25} />
      )}
    </SafeAreaView>
  );
};

export default TitleBar;
