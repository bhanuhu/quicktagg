import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Modal, Pressable, Image, ScrollView, SafeAreaView, TextInput, Button, ImageBackground, FlatList, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImageUpload from './ImageUpload';
import SelectCustomer from './SelectCustomer';
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';
import { postRequest } from '../Services/RequestServices';
import MyStyles from '../Styles/MyStyles';
import axios from 'axios';
import { serviceUrl, logoUrl } from '../Services/Constants';
import { MoveDown } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const PromoBanner = ({ visible, branchId, userToken }) => {
    // if (!visible) return <></>;
    const [isDrawerVisible, setDrawerVisible] = useState(false);
    const [param, setParam] = useState({
        "file": null,
        "message": "",
        "extra_text": "",
        "contact_us": "",
        "mobiles": [],
        "bb_id": null,
    });

    const [newContact, setNewContact] = useState("");
    const [mobile, setMobile] = useState([]);
    const [image, setImage] = React.useState(require("../assets/upload.png"));
    const [count, setCount] = useState(0);
    const [isRateModalVisible, setRateModalVisible] = useState(false);
    const [rates, setRates] = useState(null);
    const [loading, setLoading] = useState(true);
    const [goldLoading, setGoldLoading] = useState(true);
    const [customerList, setCustomerList] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [selectedCustomers, setSelectedCustomers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 200;

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );



    const openRateModal = async () => {
        setRateModalVisible(true)
        try {
            setRateModalVisible(true)
            setGoldLoading(true)
            const res = await fetch(
                'https://api.metals.dev/v1/latest?api_key=Z7NJ5I6LPQTXQCF2ZURE269F2ZURE&currency=USD&unit=g'
            );


            const resinr = await fetch(
                'https://api.metals.dev/v1/latest?api_key=Z7NJ5I6LPQTXQCF2ZURE269F2ZURE&currency=INR&unit=g'
            );

            const goldio = await fetch('https://www.goldapi.io/api/XAU/INR', {
                headers: {
                    'x-access-token': 'goldapi-6fnhsm9q3zdy4-io'
                }
            });

            const goldiousd = await fetch('https://www.goldapi.io/api/XAU/USD', {
                headers: {
                    'x-access-token': 'goldapi-6fnhsm9q3zdy4-io'
                }
            });

            const goldiosilver = await fetch('https://www.goldapi.io/api/XAG/INR', {
                headers: {
                    'x-access-token': 'goldapi-6fnhsm9q3zdy4-io'
                }
            });

            const goldiosilverusd = await fetch('https://www.goldapi.io/api/XAG/USD', {
                headers: {
                    'x-access-token': 'goldapi-6fnhsm9q3zdy4-io'
                }
            });
            const json = await res.json();

            const Inrjson = await resinr.json();

            const goildiojson = await goldio.json();

            const goildiojsonusd = await goldiousd.json();

            const goldiosilverinr = await goldiosilver.json();
            const goldiosilverjsonusd = await goldiosilverusd.json();

            console.log('goldiosilverjsonusd----->', goldiosilverjsonusd);
            console.log('goldiosilverinr----->', goldiosilverinr);
            console.log('goldiousd----->', goildiojsonusd);
            console.log('goldiojson----->', goildiojson);
            console.log('inrjson----->', Inrjson);
            console.log('json----->', json);

            const goldPerGram = json.metals.mcx_gold;
            const InrjsongoldPerGram = Inrjson.metals.mcx_gold;
            const price_gram_24k = goildiojson.price_gram_24k;
            const price_gram_22k = goildiojson.price_gram_22k;
            const price_gram_20k = goildiojson.price_gram_20k;
            const price_gram_18k = goildiojson.price_gram_18k;

            const price_gram_24kusd = goildiojsonusd.price_gram_24k;
            const price_gram_22kusd = goildiojsonusd.price_gram_22k;
            const price_gram_20kusd = goildiojsonusd.price_gram_20k;
            const price_gram_18kusd = goildiojsonusd.price_gram_18k;

            const silverPerGram = json.metals.mcx_silver;
            const silverPerGramgnir = Inrjson.metals.mcx_silver;

            const gsu = goldiosilverinr.price_gram_24k
            const gsuusd = goldiosilverjsonusd.price_gram_24k

            const goldPrices = {

                '24K (MCX)': {
                    live: price_gram_24kusd.toFixed(2),
                    open: (price_gram_24k - 10).toFixed(2),
                },

                '24K': {
                    live: goldPerGram.toFixed(2),
                    open: (InrjsongoldPerGram - 10).toFixed(2),
                },

                '22K': {
                    live: price_gram_22kusd.toFixed(2),
                    open: (price_gram_22k - 10).toFixed(2),
                },

                '20K': {
                    live: price_gram_20kusd.toFixed(2),
                    open: (price_gram_20k - 10).toFixed(2),
                },

                '18K': {
                    live: price_gram_18kusd.toFixed(2),
                    open: (price_gram_18k - 10).toFixed(2),
                }
            };

            const silverPrices = {

                'Silver (MCX)': {
                    live: silverPerGram.toFixed(2),
                    open: (silverPerGramgnir).toFixed(2),
                },

                'Silver': {
                    live: gsuusd.toFixed(2),
                    open: (gsu).toFixed(2),
                }
            };
            console.log('Gold prices:------>', goldPrices);
            console.log('Silver prices:', silverPrices);

            setRates({ gold: goldPrices, silver: silverPrices });
            setGoldLoading(false)
        } catch (error) {
            console.error('Error fetching metal prices:', error);
        } finally {
            setLoading(false);
        }
    };



    const [logo, setLogo] = useState(null);
    const openDrawer = () => setDrawerVisible(true);
    const closeDrawer = () => setDrawerVisible(false);

    const closeRateModal = () => setRateModalVisible(false);

    const handleSubmit = async () => {
        if (loading) return; // Prevent multiple submissions
        
        console.log(userToken)
        setLoading(true)
        setModalVisible(false)
        const formData = new FormData();
        formData.append("message", param.message);
        formData.append("extra_text", param.extra_text);
        formData.append("contact_us", param.contact_us);
        formData.append("mobiles", param.mobiles);
        formData.append("bb_id", param.bb_id);

        if (param.file) {
            formData.append("file", param.file);
        }


        try {
            const response = await axios.post(
                serviceUrl + "customervisit/whatsapp/bulk/message",
                formData,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "multipart/form-data",
                        "auth-token": userToken,
                    },
                }
            );
            console.log("Whatsapp response", response)
            if (response.status === 200) {
                setDrawerVisible(false);
                setParam({
                    file: null,
                    message: "",
                    extra_text: "",
                    contact_us: "",
                    mobiles: [],
                    bb_id: null
                });
                setSelectedCustomers([]);
                setCount(0);

                setgridData([...gridData, response.data]);
            } else {
                Alert.alert(
                    "Error!",
                    "Oops! \nSeems like we run into some Server Error"
                );

            }
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);

        }
        setLoading(false)
    };

    // Fetch customers
    const fetchCustomers = () => {
        try {
            postRequest(
                "transactions/customer/customerListMob",
                { branch_id: branchId },
                userToken
            ).then((resp) => {
                console.log(`customer list -> ${JSON.stringify(resp.data)}`)
                if (resp.status == 200) {
                    setCustomerList(resp.data);
                    setFilteredCustomers(resp.data);
                } else {
                    Alert.alert(
                        "Error!",
                        "Oops! \nSeems like we run into some Server Error"
                    );
                }
            }).catch(error => {
                console.error('Error fetching customers:', error);
            });
        } catch (error) {
            console.error('Error in fetchCustomers:', error);
        }
    }

    const fetchImage = () => {
        postRequest("customervisit/get_branch_logo", {}, userToken).then((data) => {
            setLoading(true);
            setImage({ uri: `${logoUrl}${data.data[0].logo}` });  // Wrap URL in an object
            setLoading(false);
        });
    };
    React.useEffect(() => {
        fetchImage();
    }, []);
    const handleSearch = (text) => {
        setSearchText(text);

        const filtered = customerList.filter((item) => {
            const name = (item.full_name || "").toLowerCase();
            const mobile = (item.mobile || "").toLowerCase();
            const category = (item.category_name || "").toLowerCase();
            const searchValue = text.toLowerCase();

            return (
                name.includes(searchValue) ||
                mobile.includes(searchValue) ||
                category.includes(searchValue)
            );
        });

        setFilteredCustomers(filtered);
    };

    useEffect(() => {
        Modal;
    }, [loading]);

    // Select/deselect one
    // Select/deselect one
    const toggleCustomer = (id) => {
        if (selectedCustomers.includes(id)) {
            setSelectedCustomers(selectedCustomers.filter((item) => item !== id));
            setCount(prev => prev - 1);  // Decrease count when deselecting
        } else {
            setSelectedCustomers([...selectedCustomers, id]);
            setCount(prev => prev + 1);  // Increase count when selecting
        }
    };

    // Toggle all
    const toggleSelectAll = () => {
        const currentCustomerIds = paginatedCustomers.map(c => c.customer_id);
        console.log(`currentCustomerIds -> ${JSON.stringify(paginatedCustomers)}`)
        const allSelected = currentCustomerIds.every(id => selectedCustomers.includes(id));
        if (allSelected) {
            // Deselect only current page
            setSelectedCustomers(prev =>
                prev.filter(id => !currentCustomerIds.includes(id))
            );
            setCount(0)
        } else {
            // Select only current page (without duplication)
            setSelectedCustomers(prev => [
                ...prev,
                ...currentCustomerIds.filter(id => !prev.includes(id))
            ]);
            setCount(currentCustomerIds.length)
        }
    };


    // Open modal and fetch customers if empty
    const openModal = () => {
        setModalVisible(true);
        if (customerList.length === 0) fetchCustomers();
        fetchImage();
    };

    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity style={styles.promoteContainer} onPress={openDrawer}>
                    <View style={styles.wantToBadge}>
                        <Text style={styles.wantToText}>Want to</Text>
                    </View>
                    <View style={styles.promoteRow}>
                        <Text style={styles.promoteText}>Promote</Text>


                        <Image
                            source={require('../assets/mail.png')}
                            style={{
                                width: 100,
                                height: 100,
                                position: 'absolute',
                                left: 60,
                                top: -30,
                                transform: [{ rotate: '15deg' }],
                            }}
                        />

                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={openRateModal}
                    style={[styles.promoteContainer, { justifyContent: 'center', alignItems: 'center' }]}
                >
                    <View style={[styles.priceBox, {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%'
                    }]}>
                        <Image
                            source={require('../assets/coins.png')}
                            style={{
                                width: 50,
                                height: 50,
                                marginRight: 8,
                            }}
                        />
                        <Text style={styles.goldLabel}>
                            Gold Price
                        </Text>
                    </View>
                </TouchableOpacity>


            </View>

            <Modal
                visible={isDrawerVisible}
                animationType="slide"
                transparent
                onRequestClose={closeDrawer}
                disabled={loading}
                style={{ opacity: loading ? 0 : 1 }}
            >

                <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <Pressable style={styles.backdrop} onPress={closeDrawer} />

                    <View style={[styles.drawer, { flex: 1, justifyContent: 'flex-end' }]}>
                        {/* Close Button Centered */}
                        <View style={styles.closeBar}>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity onPress={closeDrawer} style={{ position: 'absolute', top: -60, backgroundColor: '#fff', borderRadius: 50, padding: 5, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' }}>
                                <Icon name="close" size={18} color="#333" />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }} />
                        </View>
                        <ImageBackground

                            source={require("../assets/login-bg.jpg")}
                        >
                            <ScrollView style={{ paddingHorizontal: 20 }}>
                                <View style={{ flex: 1, marginBottom: 10 }}>
                                    {/* Clickable Input */}
                                    <TouchableOpacity onPress={openModal}>
                                        <TextInput
                                            placeholder={`Select Customers (${count})`}
                                            value={
                                                selectedCustomers.length > 0
                                                    ? `Customers    (${selectedCustomers.length})`
                                                    : ""
                                            }
                                            editable={false}
                                            pointerEvents="none"
                                            disabled={loading}
                                            style={styles.searchInput}
                                            onChange={() => setCount(selectedCustomers.length)}
                                        />
                                        <Image
                                            source={require('../assets/mail.png')}
                                            style={{
                                                width: 120,
                                                height: 100,
                                                position: 'absolute',
                                                left: '67%',
                                                top: -20,
                                                transform: [{ rotate: '15deg' }],
                                            }}
                                        />
                                    </TouchableOpacity>

                                    {/* Modal */}
                                    <Modal
                                        visible={modalVisible}
                                        transparent={true}
                                        animationType="slide"
                                        onRequestClose={() => setModalVisible(false)}
                                    >
                                        <View style={styles.modalOverlay}>
                                            <View style={styles.modalContainer}>
                                                {/* Search */}
                                                <TextInput
                                                    placeholder="Search Customers..."
                                                    value={searchText}
                                                    onChangeText={handleSearch}
                                                    style={styles.modalSearchInput}
                                                />

                                                {/* Select All */}
                                                <TouchableOpacity style={styles.selectAllButton} onPress={toggleSelectAll}>
                                                    <Text style={styles.selectAllText}>Select All</Text>
                                                </TouchableOpacity>

                                                {/* Scrollable List */}
                                                <ScrollView style={{ maxHeight: 300 }}>
                                                    {paginatedCustomers.map((item) => (
                                                        <TouchableOpacity
                                                            key={item.customer_id}
                                                            style={styles.dropdownItem}
                                                            onPress={() => toggleCustomer(item.customer_id)}
                                                        >
                                                            <Text style={styles.checkbox}>
                                                                {selectedCustomers.includes(item.customer_id) ? "✅" : "⬜️"}
                                                            </Text>
                                                            <View style={{ marginLeft: 10 }}>
                                                                <Text style={{ fontWeight: 'bold', fontSize: 15 }}>
                                                                    {item.full_name ?? 'Member'}
                                                                </Text>
                                                                <View style={{ flexDirection: 'row', gap: 70 }}>
                                                                    <Text style={{ fontSize: 13 }}>{item.mobile}</Text>
                                                                    {item.category_name && (
                                                                        <Text style={{ fontSize: 13 }}>{item.category_name}</Text>
                                                                    )}
                                                                </View>
                                                            </View>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>

                                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 10 }}>
                                                    <TouchableOpacity
                                                        onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                        style={[styles.pageButton, currentPage === 1 && { opacity: 0.5 }]}
                                                    >
                                                        <Text>Previous</Text>
                                                    </TouchableOpacity>

                                                    <Text style={{ marginHorizontal: 20 }}>{`Page ${currentPage} of ${totalPages}`}</Text>

                                                    <TouchableOpacity
                                                        onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                        disabled={currentPage === totalPages}
                                                        style={[styles.pageButton, currentPage === totalPages && { opacity: 0.5 }]}
                                                    >
                                                        <Text>Next</Text>
                                                    </TouchableOpacity>
                                                </View>


                                                {/* Done Button */}
                                                <TouchableOpacity
                                                    style={styles.doneButton}
                                                    onPress={() => {
                                                        const selectedNames = filteredCustomers
                                                            .filter(c => selectedCustomers.includes(c.customer_id))
                                                            .map(c => c.mobile)
                                                            .join(",");


                                                        setParam(prev => ({
                                                            ...prev,
                                                            bb_id: parseInt(branchId),
                                                            mobiles: selectedNames
                                                        }));
                                                        console.log(selectedNames, "selectedNames")
                                                        setModalVisible(false);
                                                        setSelectedCustomers([])
                                                    }}
                                                >
                                                    <Text style={styles.doneText}>Done</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </Modal>
                                </View>

                                {/* Preview Message */}
                                <Text style={styles.label}>
                                    Dear <Text style={styles.red}>Member</Text>, Thank you for choosing <Text style={styles.red}>{param.branchName || 'BRANCH NAME'}</Text>.
                                </Text>

                                {/* Message 1 */}
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Type here..."
                                    multiline
                                    value={param.message}
                                    onChangeText={(text) => setParam(prev => ({ ...prev, message: text }))}
                                    maxLength={200}
                                />
                                <Text style={styles.counter}>{param.message.length}/200</Text>

                                {/* Contact On */}
                                <View style={{ flexDirection: 'row', marginVertical: 8 }}>
                                    <Text style={styles.label}>Kindly contact us </Text>
                                    <TextInput
                                        style={{ borderBottomColor: '#333', width: 100, height: 35, marginTop: 2 }}
                                        placeholder="Type here..."
                                        value={param.contact_us}
                                        keyboardType="numeric"
                                        onChangeText={(text) => setParam(prev => ({ ...prev, contact_us: text }))}
                                        maxLength={200}
                                    />
                                    <Text style={styles.label}> for any assistance.</Text>
                                </View>

                                {/* Message 2 */}
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Type here..."
                                    multiline
                                    value={param.extra_text}
                                    onChangeText={(text) => setParam(prev => ({ ...prev, extra_text: text }))}
                                    maxLength={200}
                                />
                                <Text style={styles.counter}>{param.extra_text.length}/200</Text>

                                {/* Image Upload and Submit */}
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-end',
                                    paddingBottom: 10
                                }}>
                                    <ImageUpload
                                        source={image}
                                        onClearImage={() => {
                                            setImage({ uri: "" });
                                            setParam(prev => ({ ...prev, file: "" }));
                                        }}
                                        onUploadImage={(result) => {
                                            setImage({ uri: result.uri });
                                            setParam(prev => ({
                                                ...prev,
                                                file: "image-" + moment().format("YYYYMMDD-hhmmss") + ".jpg"
                                            }));
                                        }}
                                    />

                                    <TouchableOpacity 
                                        style={[styles.submitButton, loading && { opacity: 0.6 }]} 
                                        onPress={handleSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.submitText}>Submit</Text>
                                        )}
\                                    </TouchableOpacity>
                                </View>
                            </ScrollView>

                        </ImageBackground>

                    </View>
                </SafeAreaView>
            </Modal>

            <Modal
                visible={isRateModalVisible}
                animationType="slide"
                transparent
                onRequestClose={closeRateModal}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
                    <Pressable style={styles.backdrop} onPress={closeRateModal} />
                    <View style={styles.drawer}>
                        {/* Close Button Centered */}
                        <View style={styles.closeBar}>
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity
                                onPress={closeRateModal}
                                style={{
                                    position: 'absolute',
                                    top: -60,
                                    backgroundColor: '#fff',
                                    borderRadius: 50,
                                    padding: 5,
                                    width: 30,
                                    height: 30,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Icon name="close" size={18} color="#333" />
                            </TouchableOpacity>
                            <View style={{ flex: 1 }} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ImageBackground
                                source={require("../assets/login-bg.jpg")}
                                style={{ width: '100%', height: '100%', paddingVertical: 0 }}
                                imageStyle={{ borderRadius: 16 }}
                            >
                                {goldLoading && (
                                    <View style={styles.loadingOverlay}>
                                        <View style={styles.loadingContent}>
                                            <ActivityIndicator size="large" color="#0000ff" />
                                            <Text style={{ marginTop: 10, color: '#000' }}>Loading gold rates...</Text>
                                        </View>
                                    </View>
                                )}
                                <View style={[styles.contentContainer, goldLoading && styles.contentBlurred]}>
                                    <View style={{ borderRadius: 16, padding: 20, width: '100%', alignSelf: 'center' }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <View>
                                                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>Live Rates</Text>
                                                <Text style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>Today's Gold & Silver Prices *</Text>
                                            </View>
                                            <View>
                                                <Image
                                                    source={require('../assets/coins.png')}
                                                    style={{ width: 75, height: 75, borderRadius: 5, marginRight: 10 }}
                                                />
                                            </View>
                                        </View>

                                        {loading ? (
                                            <View style={{ padding: 20 }}>
                                                <Text style={{ fontSize: 14, color: '#888', textAlign: 'center' }}>Loading rates...</Text>
                                            </View>
                                        ) : (
                                            <>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, marginTop: 10 }}>
                                                    <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 14, marginTop: 25 }}>GOLD 24 (MCX)</Text>
                                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                                        <View style={{ borderRadius: 4, padding: 6, marginRight: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                textAlign: 'center',
                                                                letterSpacing: 1,
                                                                fontSize: 17,
                                                                fontWeight: 'bold',
                                                                marginBottom: 5
                                                            }}>
                                                                USD
                                                            </Text>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`$ ${rates?.gold?.["24K (MCX)"]?.live || ""}`}
                                                            </Text>
                                                        </View>
                                                        <View style={{ borderRadius: 4, padding: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                textAlign: 'center',
                                                                letterSpacing: 1,
                                                                fontSize: 17,
                                                                fontWeight: 'bold',
                                                                marginBottom: 5
                                                            }}>
                                                                INR
                                                            </Text>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`₹ ${rates?.gold?.["24K (MCX)"]?.open || ""}`}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                                    <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 14 }}>GOLD 24K</Text>
                                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                                        <View style={{ borderRadius: 4, padding: 6, marginRight: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`$ ${rates?.gold?.["24K"]?.live || ""}`}
                                                            </Text>
                                                        </View>
                                                        <View style={{ borderRadius: 4, padding: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`₹ ${rates?.gold?.["24K"]?.open || ""}`}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                                    <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 14 }}>GOLD 22K</Text>
                                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                                        <View style={{ borderRadius: 4, padding: 6, marginRight: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`$ ${rates?.gold?.["22K"]?.live || ""}`}
                                                            </Text>
                                                        </View>
                                                        <View style={{ borderRadius: 4, padding: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`₹ ${rates?.gold?.["22K"]?.open || ""}`}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                                    <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 14 }}>GOLD 20K</Text>
                                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                                        <View style={{ borderRadius: 4, padding: 6, marginRight: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`$ ${rates?.gold?.["20K"]?.live || ""}`}
                                                            </Text>
                                                        </View>
                                                        <View style={{ borderRadius: 4, padding: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`₹ ${rates?.gold?.["20K"]?.open || ""}`}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                                    <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 14 }}>GOLD 18K</Text>
                                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                                        <View style={{ borderRadius: 4, padding: 6, marginRight: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`$ ${rates?.gold?.["18K"]?.live || ""}`}
                                                            </Text>
                                                        </View>
                                                        <View style={{ borderRadius: 4, padding: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`₹ ${rates?.gold?.["18K"]?.open || ""}`}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                                    <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 14 }}>SILVER (MCX)</Text>
                                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                                        <View style={{ borderRadius: 4, padding: 6, marginRight: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`$ ${rates?.silver?.["Silver (MCX)"]?.live || ""}`}
                                                            </Text>
                                                        </View>
                                                        <View style={{ borderRadius: 4, padding: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`₹ ${rates?.silver?.["Silver (MCX)"]?.open || ""}`}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                                                    <Text style={{ flex: 1, fontWeight: 'bold', fontSize: 14 }}>SILVER</Text>
                                                    <View style={{ flexDirection: 'row', gap: 10 }}>
                                                        <View style={{ borderRadius: 4, padding: 6, marginRight: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`$ ${rates?.silver?.["Silver"]?.live || ""}`}
                                                            </Text>
                                                        </View>
                                                        <View style={{ borderRadius: 4, padding: 6 }}>
                                                            <Text style={{
                                                                color: '#000',
                                                                backgroundColor: '#fff',
                                                                borderWidth: 1,
                                                                borderColor: '#aaa',
                                                                padding: 5,
                                                                letterSpacing: 1,
                                                                fontSize: 14,
                                                                fontWeight: 'bold',
                                                                width: 120
                                                            }}>
                                                                {`₹ ${rates?.silver?.["Silver"]?.open || ""}`}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>

                                                <View style={{ backgroundColor: '#fff', padding: 10, opacity: goldLoading ? 0.9 : 1, marginTop: 10 }}>
                                                    <Text style={{ backgroundColor: '#fff', fontSize: 12, marginBottom: 4 }}>* All rates of Gold and Silver are from third party platform(API).</Text>
                                                    <Text style={{ backgroundColor: '#fff', fontSize: 12 }}>* Gold and Silver rates are exclusive of taxes (import duty, GST, etc.).</Text>
                                                </View>
                                            </>
                                        )}
                                    </View>
                                </View>
                            </ImageBackground>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>




        </>
    );
};

const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 3.84,
    },
    contentContainer: {
        flex: 1,
    },
    contentBlurred: {
        opacity: 0.9,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
        width: "90%",
        borderRadius: 10,
        padding: 16,
    },
    modalSearchInput: {
        borderWidth: 1,
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    selectAllButton: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
    selectAllText: {
        fontWeight: "bold",
        color: "red",
        alignItems: 'flex-end'
    },
    dropdownItem: {
        flexDirection: "row",
        // alignItems: "center",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    checkbox: {
        fontSize: 18,
        width: 30,
    },
    doneButton: {
        backgroundColor: MyStyles.primaryColor.backgroundColor,
        borderRadius: 5,
        color: '#000',
        marginTop: 15,
        padding: 12,
        alignItems: "center",
    },
    doneText: {
        color: "#000",
        fontWeight: "bold",
    },
    container: {
        flexDirection: 'row',
        // width: width - 20,
        backgroundColor: '#fff',
        padding: 6,
        // borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        alignSelf: 'center',
        elevation: 3,
        // marginVertical: 10,
    },
    promoteContainer: {
        flex: 1,
        backgroundColor: '#f6f9f6',
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 8,
        // alignItems: 'center',
        marginRight: 6,
        position: 'relative',
    },
    wantToBadge: {
        backgroundColor: '#e0f0e0',
        paddingHorizontal: 15,
        paddingVertical: 1,
        borderRadius: 10,
        marginBottom: 2,
        position: 'absolute',
        top: -15,
        left: 20
    },
    wantToText: {
        fontSize: 14,
        color: '#000',

    },
    promoteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        marginRight: 60
    },
    promoteText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#222',
        marginRight: 4,
    },

    priceBox: {
        flex: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        alignItems: 'center',
        marginLeft: 6,
        marginTop: -3,
        minWidth: 100,
    },
    goldLabel: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
        flexDirection: 'row',
        marginLeft: 0,
        marginRight: 20,
    },
    goldPrice: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#222',

    },
    changeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    changeText: {
        fontSize: 12,
        color: '#00AA00',
    },

    backdrop: {
        flex: 1,
    },
    drawer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        maxHeight: height * 0.80,
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
        // paddingTop: 16,
        // paddingHorizontal: 20,
    },
    closeBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // marginBottom: 16,
    },
    badge: {
        backgroundColor: '#008080',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },



    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 8,
        width: '50%',
        fontWeight: 'bold',
        fontSize: 16,
        minWidth: 200
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12
    },

    idInput: {
        width: 80,
        borderWidth: 1,
        padding: 8,
        marginLeft: 10
    },
    label: {
        fontSize: 14,
        marginVertical: 8
    },
    red: {
        color: 'red',
        fontWeight: 'bold'
    },
    textArea: {
        borderWidth: 1,
        padding: 10,
        textAlignVertical: 'top',
        height: 60,
        borderColor: '#aaa',
        borderRadius: 3
    },
    counter: {
        alignSelf: 'flex-end',
        color: 'red',
        marginBottom: 10
    },

    submitButton: {
        backgroundColor: 'orange',
        paddingHorizontal: 25,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 5,
        height: 45
    },
    submitText: {
        fontWeight: 'bold',
        color: '#000',
        fontSize: 15
    }
});

export default PromoBanner;
