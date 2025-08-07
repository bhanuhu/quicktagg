import React, { useState } from 'react';
import { View, Alert, FlatList, ScrollView, Image, Pressable, RefreshControl } from 'react-native';
import { List, Text, TouchableRipple, Portal, Modal, IconButton } from 'react-native-paper';
import MyStyles from '../../Styles/MyStyles';
import { postRequest } from '../../Services/RequestServices';
import DatePicker from '../../Components/DatePicker';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MedalIcon from 'react-native-vector-icons/FontAwesome6';
import moment from 'moment';
import Loading from '../../Components/Loading';
import { CapitalizeName } from '../../utils/CapitalizeName';
const Points = (props) => {
  const { userToken, branchId, search } = props.route.params;
  const [loading, setLoading] = useState(false);
  const [griddata, setgriddata] = useState([]);
  const [param, setparam] = useState({
    from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
  });
  const [dateModal, setDateModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPoints();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // React.useEffect(() => {
  //   Browse();
  // }, [search]);

  // const Browse = (id) => {
  //   postRequest(
  //     "masters/dashboard/browse_cart",
  //     { search: search == undefined ? "" : search },
  //     userToken
  //   ).then((resp) => {
  //     if (resp.status == 200) {
  //       console.log(resp.data)
  //       setgriddata(resp.data);
  //     } else {
  //       Alert.alert(
  //         "Error !",
  //         "Oops! \nSeems like we run into some Server Error"
  //       );
  //     }
  //   });
  //   setLoading(false);
  // };

  React.useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = () => {
    setLoading(true);
    postRequest(
      "/customervisit/notification/customer_point",
      { branch_id: branchId, from_date: param.from_date, to_date: param.to_date, search: "" },
      userToken
    ).then((resp) => {
      console.log(`points data -> ${JSON.stringify(resp.data)}`);
      if (resp.status == 200) {

        setgriddata(resp.data);
      } else {
        Alert.alert("Error !", "Oops! \nSeems like we run into some Server Error");
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
                  fetchPoints();
                }}
              />
              <Text style={MyStyles.dateLabel}>To</Text>
              <DatePicker
                mode="text"
                value={param.to_date}
                onValueChange={(date) => {
                  param.to_date = date;
                  setparam({ ...param });
                  fetchPoints();
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
        <Pressable
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
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        {griddata.map((item, index) => (
          <View key={index} style={{ borderBottomWidth: 0.5, borderBottomColor: "black", padding: 10 }}>
            <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ margin: 6, flexDirection: 'row' }}>
                <View style={{
                  borderWidth: 1,
                  borderRadius: 4,
                  borderColor: 'grey',
                  aspectRatio: 1,
                  width: 25, // Ensure a fixed width
                  height: 25, // Ensure a fixed height
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 5

                }}>
                  <Text style={{
                    color: "red",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                  }}>
                    {item.type ? item.type.charAt(0) : ""}
                  </Text>
                </View>

                <View style={{ marginLeft: 10 }}>
                  <Text
                    style={{ fontWeight: "bold", fontSize: 15 }}
                    onPress={() => props.navigation.navigate("Profile", { customer_id: item.customer_id, customer_mobile: item.mobile })}
                  >
                    {CapitalizeName(item.full_name)}
                  </Text>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ color: "#888", fontSize: 13 }}>{item.mobile}</Text>
                    <Text style={{ color: `${item.type == 'Redeem' ? 'darkblue' : 'green'}`, fontSize: 14, borderColor: '#aaa', borderWidth: 1, paddingHorizontal: 5, fontWeight: 'bold', marginLeft: 70 }}>{item.points}</Text>
                  </View>
                  <Text style={{ color: "#888", fontSize: 13 }}>{item.category_name}</Text>
                </View>
              </View>


              <Image source={{ uri: `${item.url_image}${item.image_path}` }} style={{ width: 50, height: 50, borderRadius: 5, marginRight: 10 }} />


              <View style={{ marginRight: 5, position: 'relative', height: '100%' }}>

                <Text style={{ fontSize: 12, color: "#888", marginBottom: 10, textAlign: 'right' }}>
                  {moment(item.date_time, "YYYY-MM-DD HH:mm").format("HH:mm")}
                  {"\n"}
                  {moment(item.date_time, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY")}
                </Text>

              </View>
            </View>
            {
              item.staff_name && (

                <Text style={{ fontSize: 14, color: 'gray', marginTop: 5 }}>
                  <Text style={{ fontWeight: "700", fontSize: 13 }}>({CapitalizeName(item.staff_name)}) </Text>
                  <Text style={{ fontWeight: "700", fontSize: 13 }}>{CapitalizeName(item.subcategory_name)}</Text>
                </Text>

              )
            }


            {
              item.remark && (
                <Text style={{ fontSize: 14, color: 'gray', marginTop: 5 }}>
                  {CapitalizeName(item.remark)}

                </Text>
              )
            }



          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Points;