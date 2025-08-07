import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomHeader from "../Components/CustomHeader";
import MyStyles from "../Styles/MyStyles";
import Wishlist from "./Dashboard/Wishlist";
import TrialList from "./Dashboard/TrialList";
import Stock from "./Dashboard/Stock";
import Calls from "./Dashboard/Calls";
import HomeStack from "./Dashboard/Home";
import TitleBar from "../Components/TitleBar";
import PromoBanner from "../Components/PromoBanner";
import { postRequest } from "../Services/RequestServices";
import Service from "./Dashboard/Service";

const Tab = createBottomTabNavigator();

const Dashboard = (props) => {
  const { userToken, branchId } = props.route.params;
  const title = props.route.params?.userName || "Dashboard";
  const [branchType, setBranchType] = useState(null)


  useEffect(() => {

    postRequest("masters/branch/preview", { branch_id: branchId }, userToken).then((resp) => {

      if (resp) {
        setBranchType(resp.branch_type)
         AsyncStorage.setItem('branchType', resp.branch_type);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });

  }, [])

  return (
    <View style={MyStyles.container}>

      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: MyStyles.primaryColor,
          tabBarShowLabel: false,
        }}
      >
        {[
          { name: "HomeStack", Component: HomeStack, icon: "home", label: "Home" },
          { name: "Wishlist", Component: Wishlist, icon: "heart", label: "Wishlist", Header: TitleBar },
          branchType == "Jeweller"
            ? { name: "Trial", Component: TrialList, icon: "transit-transfer", label: "Trial", Header: TitleBar }
            : { name: "Service", Component: Service, icon: "cog-outline", label: "Service", Header: TitleBar },
          { name: "Stock", Component: Stock, icon: "truck-delivery", label: "Stock", Header: CustomHeader },
          { name: "Calls", Component: Calls, icon: "phone", label: "Calls", Header: CustomHeader }
        ].map(({ name, Component, icon, label, Header }) => (
          <Tab.Screen
            key={name}
            name={name}
            options={{
              tabBarIcon: ({ focused }) => (
                <View style={{ alignItems: "center", width: 100, paddingTop: 5 }}>
                  <Icon name={icon} color={focused ? "red" : "white"} size={25} />
                  {focused && <Text style={{ color: "#000", fontSize: 12, fontWeight: 'bold' }}>{label}</Text>}
                </View>
              ),
            }}
            children={(props) => (
              <>
                {Header && <Header title={label} {...props} />}
                {React.createElement(Component, props)}
              </>
            )}
            initialParams={props.route.params}
          />
        ))}
      </Tab.Navigator>

    </View>
  );
};

export default Dashboard;
