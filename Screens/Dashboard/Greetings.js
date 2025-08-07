import React, { useState, useEffect } from "react";
import { FlatList, View, Linking, ImageBackground, RefreshControl } from "react-native";
import { List, Text, TouchableRipple } from "react-native-paper";
import { TouchableOpacity } from "react-native-gesture-handler";
import { postRequest } from "../../Services/RequestServices";
import MyStyles from "../../Styles/MyStyles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import moment from "moment";
import Loading from "../../Components/Loading";
import { CapitalizeName } from "../../utils/CapitalizeName";
const Greetings = (props) => {
  const { userToken, branchId } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [recentdobdoa, setrecentdobdoa] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  React.useEffect(() => {
    fetchGreetings()
    setLoading(false);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGreetings();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const fetchGreetings = () => {
    postRequest(
      "masters/dashboard/dobAndDoa",
      { branch_id: branchId, search: "" },
      userToken
    ).then((resp) => {
      console.log(`g data -> ${JSON.stringify(resp.data)}`);
      if (resp.status == 200) {

        setrecentdobdoa(resp.data);
      }
    });
  }

  return (
    <ImageBackground
      style={MyStyles.container}
      source={require("../../assets/login-bg.jpg")}
    >
      <Loading isloading={loading} />
      {/* <View style={MyStyles.container}> */}
      <FlatList
        data={recentdobdoa}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        initialNumToRender={10}
        renderItem={({ item, index }) => {
          let category_name = item.category_name && item.category_name !== 'null' ? item.category_name : "";
          return (<List.Item
            style={{ borderBottomWidth: 0.5, borderBottomColor: "black" }}
            // title={item.full_name}
            title={
              <Text
                style={{ fontWeight: 'bold', fontSize: 16 }}
                onPress={() => {
                  props.navigation.navigate("Profile", {
                    customer_id: item.customer_id,
                    customer_mobile: item.mobile,
                  });
                }}
              >
                {CapitalizeName(item.full_name)}
              </Text>
            }
            titleStyle={{ fontWeight: "bold" }}
            description={
              <Text>
                {item.mobile + "          " + category_name + "\n"}
                <Text style={{ fontWeight: 'bold' }}>
                  {moment(item.occasion_date).format("DD/MM/YYYY")}
                </Text>
              </Text>

            }
            left={() => (
              <TouchableRipple
                style={{
                  borderWidth: 1,
                  borderRadius: 4,
                  borderColor: 'grey',
                  aspectRatio: 1,
                  width: 25, // Ensure a fixed width
                  height: 25, // Ensure a fixed height
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 5,
                  marginLeft: 10

                }}
                onPress={() => {
                  props.navigation.navigate("Profile", {
                    customer_id: item.customer_id,
                    customer_mobile: item.mobile,
                  });
                }}
              >
                <Text style={{ color: "red", textTransform: "uppercase", fontWeight: 'bold' }}>
                  {item.type == null ? "" : item.type.charAt(0)}
                </Text>
              </TouchableRipple>
            )}
            right={() => (
              <View style={MyStyles.row}>
                {item.doa == "true" && (
                  <Text style={{ color: 'darkblue', fontFamily: 'GreatVibes-Regular', fontSize: 18, fontStyle: 'italic' }}>
                    Anniversary
                  </Text>

                )}
                {item.dob == "true" && (
                  <Text style={{ color: 'darkred', fontFamily: 'GreatVibes-Regular', fontSize: 18, fontStyle: 'italic' }}>
                    Birthday
                  </Text>
                )}

                {
                  item.sp_day == 'true' && (
                    <>
                      <View>
                        <Text style={{ color: 'darkred', fontFamily: 'GreatVibes-Regular', fontSize: 18, fontStyle: 'italic' }}>
                          Spouse
                        </Text>
                        <Text style={{ color: 'darkred', fontFamily: 'GreatVibes-Regular', fontSize: 18, fontStyle: 'italic' }}>
                          Birthday
                        </Text>
                      </View>

                    </>

                  )
                }
                <Icon
                  name="whatsapp"
                  size={30}
                  style={{
                    marginHorizontal: 2,
                    color: "green",
                    marginLeft: 20,
                  }}
                  onPress={() => {
                    Linking.openURL(
                      "whatsapp://send?text=&phone=91" + item.mobile
                    );
                  }}
                />
              </View>
            )}
          />
          )
        }}
        keyExtractor={(item, index) => index.toString()}
      />
      {/* </View> */}
    </ImageBackground>
  );
};

export default Greetings;
