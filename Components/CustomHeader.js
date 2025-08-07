import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, View, TouchableOpacity } from "react-native";
import { IconButton, Text, Menu, Badge } from "react-native-paper";
import MyStyles from "../Styles/MyStyles";
import { AuthContext } from "./Context";
import { postRequest } from '../Services/RequestServices';
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

const CustomHeader = (props) => {
  const { userToken, branchId } = props.route.params;
  const [param, setparam] = useState({
    from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
  });
  const { signOut } = React.useContext(AuthContext);
  const [dotsVisible, setDotsVisible] = React.useState(false);
  const [notifications, setNotifications] = React.useState(0);
  const [branchType, setBranchType] = useState(null);


  useEffect(() => {
    getBranchTypeAndFetchNotifications()
  }, []);

  const getBranchTypeAndFetchNotifications = async () => {
    try {
      const storedBranchType = await AsyncStorage.getItem('branchType');
      setBranchType(storedBranchType);

      if (storedBranchType === "Jeweller") {
        const resp = await postRequest(
          "customervisit/check_today_notificaton",
          { branch_id: branchId },
          userToken
        );

        console.log("✅ Jeweller resp:", resp);
        if (resp.status == 200) {
          setNotifications(resp.data[0]["check_appointment"]);
        }
      } else {
        const resp = await postRequest(
          "customervisit/due/service_notification",
          {
            branch_id: branchId,
            from_date: param.from_date,
            to_date: param.to_date,
          },
          userToken
        );
        console.log("✅ Service resp:", resp);
        if (resp.status == 200) {
          setNotifications(resp.data[0]?.due_count || 0);
        }
      }
    } catch (err) {
      console.log("❌ Error fetching notifications:", err?.message, err);
    }
  };

  // ✅ Ensure First Click Opens Menu Properly
  const toggleDotsMenu = () => {
    setDotsVisible(false); // Close First to Reset
    setTimeout(() => setDotsVisible(true), 50); // Small Delay to Ensure Opening
  };

  const closeDotsMenu = () => setDotsVisible(false);

  // ✅ Navigate & Close Dropdown
  const handleNavigate = (screen) => {
    closeDotsMenu();
    props.navigation.navigate(screen);
  };

  return (
    <>
      {/* ✅ Set Status Bar Color */}
      <StatusBar
        backgroundColor={MyStyles.primaryColor.backgroundColor} // For Android
        barStyle="light-content" // Options: "light-content" (white icons) or "dark-content" (black icons)
      />

      <SafeAreaView
        style={{
          paddingTop: MyStyles.barHeight,
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 5,
          backgroundColor: MyStyles.primaryColor.backgroundColor,
          alignItems: "center",
        }}
      >
        {/* ☰ Menu Button */}
        <IconButton icon="menu" size={25} onPress={() => props.navigation.openDrawer()} />

        {/* Title */}
        <Text style={{ fontSize: 20, flexGrow: 1, fontWeight: 'bold' }}>
          {props.title}
        </Text>

        {/* 🔔 Bell Icon with Badge */}
        <TouchableOpacity
          onPress={() => props.navigation.navigate("Notifications")}
          style={{ position: "relative" }}
        >
          <IconButton icon="bell" size={25} />
          {notifications > 0 && (
            <Badge
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                backgroundColor: "red",
              }}
            >
              {notifications}
            </Badge>
          )}
        </TouchableOpacity>

        {/* ⋮ 3-Dots Menu with Toggle Fix */}
        <Menu
          visible={dotsVisible}
          onDismiss={closeDotsMenu}
          anchor={
            <IconButton icon="dots-vertical" size={25} onPress={toggleDotsMenu} />
          }
          contentStyle={{
            marginTop: 67, // ⬇ Push menu down to prevent overlap
          }}
        >
          <Menu.Item onPress={() => handleNavigate("Greetings")} title="Greetings" />
          <Menu.Item onPress={() => handleNavigate("Points")} title="Points" />
        </Menu>
      </SafeAreaView>
    </>
  );
};

export default CustomHeader;