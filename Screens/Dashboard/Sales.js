import React, { useEffect, useState } from 'react';
import {
    View,
    Alert,
    ScrollView,
    Image,
    Pressable,
    Modal,
    RefreshControl,
    Text as RNText,
    Linking,
} from 'react-native';
import {
    Text,
    TouchableRipple,
    Portal,
    IconButton,
} from 'react-native-paper';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MedalIcon from 'react-native-vector-icons/FontAwesome6';
import Info from 'react-native-vector-icons/Feather';
import MyStyles from '../../Styles/MyStyles';
import { postRequest } from '../../Services/RequestServices';
import DatePicker from '../../Components/DatePicker';
import Loading from '../../Components/Loading';
import { CapitalizeName } from '../../utils/CapitalizeName';
import { DrawerContentScrollView } from '@react-navigation/drawer';

const Sales = (props) => {
    const { userToken, branchId, search: routeSearch } = props.route.params || {};
    const [loading, setLoading] = useState(false);
    const [griddata, setgriddata] = useState([]);
    const [param, setparam] = useState({
        from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
        to_date: moment().format('YYYY-MM-DD'),
    });
    const [dateModal, setDateModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isZoomed, setIsZoomed] = useState(false);
    const [showTodayOnly, setShowTodayOnly] = useState(true);

    const openBillPreview = (billPdf) => {
        if (billPdf) {
            const url = `https://api.quicktagg.com/bills/${billPdf}`;
            Linking.openURL(url).catch(err => {
                console.error('Failed to open PDF:', err);
                Alert.alert('Error', 'Failed to open bill PDF');
            });
        } else {
            Alert.alert('Info', 'No bill PDF available for this sale');
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchSales();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    };

    useEffect(() => {
        fetchSales();
    }, []);

    // Filter data based on search term and today filter (like Wishlist)
    const filteredData = React.useMemo(() => {
        console.log(griddata)
        let result = griddata || [];
        // Filter by today's date if enabled
        if (showTodayOnly) {
            const today = moment().startOf('day');
            result = result.filter(group => {
                // remove fake Z, treat as local IST
                const groupDate = moment(
                    group.datetime.replace('Z', '')
                ).startOf('day');

                const isMatch = groupDate.isSame(today, 'day');
                return isMatch;
            });
        }
        // Filter by search term
        if (!routeSearch || result.length === 0) {
            return result;
        }

        const searchTerm = routeSearch.toLowerCase().trim();
        console.log('Searching for:', searchTerm);

        return result.filter((group) => {
            if (!group) return false;

            // Search in group level fields
            const groupFields = [
                group.entry_no,
                group.customer_name,
                group.mobile,
                group.staff_name,
                group.remarks,
                group.sales_type,
                group.final_amount,
                group.datetime,
            ];

            // Check if any group field matches
            const groupMatch = groupFields.some(field => {
                if (!field) return false;
                return String(field).toLowerCase().includes(searchTerm);
            });

            if (groupMatch) return true;

            // Search in products
            if (group.products?.length > 0) {
                return group.products.some(product => {
                    const productFields = [
                        product.product_name,
                        product.product_code,
                        product.category_name,
                        product.subcategory_name,
                        product.staff_name,
                        product.remarks
                    ];
                    return productFields.some(field => {
                        if (!field) return false;
                        return String(field).toLowerCase().includes(searchTerm);
                    });
                });
            }

            return false;
        });
    }, [griddata, routeSearch, showTodayOnly]);

    const fetchSales = () => {
        setLoading(true);
        postRequest(
            'masters/dashboard/retailer/sales_cart',
            {
                branch_id: branchId,
                from_date: param.from_date,
                to_date: param.to_date,
                search: routeSearch || '',
            },
            userToken
        )
            .then((resp) => {
                console.log("sales resp", resp);
                if (resp.status === 200) {
                    const data = resp.data || [];
                    console.log(`Loaded ${data.length} sales records`);
                    // Group by entry_no
                    const grouped = data.reduce((acc, item) => {
                        const key = item.entry_no || 'unknown';
                        if (!acc[key]) {
                            acc[key] = {
                                entry_no: item.entry_no,
                                customer_name: item.customer_name,
                                mobile: item.mobile,
                                customer_id: item.customer_id,
                                datetime: item.datetime,
                                bill_pdf: item.bill_pdf,
                                sales_type: item.sales_type,
                                final_amount: item.final_amount,
                                products: [],
                                staff_name: item.staff_name,
                                remarks: item.remarks,
                            };
                        }
                        acc[key].products.push(item);
                        return acc;
                    }, {});
                    setgriddata(Object.values(grouped));
                } else {
                    Alert.alert('Error!', 'Oops! Server Error');
                }
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                console.error('Sales fetch error', error);
                Alert.alert('Error!', 'Failed to load Sales');
            });
    };


    return (
        <View style={MyStyles.container}>
            <Loading isloading={loading} />

            {/* Date Modal */}
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
                                    fetchSales();
                                }}
                            />
                            <Text style={MyStyles.dateLabel}>To</Text>
                            <DatePicker
                                mode="text"
                                value={param.to_date}
                                onValueChange={(date) => {
                                    param.to_date = date;
                                    setparam({ ...param });
                                    fetchSales();
                                }}
                            />
                        </View>
                    </View>
                </Modal>
            </Portal>

            {/* Header Row */}
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
                        backgroundColor: showTodayOnly ? 'green' : 'orange',
                        marginRight: 10,
                    }}
                    onPress={() => {
                        setShowTodayOnly(!showTodayOnly);
                    }}
                >
                    <Icon name="circle-medium" color={showTodayOnly ? 'white' : 'red'} size={20} />
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{showTodayOnly ? 'Show All' : 'Today'}</Text>
                </Pressable>
            </View>

            {/* Results Counter */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 10, marginVertical: 5 }}>
                <Text style={{ fontSize: 12, color: '#666' }}>
                    Showing {filteredData.length} of {griddata.length} entries
                    {showTodayOnly && ' (Today only)'}
                </Text>
            </View>

            {/* Saless List */}
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {filteredData.length === 0 && !loading ? (
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>
                        No Sales Found
                    </Text>
                ) : (
                    filteredData.map((group, index) => (
                        <View
                            key={index}
                            style={{
                                backgroundColor: '#fff',
                                marginHorizontal: 10,
                                marginVertical: 6,
                                borderRadius: 12,
                                padding: 15,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.08,
                                shadowRadius: 3,
                                elevation: 2,
                            }}
                        >

                            {/* Top Row */}
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                {/* Left Info */}
                                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                    <View
                                        style={{
                                            borderWidth: 1,
                                            borderRadius: 4,
                                            borderColor: 'grey',
                                            width: 25,
                                            height: 25,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginTop: 5,
                                        }}
                                    >
                                        <Text style={{ color: 'red', fontWeight: 'bold' }}>
                                            {group.sales_type?.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>

                                    <View style={{ marginLeft: 10 }}>
                                        <Text
                                            style={{ fontWeight: 'bold', fontSize: 15 }}
                                            onPress={() =>
                                                props.navigation.navigate('Profile', {
                                                    customer_id: group.customer_id,
                                                    customer_mobile: group.mobile,
                                                })
                                            }
                                        >
                                            {CapitalizeName(group.customer_name)}
                                        </Text>
                                        <Text style={{ color: '#888', fontSize: 13, marginBottom: 5 }}>{group.mobile}</Text>
                                        {group.staff_name && <Text style={{ color: 'black', fontSize: 13, marginBottom: 0 }}>({group.staff_name})</Text>}
                                        {group.remarks && <Text style={{ color: '#888', fontSize: 13, marginBottom: 0 }}>{group.remarks}</Text>}
                                    </View>
                                </View>

                                {/* Pressable Image with Zoom */}
                                {/* {item.image_path ? (
                                    <View style={{ width: 70, justifyContent: 'center', alignItems: 'center', marginHorizontal: 15 }}>
                                        <Pressable onPress={() => {
                                            const imageUri = item.isImageUrl
                                                ? item.image_path.trim()
                                                : `${item.url_image}${item.image_path}`;
                                            setSelectedImage(imageUri);
                                            setIsZoomed(true);
                                        }}>
                                            <Image
                                                source={{
                                                    uri: item.isImageUrl
                                                        ? item.image_path.trim()
                                                        : `${item.url_image}${item.image_path}`
                                                }}
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    borderRadius: 5,
                                                }}
                                                resizeMode="contain"
                                            />
                                        </Pressable>
                                    </View>
                                ) : null} */}

                                {/*Invoice Number */}
                                <View style={{ alignItems: 'center', margin: 20, marginRight: 50 }}>
                                    <Text style={{ fontSize: 12, color: 'green', textAlign: 'center' }}>
                                        Invoice: {group.entry_no}
                                    </Text>
                                </View>


                                {/* Time Info */}
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 12, color: '#888', textAlign: 'right' }}>
                                        {moment(group.datetime, 'YYYY-MM-DD HH:mm').format('HH:mm')}
                                        {'\n'}
                                        {moment(group.datetime, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY')}
                                    </Text>
                                </View>
                            </View>

                            {/* Products List */}
                            <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}>
                                {group.products.map((product, pidx) => (
                                    <View key={pidx} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
                                        {/* Product Image */}
                                        {product.image_path ? (
                                            <Pressable
                                                onPress={() => {
                                                    const imageUri = product.isImageUrl
                                                        ? product.image_path.trim()
                                                        : `${product.url_image}${product.image_path}`;
                                                    setSelectedImage(imageUri);
                                                    setIsZoomed(true);
                                                }}
                                            >
                                                <Image
                                                    source={{
                                                        uri: product.isImageUrl
                                                            ? product.image_path.trim()
                                                            : `${product.url_image}${product.image_path}`
                                                    }}
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 5,
                                                        marginRight: 10,
                                                    }}
                                                    resizeMode="contain"
                                                />
                                            </Pressable>
                                        ) : null}
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ fontSize: 13, fontWeight: '500' }}>
                                                {product.product_name} ({product.product_code})
                                            </Text>
                                            <Text style={{ fontSize: 11, color: '#888' }}>
                                                Qty: {product.quantity || 1} | Rs. {product.price || product.final_amount || 0}
                                            </Text>
                                            {product.remarks && (
                                                <Text style={{ fontSize: 11, color: '#666' }}>
                                                    ({product.category_name}) ({product.subcategory_name}) ({product.size_length})
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                                {/* Total */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#ddd' }}>

                                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Total Amount:  <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Rs. {group.products.reduce((sum, p) => (p.final_amount || 0), 0)}</Text></Text>
                                </View>
                            </View>

                            {/* Info Icon */}
                            <View style={{ alignItems: 'flex-end', marginTop: -20 }}>
                                <Info
                                    name="info"
                                    size={25}
                                    color="red"
                                    onPress={() => openBillPreview(group.bill_pdf)}
                                    style={{ transform: [{ rotate: '180deg' }] }}
                                />
                            </View>
                        </View>
                    ))
                )}
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

export default Sales;
