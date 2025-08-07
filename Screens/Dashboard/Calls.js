import React, { useState, useEffect } from "react";
import { View, FlatList, Alert } from "react-native";
import { List, Text, TouchableRipple, Portal, Modal, IconButton } from "react-native-paper";
import MyStyles from "../../Styles/MyStyles";
import { postRequest } from "../../Services/RequestServices";
import DatePicker from "../../Components/DatePicker";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import moment from "moment";
import Loading from "../../Components/Loading";
import { CapitalizeName } from "../../utils/CapitalizeName";

const Calls = (props) => {
  const { userToken, branchId } = props.route.params;
  const [loading, setLoading] = useState(false);
  const [griddata, setgriddata] = useState([]);
  const [param, setparam] = useState({
    from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
  });
  const [dateModal, setDateModal] = useState(false);
  React.useEffect(() => {
    fetchCallList();

  }, []);

  const fetchCallList = () => {
    setLoading(true);
    postRequest(
      "masters/dashboard/app_call_list",
      { branch_id: branchId, from_date: param.from_date, to_date: param.to_date, search: "" },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        //console.log(resp.data);   
        setgriddata(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
      setLoading(false);
    });
  };

  return (
    <View style={MyStyles.container}>
      <Loading isloading={loading} />
      <Portal>
        <Modal
          visible={dateModal}
          contentContainerStyle={{
            backgroundColor: "#FFF",
            marginHorizontal: 20,
            paddingHorizontal: 10,
            borderRadius: 5,
          }}
          onDismiss={() => setDateModal(false)}
        >
          <View style={MyStyles.datePickerModal}>
            <View>
              <Text>
                Select Duration
              </Text>
            </View>
            <View style={MyStyles.datePickerRow}>
              <DatePicker
                mode="text"
                value={param.from_date}
                onValueChange={(date) => {
                  param.from_date = date;
                  setparam({ ...param });
                  fetchCallList();
                }}
              />
              <Text style={MyStyles.dateLabel}>To</Text>
              <DatePicker
                mode="text"
                value={param.to_date}
                onValueChange={(date) => {
                  param.to_date = date;
                  setparam({ ...param });
                  fetchCallList();
                }}
              />
            </View>
          </View>
        </Modal>
      </Portal>
      <View style={MyStyles.row}>
        <TouchableRipple onPress={() => setDateModal(true)}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <IconButton icon="calendar" />
            <Text style={{ fontWeight: 'bold' }}>
              {moment(param.from_date).format("DD/MM/YYYY") +
                " - " +
                moment(param.to_date).format("DD/MM/YYYY")}
            </Text>
          </View>
        </TouchableRipple>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            paddingHorizontal: 20,
            borderRadius: 10,
            backgroundColor: "orange",

            marginRight: 10,
          }}
          onPress={() => {
            props.navigation.navigate("RecentActivity");
          }}
        >
          <Icon name="circle-medium" color="red" size={20} />
          <Text style={{ color: "#FFF", fontWeight: 'bold' }}>Live</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={griddata}
        initialNumToRender={10}
        refreshing={loading}
        onRefresh={fetchCallList}
        renderItem={({ item, index }) => (
          <View style={{ borderBottomWidth: 0.5, borderBottomColor: "black" }}>
            <List.Item
              key={item.customer_id}
              title={
                <Text
                  style={{ fontWeight: 'bold' }}
                  onPress={() => {
                    props.navigation.navigate("Profile", {
                      customer_id: item.customer_id,
                      customer_mobile: item.mobile,
                    });
                  }}
                >
                  {CapitalizeName(item.customer_name)}
                </Text>
              }
              titleStyle={{ fontWeight: "bold" }}
              description={() => (
                <View>
                  <View style={{ flexDirection: 'row' }}>
                    <Text>{item.mobile}</Text>
                    <View style={{ marginLeft: 100 }}>
                      {item.type == "miss call" && (
                        <Icon
                          name="phone-missed"
                          size={25}
                          style={{ marginRight: 10, color: 'red' }}
                        />
                      )}
                      {item.type == "video call" && (
                        <Icon
                          name="video"
                          size={25}

                          style={{ marginRight: 10 }}
                        />
                      )}

                    </View>
                  </View>
                  <Text style={{ marginBottom: -5 }}>{item.customer_category}</Text>
                </View>

              )}

              left={() => {
                return (
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
                      {item.platform == null ? "" : item.platform.charAt(0)}
                    </Text>
                  </TouchableRipple>
                );
              }}
              right={() => (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>

                  <Text style={{ color: "#999", textAlign: "right", fontSize: 12 }}>
                    {moment(item.datetime).format("DD/MM/YYYY") ===
                      moment().format("DD/MM/YYYY")
                      ? item.time
                      : item.time + "\n" + moment(item.datetime).format("DD/MM/YYYY")}
                  </Text>
                </View>
              )}
            />
            <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 10, }}>
              <Text style={{ fontSize: 14, color: '#000', fontWeight: 'bold' }}>
                {item.status == "request" ? "Requested a " : item.status == "accept" ? "Accept " : "Done a "}
                {item.type}
                {/* <Text style={{ fontWeight: "700", fontSize: 14, margin: 2 }}>{item.platform}</Text> */}
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

export default Calls;
