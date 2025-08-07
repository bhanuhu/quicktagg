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
import MyStyles from '../../Styles/MyStyles';
import { postRequest } from '../../Services/RequestServices';
import DatePicker from '../../Components/DatePicker';
import Loading from '../../Components/Loading';
import { CapitalizeName } from '../../utils/CapitalizeName';

const Appointment = (props) => {
    const { userToken, branchId } = props.route.params;
    const [loading, setLoading] = useState(false);
    const [griddata, setgriddata] = useState([]);
    const [param, setparam] = useState({
        from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
        to_date: moment().format('YYYY-MM-DD'),
    });
    const [dateModal, setDateModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [zoomedImageUri, setZoomedImageUri] = useState(null);

    const onRefresh = () => {
        setRefreshing(true);
        fetchAppointment();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    };

    useEffect(() => {
        fetchAppointment();
    }, []);

    const fetchAppointment = () => {
        setLoading(true);
        postRequest(
            'masters/dashboard/browse_cart',
            {
                branch_id: branchId,
                from_date: param.from_date,
                to_date: param.to_date,
                search: '',
            },
            userToken
        )
            .then((resp) => {
                if (resp.status === 200) {
                    const filteredData = resp.data.filter((item) => {
                        const interest = item.interest?.toLowerCase() === 'follow up';
                        const updatedInterest = item.updated_interest?.toLowerCase() === 'follow up';
                        return interest || updatedInterest;
                    });
                    setgriddata(filteredData);
                } else {
                    Alert.alert('Error!', 'Oops! Server Error');
                }
                setLoading(false);
            })
            .catch((error) => {
                setLoading(false);
                console.error('Appointment fetch error', error);
                Alert.alert('Error!', 'Failed to load appointments');
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
                                    fetchAppointment();
                                }}
                            />
                            <Text style={MyStyles.dateLabel}>To</Text>
                            <DatePicker
                                mode="text"
                                value={param.to_date}
                                onValueChange={(date) => {
                                    param.to_date = date;
                                    setparam({ ...param });
                                    fetchAppointment();
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
                        backgroundColor: 'orange',
                        marginRight: 10,
                    }}
                    onPress={() => {
                        props.navigation.navigate('RecentActivity');
                    }}
                >
                    <Icon name="circle-medium" color="red" size={20} />
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Live</Text>
                </Pressable>
            </View>

            {/* Appointments List */}
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {griddata.length === 0 && !loading ? (
                    <Text style={{ textAlign: 'center', marginTop: 20 }}>
                        No Follow-up Appointments Found
                    </Text>
                ) : (
                    griddata.map((item, index) => (
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
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {/* Left Info */}
                                <View style={{ flexDirection: 'row' }}>
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
                                            {item.added_from?.charAt(0).toUpperCase()}
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
                                            {CapitalizeName(item.customer_name)}
                                        </Text>
                                        <Text style={{ color: '#888', fontSize: 13 }}>{item.mobile}</Text>
                                        <Text style={{ color: '#888', fontSize: 13 }}>{item.customer_category}</Text>
                                    </View>
                                </View>

                                {/* Pressable Image with Zoom */}
                                {item.image_path && item.url_image && (
                                    <Pressable onPress={() => setZoomedImageUri(`${item.url_image}${item.image_path}`)}>
                                        <Image
                                            source={{ uri: `${item.url_image}${item.image_path}` }}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                borderRadius: 5,
                                                marginBottom: 5,
                                            }}
                                            resizeMode="contain"
                                        />
                                    </Pressable>
                                )}



                                {/* Time Info */}
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={{ fontSize: 12, color: '#888', textAlign: 'right' }}>
                                        {moment(item.datetime, 'YYYY-MM-DD HH:mm').format('HH:mm')}
                                        {'\n'}
                                        {moment(item.datetime, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY')}
                                    </Text>

                                    {item.appointment_date !== 'N/A' && item.appointment_date && (
                                        <View
                                            style={{
                                                borderWidth: 1,
                                                padding: 5,
                                                marginTop: 5,
                                                backgroundColor: MyStyles.primaryColor.backgroundColor,
                                                borderColor: '#aaa',
                                                borderRadius: 4,
                                            }}
                                        >
                                            <Text style={{ fontSize: 12, color: '#000', textAlign: 'right' }}>
                                                {moment(item.appointment_date, 'YYYY-MM-DD HH:mm').format('HH:mm')}
                                                {'\n'}
                                                {moment(item.appointment_date, 'YYYY-MM-DD HH:mm:ss').format('DD/MM/YYYY')}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Product Info */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                {/* Text block */}
                                <View style={{ flex: 1, paddingRight: 10 }}>
                                    {(item.product_name || item.subcategory_name || item.staff_name) && (
                                        <Text style={{ fontSize: 14, color: 'gray' }}>
                                            {item.product_name && (
                                                <Text style={{ fontWeight: '700' }}>
                                                    ({CapitalizeName(item.product_name)}){' '}
                                                </Text>
                                            )}
                                            {item.subcategory_name && (
                                                <Text style={{ fontWeight: '700' }}>
                                                    ({CapitalizeName(item.subcategory_name)}){' '}
                                                </Text>
                                            )}
                                            {item.staff_name && (
                                                <Text style={{ fontWeight: '700' }}>
                                                    ({CapitalizeName(item.staff_name)})
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

                                {/* Medal Icon */}
                                <View style={{ alignItems: 'flex-end' }}>
                                    <MedalIcon
                                        name="medal"
                                        size={25}
                                        color="gold"
                                        style={{ transform: [{ rotate: '180deg' }], marginTop: 5 }}
                                    />
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
            <Modal visible={!!zoomedImageUri} transparent onDismiss={() => setZoomedImageUri(null)}>
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                    onPress={() => setZoomedImageUri(null)}
                >
                    <Image
                        source={{ uri: zoomedImageUri }}
                        style={{
                            width: '90%',
                            height: '70%',
                            borderRadius: 10,
                        }}
                        resizeMode="contain"
                    />
                </Pressable>
            </Modal>

        </View>
    );
};

export default Appointment;
