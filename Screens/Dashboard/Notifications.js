import React, { useState, useEffect } from 'react';
import {
  View,
  Alert,
  ScrollView,
  Image,
  Pressable,
  RefreshControl,
} from 'react-native';
import {
  Text,
  TouchableRipple,
  Portal,
  Modal,
  IconButton,
} from 'react-native-paper';
import MyStyles from '../../Styles/MyStyles';
import { postRequest } from '../../Services/RequestServices';
import DatePicker from '../../Components/DatePicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MedalIcon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import Loading from '../../Components/Loading';
import { CapitalizeName } from '../../utils/CapitalizeName';

const Notifications = (props) => {
  const { userToken, branchId } = props.route.params;
  const [loading, setLoading] = useState(false);
  const [griddata, setgriddata] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [param, setparam] = useState({
    from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
  });
  const [dateModal, setDateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
 const seeDetails = () => {
        setIsOpen(!isOpen)
    }


  const getInterestColor = (item) => {
    switch (item.status) {
      case 'Done':
        return 'green';
      case 'Pending...':
        return MyStyles.primaryColor.backgroundColor;
      case 'Due':
        return 'blue';
      default:
        return 'red';
    }
  };

  const fetchNotifications = () => {
    setLoading(true);
    Promise.all([
      postRequest(
        'customervisit/notification',
        { branch_id: branchId, ...param, search: '' },
        userToken
      ),
      postRequest(
        'customervisit/details/customer_service',
        { branch_id: branchId, ...param, search: '' },
        userToken
      ),
    ])
      .then(([notifResp, serviceResp]) => {
        if (notifResp.status === 200) {
          setgriddata(notifResp.data);
        } else {
          Alert.alert('Error!', 'Failed to fetch notifications');
        }

        if (serviceResp.status === 200) {
          const today = moment().format('YYYY-MM-DD');
          const filtered = serviceResp.data.filter(
            (item) =>
              item.status === 'Due' &&
              moment(item.next_service).format('YYYY-MM-DD') === today
          );
          setServiceData(filtered);
        } else {
          Alert.alert('Error!', 'Failed to fetch service data');
        }

        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        Alert.alert('Error!', 'Something went wrong');
        setLoading(false);
      });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <View style={MyStyles.container}>
      <Loading isloading={loading} />

      <Portal>
        <Modal
          visible={dateModal}
          contentContainerStyle={{
            backgroundColor: '#FFF',
            marginHorizontal: 20,
            paddingHorizontal: 10,
            borderRadius: 5,
          }}
          onDismiss={() => setDateModal(false)}
        >
          <View style={MyStyles.datePickerModal}>
            <Text>Select Duration</Text>
            <View style={MyStyles.datePickerRow}>
              <DatePicker
                mode="text"
                value={param.from_date}
                onValueChange={(date) => {
                  param.from_date = date;
                  setparam({ ...param });
                  fetchNotifications();
                }}
              />
              <Text style={MyStyles.dateLabel}>To</Text>
              <DatePicker
                mode="text"
                value={param.to_date}
                onValueChange={(date) => {
                  param.to_date = date;
                  setparam({ ...param });
                  fetchNotifications();
                }}
              />
            </View>
          </View>
        </Modal>
      </Portal>

      <View style={MyStyles.row}>
        <TouchableRipple onPress={() => setDateModal(true)}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <IconButton icon="calendar" />
            <Text style={{ fontWeight: 'bold' }}>
              {moment(param.from_date).format('DD/MM/YYYY')} -{' '}
              {moment(param.to_date).format('DD/MM/YYYY')}
            </Text>
          </View>
        </TouchableRipple>
        <Pressable
          style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            borderRadius: 10,
            backgroundColor: 'orange',
            marginRight: 10,
          }}
          onPress={() => props.navigation.navigate('RecentActivity')}
        >
          <Icon name="circle-medium" color="red" size={20} />
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Live</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {griddata.map((item, index) => (
          <View
            key={`notif-${index}`}
            style={{
              borderBottomWidth: 0.5,
              borderBottomColor: 'black',
              padding: 10,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <View style={{ margin: 6, flexDirection: 'row' }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 4,
                    borderColor: 'grey',
                    aspectRatio: 1,
                    width: 25,
                    height: 25,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 5,
                  }}
                >
                  <Text
                    style={{
                      color: 'red',
                      textTransform: 'uppercase',
                      fontWeight: 'bold',
                    }}
                  >
                    {item.added_from ? item.added_from.charAt(0) : 'c'}
                  </Text>
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text
                    style={{ fontWeight: 'bold', fontSize: 15 }}
                    onPress={() =>
                      props.navigation.navigate('Profile', {
                        customer_id: item.customer_id,
                        customer_mobile: item.mobile,
                      })
                    }
                  >
                    {CapitalizeName(item.full_name)}
                  </Text>
                  <Text style={{ color: '#888', fontSize: 13 }}>
                    {item.mobile}
                  </Text>
                  <Text style={{ color: '#888', fontSize: 13 }}>
                    {item.category_name}
                  </Text>
                </View>
              </View>

              {item.image_path ? (
                <Image
                  source={{
                    uri: `${item.url}CustomerUploadedDesign/${item.image_path}`
                  }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 5,
                    marginRight: 10,
                  }}
                />
              ) : (
                <UploadIcon
                  name="upload"
                  size={30}
                  color="green"
                  style={{ marginRight: 10 }}
                />
              )}

              <View style={{ marginRight: 5, alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#888',
                    textAlign: 'right',
                    marginBottom: 10,
                  }}
                >
                  {moment(item.edatetime, 'YYYY-MM-DD HH:mm').format('HH:mm') +
                    '\n' +
                    moment(item.edatetime, 'YYYY-MM-DD HH:mm:ss').format(
                      'DD/MM/YYYY'
                    )}
                </Text>
              </View>
            </View>

            {item.category && (
              <Text style={{ fontSize: 14, color: 'gray', marginTop: 5 }}>
                <Text style={{ fontWeight: '700', fontSize: 13 }}>
                  ({CapitalizeName(item.category)}){' '}
                </Text>
                {item.subcategory_name && (
                  <Text style={{ fontWeight: '700', fontSize: 13 }}>
                    {CapitalizeName(item.subcategory_name)}
                  </Text>
                )}
              </Text>
            )}

            {item.remarks && (
              <Text style={{ fontSize: 14, color: 'gray', marginTop: 5 }}>
                {CapitalizeName(item.remarks)}
              </Text>
            )}
          </View>
        ))}

        {serviceData.map((item, index) => (
          <View key={`service-${index}`} style={{ borderBottomWidth: 0.5, borderBottomColor: 'black', padding: 10 }}>
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
                  <Text style={{ color: "#888", fontSize: 13 }}>{item.mobile}</Text>
                  <Text style={{ color: "#555", fontSize: 13 }}>{item.vichle_number}</Text>
                </View>
              </View>


              <Image source={{ uri: `https://api.quicktagg.com/CustomerUploads/${item.image}` }} style={{ width: 50, height: 50, borderRadius: 5, marginRight: 10 }} />


              <View style={{ marginRight: 5, position: 'relative', height: '100%' }}>

                <Text style={{ fontSize: 12, color: "#888", marginBottom: 10, textAlign: 'right' }}>
                  {moment(item.date, "YYYY-MM-DD HH:mm").format("HH:mm")}
                  {"\n"}
                  {moment(item.date, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY")}
                </Text>


                {item.next_service !== "N/A" && item.next_service !== null && (
                  <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
                    <View style={{
                      borderWidth: 1,
                      padding: 5,
                      borderColor: '#aaa',
                      backgroundColor: MyStyles.primaryColor.backgroundColor,
                      borderRadius: 4,
                    }}>
                      <Text style={{ fontSize: 12, color: "#000", textAlign: 'right' }}>
                        {/* {moment(item.next_service, "YYYY-MM-DD HH:mm").format("HH:mm")} */}
                        {/* {"\n"} */}
                        {moment(item.next_service, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY")}
                      </Text>
                    </View>
                  </View>
                )}


                <View style={{ alignItems: 'center', position: 'relative' }}>
                  <Pressable style={{ position: 'absolute', bottom: -40, right: 20 }} onPress={seeDetails}>
                    <MedalIcon
                      name="caret-down-outline"
                      size={30}
                      color={getInterestColor(item)}

                    />
                  </Pressable>
                </View>

              </View>
            </View>
            {
              (item.category || item.sub_category) ? (
                <Text style={{ fontSize: 14, color: 'gray', marginTop: 5 }}>
                  {
                    item.category && (
                      <Text style={{ fontWeight: "700", fontSize: 13 }}>
                        ({CapitalizeName(item.category)}){" "}
                      </Text>
                    )
                  }
                  {
                    item.sub_category && (
                      <Text style={{ fontWeight: "700", fontSize: 13 }}>
                        ({CapitalizeName(item.sub_category)})
                      </Text>
                    )
                  }
                  {
                    item.color && (
                      <Text style={{ fontWeight: "700", fontSize: 13, }}>
                        ({CapitalizeName(item.color)})
                      </Text>
                    )
                  }

                  {
                    item.staff && (
                      <Text style={{ fontWeight: "700", fontSize: 13, }}>
                        ({CapitalizeName(item.staff)})
                      </Text>
                    )
                  }
                </Text>
              ) : null
            }


            {
              // item.remark && (
              <Text style={{ fontSize: 14, color: 'gray', marginTop: 5 }}>
                {item.remark}

              </Text>
              // )
            }

            {
              isOpen && (
                <View style={{ elevation: 10, borderColor: '#aaa', borderWidth: 1, backgroundColor: '#fff', padding: 10, borderRadius: 5 }}>
                  <View style={{ flexDirection: 'row', gap: 35, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ fontSize: 15 }}>Last Service</Text>
                      <Text style={{ fontWeight: 'bold' }}>{moment(item.last_service_date, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY")}</Text>
                    </View>

                    <View>
                      <Text style={{ fontSize: 15 }}>Color</Text>
                      <Text style={{ fontWeight: 'bold' }}>{item.color}</Text>
                    </View>

                    <View>
                      <Text style={{ fontSize: 15 }}>Kilometer</Text>
                      <Text style={{ fontWeight: 'bold' }}>{item.kms}</Text>
                    </View>





                    <View>
                      <Text style={{ fontSize: 15 }}>Next Service</Text>
                      <Text style={{ fontWeight: 'bold' }}>{moment(item.next_service, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY")}</Text>
                    </View>

                    <View>
                      <Text style={{ fontSize: 15 }}>Points</Text>
                      <Text style={{ fontWeight: 'bold' }}>{item.points}</Text>
                    </View>

                    <View>
                      <Text style={{ fontSize: 15 }}>Payment</Text>
                      <Text style={{ fontWeight: 'bold' }}>{item.payment}</Text>
                    </View>




                  </View>
                </View>
              )
            }
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Notifications;
