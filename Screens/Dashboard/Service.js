import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Alert, FlatList, ScrollView, Image, Pressable, RefreshControl } from 'react-native';
import { List, Text, TouchableRipple, Portal, Modal, IconButton } from 'react-native-paper';
import MyStyles from '../../Styles/MyStyles';
import { postRequest } from '../../Services/RequestServices';
import DatePicker from '../../Components/DatePicker';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MedalIcon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import Loading from '../../Components/Loading';
import { CapitalizeName } from '../../utils/CapitalizeName';
import RNPickerSelect from 'react-native-picker-select';
const Service = (props) => {
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
    const [refreshing, setRefreshing] = useState(false);

    const [productCategory, setProductCategory] = useState(null);
    const [interest, setInterest] = useState(null);
    const [updatedInterest, setUpdatedInterest] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const toggleDropdown = useCallback((id) => {
        setOpenDropdownId(prevId => prevId === id ? null : id);
    }, []);

    const uniqueNames = new Set();

      const filteredData = React.useMemo(() => {
        
        if (!search || !griddata?.length) {
          return griddata || [];
        }
        
        const searchTerm = search?.toLowerCase().trim();
        
        const result = griddata?.filter((item) => {
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
          
          const hasMatch = fieldsToSearch?.some(({ name, value }) => {
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
      }, [griddata, search]);

    const filteredItems = filteredData?.filter(item => {
        const name = item.product_name?.trim();
        if (!name || uniqueNames.has(name)) return false;
        uniqueNames.add(name);
        return true;
    });

    // console.log(`original data -> ${JSON.stringify(filteredItems)}`)

    // Picker items for unique product names
    const pickerItems = filteredItems?.map(item => ({
        label: item.product_name,
        value: item.product_name,
    }));

    // Collect all interests from filtered items
    const allInterests = filteredItems?.map(item => ({
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
            "customervisit/details/customer_service",
            { branch_id: branchId, from_date: param.from_date, to_date: param.to_date, search: "" },
            userToken
        ).then((resp) => {
            console.log(`service response --------> ${JSON.stringify(resp.data[0].count_check)}`)
            if (resp.status == 200) {
                setgriddata(resp.data);
                setOriginalGridData(resp.data)

            } else {
                Alert.alert("Error !", "Oops! \nSeems like we run into some Server Error");
            }
            setLoading(false);
        });
    };

    const seeDetails = () => {
        setIsOpen(!isOpen)
    }

    const getInterestColor = (item) => {
        const interestValue = item.status

        switch (interestValue) {
            case 'Done':
                return 'green';
            case 'Pending...':
                return MyStyles.primaryColor.backgroundColor
            case 'Due':
                return 'blue';
            case 'OverDue':
                return 'grey';
            default:
                return 'red';
            
        }
    };

    return (
        <View style={MyStyles.container}>

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
            {/* <View style={{ padding: 10, flexDirection: 'row', justifyContent: 'space-between' }}>

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
            </View> */}

{filteredData?.length > 0 ? (
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                {filteredData?.map((item, index) => (
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
                                    <Pressable style={{ position: 'absolute', bottom: -40, right: 20 }} onPress={() => toggleDropdown(item.id || index)}>
                                        <MedalIcon
                                            name={openDropdownId === (item.id || index) ? "caret-up-outline" : "caret-down-outline"}
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
                            openDropdownId === (item.id || index) && (
                                <DropdownContent item={item} />
                            )
                        }





                    </View>
                ))}
            </ScrollView>):(
                <Text style={{ textAlign: 'center' }}>No records found</Text>
            )}
        </View>
    );
};

const DropdownContent = memo(({ item }) => (
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
));

export default Service;