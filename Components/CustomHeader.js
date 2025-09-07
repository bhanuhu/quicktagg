import React, { useEffect, useState,   useCallback } from "react";
import { SafeAreaView, StatusBar, View, TouchableOpacity } from "react-native";
import { IconButton, Text, Menu, Badge } from "react-native-paper";
import MyStyles from "../Styles/MyStyles";
import { AuthContext } from "./Context";
import { postRequest } from '../Services/RequestServices';
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

const CustomHeader = (props) => {
  const { userToken, branchId, search, refreshKey, onRefresh, notifications } = props;
  const [param, setParam] = useState({
    from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
  });
  const { signOut } = React.useContext(AuthContext);
  const [dotsVisible, setDotsVisible] = React.useState(false);
  const [branchType, setBranchType] = useState(null);

  // Fetch branch type on mount
  const fetchBranchType = useCallback(async () => {
    try {
      const branchResp = await postRequest("masters/branch/preview", { branch_id: branchId }, userToken);
      if (branchResp?.branch_type) {
        setBranchType(branchResp.branch_type);
        await AsyncStorage.setItem('branchType', branchResp.branch_type);
      }
    } catch (error) {
      console.error('Error fetching branch type:', error);
    }
  }, [branchId, userToken]);

  useEffect(() => {
    fetchBranchType();
  }, [fetchBranchType]);

  // Menu visibility handlers
  const toggleDotsMenu = () => {
    setDotsVisible(prev => !prev);
  };

  const closeDotsMenu = () => setDotsVisible(false);

  // ✅ Navigate & Close Dropdown
  const handleNavigate = (screen) => {
    closeDotsMenu();
    if (screen === 'Home' && typeof onRefresh === 'function') {
      onRefresh();
    }
    props.navigation.navigate(screen);
  };


  return (
    <>
    {console.log("branch type->", notifications)}
      {/* Status Bar */}
      <StatusBar
        backgroundColor={MyStyles.primaryColor.backgroundColor}
        barStyle="light-content"
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