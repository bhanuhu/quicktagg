import React, { useState, useEffect } from 'react';
import {
  View,
  Alert,
  ScrollView,
  Image,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Modal } from 'react-native';
import {
  Text,
  TouchableRipple,
  Portal,
  IconButton,
  TouchableWithoutFeedback,
} from 'react-native-paper';
import MyStyles from '../../Styles/MyStyles';
import { postRequest } from '../../Services/RequestServices';
import DatePicker from '../../Components/DatePicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MedalIcon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import Loading from '../../Components/Loading';
import { CapitalizeName } from '../../utils/CapitalizeName';
import { TouchableOpacity } from 'react-native-gesture-handler';

const Notifications = (props) => {
  const { userToken, branchId, search } = props.route.params;
  const [loading, setLoading] = useState(false);
  const [griddata, setgriddata] = useState([]);
  const [serviceData, setServiceData] = useState([]);
  const [param, setparam] = useState({
    from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
  });
  const [dateModal, setDateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

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

  const filteredData = React.useMemo(() => {
    console.log('Search term:', search);
    console.log('Grid data length:', griddata?.length);

    if (!search || !griddata?.length) {
      console.log('No search term or empty grid data, returning all items');
      return griddata || [];
    }

    const searchTerm = search.toLowerCase().trim();
    console.log('Searching for:', searchTerm);

    const result = griddata.filter((item) => {
      if (!item) return false;

      // Check each field for the search term
      const fieldsToSearch = [
        { name: 'full_name', value: item.full_name },
        { name: 'mobile', value: item.mobile },
        { name: 'category', value: item.category },
        { name: 'category_name', value: item.category_name },

      ];

      const hasMatch = fieldsToSearch.some(({ name, value }) => {
        if (!value) return false;
        const strValue = String(value).toLowerCase();
        const match = strValue.includes(searchTerm);
        if (match) {
          console.log(`Match found in ${name}:`, value);
        }
        return match;
      });

      return hasMatch;
    });

    console.log('Filtered results count:', result.length);
    return result;
  }, [griddata, search]);

   const filteredServiceData = React.useMemo(() => {
          
          if (!search || !serviceData?.length) {
            return serviceData || [];
          }
          
          const searchTerm = search.toLowerCase().trim();
          
          const result = serviceData.filter((item) => {
            if (!item) return false;
            
            // Check each field for the search term
            const fieldsToSearch = [
              { name: 'customer_name', value: item.full_name },
              { name: 'mobile', value: item.mobile },
              { name: 'product_name', value: item.category },
              { name: 'subcategory_name', value: item.sub_category },
              { name: 'staff_name', value: item.staff },
              { name: 'status', value: item.status },
              { name: 'vehicle_number', value: item.vihcle_number },
              { name: 'last_service_date', value: moment(item.last_service_date).format('YYYY-MM-DD') },
              { name: 'next_service', value: moment(item.next_service).format('YYYY-MM-DD') },
            ];
            
            const hasMatch = fieldsToSearch.some(({ name, value }) => {
              if (!value) return false;
              const strValue = String(value).toLowerCase();
              const match = strValue.includes(searchTerm);
              if (match) {
                console.log(`Match found in ${name}:`, value);
              }
              return match;
            });
            
            return hasMatch;
          });
          
          return result;
        }, [serviceData, search]);
        
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
        console.log('Notification response:', notifResp);
        if (notifResp.status === 200) {
          setgriddata(notifResp.data);
        } else {
          Alert.alert('Error!', 'Failed to fetch notifications');
        }

        if (serviceResp.status === 200) {
          console.log(`service response --------> ${JSON.stringify(serviceResp.data)}`)
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

      

     

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredData.map((item, index) => (
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
                <TouchableOpacity onPress={() => {
                  setSelectedImage(`${item.url}CustomerUploadedDesign/${item.image_path}`);
                  setIsZoomed(true);
                }}>
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
                </TouchableOpacity>
              ) : (
                <Icon
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

        {filteredServiceData.map((item, index) => (
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


              <Pressable onPress={() => {
                setSelectedImage(`https://api.quicktagg.com/CustomerUploads/${item.image}`);
                setIsZoomed(true);
              }}>
                <Image 
                  source={{ uri: `https://api.quicktagg.com/CustomerUploads/${item.image}` }} 
                  style={{ width: 50, height: 50, borderRadius: 5, marginRight: 10 }}
                />
              </Pressable>


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
                  <Pressable 
                    style={{ position: 'absolute', bottom: -40, right: 20 }} 
                    onPress={() => toggleDropdown(item.id || `service-${index}`)}
                  >
                    <MedalIcon
                      name={openDropdownId === (item.id || `service-${index}`) ? "caret-up-outline" : "caret-down-outline"}
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

            {openDropdownId === (item.id || `service-${index}`) && (
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

      {/* Toggle Zoom Image */}
      {selectedImage && (
        <Pressable 
          onPress={() => {
            if (!isZoomed) {
              setIsZoomed(true);
            } else {
              setSelectedImage(null);
              setIsZoomed(false);
            }
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <Image 
            source={{ uri: selectedImage }} 
            style={{
              width: '60%',
              height: '60%',
              resizeMode: 'contain',
              transform: [{ scale: isZoomed ? 1.5 : 1 }]
            }}
          />
        </Pressable>
      )}
    </View>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedImage: {
    width: '100%',
    height: '80%',
  }
};

export default Notifications;
