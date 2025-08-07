import React, { useState, useEffect } from "react";
import { FlatList, View, Alert } from "react-native";
import { Text } from "react-native-paper";
import { postRequest } from "../../Services/RequestServices";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import moment from "moment-timezone";
import Loading from "../../Components/Loading";
import { CapitalizeName } from "../../utils/CapitalizeName";

const RecentActivity = (props) => {
  const { userToken, branchId } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [recentactivity, setRecentActivity] = useState([]);

  useEffect(() => {
    postRequest(
      "masters/dashboard/recentActivity",
      {
        branch_id: branchId,
        from_date: moment().tz("Asia/Kolkata").subtract(3, "days").format("YYYY-MM-DD"),
        to_date: moment().tz("Asia/Kolkata").format("YYYY-MM-DD"),
      },
      userToken
    ).then((resp) => {
      if (resp.status === 200) {
        setRecentActivity(resp.data);
      } else {
        Alert.alert("Error!", "Oops! \nSeems like we ran into a Server Error.");
      }
      setLoading(false);
    });
  }, []);

  const renderItem = ({ item, index }) => {
    const iconSize = 18;
    const dateTime = item.dateTime; // Given UTC time

    // Format the date and time
    const formattedDate = moment.utc(dateTime).format("DD-MM-YYYY");
    const formattedTime = item.time;
    
    // Get today's date and compare
    const isToday = moment().isSame(moment.utc(dateTime), 'day');
    const isCurrentWeek = moment().isSame(moment.utc(dateTime), 'week');
    
    // Format the display for the date and time
    let dateTimeDisplay = '';
    
    if (isToday) {
      dateTimeDisplay = `${formattedTime}`;
    } else if (isCurrentWeek) {
      dateTimeDisplay = moment.utc(dateTime).format('dddd'); // Show day of the week (e.g., Monday, Tuesday)
    } else {
      dateTimeDisplay = `${formattedTime}\n${formattedDate}`; // Show both time and date for older entries
    }

    return (
      <View key={index} style={{ borderBottomWidth: 0.5, borderBottomColor: "black", padding: 10, flexDirection: "row" }}>
        {/* Customer Type Initial */}
        <View style={{ margin: 6, marginTop: 5 }}>
          <Text style={{
            color: "red",
            textTransform: "uppercase",
            borderWidth: 1,
            borderRadius: 4,
            borderColor: 'grey',
            aspectRatio: 1,
            textAlign: 'center',
            fontWeight: "bold",
            padding: 2
          }}>
            {item.customer_type ? item.customer_type.charAt(0) : ""}
          </Text>
        </View>

        {/* Customer Info */}
        <View style={{ flex: 1, paddingHorizontal: 5 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View>
              <Text
                onPress={() => {
                  props.navigation.navigate("Profile", {
                    customer_id: item.customer_id,
                    customer_mobile: item.mobile,
                  });
                }}
                style={{ fontSize: 15, fontWeight: "700", color: "black" }}
              >
                {CapitalizeName(item.full_name) || ""}
              </Text>

              {item.type === "New Customer" && (
                <Icon name="brightness-1" size={10} style={{ marginHorizontal: 5, color: "lightgreen" }} />
              )}

              {/* Mobile Number & Icons */}
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", marginRight: 10 }}>{item.mobile}</Text>

                {item.dob === "true" || item.doa === "true" ? <Icon name="cake" size={iconSize} style={{ marginHorizontal: 3, color: "gold" }} /> : null}
                {item.missCall === "true" ? <Icon name="phone-missed" size={iconSize} style={{ marginHorizontal: 3 }} /> : null}
                {item.vcall === "true" ? <Icon name="video" size={iconSize} style={{ marginHorizontal: 3 }} /> : null}
                {item.wish === "true" ? <Icon name="heart" size={iconSize} style={{ marginHorizontal: 3, color: "red" }} /> : null}
              </View>

              {/* Activity Type */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontWeight: "500", marginTop: 1, color: "#333", fontSize: 13 }}>
                  {(item.type === "Get Voucher" ? "Get " + item.details : item.type).toLowerCase()}
                </Text>
              </View>
            </View>

            {/* Date & Time */}
            <Text style={{ fontSize: 13, color: "#000", textAlign: "right", marginLeft: 20 }}>
              {dateTimeDisplay}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ backgroundColor: "#FFF" }}>
      <Loading isloading={loading} />
      <FlatList
        data={recentactivity}
        initialNumToRender={10}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default RecentActivity;
