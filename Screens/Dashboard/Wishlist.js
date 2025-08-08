import React, { useEffect, useState } from 'react';
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
import RNPickerSelect from 'react-native-picker-select';
const Wishlist = (props) => {
  const { userToken, branchId, search } = props.route.params;
  const [loading, setLoading] = useState(false);
  const [griddata, setgriddata] = useState([]);
  const [originalGridData, setOriginalGridData] = useState([]);
  const [param, setparam] = useState({
    from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
  });
  const [dateModal, setDateModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null); // This holds the selected value


  const [productCategory, setProductCategory] = useState(null);
  const [interest, setInterest] = useState(null);
  const [updatedInterest, setUpdatedInterest] = useState(null);




  const uniqueNames = new Set();
  const filteredItems = originalGridData.filter(item => {
    const name = item.product_name?.trim();
    if (!name || uniqueNames.has(name)) return false;
    uniqueNames.add(name);
    return true;
  });

  // console.log(`original data -> ${JSON.stringify(filteredItems)}`)

  // Picker items for unique product names
  const pickerItems = filteredItems.map(item => ({
    label: item.product_name,
    value: item.product_name,
  }));

  // Collect all interests from filtered items
  const allInterests = filteredItems.map(item => ({
    label: item.interest,
    value: item.interest,
  }));

  useEffect(() => {
    let result = originalGridData;

    // Filter by product category if selected
    if (productCategory) {
      result = result.filter(item => item.product_name === productCategory);
    }

    // Filter by interest if selected
    if (interest) {
      result = result.filter(item => item.interest === interest);
    }

    setgriddata(result);
  }, [productCategory, interest]);




  const onRefresh = () => {
    setRefreshing(true);
    fetchWishlist();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  React.useEffect(() => {
    fetchWishlist();

  }, [search]);

  useEffect(() => {
    setProductCategory(null);
    setInterest(null);
  }, [originalGridData]);


  const fetchWishlist = () => {
    setLoading(true);
    postRequest(
      "masters/dashboard/browse_cart",
      { branch_id: branchId, from_date: param.from_date, to_date: param.to_date, search: "" },
      userToken
    ).then((resp) => {

      if (resp.status == 200) {

        const filteredData = resp.data.filter(
          item => item.added_from !== "exhibition" && item.added_from !== "trial"
        );
        console.log(`filteredData -> ${JSON.stringify(filteredData)}`)
        setgriddata(filteredData);
        setOriginalGridData(filteredData)




      } else {
        Alert.alert("Error !", "Oops! \nSeems like we run into some Server Error");
      }
      setLoading(false);
    });
  };

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
  
  // Debug effect to log data structure
  React.useEffect(() => {
    if (griddata && griddata.length > 0) {
      console.log('First item structure:', JSON.stringify(griddata[0], null, 2));
    }
  }, [griddata]);

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
        { name: 'customer_name', value: item.customer_name },
        { name: 'mobile', value: item.mobile },
        { name: 'product_name', value: item.product_name },
        { name: 'subcategory_name', value: item.subcategory_name },
        { name: 'staff_name', value: item.staff_name },
        { name: 'interest', value: item.interest },
        { name: 'status', value: item.status },
        { name: 'type', value: item.type_interest || item.type },
        { name: 'updated_interest', value: item.updated_interest },
        { name: 'customer_category', value: item.customer_category }
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
                  fetchWishlist();
                }}
              />
              <Text style={MyStyles.dateLabel}>To</Text>
              <DatePicker
                mode="text"
                value={param.to_date}
                onValueChange={(date) => {
                  param.to_date = date;
                  setparam({ ...param });
                  fetchWishlist();
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
      <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between' }}>

        <View style={{ width: '100%' }}>
          <RNPickerSelect
            onValueChange={(value) => setProductCategory(value)}
            items={pickerItems}
            placeholder={{ label: 'Select Category', value: null }}
            useNativeAndroidPickerStyle={false}
            style={{
              inputAndroid: {
                fontSize: 13,
                paddingHorizontal: 5,
                paddingVertical: 5,
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 4,
                color: 'black',
                paddingRight: 15,
              },
            }}
          />
        </View>





      </View>


      <ScrollView contentContainerStyle={{ flexGrow: 1 }} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <Text style={{padding: 10, fontWeight: 'bold'}}>
          Showing {filteredData.length} of {griddata.length} items (search: "{search}")
        </Text>
        
        {filteredData.map((item, index) => (
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
                    {item.added_from ? item.added_from.charAt(0) : ""}
                  </Text>
                </View>

                <View style={{ marginLeft: 10 }}>
                  <Text
                    style={{ fontWeight: "bold", fontSize: 15 }}
                    onPress={() => props.navigation.navigate("Profile", { customer_id: item.customer_id, customer_mobile: item.mobile })}
                  >
                    {CapitalizeName(item.customer_name)}
                  </Text>
                  <Text style={{ color: "#888", fontSize: 13 }}>{item.mobile}</Text>
                  <Text style={{ color: "#888", fontSize: 13 }}>{item.customer_category}</Text>
                </View>
              </View>


              <Pressable onPress={() => {
                setSelectedImage(`${item.url_image}${item.image_path}`);
                setIsZoomed(true);
              }}>
                <Image 
                  source={{ uri: `${item.url_image}${item.image_path}` }} 
                  style={{ width: 50, height: 50, borderRadius: 5, marginRight: 10 }} 
                />
              </Pressable>


              <View style={{ marginRight: 5, position: 'relative', height: '100%' }}>

                <Text style={{ fontSize: 12, color: "#888", marginBottom: 10, textAlign: 'right' }}>
                  {moment(item.datetime, "YYYY-MM-DD HH:mm").format("HH:mm")}
                  {"\n"}
                  {moment(item.datetime, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY")}
                </Text>


                {item.appointment_date !== "N/A" && item.appointment_date !== null && (
                  <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
                    <View style={{
                      borderWidth: 1,
                      padding: 5,
                      borderColor: '#aaa',
                      backgroundColor: MyStyles.primaryColor.backgroundColor,
                      borderRadius: 4,
                    }}>
                      <Text style={{ fontSize: 12, color: "#000", textAlign: 'right' }}>
                        {moment(item.appointment_date, "YYYY-MM-DD HH:mm").format("HH:mm")}
                        {"\n"}
                        {moment(item.appointment_date, "YYYY-MM-DD HH:mm:ss").format("DD/MM/YYYY")}
                      </Text>
                    </View>
                  </View>
                )}


                <View style={{ alignItems: 'center', position: 'relative' }}>
                  <MedalIcon
                    name="medal"
                    size={25}
                    color={getInterestColor(item)}
                    style={{ transform: [{ rotate: '180deg' }], position: 'absolute', right: 25, marginBottom: 10 ,top: 0}}
                  />
                </View>

              </View>
            </View>
            {
              (item.product_name || item.subcategory_name) ? (
                <Text style={{ fontSize: 14, color: 'gray', marginTop: 5 }}>
                  {
                    item.product_name && (
                      <Text style={{ fontWeight: "700", fontSize: 13 }}>
                        ({CapitalizeName(item.product_name)}){" "}
                      </Text>
                    )
                  }
                  {
                    item.subcategory_name && (
                      <Text style={{ fontWeight: "700", fontSize: 13 }}>
                        ({CapitalizeName(item.subcategory_name)})
                      </Text>
                    )
                  }
                </Text>
              ) : null
            }


            {
              item.remarks && (
                <Text style={{ fontSize: 14, color: 'gray', marginTop: 5 }}>
                  {item.remarks}

                </Text>
              )
            }



          </View>
        ))}
      </ScrollView>

      {/* Zoomable Image */}
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

export default Wishlist;