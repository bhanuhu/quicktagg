import React, { useEffect, useState, useRef } from 'react';
import { Dimensions, RefreshControl } from 'react-native';
import moment from 'moment';
import {
  Image,
  ImageBackground,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
  Linking
} from 'react-native';
import {
  Button,
  Text,
  TextInput,
  Card,
  Modal,
  Portal,
  TouchableRipple,
  IconButton,
  FAB,
} from 'react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Icon from 'react-native-vector-icons/Feather';
import Icon_FA from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon3 from 'react-native-vector-icons/MaterialCommunityIcons';
import IconDot from "react-native-vector-icons/MaterialCommunityIcons";
import MyStyles from '../Styles/MyStyles';
import { FlatList } from 'react-native-gesture-handler';
import { postRequest, getRequest } from '../Services/RequestServices';
import LottieView from 'lottie-react-native';
import MaleAvatar from '../assets/Animations/42842-male-avatar.json';
import FemaleAvatar from '../assets/Animations/50019-female-avatar.json';
import NotAvailable from '../assets/Animations/77295-not-available.json';
import DatePicker from '../Components/DatePicker';
import LinearGradient from 'react-native-linear-gradient';
import BadgeRibbon from '../Components/BadgeRibbon';
import Loading from '../Components/Loading';
import TimePicker from '../Components/TimePicker';
import Swiper from 'react-native-swiper';
import { CapitalizeName } from '../utils/CapitalizeName';
import { useNavigation } from '@react-navigation/native';
import MedalIcon from 'react-native-vector-icons/FontAwesome6';
import DropDown from '../Components/DropDown';

const Profile = (props) => {
  const Tab = createMaterialTopTabNavigator();
  const { userToken, customer_id, customer_mobile, missCallUser, branchId } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [param, setparam] = useState({
    customer_id: "",
    full_name: "",
    gender: "",
    category_id: "",
    category_name: "",
    mobile: "",
    doa: "",
    dob: "",
    spouse_birthday: "",
    area_id: "",
    area_name: "",
    profession: "",
    staff_id: "",
    staff_name: "",
    ref_id: "",
    ref_full_name: "",
    ref_mobile: "",
    totalwishlist: "",
    totaltrials: "",
    totalvcalls: "",
    catalogs: "",
  });
  const [isShow, setIsShow] = useState(true)
  const [totalPoint, setTotalPoint] = useState(0)


  React.useEffect(() => {
    let data = { customer_id: customer_id };
    postRequest("customers/customer/profile", data, userToken).then((resp) => {
      if (resp.status === 200) {
        const customerData = resp.data[0];
        setparam({
          customer_id: customerData.customer_id,
          full_name: customerData.full_name,
          gender: customerData.gender,
          category_id: customerData.category_id,
          category_name: customerData.category_name,
          mobile: customerData.mobile,
          doa: customerData.doa,
          dob: customerData.dob,
          spouse_birthday: customerData.spouse_birthday,
          area_id: customerData.area_id,
          area_name: customerData.area_name,
          profession: customerData.profession,
          staff_id: customerData.staff_id,
          staff_name: customerData.staff_name,
          ref_id: customerData.ref_id,
          ref_full_name: customerData.ref_full_name,
          ref_mobile: customerData.ref_mobile,
          totalwishlist: customerData.totalwishlist,
          totaltrials: customerData.totaltrials,
          totalvcalls: customerData.totalvcalls,
          catalogs: customerData.catalogs,
        });
      } else {
        Alert.alert(
          "Error!",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
      setLoading(false);
    });
  }, [customer_id, userToken]);

  React.useEffect(() => {
    let temparam = {
      customer_id: customer_id,
    };
    postRequest("customervisit/getCustomerPointList", temparam, userToken).then(
      (data) => {
        console.log("points - ", data.data[0].total_points)
        setTotalPoint(data.data[0].total_points);
      }
    );
  }, [customer_id]);



  return (
    <View style={MyStyles.container}>
      <Loading isloading={loading} />
      <View
        style={[
          MyStyles.row,
          {
            justifyContent: "center",
            marginTop: 10,
          },
        ]}
      >

        {param.gender !== '' ? (<LottieView
          source={param.gender === "Male" ? MaleAvatar : FemaleAvatar}
          autoPlay
          loop
          resizeMode="cover"
          style={{ width: 100, height: 100, margin: -10, }}
        />

        ) : (<LottieView
          source={NotAvailable}
          autoPlay
          loop
          resizeMode="cover"
          style={{ width: 100, height: 100, margin: -10, }}
        />

        )}

        <View style={[MyStyles.profile_row, { marginRight: 30 }]}>
          <View style={{ alignItems: "center", paddingHorizontal: 10 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>
              {param.totalwishlist}
            </Text>
            <Text style={{ fontWeight: "bold" }}>Wishlist</Text>
          </View>
          <View style={{ alignItems: "center", paddingHorizontal: 10 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>
              {param.totaltrials}
            </Text>
            <Text style={{ fontWeight: "bold" }}>Trials</Text>
          </View>
          <View style={{ alignItems: "center", paddingHorizontal: 10 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>
              {param.totalvcalls}
            </Text>
            <Text style={{ fontWeight: "bold" }}>Calls</Text>
          </View>
          <View style={{ alignItems: "center", paddingHorizontal: 10 }}>
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>
              {param.catalogs}
            </Text>
            <Text style={{ fontWeight: "bold" }}>Catalogs</Text>
          </View>
        </View>
      </View>
      <View style={{ margin: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>

          {CapitalizeName(param.full_name)} {(param.gender == null ? "" : (param.gender == "male" ? "♂️" : "♀️")) + "      "}
          <Text style={{ color: "green" }}>{CapitalizeName(param.category_name)}</Text>
        </Text>
      </View>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginHorizontal: 10, marginVertical: 5 }}>{totalPoint}</Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
          <TouchableRipple onPress={() => Linking.openURL("tel:9874561230")}>
            <Text>{param.mobile}</Text>
          </TouchableRipple>
          <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
            <Icon2
              name='whatsapp'
              size={27}
              style={{ color: "green", marginHorizontal: 10, marginLeft: "auto" }}
              onPress={() => {
                Linking.openURL("whatsapp://send?text=&phone=91" + param.mobile);
              }}
            />
            <Icon2
              name='arrow-up-bold-box'
              size={30}
              style={{ color: "blue", marginHorizontal: 5, marginLeft: "auto" }}
              onPress={() => {
                setIsShow(!isShow)
              }}
            />
          </View>
        </View>
        {
          isShow && (
            <>
              <Text>
                DOB:{" "}
                {param.dob == null ? "N/A" : moment(param.dob).format("Do MMM YYYY")}{" "}
              </Text>
              <Text>
                DOA:{" "}
                {param.doa == null ? "N/A" : moment(param.doa).format("Do MMM YYYY")}
              </Text>
              <Text>{param.area_name}</Text>
              <Text>{param.profession}</Text>
            </>
          )
        }
      </View>
      {
        isShow && (
          <>
            <View style={{ margin: 10 }}>
              <Text style={{ color: "#F33A6A" }}>Staff: {param.staff_id}</Text>
              <Text style={{ color: "#F33A6A" }}>
                REF. BY: {param.ref_full_name} - {param.ref_mobile}
              </Text>
            </View>

          </>
        )
      }
      <View style={[MyStyles.row, { justifyContent: "space-between", marginHorizontal: 10 }]}>
        <Button
          mode='outlined'

          uppercase={false}
          style={{ borderRadius: 5 }}
          labelStyle={{ color: "black" }}
          onPress={() =>
            props.navigation.navigate("CustomerForm", {
              customer_id: param.customer_id,
            })
          }>
          Edit Profile
        </Button>
        <Button
          mode='outlined'
          compact
          uppercase={false}
          style={{ borderRadius: 5 }}
          labelStyle={{ color: "black" }}
          color='black'
          onPress={() => props.navigation.navigate("Catalogs")}>
          Create Catalog
        </Button>
        <Button
          mode='outlined'

          uppercase={false}
          style={{ borderRadius: 5 }}
          labelStyle={{ color: "black" }}
          color='black'
          onPress={() =>
            props.navigation.navigate("CustomerVoucherList", {
              customer_id: param.customer_id,
              search: ""
            })
          }>
Redeem        </Button>
      </View>


      <Tab.Navigator
        key={param.customer_id}
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#ff0000',
          tabBarInactiveTintColor: '#000',
          swipeEnabled: false
        }}
      >
        <Tab.Screen
          name='Wishlist'
          children={() => <Wishlist userToken={userToken} customer_id={param.customer_id} />}
          options={{
            tabBarIcon: ({ focused }) => (
              <Icon_FA name="heart" size={20} color={focused ? '#ff0000' : '#000'} />
            )
          }}
        />

        <Tab.Screen
          name='Uploaded'
          children={() => <Uploaded userToken={userToken} customer_id={param.customer_id} />}
          options={{
            tabBarIcon: ({ focused }) => (
              <Icon_FA name="upload" size={20} color={focused ? '#00ff00' : '#000'} />
            )
          }}

        />
        <Tab.Screen
          name='Exhibition'
          children={() => <Exhibition userToken={userToken} customer_id={param.customer_id} />}
          options={{
            tabBarIcon: ({ focused }) => (
              <Icon2 name="cog-outline" size={20} color={focused ? '#00eeff' : '#000'} />
            )
          }}

        />
        <Tab.Screen
          name='VideoCallRequest'
          children={() => <VideoCallRequest userToken={userToken} customer_id={param.customer_id} customer_mobile={customer_mobile} />}
          options={{
            tabBarIcon: ({ focused }) => (
              <Icon2 name="video" size={20} color={focused ? '#ff0000' : '#000'} />
            )
          }}

        />
        <Tab.Screen
          name='CallRequest'
          children={() => <CallRequest userToken={userToken} customer_id={param.customer_id} customer_mobile={customer_mobile} miss_call_user={missCallUser} />}
          options={{
            tabBarIcon: ({ focused }) => (
              <Icon_FA name="phone" size={20} color={focused ? '#00ff00' : '#000'} />
            )
          }}
        />
      </Tab.Navigator>


    </View>
  );
};

const Wishlist = ({ userToken, customer_id }) => {
  // const { userToken, customer_id } = props.route.params;


  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth / 3) - 20;  // 3 cards per row, minus margins
  const [loading, setLoading] = useState(true);
  const [wishlist, setwishlist] = useState([]);
  const [param, setparam] = useState({
    from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    postRequest("masters/dashboard/browse_cart", { from_date: param.from_date, to_date: param.to_date }, userToken).then((resp) => {
      if (resp.status == 200) {

        const filteredData = resp.data.filter(
          item => item.customer_id === customer_id && item.added_from != 'trial' && item.added_from != 'exhibition' && item.added_from != "online"
        );


        setwishlist(filteredData);

      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
      setLoading(false);
    });
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const navigation = useNavigation();


  React.useEffect(() => {
    postRequest("masters/dashboard/browse_cart", { from_date: param.from_date, to_date: param.to_date }, userToken).then((resp) => {
      if (resp.status == 200) {

        const filteredData = resp.data.filter(
          item => item.customer_id === customer_id && item.added_from != 'trial' && item.added_from != 'exhibition' && item.added_from != "online"
        );


        setwishlist(filteredData);

      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
      setLoading(false);
    });

  }, [customer_id]);


  // Group wishlist items by date
  const groupedWishlist = wishlist
    .slice()
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
    .reduce((groups, item) => {
      const dateKey = moment(item.datetime).format('MMM DD, YYYY');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
      return groups;
    }, {});

  const getInterestColor = (item) => {
    const interestValue =
      (item.updated_interest && item.updated_interest !== 'N/A'
        ? item.updated_interest
        : item.interest && item.interest !== 'N/A'
          ? item.interest
          : ''
      ).toLowerCase();

    switch (interestValue) {
      case 'yes':
        return 'green';
      case 'follow up':
        return MyStyles.primaryColor.backgroundColor
      case 'requirement':
        return 'red';
      default:
        return 'red';
    }
  };


  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>  {/* Safe full screen container */}
      <Loading isloading={loading} />


      <ScrollView contentContainerStyle={{ padding: 10 }} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <View style={{ flexDirection: 'column' }}>
          {Object.keys(groupedWishlist).map((dateKey, index) => (
            <View key={dateKey + index}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 10, color: '#333' }}>
                {dateKey}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                }}
              >
                {groupedWishlist[dateKey].map((item, index) => (
                  <Card
                    key={item.customer_id + index}
                    style={{
                      width: cardWidth,
                      margin: 5,
                      borderRadius: 10,
                      overflow: 'hidden',
                      backgroundColor: '#fff'
                    }}
                    onPress={() =>
                      navigation.navigate("ProfileProductsPreview", {
                        product_id: item.product_id,
                        item
                      })
                    }
                  >
                    <Image
                      source={{ uri: item.url_image + item.image_path }}
                      style={{
                        width: '100%',
                        height: 120,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        zIndex: -1
                      }}
                    />
                    <View style={{
                      padding: 5,
                      paddingVertical: 10,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Text numberOfLines={1} style={{ color: "#333", fontWeight: 'bold' }}>
                        {item.product_name.length < 13
                          ? CapitalizeName(item.product_name)
                          : `${CapitalizeName(item.product_name).substring(0, 10)}...`}
                      </Text>

                      <IconDot
                        name="brightness-1"
                        size={10}
                        color={getInterestColor(item)}
                        style={{
                          marginHorizontal: 2,
                          alignSelf: "center",
                        }}
                      />
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView >


    </View >
  );

};

const Uploaded = ({ userToken, customer_id }) => {
  // const { userToken, customer_id } = props.route.params;


  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth / 3) - 20;  // 3 cards per row, minus margins
  const [loading, setLoading] = useState(true);
  const [uploaded, setUploaded] = useState([]);
  const [param, setparam] = useState({
    from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
  });

  const navigation = useNavigation();

  // console.log(`customer id in uploaded -> ${customer_id}`)
  // console.log(uploaded)


  React.useEffect(() => {
    postRequest("masters/dashboard/browse_cart", { from_date: param.from_date, to_date: param.to_date }, userToken).then((resp) => {
      if (resp.status == 200) {
        // console.log()
        const filteredData = resp.data.filter(
          item => item.customer_id === customer_id && item.added_from == "Online"
        );


        setUploaded(filteredData);

      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
      setLoading(false);
    });

  }, [customer_id]);


  // Group Uploaded items by date
  const groupedUploaded = uploaded
    .slice()
    .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
    .reduce((groups, item) => {
      const dateKey = moment(item.datetime).format('MMM DD, YYYY');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
      return groups;
    }, {});


  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>  {/* Safe full screen container */}
      <Loading isloading={loading} />


      <ScrollView contentContainerStyle={{ padding: 10 }}>
        <View style={{ flexDirection: 'column' }}>
          {Object.keys(groupedUploaded).map((dateKey, index) => (
            <View key={dateKey + index}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 10, color: '#333' }}>
                {dateKey}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-start',
                }}
              >
                {groupedUploaded[dateKey].map((item, index) => (
                  <Card
                    key={item.customer_id + index}
                    style={{
                      width: cardWidth,
                      margin: 5,
                      borderRadius: 10,
                      overflow: 'hidden',
                      backgroundColor: '#fff'
                    }}
                    onPress={() =>
                      navigation.navigate("ProfileProductsPreview", {
                        product_id: item.product_id,
                        remarks: item.remarks
                      })
                    }
                  >
                    <Image
                      source={{ uri: item.url_image + item.image_path }}
                      style={{
                        width: '100%',
                        height: 120,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        zIndex: -1
                      }}
                    />
                    <View style={{
                      padding: 5,
                      paddingVertical: 10,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Text numberOfLines={1} style={{ color: "#333", fontWeight: 'bold' }}>
                        {item.product_name.length < 13
                          ? CapitalizeName(item.product_name)
                          : `${CapitalizeName(item.product_name).substring(0, 10)}...`}
                      </Text>

                      <IconDot
                        name="brightness-1"
                        size={10}
                        style={{
                          marginHorizontal: 2,
                          color: (
                            item.updated_interest && item.updated_interest !== 'N/A'
                              ? (item.updated_interest.toLowerCase() === 'yes' ? 'green' : MyStyles.primaryColor.backgroundColor)
                              : item.interest && item.interest !== 'N/A'
                                ? (item.interest.toLowerCase() === 'yes' ? 'green' : MyStyles.primaryColor.backgroundColor)
                                : 'red'
                          ),
                          alignSelf: "center",
                        }}
                      />
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView >


    </View >
  );

};

const Exhibition = ({ userToken, customer_id }) => {
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = (screenWidth / 3) - 20;  // 3 cards per row, minus margins
  const [loading, setLoading] = useState(true);
  const [serviceList, setServiceList] = useState([]);
  const [exhibition, setExhibition] = useState([]);
  const [param, setparam] = useState({
    from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
  });

  const navigation = useNavigation();

  React.useEffect(() => {
    setLoading(true);

    // First API for exhibition/trial products
    postRequest("masters/dashboard/browse_cart", { from_date: param.from_date, to_date: param.to_date}, userToken)
      .then((resp) => {
        if (resp.status === 200) {
          const filteredData = resp.data.filter(
            item =>
              item.customer_id === customer_id &&
              (item.added_from === 'trial' || item.added_from === 'exhibition')
          );
          setExhibition(filteredData);
        } else {
          Alert.alert("Error !", "Oops! \nSeems like we ran into some Server Error");
        }
      })
      .catch((err) => console.error("Exhibition browse_cart error:", err));

    // 👉 Second API call for customer_service
    postRequest(
      "customervisit/details/customer_service",
      {
        branch_id: param.branchId,
        customer_id: param.customer_id,
        from_date: param.from_date,
        to_date: param.to_date,
        search: ""
      },
      userToken
    )
      .then((resp) => {
        if (resp.status === 200 && Array.isArray(resp.data)) {
          console.log(`service response --------> ${JSON.stringify(resp.data)}`)

          console.log('api',resp)
          const filtered = resp.data.filter(item => item.customer_id === customer_id);
          setServiceList(filtered);
        } else {
          setServiceList([]);
        }
        setLoading(false);
      });
  }, [customer_id]);


  // Group Exhibition items by date
  const groupedExhibition = serviceList
    .slice()
    .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
    .reduce((groups, item) => {
      const dateKey = moment(item.date).format('MMM DD, YYYY');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
      return groups;
    }, {});
  console.log('group', groupedExhibition)

  const getStatusColor = (status) => {
  const normalized = (status || '').trim().toLowerCase();

  switch (normalized) {
    case 'done':
      return 'green';
    case 'overdue':
      return 'gray';
    case 'reject':
      return 'red';
    case 'pending':
    case 'pending...':
      return '#fbb534'; 
    case 'due':
      return 'purple';
    default:
      return '#000'; 
  }
};

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Loading isloading={loading} />
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        <View style={{ flexDirection: 'column' }}>
          {Object.keys(groupedExhibition).map((dateKey, index) => (
            <View key={dateKey + index}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginVertical: 10, color: '#333' }}>
                {dateKey}
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                {groupedExhibition[dateKey].map((item, index) => (
                  <Card
                    key={item.customer_id + index}
                    style={{
                      width: cardWidth,
                      margin: 5,
                      borderRadius: 10,
                      overflow: 'hidden',
                      backgroundColor: '#fff'
                    }}
                    onPress={() =>
                      navigation.navigate("ZoomImageDetailScreen", {
                        imageUri: `https://api.quicktagg.com/CustomerUploads/${item.image}`,
                        details: {
                          category: item.category,
                          subCategory: item.sub_category,
                          type: item.type,
                          staff: item.staff,
                          remark: item.remark,
                          status: item.status,
                          kms: item.kms,
                          next_service: item.next_service,
                          last_service_date: item.last_service_date,
                          color: item.color,
                          payment: item. payment,
                          vichle_number: item.vichle_number
                        }
                      })
                    }
                  >
                    {/* Image */}
                    <Image
                    // uri: item.url_image + item.image_path 
                      source={{uri: `https://api.quicktagg.com/CustomerUploads/${item.image}`}}
                      style={{
                        width: '100%',
                        height: 120,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        zIndex: -1
                      }}/>
                    <View style={{
                      padding: 5,
                      paddingVertical: 10,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Text numberOfLines={1} style={{ color: "#333", fontWeight: 'bold' }}>
                         {item.category || "No Category"}
                      </Text>

                      <IconDot
                        name="brightness-1"
                        size={10}
                        color={getStatusColor(item.status)}
                        style={{
                          marginHorizontal: 2,
                          alignSelf: "center",
                        }}
                      />
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView >


    </View >
  );

};


const VideoCallRequest = ({ userToken, customer_id, customer_mobile }) => {
  // const { userToken, customer_id, customer_mobile } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [vcallslist, setvcallslist] = useState([]);
  const [visible, setVisible] = React.useState(false);
  const [visible2, setVisible2] = React.useState(false);
  const [requestParam, setrequestParam] = useState({
    tran_id: "",
    status: "accept",
    accept_date: "",
    accept_time: "",
    remarks: "",
  });
  const [newrequestParam, setnewrequestParam] = useState({
    tran_id: "0",
    name: "request",
    visit_type: "video call",
    mobile: customer_mobile,
    customer_id: customer_id,
  });
  const [active, setActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState("");
  React.useEffect(() => {
    Refresh();
  }, []);

  const Refresh = () => {
    postRequest(
      "customers/customer/profile",
      { customer_id: customer_id },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        let param = [];
        param = resp.data[0].vcalls;
        // console.log(param)
        setvcallslist(param);
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
      <Card
        style={{
          borderBottomColor: "black",
          borderBottomWidth: 1,
          paddingHorizontal: 10,
          backgroundColor: '#fff'
        }}>
        <Card.Title
          title='Create Request'
          titleStyle={{ marginLeft: -10, fontWeight: 'bold', fontSize: 20 }}
          right={() => (
            <View>
              <Button
                mode='contained'
                compact
                uppercase={false}
                style={{ borderRadius: 5 }}
                onPress={() => {
                  setVisible2(true);
                }}>
                <Icon name='plus' color='black' size={20} />
              </Button>
            </View>
          )}
        />
      </Card>
      <FlatList
        data={vcallslist}
        initialNumToRender={10}
        renderItem={({ item, index }) => (
          <Card key={index} style={{ backgroundColor: '#fff' }}>
            <Card.Title
              title={CapitalizeName(item.status)}
              titleStyle={{ fontWeight: 'bold' }}
              right={() => (
                <View style={{ marginRight: -20, marginVertical: 8 }}>
                  <View style={{ flex: 1, flexDirection: 'row', marginLeft: 10 }}>
                    <View style={{ marginLeft: 20 }}>
                      <Button
                        mode='outlined'
                        compact
                        labelStyle={{ color: 'red', fontWeight: 'bold' }}
                        uppercase={false}
                        style={{ marginVertical: 1, borderRadius: 5 }}>
                        {item.date}
                      </Button>

                    </View>
                    <Text>

                    </Text>


                    <Text style={{ color: "green", paddingTop: 12, paddingLeft: 30, marginRight: 30, fontWeight: 'bold' }}>
                      {moment(item.current_datetime).format('DD-MM-YYYY')}
                    </Text>
                  </View>
                  <View style={{ padding: 0, marginRight: 30 }}>
                    {item.status == "request" && (
                      <Button
                        mode="contained"
                        labelStyle={{
                          color: '#000',
                          // fontSize: 12,
                        }}
                        contentStyle={{
                          paddingHorizontal: 10,
                          paddingVertical: 2,
                        }}
                        style={{
                          marginTop: 5,
                          marginRight: 1,
                          borderRadius: 5,
                          alignSelf: 'flex-end', // important: makes it shrink to content
                        }}
                        uppercase={false}
                        onPress={() => {
                          setrequestParam({
                            ...requestParam,
                            tran_id: item.tran_id,
                            status: "accept",
                          });
                          setVisible(true);
                        }}
                      >
                        Accept
                      </Button>

                    )}
                    {item.status == "accept" && (
                      <View style={{ flexDirection: "row", marginTop: 5, flex: 1, alignSelf: 'flex-end' }}>
                        <Button
                          mode='contained'
                          uppercase={false}
                          labelStyle={{ color: '#000' }}
                          style={{ marginHorizontal: 10, borderRadius: 5 }}
                          onPress={() => {

                            Alert.alert("Alert", "Are you sure you want to complete this query ?", [
                              {
                                text: "No",
                                onPress: () => { },
                                style: "cancel",
                              },
                              // {
                              //   text: "Yes",
                              //   onPress: () => {
                              //     setLoading(true);
                              //     let done_param = {
                              //       tran_id: item.tran_id,
                              //       status: "done",
                              //       accept_date: moment().format("YYYY-MM-DD"),
                              //       accept_time: moment().format("HH:mm"),
                              //       remarks: "",
                              //     };
                              //     postRequest(
                              //       "transactions/customer/vcall/update",
                              //       done_param,
                              //       userToken
                              //     ).then((resp) => {
                              //       if (resp.status == 200) {
                              //         Refresh();
                              //         setLoading(false);
                              //       }
                              //     });

                              //   },
                              {
                                text: "Yes",
                                onPress: () => {
                                  setLoading(true);
                                  let done_param = {
                                    tran_id: item.tran_id,
                                    status: "done",
                                    accept_date: moment().format("YYYY-MM-DD"),
                                    accept_time: moment().format("HH:mm"),
                                    remarks: "",
                                  };
                                  postRequest(
                                    "transactions/customer/vcall/update",
                                    done_param,
                                    userToken
                                  ).then((resp) => {
                                    if (resp.status == 200) {
                                      Refresh();
                                      setLoading(false);
                                    }
                                  });

                                },
                              },
                            ]
                            );
                          }}>
                          Done
                        </Button>
                        <Button
                          mode='contained'
                          labelStyle={{ color: '#000' }}
                          style={{ marginHorizontal: 0, borderRadius: 5 }}
                          onPress={() => {
                            requestParam.tran_id = item.tran_id;
                            requestParam.status = "accept";
                            requestParam.accept_date = item.accept_date;
                            requestParam.accept_time = item.accept_time;
                            let accept_time = moment(item.accept_date).format("YYYY-MM-DD") + "T" + item.accept_time;
                            requestParam.accept_time = accept_time;
                            setrequestParam({ ...requestParam });
                            setVisible(true);

                          }}>
                          Edit
                        </Button>
                      </View>
                    )}
                  </View>
                </View>
              )}
            />
            <View
              style={{
                borderTopWidth: 0.5,
                borderTopColor: "#AAA",
                borderBottomColor: "black",
                borderBottomWidth: 1,
                marginHorizontal: 10,
              }}>
              <View style={[MyStyles.row, { justifyContent: "flex-start" }]}>
                {item.accept_date !== null && (
                  <Button
                    mode='outlined'
                    labelStyle={{ color: '#000', fontWeight: 'bold' }}
                    compact
                    uppercase={false}
                    style={{ marginHorizontal: 5, borderRadius: 5 }}>
                    {moment(item.accept_date).format("DD-MM-YYYY")}
                  </Button>
                )}

                {item.accept_time !== null && (
                  <Button
                    mode='outlined'
                    labelStyle={{ color: '#000', fontWeight: 'bold' }}
                    compact
                    uppercase={false}
                    style={{ marginHorizontal: 5, borderRadius: 5 }}>
                    {item.accept_time}
                  </Button>
                )}
              </View>
              <View>
                {item.remarks.length > 0
                  && item.remarks.map((item, i) => {
                    if (i == 0) {
                      return (
                        <Text style={{ color: "gray", marginBottom: 5 }}>{item.remarks}</Text>
                      );
                    }
                  })}

                {(activeIndex == index && active && item.remarks.length > 0)
                  && item.remarks.map((item, i) => {
                    if (i != 0) {
                      return (
                        <Text style={{ color: "gray", marginBottom: 5 }}>{item.remarks}</Text>
                      );
                    }
                  })}

                {activeIndex == index && active ?
                  <TouchableOpacity onPress={() => {
                    setActiveIndex(index);
                    setActive(false);
                  }}><Text style={{ color: "black", fontSize: 12, marginTop: 10 }}>Less All Remarks</Text>
                  </TouchableOpacity>
                  :
                  <TouchableOpacity onPress={() => {
                    setActiveIndex(index);
                    setActive(true);
                  }}>
                    <Text style={{ color: "black", fontSize: 12 }}>Show All Remarks</Text>
                  </TouchableOpacity>
                }

              </View>
            </View>
          </Card>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <Portal>
        <Modal
          visible={visible}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 10,
          }}>
          <View>
            <View style={MyStyles.row}>
              <DatePicker
                label='Accept Date'
                inputStyles={{ backgroundColor: "rgba(0,0,0,0)", width: "48%" }}
                value={requestParam.accept_date}
                onValueChange={(date) => {
                  setrequestParam({ ...requestParam, accept_date: date });
                }}
              />
              <TimePicker
                label='Accept Time'
                style={{ backgroundColor: "rgba(0,0,0,0)", width: "100%" }}
                // value={`2022-01-27T${requestParam.accept_time}`}
                value={requestParam.accept_time}
                onValueChange={(dateTime) => {
                  //console.log(dateTime);
                  requestParam.accept_time = dateTime;
                  setrequestParam({ ...requestParam });
                  //console.log(requestParam.accept_time);
                }}
              />
              {/* <TextInput
                mode="outlined"
                placeholder="Accept Time"
                style={{ backgroundColor: "rgba(0,0,0,0)", width: "48%" }}
                value={requestParam.accept_time}
                keyboardType={"number-pad"}
                onChangeText={(e) => {
                  setrequestParam({
                    ...requestParam,
                    accept_time:
                      e.length == 2
                        ? e.substring(0, 2) + ":" + e.substring(2, 5)
                        : e,
                  });
                }}
                maxLength={5}
              /> */}
            </View>
            <TextInput
              mode='outlined'
              placeholder='Remarks'
              style={{ backgroundColor: "rgba(0,0,0,0)" }}
              value={requestParam.remarks}
              onChangeText={(text) => {
                setrequestParam({ ...requestParam, remarks: text });
              }}
              multiline
              numberOfLines={4}
            />
            <View style={[MyStyles.row, { marginTop: 20 }]}>
              <Button
                mode='contained'
                compact
                uppercase={false}
                labelStyle={{ color: '#000' }}

                style={{ width: "48%", borderRadius: 5 }}
                onPress={() => {
                  setrequestParam({
                    ...requestParam,
                    tran_id: "",
                    status: "",
                    accept_date: "",
                    accept_time: "",
                    remarks: "",
                  });
                  setVisible(false);
                }}>
                Close
              </Button>
              <Button
                mode='contained'
                compact
                uppercase={false}
                labelStyle={{ color: '#000' }}
                style={{ width: "48%", borderRadius: 5 }}
                onPress={() => {
                  if (requestParam.accept_date == "") {
                    Alert.alert("Please Select Date !");
                  }
                  else if (requestParam.accept_time == "") {
                    Alert.alert("Please Select Time !");
                  }
                  else {
                    requestParam.accept_time = moment(requestParam.accept_time).format("HH:mm:ss");
                    setrequestParam({ ...requestParam });
                    //console.log(requestParam);
                    setVisible(false);
                    setLoading(true);
                    postRequest(
                      "transactions/customer/vcall/update",
                      requestParam,
                      userToken
                    ).then((resp) => {
                      setLoading(false);
                      if (resp.status == 200) {
                        Refresh();
                        setrequestParam({
                          ...requestParam,
                          tran_id: "",
                          status: "",
                          accept_date: "",
                          accept_time: "",
                          remarks: "",
                        });
                      }
                    });
                  }
                }}>
                Submit
              </Button>
            </View>
          </View>
        </Modal>

        <Modal
          visible={visible2}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 10,
          }}>
          <View>
            <TextInput
              mode='outlined'
              placeholder='Mobile'
              style={{ backgroundColor: "rgba(0,0,0,0)" }}
              placeholderTextColor="#000"
              value={newrequestParam.mobile}
              onChangeText={(text) => {
                setnewrequestParam({ ...newrequestParam, mobile: text });
              }}
              disabled
            />
            <View style={[MyStyles.row, { marginTop: 20 }]}>
              <Button
                mode='contained'
                compact
                uppercase={false}

                labelStyle={{ color: '#000' }}

                style={{ width: "48%", borderRadius: 5 }}
                onPress={() => {
                  setVisible2(false);
                }}>
                Close
              </Button>
              <Button
                mode='contained'
                compact
                uppercase={false}
                labelStyle={{ color: '#000' }}

                style={{ width: "48%", borderRadius: 5 }}
                onPress={() => {
                  setVisible2(false);
                  setLoading(true);
                  postRequest(
                    "session/Insert_appointment_app",
                    newrequestParam,
                    userToken
                  ).then((resp) => {
                    if (resp.status == 200) {
                      Refresh();
                      setLoading(false);
                    }
                  });
                }}>
                Submit
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View >
  );
};
const CallRequest = ({ userToken, customer_id, customer_mobile, miss_call_user }) => {
  // const { userToken, customer_id, customer_mobile, miss_call_user } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [misscallslist, setmisscallslist] = useState([]);
  const [visible, setVisible] = React.useState(false);
  const [visible2, setVisible2] = React.useState(false);
  const [requestParam, setrequestParam] = useState({
    tran_id: "",
    status: "",
    accept_date: "",
    accept_time: "",
    remarks: "",
  });
  const [newrequestParam, setnewrequestParam] = useState({
    tran_id: "0",
    name: "request",
    visit_type: "miss call",
    mobile: customer_mobile,
    customer_id: customer_id,
  });
  const [active, setActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState("");
  React.useEffect(() => {
    Refresh();

  }, [customer_id]);
  const Refresh = () => {
    postRequest(
      "customers/customer/profile",
      { customer_id: customer_id },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        let param = [];
        param = resp.data[0].mcalls;
        setmisscallslist(param);

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
      <Card

        style={{
          borderBottomColor: "black",
          borderBottomWidth: 1,
          paddingHorizontal: 10,
          backgroundColor: '#fff'
        }}>
        <Card.Title
          title='Create Request'
          titleStyle={{ marginLeft: -10, fontSize: 20, fontWeight: 'bold' }}
          right={() => (
            <View>
              <Button
                mode='contained'
                compact
                uppercase={false}
                style={{ borderRadius: 5 }}
                onPress={() => {
                  setVisible2(true);
                }}>
                <Icon name='plus' color='black' size={20} />
              </Button>
            </View>
          )}
        />
      </Card>
      <FlatList
        data={misscallslist}
        initialNumToRender={10}
        renderItem={({ item, index }) => (
          <Card key={index} style={{ backgroundColor: '#fff' }}>
            <Card.Title
              title={CapitalizeName(item.status)}
              titleStyle={{ fontWeight: 'bold' }}
              right={() => (
                <View style={{ marginVertical: 8 }}>
                  <View style={{ flexDirection: 'row', marginHorizontal: 10 }}>
                    <Button
                      mode='outlined'
                      labelStyle={{ color: 'red', fontWeight: 'bold' }}
                      compact
                      uppercase={false}
                      style={{ marginHorizontal: 5, borderRadius: 5 }}>
                      {moment(item.date).format("DD-MM-YYYY")}
                    </Button>
                    <Text style={{ color: "green", marginLeft: 30, marginTop: 10, fontWeight: 'bold' }}>
                      {moment(item.current_datetime.split("T")[0]).format("DD-MM-YYYY")}
                    </Text>
                  </View>
                  {item.status == "request" && (
                    <Button
                      mode='contained'

                      labelStyle={{ color: '#000' }}
                      contentStyle={{
                        paddingHorizontal: 10,
                        paddingVertical: 2,
                      }}
                      style={{
                        marginTop: 5,
                        marginRight: 10,
                        borderRadius: 5,
                        alignSelf: 'flex-end', // important: makes it shrink to content
                      }}


                      uppercase={false}
                      onPress={() => {
                        setrequestParam({
                          ...requestParam,
                          tran_id: item.tran_id,
                          status: "accept",
                        });
                        setVisible(true);
                      }}>
                      Accept
                    </Button>
                  )}
                  {item.status == "accept" && (
                    <View style={{ flexDirection: "row", marginTop: 5, marginLeft: 45 }}>
                      <Button
                        mode='contained'
                        labelStyle={{ color: '#000' }}
                        style={{ marginHorizontal: 10, borderRadius: 5 }}
                        uppercase={false}
                        onPress={() => {
                          Alert.alert("Alert", "Are you sure you want to complete this query ?", [
                            {
                              text: "No",
                              onPress: () => { },
                              style: "cancel",
                            },
                            {
                              text: "Yes",
                              onPress: () => {
                                setLoading(true);
                                let done_param = {
                                  tran_id: item.tran_id,
                                  status: "done",
                                  accept_date: moment().format("YYYY-MM-DD"),
                                  accept_time: moment().format("HH:mm"),
                                  remarks: "",
                                };
                                postRequest(
                                  "transactions/customer/missCall/update",
                                  done_param,
                                  userToken
                                ).then((resp) => {
                                  if (resp.status == 200) {
                                    Refresh();
                                    setLoading(false);
                                  }
                                });

                              },
                            }
                          ]);
                        }
                        }
                      >

                        Done
                      </Button>

                      <Button
                        mode='contained'
                        uppercase={false}
                        labelStyle={{ color: '#000' }}
                        style={{ marginRight: 10, borderRadius: 5 }}
                        onPress={() => {
                          requestParam.tran_id = item.tran_id;
                          requestParam.status = "accept";
                          requestParam.accept_date = item.accept_date;
                          let accept_time = moment(item.accept_date).format("YYYY-MM-DD") + "T" + item.accept_time;
                          requestParam.accept_time = accept_time;
                          setrequestParam({ ...requestParam });
                          setVisible(true);

                        }}>
                        Edit
                      </Button>
                    </View>
                  )}
                </View>
              )}
            />
            <View
              style={{
                borderTopWidth: 0.5,
                borderTopColor: "#AAA",
                borderBottomColor: "black",
                borderBottomWidth: 1,
                marginHorizontal: 10,
              }}>
              <View style={[MyStyles.row, { justifyContent: "flex-start" }]}>
                {item.accept_date !== null && (
                  <Button
                    mode='outlined'
                    labelStyle={{ color: '#000', fontWeight: 'bold' }}
                    compact
                    uppercase={false}
                    style={{ marginHorizontal: 5, borderRadius: 5 }}>
                    {moment(item.accept_date).format("DD-MM-YYYY")}
                  </Button>
                )}

                {item.accept_time !== null && (
                  <Button
                    mode='outlined'
                    labelStyle={{ color: '#000', fontWeight: 'bold' }}
                    compact
                    uppercase={false}
                    style={{ marginHorizontal: 5, borderRadius: 5 }}>
                    {item.accept_time}
                  </Button>
                )}
              </View>
              <View>
                {item.remarks.length > 0
                  && item.remarks.map((item, i) => {
                    if (i == 0) {
                      return (
                        <Text style={{ color: "gray", marginBottom: 5 }}>- {item.remark}</Text>
                      );
                    }
                  })}

                {(activeIndex == index && active && item.remarks.length > 0)
                  && item.remarks.map((item, i) => {
                    if (i != 0) {
                      return (
                        <Text style={{ color: "gray", marginBottom: 5 }}>- {item.remark}</Text>
                      );
                    }
                  })}

                {activeIndex == index && active ?
                  <TouchableOpacity onPress={() => {
                    setActiveIndex(index);
                    setActive(false);
                  }}><Text style={{ color: "black", fontSize: 12, marginTop: 10 }} >Less All Remarks</Text>
                  </TouchableOpacity>
                  :
                  <TouchableOpacity onPress={() => {
                    setActiveIndex(index);
                    setActive(true);
                  }}>
                    <Text style={{ color: "black", fontSize: 12 }} >Show All Remarks</Text>
                  </TouchableOpacity>
                }
              </View>
            </View>
          </Card>
        )
        }
        keyExtractor={(item, index) => index.toString()}
      />
      < Portal >
        <Modal
          visible={visible}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 10,
          }}>
          <View>
            <View style={MyStyles.row}>
              <DatePicker
                label='Accept Date'
                inputStyles={{ backgroundColor: "rgba(0,0,0,0)" }}
                value={requestParam.accept_date}
                onValueChange={(date) => {
                  setrequestParam({ ...requestParam, accept_date: date });
                }}
              />
              <TimePicker
                label='Accept Time'
                style={{ backgroundColor: "rgba(0,0,0,0)", }}
                value={requestParam.accept_time}
                onValueChange={(dateTime) => {
                  requestParam.accept_time = dateTime;
                  setrequestParam({ ...requestParam });
                }}
              />
            </View>
            <TextInput
              mode='outlined'
              placeholder='Remarks'
              style={{ backgroundColor: "rgba(0,0,0,0)" }}
              placeholderTextColor="#000"
              value={requestParam.remarks}
              onChangeText={(text) => {
                setrequestParam({ ...requestParam, remarks: text });
              }}
              multiline
              numberOfLines={4}
            />
            <View style={[MyStyles.row, { marginTop: 20 }]}>
              <Button
                mode='contained'
                compact
                uppercase={false}

                style={{ backgroundColor: "red", width: "48%", borderRadius: 5 }}
                onPress={() => {
                  setrequestParam({
                    ...requestParam,
                    tran_id: "",
                    status: "",
                    accept_date: "",
                    accept_time: "",
                    remarks: "",
                  });
                  setVisible(false);
                }}>
                Close
              </Button>
              <Button
                mode='contained'
                compact
                labelStyle={{ color: '#000' }}
                uppercase={false}
                style={{ width: "48%", borderRadius: 5 }}

                onPress={() => {
                  if (requestParam.accept_date == "") {
                    Alert.alert("Please Select Date !");
                  }
                  else if (requestParam.accept_time == "") {
                    Alert.alert("Please Select Time !");
                  }
                  else {
                    requestParam.accept_time = moment(requestParam.accept_time).format("HH:mm:ss");
                    setrequestParam({ ...requestParam });
                    setVisible(false);
                    // setLoading(true);
                    postRequest(
                      "transactions/customer/missCall/update",
                      requestParam,
                      userToken
                    ).then((resp) => {
                      setLoading(false);
                      console.log(`call submission err -> ${resp}`)
                      // return
                      if (resp.status == 200) {
                        Refresh();
                        setrequestParam({
                          ...requestParam,
                          tran_id: "",
                          status: "",
                          accept_date: "",
                          accept_time: "",
                          remarks: "",
                        });
                      }
                    });
                  }
                }}>
                Submit
              </Button>
            </View>
          </View>
        </Modal>

        <Modal
          visible={visible2}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            margin: 10,
          }}>
          <View>
            <TextInput
              mode='outlined'
              placeholder='Mobile'
              style={{ backgroundColor: "rgba(0,0,0,0)" }}
              placeholderTextColor="#000"
              value={newrequestParam.mobile}
              onChangeText={(text) => {
                setnewrequestParam({ ...newrequestParam, mobile: text });
              }}
              disabled
            />
            <View style={[MyStyles.row, { marginTop: 20 }]}>
              <Button
                mode='contained'
                compact
                uppercase={false}
                labelStyle={{ color: '#000' }}

                style={{ width: "48%", borderRadius: 5 }}
                onPress={() => {
                  setVisible2(false);
                }}>
                Close
              </Button>
              <Button
                mode='contained'
                compact
                uppercase={false}
                labelStyle={{ color: '#000' }}

                style={{ width: "48%", borderRadius: 5 }}
                onPress={() => {
                  setLoading(true);
                  getRequest(
                    "https://api.quicktagg.com/public/call?mobile=" + newrequestParam.mobile + "&DidNum=" + miss_call_user + "")
                    .then((resp) => {
                      console.log(`missed call data -> ${JSON.stringify(resp)}`)
                      if (resp.status == 200) {
                        Refresh();
                        setVisible2(false);
                        setLoading(false);
                      }
                      // console.log(resp);
                    });
                }}>
                Submit
              </Button>
            </View>
          </View>
        </Modal>
      </Portal >
    </View >
  );
};

const CustomerVoucherList = (props) => {
  const { userToken, customer_id } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [griddata, setgriddata] = useState([]);
 const [totalPoint,setTotalPoint ] = useState(0);
  const Tab = createMaterialTopTabNavigator();

  React.useEffect(() => {
    Browse();
  }, []);

  const Browse = () => {
    postRequest(
      "customervisit/getCustomerVoucherList",
      { customer_id: customer_id },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        //console.log(resp);
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

  React.useEffect(() => {
    let temparam = {
      customer_id: customer_id,
    };
    postRequest("customervisit/getCustomerPointList", temparam, userToken).then(
      (data) => {
        console.log("points - ", data.data[0].total_points)
        setTotalPoint(data.data[0].total_points);
      }
    );
  }, [customer_id]);

  return (
    <View style={MyStyles.container}>
      {console.log("customer points", props)}
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: "#ffba3c" },
          tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        }}
      >
        <Tab.Screen
          name="Voucher"
          children={() => <CustomerRedeem {...props} />}
          initialParams={props.route.params}
        />
        <Tab.Screen
          name="Category"
          children={() => <CustomerPoints {...props} />}
          options={{ title: `Points ${totalPoint===0?'':`(${totalPoint})`}` }}
          initialParams={props.route.params}
        />

      </Tab.Navigator>
    </View>
  );
};

const ProfileProductsPreview = (props) => {
  const { userToken, product_id, item } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [param, setparam] = useState({
    product_id: "",
    product_code: "",
    product_name: "",
    remarks: "",
    price: "",
    disable: "",
    exhibition: "",
    businesses: "",
    trial: "",
    discounted_price: "",
    weight: "",
    size_length: "",
    gender: "",
    Metal: "",
    material: "",
    on_demand: "",
    available: "",
    qty: "",
    remarks_list: [],
  });
  const [productImages, setProductImages] = useState([]);
  const [remarks, setRemarks] = useState([]);
  const [active, setActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState("");
  const [currentProduct, setCurrentProduct] = useState({});

  const [sortedList, setSortedList] = useState({});

  console.log(remarks)


  useEffect(() => {
    setLoading(true);

    postRequest("transactions/customer/cart/remarks", {
      tran_id: item.tran_id,
      from: item.type
    }, userToken)
      .then((resp) => {
        console.log("Full API Response:", JSON.stringify(resp.data, null, 2));

        if (resp.status === 200 && Array.isArray(resp.data)) {
          setRemarks(resp.data); // Because resp.data *is* the array
        } else {
          console.warn("Unexpected response structure:", resp.data);
          setRemarks([]);
        }
      })
      .catch((error) => {
        console.error("API Error:", error);
        Alert.alert("Error!", "Something went wrong. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [item, product_id]);

  React.useEffect(() => {
    let data = { product_id: product_id };
    if (data != 0) {
      postRequest("masters/product/preview", data, userToken).then((resp) => {
        if (resp.status == 200) {
          console.log(`remarks -> ${JSON.stringify(resp.data)}`)
          setparam({
            product_id: resp.data[0].product_id,
            product_code: resp.data[0].product_code,
            product_name: resp.data[0].product_name,
            remarks: resp.data[0].remarks,
            price: resp.data[0].price,
            disable: resp.data[0].disable,
            exhibition: resp.data[0].exhibition,
            businesses: resp.data[0].businesses,
            trial: resp.data[0].trial,
            discounted_price: resp.data[0].discounted_price,
            weight: resp.data[0].weight,
            size_length: resp.data[0].size_length,
            gender: resp.data[0].gender,
            Metal: resp.data[0].Metal,
            material: resp.data[0].material,
            on_demand: resp.data[0].on_demand,
            available: resp.data[0].available,
            qty: resp.data[0].qty,
            remarks_list: remarks,

          })

          let ImagesList = [];
          ImagesList = resp.data[0].images;
          setProductImages(ImagesList);
          // console.log(ImagesList)
          setCurrentProduct(ImagesList.length > 0 ? ImagesList[0] : {});

        } else {

          Alert.alert(
            "Error !",
            "Oops! \nSeems like we run into some Server Error"
          );
        }
      });
    }

    setSortedList([...item.remarks || []].reverse());

    setLoading(false);
  }, [product_id]);

  return (
    product_id != 0 ?
      <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: 'white' }} style={{ backgroundColor: 'white' }}>
        <Loading isloading={loading} />
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {
              param.product_name && (
                <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                  {CapitalizeName(param.product_name)}
                </Text>
              )
            }
            <MedalIcon
              name="medal"
              size={25}
              color={
                item.updated_interest && item.updated_interest !== 'N/A'
                  ? (item.updated_interest.toLowerCase() === 'yes' ? 'green' : MyStyles.primaryColor.backgroundColor)
                  : item.interest && item.interest !== 'N/A'
                    ? (item.interest.toLowerCase() === 'yes' ? 'green' : MyStyles.primaryColor.backgroundColor)
                    : 'red'
              }
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </View>

          <View>
            {
              item.subcategory_name && (
                <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                  {CapitalizeName(item.subcategory_name)}
                </Text>
              )

            }

            {item.appointment_date !== "N/A" && (
              <View style={{ borderWidth: 1, padding: 3, borderColor: '#aaa', color: 'black', backgroundColor: MyStyles.primaryColor.backgroundColor, borderRadius: 2, marginBottom: 10 }}>
                <Text style={{ fontSize: 12, color: "#000" }}>
                  {moment(item.appointment_date, "YYYY-MM-DD HH:mm").format("HH:mm")}
                  {"\n"}
                  {moment(item.appointment_date, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY")}
                </Text>
              </View>
            )}
          </View>

          {
            param.product_code && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>SKU:</Text>{"   "}{param.product_code}
              </Text>
            )
          }

          {
            param.price && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Price:</Text>{"   "}{param.price}/-{"  "}
                <Text
                  style={{
                    color: "red",
                    textDecorationLine: "line-through",
                  }}
                >
                  {param.price}/-
                </Text>
              </Text>
            )
          }



        </View>
        <View style={{ marginVertical: 10, height: 250 }}>
          <IconButton
            icon="share-variant"
            size={20}
            color="#FFF"
            style={{
              margin: 5,
              backgroundColor: MyStyles.primaryColor.backgroundColor,
              alignSelf: 'flex-end'
            }}
            onPress={() => {
              Sharing.isAvailableAsync().then((result) => {
                // console.log(result, "jsadhfjhsdfhjsdfhjs")
                if (result) {
                  setLoading(true);
                  const options = {
                    dialogTitle: param.product_name.toString(),
                    mimeType: "image/jpeg"
                  };
                  FileSystem.downloadAsync(currentProduct.url + "" + currentProduct.image_path, FileSystem.cacheDirectory + currentProduct.image_path)
                    .then(async ({ uri }) => {
                      // console.log(uri, "Pathof Image")
                      Sharing.shareAsync(uri, options);
                    })
                    .catch((error) => {

                      console.error(error, "This is Error and Path is:" + currentProduct.url + "" + currentProduct.image_path, FileSystem.cacheDirectory + currentProduct.image_path);
                    });
                  setLoading(false);
                }
              });
            }}
          />
          <Swiper key={productImages.length} loop={false} activeDotColor="gray" onIndexChanged={(index) => {
            setCurrentProduct(productImages[index]);
          }} style={{ height: '100%' }}>
            {productImages.length > 0 ? (
              productImages.map((resp, index) => {
                return (
                  <View key={index}>
                    <Image
                      source={{ uri: resp.url + "" + resp.image_path }}
                      style={[{ height: '100%', width: "100%", borderRadius: 5 }]}
                    />
                  </View>
                );
              })) :
              (<Image
                source={require("../assets/upload.png")}
                style={[{ height: '100%', width: "100%", borderRadius: 5 }]}
              />)}
          </Swiper>
        </View>
        <View>
          {
            param.available && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Availablity:</Text>{"   "}{param.available || '-'}
              </Text>
            )
          }

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {
              item.added_from && (
                <Text style={{ fontSize: 15, marginTop: 10 }}>
                  <Text style={{ color: 'gray' }}>Type:</Text>{"   "}{CapitalizeName(item.added_from) || '-'}
                </Text>
              )
            }

            {
              item.staff_name && (
                <Text style={{ fontSize: 15, marginTop: 10 }}>
                  <Text style={{ color: 'gray' }}>Staff Name:</Text>{"   "}{CapitalizeName(item.staff_name) || '-'}
                </Text>
              )
            }
          </View>

          {
            param.Metal && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Metal:</Text>{"   "}{param.Metal || '-'}
              </Text>
            )
          }

          {
            param.material && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Material:</Text>{"   "}{param.material || '-'}
              </Text>
            )
          }


          {
            param.disable && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Disable:</Text>{"   "}{param.disable || '-'}
              </Text>
            )
          }

          {
            param.exhibition && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Exhibition:</Text>{"   "}{param.exhibition || '-'}
              </Text>
            )
          }

          {
            param.weight && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Weight:</Text>{"   "}{param.weight || '-'}
              </Text>
            )
          }
          {
            param.size_length && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Size/Length:</Text>{"   "}{param.size_length || '-'}
              </Text>
            )
          }

          {
            param.gender && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Gender:</Text>{"   "}{param.gender || '-'}
              </Text>
            )
          }

          {
            param.product_code && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Description:</Text>{"   "}{param.product_code || '-'}
              </Text>
            )
          }

        </View>
        <View style={{ marginTop: 50 }}>
          {remarks.length > 0 && (
            <>
              {!active
                ? (
                  // Show only the first remark
                  <Text style={{ color: "black", marginBottom: 5, fontSize: 14 }}>
                    {CapitalizeName(remarks[0].remarks)}
                  </Text>
                )
                : (
                  // Show all remarks (from first to last)
                  remarks.map((item, index) => (
                    <Text
                      key={index}
                      style={{ color: index === 0 ? "black" : "gray", marginBottom: 3 }}
                    >
                      {CapitalizeName(item.remarks)}
                    </Text>
                  ))
                )}
            </>
          )}

          {remarks.length > 1 && (
            <Text
              style={{ color: "black", fontSize: 12, marginTop: 5 }}
              onPress={() => setActive(prev => !prev)}
            >
              {active ? "Hide Remarks" : "Show All Remarks"}
            </Text>
          )}
        </View>
      </ScrollView>
      : <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: 'white' }} style={{ backgroundColor: 'white' }}>
        <Loading isloading={loading} />
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {
              item.product_name && (
                <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                  {CapitalizeName(item.product_name)}
                </Text>
              )
            }
            <MedalIcon
              name="medal"
              size={25}
              color={
                item.updated_interest && item.updated_interest !== 'N/A'
                  ? (item.updated_interest.toLowerCase() === 'yes' ? 'green' : MyStyles.primaryColor.backgroundColor)
                  : item.interest && item.interest !== 'N/A'
                    ? (item.interest.toLowerCase() === 'yes' ? 'green' : MyStyles.primaryColor.backgroundColor)
                    : 'red'
              }
              style={{ transform: [{ rotate: '180deg' }] }}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            {
              item.subcategory_name && (
                <Text>
                  {CapitalizeName(item.subcategory_name)}
                </Text>
              )

            }

            {item.appointment_date !== "N/A" && item.appointment_date != null && (
              <View style={{ borderWidth: 1, padding: 3, borderColor: '#aaa', color: 'black', borderRadius: 2, marginBottom: 10 }}>
                <Text style={{ fontSize: 12, color: "#000", textAlign: 'right' }}>
                  {moment(item.appointment_date, "YYYY-MM-DD HH:mm").format("HH:mm")}
                  {"\n"}
                  {moment(item.appointment_date, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY")}
                </Text>
              </View>
            )}
          </View>

          {
            item.product_code && (

              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>SKU:</Text>{"   "}{item.product_code}
              </Text>

            )
          }

          {
            item.price && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Price:</Text>{"   "}{item.price}/-{"  "}
                <Text
                  style={{
                    color: "red",
                    textDecorationLine: "line-through",
                  }}
                >
                  {item.price}/-
                </Text>
              </Text>
            )
          }



        </View>
        <View style={{ marginVertical: 10, height: 200 }}>
          <IconButton
            icon="share-variant"
            size={20}
            color="#FFF"
            style={{
              margin: 5,
              backgroundColor: MyStyles.primaryColor.backgroundColor,
              alignSelf: 'flex-end'
            }}
            onPress={() => {
              Sharing.isAvailableAsync().then((result) => {
                // console.log(result, "jsadhfjhsdfhjsdfhjs")
                if (result) {
                  setLoading(true);
                  const options = {
                    dialogTitle: item.product_name.toString(),
                    mimeType: "image/jpeg"
                  };
                  FileSystem.downloadAsync(currentProduct.url + "" + currentProduct.image_path, FileSystem.cacheDirectory + currentProduct.image_path)
                    .then(async ({ uri }) => {
                      // console.log(uri, "Pathof Image")
                      Sharing.shareAsync(uri, options);
                    })
                    .catch((error) => {

                      console.error(error, "This is Error and Path is:" + currentProduct.url + "" + currentProduct.image_path, FileSystem.cacheDirectory + currentProduct.image_path);
                    });
                  setLoading(false);
                }
              });
            }}
          />
          <View>
            <Image
              source={{ uri: item.url_image + "" + item.image_path }}
              style={[{ height: 200, width: "100%", borderRadius: 5 }]}
            />
          </View>
        </View>
        <View>
          {
            item.available && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Availablity:</Text>{"   "}{item.available || '-'}
              </Text>
            )
          }

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 50 }}>
            {
              item.added_from && (
                <Text style={{ fontSize: 15, marginTop: 10, fontWeight: 'bold' }}>
                  <Text style={{ color: 'gray' }}>Type:</Text>{"   "}{CapitalizeName(item.added_from) || '-'}
                </Text>
              )
            }

            {
              item.staff_name && (
                <Text style={{ fontSize: 15, marginTop: 10, fontWeight: 'bold' }}>
                  <Text style={{ color: 'gray' }}>Staff Name:</Text>{"   "}{CapitalizeName(item.staff_name) || '-'}
                </Text>
              )
            }
          </View>

          {
            item.Metal && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Metal:</Text>{"   "}{item.Metal || '-'}
              </Text>
            )
          }

          {
            item.material && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Material:</Text>{"   "}{item.material || '-'}
              </Text>
            )
          }




          {
            item.disable && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Disable:</Text>{"   "}{item.disable || '-'}
              </Text>
            )
          }

          {
            item.exhibition && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Exhibition:</Text>{"   "}{item.exhibition || '-'}
              </Text>
            )
          }

          {
            item.weight && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Weight:</Text>{"   "}{item.weight || '-'}
              </Text>
            )
          }

          {
            item.size_length && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Size/Length:</Text>{"   "}{item.size_length || '-'}
              </Text>
            )
          }

          {
            item.gender && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Gender:</Text>{"   "}{item.gender || '-'}
              </Text>

            )
          }

          {
            item.product_code && (
              <Text style={{ fontSize: 15, marginTop: 10 }}>
                <Text style={{ color: 'gray' }}>Description:</Text>{"   "}{item.product_code || '-'}
              </Text>
            )
          }






        </View>
        <View style={{ marginTop: 50 }}>
          {remarks.length > 0 && (
            <>
              {!active
                ? (
                  // Show only the first remark
                  <Text style={{ color: "black", marginBottom: 5, fontSize: 14 }}>
                    {CapitalizeName(remarks[0].remarks)}
                  </Text>
                )
                : (
                  // Show all remarks (from first to last)
                  remarks.map((item, index) => (
                    <Text
                      key={index}
                      style={{ color: index === 0 ? "black" : "gray", marginBottom: 3 }}
                    >
                      {CapitalizeName(item.remarks)}
                    </Text>
                  ))
                )}
            </>
          )}

          {remarks.length > 1 && (
            <Text
              style={{ color: "black", fontSize: 12, marginTop: 5 }}
              onPress={() => setActive(prev => !prev)}
            >
              {active ? "Hide Remarks" : "Show All Remarks"}
            </Text>
          )}
        </View>






      </ScrollView >
  )

  // return (
  //   <View style={MyStyles.container}>
  //     <Loading isloading={loading} />
  //     <ScrollView>
  //       <View style={[MyStyles.wrapper, { paddingHorizontal: 5 }]}>
  //         <Text style={{ fontWeight: "bold", fontSize: 22 }}>
  //           {param.product_name}
  //         </Text>
  //         <Text style={{ fontSize: 18, marginVertical: 10 }}>
  //           SKU: {param.product_code}
  //         </Text>
  //         <View style={{ flexDirection: "row", alignItems: "center" }}>
  //           <Text style={{ fontSize: 18 }}>
  //             Price: <Text style={{ fontWeight: "bold" }}>{param.price}</Text>{" "}
  //             {"      "}
  //             <Text
  //               style={{
  //                 fontSize: 14,
  //                 color: "red",
  //                 textDecorationLine: "line-through",
  //               }}
  //             >
  //               {param.price}
  //             </Text>
  //           </Text>
  //           {/* <IconButton
  //             icon="share-variant"
  //             size={25}
  //             color="#FFF"
  //             style={{
  //               marginHorizontal: 0,
  //               backgroundColor: "#2874A6",
  //               textAlign: "right",
  //               marginLeft: "auto",
  //             }}
  //             onPress={() => {              
  //               });
  //             }}
  //           /> */}
  //         </View>
  //       </View>

  //       <View style={{ height: 300 }}>
  //         <Swiper key={productImages.length} loop={false} activeDotColor="#ffba3c">
  //           {productImages.length > 0 ? (
  //             productImages.map((resp, index) => {
  //               return (
  //                 <>
  //                   <IconButton
  //                     icon="share-variant"
  //                     size={25}
  //                     color="#FFF"
  //                     style={{
  //                       marginHorizontal: 0,
  //                       backgroundColor: "#2874A6",
  //                       textAlign: "right",
  //                       marginLeft: "auto",
  //                       marginRight: 15,
  //                     }}
  //                     onPress={() => {
  //                       Sharing.isAvailableAsync().then((result) => {
  //                         if (result) {
  //                           setLoading(true);
  //                           const options = {
  //                             dialogTitle: param.product_name.toString(),
  //                             mimeType: "image/jpeg"
  //                           };
  //                           FileSystem.downloadAsync(resp.url + "" + resp.image_path, FileSystem.cacheDirectory + resp.image_path)
  //                             .then(async ({ uri }) => {
  //                               Sharing.shareAsync(uri, options);
  //                             })
  //                             .catch((error) => {
  //                               console.error(error);
  //                             });
  //                           setLoading(false);
  //                         }
  //                       });
  //                     }}
  //                   />
  //                   <Image
  //                     source={{ uri: resp.url + "" + resp.image_path }}
  //                     style={[{ height: 250, width: "100%" }]}
  //                   />
  //                 </>
  //               );
  //             })
  //           ) : (
  //             <Image
  //               source={require("../assets/upload.png")}
  //               style={[{ height: 250, width: "100%" }]}
  //             />
  //           )}

  //         </Swiper>
  //       </View>
  //       <View style={[MyStyles.wrapper, { paddingHorizontal: 10 }]}>
  //         <View style={[MyStyles.row, { justifyContent: "flex-start" }]}>
  //           <Text style={{ fontWeight: "bold", fontSize: 14, width: 150 }}>
  //             Availablity :
  //           </Text>
  //           <Text>{param.available}</Text>
  //         </View>
  //         <View style={[MyStyles.row, { justifyContent: "flex-start" }]}>
  //           <Text style={{ fontWeight: "bold", fontSize: 14, width: 150 }}>
  //             Metal :
  //           </Text>
  //           <Text>{param.Metal}</Text>
  //         </View>
  //         <View style={[MyStyles.row, { justifyContent: "flex-start" }]}>
  //           <Text style={{ fontWeight: "bold", fontSize: 14, width: 150 }}>
  //             Material :
  //           </Text>
  //           <Text>{param.material}</Text>
  //         </View>
  //         <View style={[MyStyles.row, { justifyContent: "flex-start" }]}>
  //           <Text style={{ fontWeight: "bold", fontSize: 14, width: 150 }}>
  //             Disable :
  //           </Text>
  //           <Text>{param.disable}</Text>
  //         </View>
  //         <View style={[MyStyles.row, { justifyContent: "flex-start" }]}>
  //           <Text style={{ fontWeight: "bold", fontSize: 14, width: 150 }}>
  //             Exhibition :
  //           </Text>
  //           <Text>{param.exhibition}</Text>
  //         </View>
  //         <View style={[MyStyles.row, { justifyContent: "flex-start" }]}>
  //           <Text style={{ fontWeight: "bold", fontSize: 14, width: 150 }}>
  //             Weight :
  //           </Text>
  //           <Text>{param.weight}</Text>
  //         </View>
  //         <View style={[MyStyles.row, { justifyContent: "flex-start" }]}>
  //           <Text style={{ fontWeight: "bold", fontSize: 14, width: 150 }}>
  //             Size/Length :
  //           </Text>
  //           <Text>{param.size_length}</Text>
  //         </View>
  //         <View style={[MyStyles.row, { justifyContent: "flex-start" }]}>
  //           <Text style={{ fontWeight: "bold", fontSize: 14, width: 150 }}>
  //             Gender :
  //           </Text>
  //           <Text>{param.gender}</Text>
  //         </View>
  //         <View style={[MyStyles.row, { justifyContent: "flex-start" }]}>
  //           <Text style={{ fontWeight: "bold", fontSize: 14, width: 150 }}>
  //             Description :
  //           </Text>
  //           <Text>{param.product_code}</Text>
  //         </View>
  //         <View style={[MyStyles.row, { justifyContent: "flex-start" }]}>
  //           <Text>
  //             {param.remarks_list.length > 0
  //               && param.remarks_list.map((item, i) => {
  //                 if (i == param.remarks_list.length - 1) {
  //                   return (
  //                     <Text style={{ color: "#333" }}>{item.remarks}</Text>
  //                   );
  //                 }
  //               })}
  //           </Text>
  //         </View>
  //         <View >

  //           {(activeIndex == 1 && active && param.remarks_list.length > 0)
  //             && param.remarks_list.map((item, i) => {
  //               if (i != param.remarks_list.length - 1) {
  //                 return (
  //                   <Text style={{ color: "#888" }}>{item.remarks}</Text>
  //                 );
  //               }
  //             })}

  //           {activeIndex == 1 && active ?
  //             <TouchableOpacity onPress={() => {
  //               setActiveIndex(1);
  //               setActive(false);
  //             }}><Text style={{ color: "#888" }} >Less All Remarks</Text>
  //             </TouchableOpacity>
  //             :
  //             <TouchableOpacity onPress={() => {
  //               setActiveIndex(1);
  //               setActive(true);
  //             }}>
  //               <Text style={{ color: "#888" }} >Show All Remarks</Text>
  //             </TouchableOpacity>
  //           }
  //         </View>
  //       </View>
  //     </ScrollView>
  //   </View>
  // );
};

const CustomerRedeem = (props) => {
  const { userToken, search, customer_id } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [griddata, setgriddata] = useState([]);

  React.useEffect(() => {

    Browse();

  }, [customer_id]);

  const Browse = () => {
    let temparam = {
      customer_id: customer_id,
    };
    postRequest(
      "customervisit/getCustomerVoucherList", temparam, userToken
    ).then((resp) => {
      if (resp.status == 200) {
        // console.log(`vouchers -> ${JSON.stringify(resp)}`)
        setgriddata(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
    setLoading(false);
  };
  const Refresh = async () => {
    try {
      setLoading(true);
      // Wait for all API calls to complete
      await Promise.all([
       BrowseActive(),
       BrowseRedeemed(),
       BrowseExpired(),
      ]);
    } catch (error) {
      console.error('Error during refresh:', error);
      // Optionally show an error message to the user
    } finally {
      // Always set loading to false when all operations are done or if there's an error
      setLoading(false);
    }
  };


//   React.useEffect(() => {
//     Refresh();
//   }, [customer_id]);

//   const scrollTimeout = useRef(null);
//  const handleScroll = () => {
//     // Hide the banner when scrolling

//     // Clear any existing timeout
//     if (scrollTimeout.current) {
//       clearTimeout(scrollTimeout.current);
//     }

//   };

  return (
    <View style={MyStyles.container}>
      {/* <ScrollView
              onScroll={handleScroll} scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={Refresh}
                />
              }
            > */}
      <FlatList
        style={{ marginVertical: 10 }}
        data={griddata}
        renderItem={({ item, index }) => (
          <Card
            key={item.voucher_id}
            style={{
              marginHorizontal: 20,
              padding: 0,
              borderRadius: 10,
              marginVertical: 5,
              backgroundColor: "white"
            }}
          >

            {
              item.IsvoucherExpire == "false" ?
                <BadgeRibbon
                  text="Expire"
                  color="red"
                  position="voucherRight"
                  textStyle={{ top: 20, left: -20 }}
                />
                :
                <BadgeRibbon
                  text="Active"
                  color="green"
                  position="voucherRight"
                  textStyle={{ top: 20, left: -20 }}
                />
            }


            <LinearGradient
              colors={["#F6356F", "#FF5F50"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                backgroundColor: "pink",
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                margin: 0,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                {CapitalizeName(item.voucher_name)}
              </Text>
            </LinearGradient>

            <Card.Content>
              <View style={[MyStyles.row, { margin: 0, alignItems: 'flex-end' }]}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {CapitalizeName(item.details)}
                  </Text>
                  <Text style={{ marginBottom: 20 }}>
                    {"Value => "}
                    <Text style={{ fontWeight: 'bold' }}>{item.amount}</Text>
                  </Text>
                  <Text>
                    {"Start Date => "}
                    <Text style={{ fontWeight: 'bold' }}>{item.start_date}</Text>
                  </Text>
                  <Text>
                    {"End Date => "}
                    <Text style={{ fontWeight: 'bold' }}>{moment(item.redeem_end_date).format("DD/MM/YYYY")}</Text>
                  </Text>
                </View>
                <View>
                  {
                    item.IsvoucherExpire !== "false" && (
                      <Button
                        mode="contained"
                        compact
                        uppercase={false}
                        style={{ borderRadius: 5 }}
                        labelStyle={{ color: "black" }}
                      >
                        Redeem
                      </Button>
                    )
                  }


                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

{/* </ScrollView> */}
    </View>
  );
}

const CustomerPoints = (props) => {
  const { userToken, search, customer_id } = props.route.params;
  const [loading, setLoading] = useState(false);
  const [activeGriddata, setActiveGriddata] = useState([]);
  const [reddemedGriddata, setReddemedGriddata] = useState([]);
  const [expiredGriddata, setExpiredGriddata] = useState([]);
  const [griddata, setGriddata] = useState([]);

  useEffect(() => {
    setGriddata([
      ...activeGriddata,
      ...reddemedGriddata,
      ...expiredGriddata
    ]);
  }, [activeGriddata, reddemedGriddata, expiredGriddata]);

  // const Refresh = async () => {
  //   try {
  //     setLoading(true);
  //     // Wait for all API calls to complete
  //     await Promise.all([
  //      BrowseActive(),
  //      BrowseRedeemed(),
  //      BrowseExpired(),
  //     ]);
  //   } catch (error) {
  //     console.error('Error during refresh:', error);
  //     // Optionally show an error message to the user
  //   } finally {
  //     // Always set loading to false when all operations are done or if there's an error
  //     setLoading(false);
  //   }
  // };
  React.useEffect(() => {
    BrowseActive();
    BrowseRedeemed();
    BrowseExpired();
  }, [customer_id]);

  const BrowseActive = () => {
    let temparam = {
      customer_id: customer_id,
    };
    postRequest(
      "customervisit/getCustomerPointStatusMob",
      temparam,
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        console.log(`points active -> ${JSON.stringify(resp)}`)
        setActiveGriddata(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
    setLoading(false);
  };
  const BrowseRedeemed = () => {
    let temparam = {
      customer_id: customer_id,
    };
    postRequest(
      "customervisit/getCustomerRedeemPointList",
      temparam,
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        console.log(`points Redeem -> ${JSON.stringify(resp)}`)
        setReddemedGriddata(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
    setLoading(false);
  };
  const BrowseExpired = () => {
    let temparam = {
      customer_id: customer_id,
    };
    postRequest(
      "customervisit/getCustomerExpirePointList",
      temparam,
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        console.log(`points Expired -> ${JSON.stringify(resp)}`)
        setExpiredGriddata(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
    setLoading(false);
  };

  // const scrollTimeout = useRef(null);
  // const handleScroll = () => {
  //   // Hide the banner when scrolling

  //   // Clear any existing timeout
  //   if (scrollTimeout.current) {
  //     clearTimeout(scrollTimeout.current);
  //   }

  // };

  return (

    <View style={MyStyles.container}>
      {/* <ScrollView
              onScroll={handleScroll} scrollEventThrottle={16}
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={Refresh}
                />
              }
            > */}
      <FlatList
        style={{ marginVertical: 10 }}
        data={griddata}
        renderItem={({ item, index }) => (

          <Card
            key={item.voucher_id}
            style={{
              marginHorizontal: 20,
              padding: 0,
              borderRadius: 10,
              marginVertical: 5,
              backgroundColor: "white"
            }}
          >

            {item.expire_flag == true ?
              <BadgeRibbon
                text="Expire"
                color="red"
                position="voucherRight"
                textStyle={{ top: 20, left: -20 }}
              />
              :
              (item.type == "redeem" ?
                <BadgeRibbon
                  text="Redeem"
                  color="blue"
                  position="voucherRight"
                  textStyle={{ top: 20, left: -20 }}
                />
                :
                <BadgeRibbon
                  text="Active"
                  color="green"
                  position="voucherRight"
                  textStyle={{ top: 20, left: -20 }}
                />)}


            <LinearGradient
              colors={["#F6356F", "#FF5F50"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                backgroundColor: "pink",
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                margin: 0,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                {CapitalizeName(item.type)}
              </Text>
            </LinearGradient>

            <Card.Content>
              <View style={[MyStyles.row, { margin: 0, alignItems: 'flex-end' }]}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {CapitalizeName(item.voucher_heading)}
                  </Text>
                  {
                    item.staff_name && (
                      <Text style={{ marginBottom: 10, fontWeight: "bold" }}>
                        {"Staff Name: "}
                        {CapitalizeName(item.staff_name)}
                      </Text>
                    )
                  }
                  <Text>
                    {"Generate: "}
                    {moment(item.start_date).format("DD/ MM/ YYYY")}
                  </Text>
                  <Text>
                    {"Expiry: "}
                    {moment(item.expire_date).format("DD/ MM/ YYYY")}
                  </Text>
                  <View>
                    {
                      item.remark && (
                        <Text>{item.remark}</Text>
                      )
                    }
                  </View>
                </View>
                <View>
                  {item.active_flag === true && item.expire_flag === false && (
                    <Text style={{ borderWidth: 1, borderColor: '#aaa', paddingHorizontal: 20, paddingVertical: 5, fontSize: 16, fontWeight: 'bold' }}> {item.points}</Text>
                  )}



                </View>

              </View>
            </Card.Content>
          </Card>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <FAB
        style={{
          position: "absolute",
          bottom: '4%',
          right: '4%',
          borderRadius: 50,
          backgroundColor: MyStyles.primaryColor.backgroundColor

        }}
        icon="minus"
        color="#000"
        onPress={() =>
          props.navigation.navigate("PointForm", { customer_id })
        }
      />

      <FAB
        style={{
          position: "absolute",
          bottom: '4%',
          right: '20%',
          borderRadius: 50,
          backgroundColor: MyStyles.primaryColor.backgroundColor

        }}
        icon="plus"
        color="#000"
        onPress={() =>
          props.navigation.navigate("ExtraPoints", { customer_id })
        }
      />
      {/* </ScrollView> */}
    </View>
  )
}

const PointForm = (props) => {
  const { customer_id, userToken, branchId } = props.route.params;
  const [stafflist, setstafflist] = useState([]);
  const { user_Name } = props.route.params;
  const { missCallUser } = props.route.params;
  const [param, setparam] = useState({
    customer_id,
    redeemPoint: "",
    remark: "",
    staff_id: "",
    full_name: user_Name,
    mobile: missCallUser,
    staff_name: "", 
    branch_id: branchId,
  });



  React.useEffect(() => {

    postRequest("masters/staff/browse", param, userToken).then((resp) => {
      if (resp.status == 200) {
        setstafflist(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });


  }, [customer_id]);

  console.log(customer_id)
  return (
    <ImageBackground
      style={MyStyles.container}
      source={require("../assets/login-bg.jpg")}
    >

      <View style={[MyStyles.cover, { backgroundColor: "" }]}>
        <View>

          <DropDown
            data={stafflist}
            ext_val="staff_id"
            ext_lbl="name"
            value={param.staff_id}
            required
            onChange={(val) => {
              const selectedStaff = stafflist.find((item) => item.staff_id === val);
              setparam({
                ...param,
                staff_id: val,
                staff_name: selectedStaff?.name || ''
              });
            }}
            placeholder="Staff"
            style={{ marginBottom: 5 }}
          />



          <TextInput
            mode="outlined"
            label="Points"
            required
            style={{ marginBottom: 2, backgroundColor: 'transparent' }}
            value={param.redeemPoint}
            onChangeText={(text) => setparam({ ...param, redeemPoint: text })}
          />

          <View style={{ marginVertical: 10 }}>
            <TextInput
              mode="outlined"
              placeholder="Remarks"
              required
              style={{ backgroundColor: "rgba(0,0,0,0)" }}
              value={param.remark}
              onChangeText={(text) => {
                setparam({ ...param, remark: text });
              }}
              maxLength={200}
            />
            <Text style={{ alignSelf: 'flex-end', marginTop: 4, color: '#888' }}>
              {param.remark.length}/200
            </Text>
          </View>


          <Button
            mode="contained"
            compact
            uppercase={false}
            style={{ borderRadius: 5 }}
            labelStyle={{ color: "black" }}
            onPress={() => {
              // setLoading(true);

              console.log(param);


              postRequest(
                "customervisit/insertPointRedeem02",
                param,
                userToken
              ).then((resp) => {
                if (resp.status == 200) {
                  console.log(resp)
                  if (resp.data[0].valid) {

                    props.navigation.goBack();
                    setparam({
                      ...param,
                      redeemPoint: "",
                      remark: "",
                      staff_id: "",
                      staff_name: "",
                      full_name: "",
                      mobile: "",
                    })
                  }
                  // setLoading(false);
                }
              });
            }}
          >
            Submit
          </Button>
        </View>
      </View>
    </ImageBackground>
  )
}

const ExtraPoints = (props) => {
  const { customer_id,branchId } = props.route.params;
  const { userToken } = props.route.params;
  const { missCallUser } = props.route.params;
  const { userName } = props.route.params;
  const [stafflist, setstafflist] = useState([]);
  const [totalPoint, setTotalPoint] = useState(0);
  console.log(props)
  const [param, setparam] = useState({
    customer_id:customer_id,
    remark: "",
    extra_point: "",
    mobile:missCallUser,
    staff_name: "",
    full_name: userName,
    branch_id:branchId,
  });



  React.useEffect(() => {

    postRequest("masters/staff/browse", param, userToken).then((resp) => {
      if (resp.status == 200) {
        setstafflist(resp.data);
        console.log(resp.data)
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });


  }, [customer_id]);

  return (
    <ImageBackground
      style={MyStyles.container}
      source={require("../assets/login-bg.jpg")}
    >

      <View style={[MyStyles.cover, { backgroundColor: "" }]}>
        <View>

          <DropDown
            data={stafflist}
            ext_val="staff_id"
            ext_lbl="name"
            value={param.staff_id}
            required
            onChange={(val) => {
              const selectedStaff = stafflist.find((item) => item.staff_id === val);
              setparam({
                ...param,
                staff_name: selectedStaff?.name || ''
              });
            }}
            placeholder="Staff"
            style={{ marginBottom: 5 }}
          />



          <TextInput
            mode="outlined"
            label="Extra Points"
            required
            style={{ marginBottom: 2, backgroundColor: 'transparent' }}
            value={param.extra_point || ""}
            onChangeText={(text) => setparam({ ...param, extra_point: text })}

          />

          <View style={{ marginVertical: 10 }}>
            <TextInput
              mode="outlined"
              placeholder="Remarks"
              required
              style={{ backgroundColor: "rgba(0,0,0,0)" }}
              value={param.remark || ""}
              onChangeText={(text) => {
                setparam({ ...param, remark: text });
              }}
              maxLength={200}
            />
            <Text style={{ alignSelf: 'flex-end', marginTop: 4, color: '#888' }}>
              {param.remark.length}/200
            </Text>
          </View>


          <Button
            mode="contained"
            compact
            uppercase={false}
            style={{ borderRadius: 5 }}
            labelStyle={{ color: "black" }}
            onPress={() => {
              // setLoading(true);

              postRequest(
                "customervisit/insert/extraPoint",
                param,
                userToken
              ).then((resp) => {
                console.log('data', param)
                if (resp.status == 200) {
                  if (resp.data[0].valid) {
                    console.log('submited data', resp)
                    props.navigation.goBack();
                    setparam({
                      ...param,
                      staff_name: "",
                      extra_point: "",
                      remark: "",
                    });
                  }
                  // setLoading(false);
                }
              });
            }}
          >
            Submit
          </Button>
        </View>
      </View>
    </ImageBackground>
  )
}
export { Profile, CustomerVoucherList, ProfileProductsPreview, PointForm, ExtraPoints, CustomerPoints };
