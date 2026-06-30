import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Alert,
    ScrollView,
    TextInput,
    Pressable,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    Modal,
    BackHandler,
} from 'react-native';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { launchCamera } from 'react-native-image-picker';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import {
    Text,
    Button,
    IconButton,
    Card,
    Divider,
    List,
    Menu,
} from 'react-native-paper';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStyles from '../../Styles/MyStyles';
import { postRequest, uploadImage } from '../../Services/RequestServices';
import Loading from '../../Components/Loading';
import { CapitalizeName } from '../../utils/CapitalizeName';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';

const NewSale = (props) => {
    const { userToken, branchId } = props.route.params || {};
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused();
    
    // Form state
    const [formData, setFormData] = useState({
        title: 'Sale',
        entryNo: '',
        mobile: '',
        customerName: '',
        staffId: '',
        staffName: '',
        remarks: '',
    });
    const [isCustomerLoading, setIsCustomerLoading] = useState(false);
    
    // Cart item popup state
    const [selectedCartItem, setSelectedCartItem] = useState(null);
    const [cartItemModalVisible, setCartItemModalVisible] = useState(false);
    const [productVariants, setProductVariants] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loadingVariants, setLoadingVariants] = useState(false);
    const [variantQuantities, setVariantQuantities] = useState({}); // Track qty for each variant
    
    // Products cart
    const [cartItems, setCartItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [staffMenuVisible, setStaffMenuVisible] = useState(false);

    // Invoice preview state
    const [invoicePreviewVisible, setInvoicePreviewVisible] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
    const [checkoutPayload, setCheckoutPayload] = useState(null);
    
    // Customer vouchers and points
    const [customerVouchers, setCustomerVouchers] = useState([]);
    const [customerPoints, setCustomerPoints] = useState([]);
    
    // Discount/payment state for invoice preview
    const [redeemPoints, setRedeemPoints] = useState('');
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [specialDiscount, setSpecialDiscount] = useState('');
    const [voucherModalVisible, setVoucherModalVisible] = useState(false);
    const [pointsError, setPointsError] = useState('');
    
    // Calculated discount values
    const [pointDiscount, setPointDiscount] = useState(0);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [specialDiscountAmount, setSpecialDiscountAmount] = useState(0);
    const [calculatedFinalAmount, setCalculatedFinalAmount] = useState(null);
    
    // Branch details for invoice
    const [branchDetails, setBranchDetails] = useState(null);
    
    // Share mode - hides input fields when capturing for share
    const [isShareMode, setIsShareMode] = useState(false);
    
    // Ref for capturing invoice image
    const viewShotRef = useRef(null);

    // Fetch preview data on mount
    useEffect(() => {
        fetchSalePreview();
        fetchStaffList();
        fetchBranchDetails();
    }, []);

    // Handle reset flag from navigation
    useEffect(() => {
        if (props.route.params?.resetNewSale) {
            console.log('Resetting NewSale fields after successful save');
            // Reset all form fields
            setFormData({
                title: 'Sale',
                entryNo: '',
                mobile: '',
                customerName: '',
                staffId: '',
                staffName: '',
                remarks: '',
            });
            setCartItems([]);
            setSearchResults([]);
            setSearchQuery('');
            setCustomerVouchers([]);
            setCustomerPoints([]);
            setSelectedVoucher(null);
            setRedeemPoints('');
            setSpecialDiscount('');
            setPointsError('');
            setPointDiscount(0);
            setVoucherDiscount(0);
            setSpecialDiscountAmount(0);
            setCalculatedFinalAmount(null);
            
            // Generate new entry number
            fetchSalePreview();
            
            // Check if we should navigate to Dashboard after reset
            if (props.route.params?.navigateToDashboard) {
                setTimeout(() => {
                    props.navigation.navigate('Dashboard', {
                        userToken,
                        branchId
                    });
                }, 100); // Small delay to ensure reset completes
            }
            
            // Clear the reset flags
            const routeParams = props.route.params;
            delete routeParams.resetNewSale;
            delete routeParams.navigateToDashboard;
        }
    }, [props.route.params?.resetNewSale]);

    // Handle triggerBackReset from TitleBar
    useEffect(() => {
        if (props.route.params?.triggerBackReset) {
            console.log('Triggering back reset from TitleBar');
            handleCancel();
            // Clear the trigger flag
            const routeParams = props.route.params;
            delete routeParams.triggerBackReset;
        }
    }, [props.route.params?.triggerBackReset]);

    // Handle resetCheckoutData from CheckoutPage
    useEffect(() => {
        if (props.route.params?.resetCheckoutData) {
            console.log('Resetting CheckoutPage data - going back to NewSale');
            // Clear the trigger flag
            const routeParams = props.route.params;
            delete routeParams.resetCheckoutData;
        }
    }, [props.route.params?.resetCheckoutData]);

    // Handle Android hardware back button
    useEffect(() => {
        const backAction = () => {
            handleCancel();
            return true; // Prevent default back behavior
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

        return () => backHandler.remove();
    }, []);

    
    const fetchBranchDetails = () => {
        postRequest(
            'masters/branch/preview',
            { branch_id: branchId },
            userToken
        ).then((resp) => {
            if (resp) {
                setBranchDetails(resp);
            }
        }).catch((error) => {
            console.error('Error fetching branch details:', error);
        });
    };

    const fetchSalePreview = () => {
        setLoading(true);
        postRequest(
            'transactions/stockSales/preview',
            {"tran_id":0},
            userToken
        ).then((resp) => {
            if (resp.status === 200 && resp.data?.length > 0) {
                const preview = resp.data[0];
                console.log("preview",preview)
                setFormData(prev => ({
                    ...prev,
                    entryNo: preview.entry_no || '',
                    title: preview.title || 'Sale',
                    mobile: preview.mobile || '',
                    customerName: preview.customer_name || '',
                    remarks: preview.remarks || '',
                }));
                
            } else {
                // Fallback if API fails
                const timestamp = Date.now().toString().slice(-5);
                const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                setFormData(prev => ({ ...prev, entryNo: timestamp + random }));
            }
            setLoading(false);
        }).catch((error) => {
            console.error('Preview fetch error:', error);
            // Fallback entry number generation
            const timestamp = Date.now().toString().slice(-5);
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            setFormData(prev => ({ ...prev, entryNo: timestamp + random }));
            setLoading(false);
        });
    };

    const fetchStaffList = () => {
        postRequest(
            'customervisit/StaffList',
            {},
            userToken
        ).then((resp) => {
            if (resp.status === 200 && resp.data) {
                // Map API response to staff list format
                const staff = resp.data.map(item => ({
                    id: item.staff_id || item.id,
                    name: item.staff_name || item.name,
                }));
                setStaffList(staff);
                console.log('Staff list loaded:', staff.length);
            } else {
                // Fallback empty list
                setStaffList([]);
            }
        }).catch((error) => {
            console.error('Staff list fetch error:', error);
            setStaffList([]);
        });
    };

    const checkExistingCustomer = (mobile) => {
        if (mobile.length !== 10) return;
        
        setIsCustomerLoading(true);
        postRequest(
            'transactions/customer/session/getCustomer',
            { mobile: mobile },
            userToken
        ).then((resp) => {
            if (resp.status === 200 && resp.data?.length > 0) {
                const customer = resp.data[0];
                console.log('Customer found:', customer);
                setFormData(prev => ({
                    ...prev,
                    customerName: customer.full_name || customer.customer_name || '',
                }));

                // Fetch customer vouchers
                postRequest(
                    'customervisit/getCustomerVoucherList',
                    { mobile: mobile, customer_id: customer.customer_id },
                    userToken
                ).then((voucherResp) => {
                    console.log('Customer vouchers:', voucherResp);
                    setCustomerVouchers(voucherResp.data || []);
                }).catch((error) => {
                    console.error('Voucher lookup error:', error);
                });
                
                // Fetch customer points
                postRequest(
                    'customervisit/getCustomerPointList',
                    { mobile: mobile, customer_id: customer.customer_id },
                    userToken
                ).then((pointsResp) => {
                    console.log('Customer points:', pointsResp.data);
                    setCustomerPoints(pointsResp.data || []);
                }).catch((error) => {
                    console.error('Points lookup error:', error);
                });
            } else {
                console.log('New customer - name can be entered manually');
                // Keep customer name empty for new customer
                setFormData(prev => ({
                    ...prev,
                    customerName: '',
                }));
                // Clear vouchers and points for new customer
                setCustomerVouchers([]);
                setCustomerPoints([]);
            }
            setIsCustomerLoading(false);
        }).catch((error) => {
            setIsCustomerLoading(false);
            console.error('Customer lookup error:', error);
        });
    };

    const handleMobileChange = (text) => {
        // Only allow digits
        const cleaned = text.replace(/[^0-9]/g, '');
        // Limit to 10 digits
        const limited = cleaned.slice(0, 10);
        
        setFormData(prev => ({ ...prev, mobile: limited }));
        
        // Check for existing customer when 10 digits entered
        if (limited.length === 10) {
            checkExistingCustomer(limited);
        }
    };

    const handleSearchProducts = (searchValue = null) => {
        // Ensure we get a string value
        let query = '';
        
        if (searchValue && typeof searchValue === 'string') {
            query = searchValue;
        } else if (searchQuery) {
            query = typeof searchQuery === 'string' ? searchQuery : String(searchQuery);
        }
        
        // Final safety check
        if (!query || typeof query !== 'string') {
            console.log('Invalid query type:', typeof query, query);
            return;
        }
        
        if (!query.trim()) return;
        setLoading(true);
        console.log("Searching for:", query.trim())
        postRequest(
            'transactions/customer/session/getProductsbyProductCode',
            { search: query.trim() },
            userToken
        ).then((resp) => {
            if (resp.status === 200 && resp.data) {
                setSearchResults(resp.data || []);
                console.log('Products found:', resp.data.length);
            } else {
                setSearchResults([]);
                Alert.alert('Not Found', 'No products found with this code');
            }
            setLoading(false);
        }).catch((error) => {
            setLoading(false);
            console.error('Product search error:', error);
            Alert.alert('Error', 'Failed to search products');
        });
    };

    const addToCart = (product) => {
        const productId = product.product_id;
        const existingItem = cartItems.find(item => item.product_id === productId);
        
        if (existingItem) {
            setCartItems(cartItems.map(item => 
                item.product_id === productId
                    ? { ...item, qty: item.qty + 1 }
                    : item
            ));
        } else {
            setCartItems([...cartItems, { 
                product_id: productId,
                product_name: product.product_name || product.product,
                product_code: product.product_code,
                price: product.price || 0,
                qty: 1,
                category_name: product.category_name,
                subcategory_name: product.subcategory_name,
                size_length: product.size_length,
                image_path: product.image_path,
                url_image: product.url_image,
                isImageUrl: product.isImageUrl,
                color: product.color,
                gst: product.gst,
            }]);
        }
        setSearchResults([]);
        setSearchQuery('');
    };

    const removeFromCart = (productId) => {
        setCartItems(cartItems.filter(item => item.product_id !== productId && item.id !== productId));
    };

    const parseProductCode = (fullCode) => {
        if (!fullCode) return '';
        const parts = fullCode.split('/');
        if (parts.length >= 2) {
            return parts[0] + '/' + parts[1];
        }
        return fullCode;
    };

    const fetchProductVariants = (productCode) => {
        const searchCode = parseProductCode(productCode);
        if (!searchCode) return;
        
        setLoadingVariants(true);
        postRequest(
            'transactions/customer/session/getProductsbyProductCodeRetailer',
            { search: searchCode },
            userToken
        ).then((resp) => {
            setLoadingVariants(false);
            if (resp.status === 200 && resp.data) {
                setProductVariants(resp.data || []);
                // Find current variant in the list
                const current = resp.data.find(v => v.product_code === productCode);
                setSelectedVariant(current || resp.data[0] || null);
                // Initialize quantities to 0 for all variants
                const initialQuantities = {};
                resp.data.forEach(v => {
                    initialQuantities[v.product_id] = 0;
                });
                // Check all cart items and set quantities for matching variants
                resp.data.forEach(variant => {
                    const cartItem = cartItems.find(item => item.product_id === variant.product_id);
                    if (cartItem) {
                        initialQuantities[variant.product_id] = cartItem.qty || 0;
                    }
                });
                setVariantQuantities(initialQuantities);
            } else {
                setProductVariants([]);
                setSelectedVariant(null);
                setVariantQuantities({});
            }
        }).catch((error) => {
            setLoadingVariants(false);
            console.error('Product variants fetch error:', error);
            setProductVariants([]);
            setSelectedVariant(null);
            setVariantQuantities({});
        });
    };

    const openCartItemPopup = (item) => {
        setSelectedCartItem(item);
        setCartItemModalVisible(true);
        setProductVariants([]);
        setSelectedVariant(null);
        // Fetch variants when opening popup
        fetchProductVariants(item.product_code);
    };

    const closeCartItemPopup = () => {
        setCartItemModalVisible(false);
        setSelectedCartItem(null);
        setProductVariants([]);
        setSelectedVariant(null);
        setVariantQuantities({});
    };

    const addAllVariantsToCart = () => {
        // Get all variants with quantity > 0
        const variantsToAdd = productVariants.filter(variant => (variantQuantities[variant.product_id] || 0) > 0);
        
        if (variantsToAdd.length === 0) {
            // If no variants have quantity, just close (keep original item)
            closeCartItemPopup();
            return;
        }

        // Remove the original cart item
        const originalProductId = selectedCartItem?.product_id || selectedCartItem?.id;
        let newCartItems = cartItems.filter(item => item.product_id !== originalProductId && item.id !== originalProductId);

        // Add all variants with their quantities
        variantsToAdd.forEach(variant => {
            const qty = variantQuantities[variant.product_id];
            const existingItem = newCartItems.find(item => item.product_id === variant.product_id);
            
            if (existingItem) {
                // Update existing item quantity (replace, don't add)
                newCartItems = newCartItems.map(item => 
                    item.product_id === variant.product_id 
                        ? { ...item, qty: qty }
                        : item
                );
            } else {
                // Add new item
                newCartItems.push({
                    product_id: variant.product_id,
                    product_name: variant.product_name || variant.product,
                    product_code: variant.product_code,
                    price: variant.price || 0,
                    qty: qty,
                    category_name: variant.category_name,
                    subcategory_name: variant.subcategory_name,
                    size_length: variant.size_length,
                    color: variant.color,
                    image_path: variant.image_path,
                    url_image: variant.url_image,
                    isImageUrl: variant.isImageUrl,
                    gst: variant.gst,
                });
            }
        });

        setCartItems(newCartItems);
        closeCartItemPopup();
    };

    const updateCartItemQty = (newQty) => {
        if (newQty <= 0) {
            removeFromCart(selectedCartItem?.product_id || selectedCartItem?.id);
        } else {
            setCartItems(cartItems.map(item => 
                (item.product_id === selectedCartItem?.product_id || item.id === selectedCartItem?.id) 
                    ? { ...item, qty: newQty } 
                    : item
            ));
        }
    };

    const switchToVariant = (variant) => {
        setSelectedVariant(variant);
        // Update the cart item with new variant details
        setCartItems(cartItems.map(item => 
            (item.product_id === selectedCartItem?.product_id || item.id === selectedCartItem?.id) 
                ? { 
                    ...item, 
                    product_id: variant.product_id,
                    product_code: variant.product_code,
                    product_name: variant.product_name || variant.product,
                    price: variant.price || 0,
                    image_path: variant.image_path,
                    url_image: variant.url_image,
                    isImageUrl: variant.isImageUrl,
                    category_name: variant.category_name,
                    subcategory_name: variant.subcategory_name,
                    size_length: variant.size_length,
                    color: variant.color,
                    gst: variant.gst,
                } 
                : item
        ));
        // Update selected cart item reference
        setSelectedCartItem(prev => ({
            ...prev,
            product_id: variant.product_id,
            product_code: variant.product_code,
            product_name: variant.product_name || variant.product,
            price: variant.price || 0,
            image_path: variant.image_path,
            url_image: variant.url_image,
            isImageUrl: variant.isImageUrl,
            size_length: variant.size_length,
            color: variant.color,
        }));
    };

    const updateVariantQuantity = (variantId, newQty) => {
        const qty = Math.max(0, parseInt(newQty) || 0);
        setVariantQuantities(prev => ({
            ...prev,
            [variantId]: qty
        }));
    };

    const updateQty = (productId, newQty) => {
        if (newQty <= 0) {
            removeFromCart(productId);
        } else {
            setCartItems(cartItems.map(item => 
                (item.product_id === productId || item.id === productId) 
                    ? { ...item, qty: newQty } 
                    : item
            ));
        }
    };

    const calculateTotals = () => {
        const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
        return { totalItems, subtotal };
    };

    const handleCheckout = () => {
        if (!formData.customerName) {
            Alert.alert('Error', 'Please enter customer name');
            return;
        }
        if (cartItems.length === 0) {
            Alert.alert('Error', 'Please add at least one product');
            return;
        }

        // Prepare the payload according to the API specification
        const payload = {
            tran_id: "0",
            entry_no: formData.entryNo,
            title: formData.title || "Sale",
            mobile: formData.mobile,
            customer_id: 0, // Will be set to 0 for new customers
            customer_name: formData.customerName,
            remarks: formData.remarks || "",
            staff_id: formData.staffId || "3078", // Default staff ID if not selected
            gst: 0,
            customer_sale_products: cartItems.map((item, index) => ({
                mtran_id: "0",
                product_id: item.product_id,
                product_code: item.product_code || "",
                product_name: item.product_name || "",
                size: item.size_length || "",
                price: item.price || 0,
                qty: item.qty || 1,
                sale_qty: item.qty || 1,
                color: item.color || "",
                gst: item.gst || "0",
                image_path: item.image_path || "",
                url_image: item.url_image || "https://api.quicktagg.com/Images/",
                subcategory_id: item.subcategory_id || 0,
                subcategory_name: item.subcategory_name || "",
                category_name: item.category_name || "",
                category_id: item.category_id || 0
            }))
        };

        // Calculate totals for invoice preview
        const { totalItems, subtotal } = calculateTotals();
        
        // Prepare invoice data for preview
        const invoicePreviewData = {
            entryNo: formData.entryNo,
            date: new Date().toLocaleDateString('en-GB'),
            customerName: formData.customerName,
            mobile: formData.mobile,
            items: cartItems,
            totalItems,
            subtotal,
            finalAmount: subtotal // Can be updated with discounts later
        };

        // Navigate to CheckoutPage with all necessary data
        props.navigation.navigate('CheckoutPage', {
            userToken,
            branchId,
            checkoutPayload: payload,
            invoiceData: invoicePreviewData,
            customerVouchers,
            customerPoints,
            branchDetails,
        });
    };

    const handleSaveInvoice = async () => {
        if (!checkoutPayload) return;

        setLoading(true);
        console.log('Saving Invoice:', JSON.stringify(checkoutPayload, null, 2));

        try {
            // First, save the sale
            const resp = await postRequest(
                'transactions/stockRetailerSales/insert',
                checkoutPayload,
                userToken
            );

            if (resp.status === 200) {
                // Calculate totals for uploadBill
                const { subtotal } = calculateTotals();
                const finalAmount = calculatedFinalAmount !== null ? calculatedFinalAmount : subtotal;
                const subtotalAfterDiscount = subtotal - pointDiscount - voucherDiscount - specialDiscountAmount;
                
                // Prepare uploadBill FormData
                const billFormData = new FormData();
                
                // NOTE: PDF generation requires native libraries incompatible with RN 0.78+
                // Sending data without file - server can generate PDF from the data
                // To add PDF later, use a library compatible with RN 0.78+ or capture view as image
                
                // Add other fields - all values must be strings
                billFormData.append('customer_name', String(formData.customerName || ''));
                billFormData.append('mobile', String(formData.mobile || ''));
                billFormData.append('branch', String(branchId || '2060'));
                billFormData.append('entry_no', String(formData.entryNo || ''));
                billFormData.append('redeemPoint', String(redeemPoints || '0'));
                billFormData.append('voucher_id', String(selectedVoucher?.voucher_id || ''));
                billFormData.append('voucher_name', String(selectedVoucher?.voucher_name || ''));
                billFormData.append('special_discount', String(specialDiscount || ''));
                billFormData.append('IGST', '0.00');
                billFormData.append('CGST', '0.00');
                billFormData.append('SGST', '0.00');
                billFormData.append('subtotal_after_discount', String(Math.max(0, subtotalAfterDiscount).toFixed(2)));
                billFormData.append('final_amount', String(finalAmount.toFixed(2)));
                billFormData.append('customer_id', String(checkoutPayload.customer_id || '0'));
                billFormData.append('staff_id', String(formData.staffId || '3078'));

                console.log('UploadBill FormData:', billFormData);

                // Call uploadBill API
                const uploadResp = await uploadImage(
                    'transactions/uploadBill',
                    billFormData,
                    userToken
                );

                console.log('UploadBill response:', uploadResp);

                setLoading(false);
                setInvoicePreviewVisible(false);
                Alert.alert(
                    'Success', 
                    'Sale created successfully!\nEntry No: ' + formData.entryNo,
                    [
                        { 
                            text: 'OK', 
                            onPress: () => {
                                // Reset form after successful sale
                                setFormData({
                                    title: 'Sale',
                                    entryNo: '',
                                    mobile: '',
                                    customerName: '',
                                    staffId: '',
                                    staffName: '',
                                    remarks: '',
                                });
                                setCartItems([]);
                                setCheckoutPayload(null);
                                setInvoiceData(null);
                                // Reset discount fields
                                setRedeemPoints('');
                                setSelectedVoucher(null);
                                setSpecialDiscount('');
                                setPointDiscount(0);
                                setVoucherDiscount(0);
                                setSpecialDiscountAmount(0);
                                setCalculatedFinalAmount(null);
                                fetchSalePreview(); // Generate new entry number
                            }
                        }
                    ]
                );
            } else {
                setLoading(false);
                Alert.alert('Error', 'Failed to create sale. Please try again.');
                console.error('Checkout response error:', resp);
            }
        } catch (error) {
            setLoading(false);
            console.error('Checkout error:', error);
            Alert.alert('Error', 'Failed to create sale. Please check your connection and try again.');
        }
    };

    const handleShareInvoice = async () => {
        if (!invoiceData) {
            Alert.alert('Error', 'No invoice data to share');
            return;
        }

        setLoading(true);

        try {
            // Enable share mode to hide input fields
            setIsShareMode(true);
            
            // Wait for React to re-render without inputs
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Capture the invoice view as image (without input fields)
            const uri = await viewShotRef.current.capture();
            console.log('Invoice captured:', uri);
            
            // Disable share mode to show inputs again
            setIsShareMode(false);

            // Share the image
            const shareOptions = {
                title: 'Share Invoice',
                message: `Invoice ${formData.entryNo}`,
                url: uri,
                type: 'image/png',
            };

            await Share.open(shareOptions);
            setLoading(false);
        } catch (error) {
            console.error('Share error:', error);
            setIsShareMode(false);
            setLoading(false);
            Alert.alert('Error', 'Failed to share invoice. Please try again.');
        }
    };

    // Function to reset all NewSale data
    const resetAllData = () => {
        setFormData({
            title: 'Sale',
            entryNo: '',
            mobile: '',
            customerName: '',
            staffId: '',
            staffName: '',
            remarks: '',
        });
        setCartItems([]);
        setSearchResults([]);
        setSearchQuery('');
        setCustomerVouchers([]);
        setCustomerPoints([]);
        setSelectedVoucher(null);
        setRedeemPoints('');
        setSpecialDiscount('');
        setPointsError('');
        setPointDiscount(0);
        setVoucherDiscount(0);
        setSpecialDiscountAmount(0);
        setCalculatedFinalAmount(null);
        setCheckoutPayload(null);
        setInvoiceData(null);
        
        // Generate new entry number
        fetchSalePreview();
    };

    const handleCancel = () => {
        Alert.alert(
            'Cancel',
            'Are you sure you want to cancel? All data will be cleared.',
            [
                { text: 'No', style: 'cancel' },
                { text: 'Yes', onPress: () => {
                    resetAllData();
                    props.navigation.goBack();
                }}
            ]
        );
    };

    const closeInvoicePreview = () => {
        setInvoicePreviewVisible(false);
        // Reset discount fields
        setRedeemPoints('');
        setSelectedVoucher(null);
        setSpecialDiscount('');
        setPointsError('');
        setPointDiscount(0);
        setVoucherDiscount(0);
        setSpecialDiscountAmount(0);
        setCalculatedFinalAmount(null);
    };

    // Calculate all discounts based on inputs
    const calculateDiscounts = (subtotal) => {
        // Point discount = redeem points entered (assuming 1 point = ₹1)
        const points = parseInt(redeemPoints) || 0;
        setPointDiscount(points);
        
        // Voucher discount = parse amount from string like 'Rs. 200 off' or '10% off'
        let voucherAmount = 0;
        if (selectedVoucher && selectedVoucher.amount) {
            const amountStr = selectedVoucher.amount.toString();
            const match = amountStr.match(/[\d.]+/);
            if (match) {
                const numericValue = parseFloat(match[0]);
                // Check if amount contains % symbol
                if (amountStr.includes('%')) {
                    // Calculate percentage of subtotal
                    voucherAmount = (numericValue / 100) * invoiceData.subtotal;
                } else {
                    // Fixed amount discount
                    voucherAmount = numericValue;
                }
            }
        }
        setVoucherDiscount(voucherAmount);
        
        // Special discount - handle both fixed amount and percentage
        let specialDisc = 0;
        if (specialDiscount) {
            const discountStr = specialDiscount.trim();
            if (discountStr.endsWith('%')) {
                // Percentage discount
                const percentage = parseFloat(discountStr) || 0;
                specialDisc = (subtotal * percentage) / 100;
            } else {
                // Fixed amount discount
                specialDisc = parseFloat(discountStr) || 0;
            }
        }
        setSpecialDiscountAmount(specialDisc);
        
        // Calculate final amount
        const totalDiscount = points + voucherAmount + specialDisc;
        const final = Math.max(0, subtotal - totalDiscount);
        setCalculatedFinalAmount(final);
        
        return { points, voucherAmount, specialDisc, final };
    };

    // Recalculate discounts when inputs change
    useEffect(() => {
        if (invoiceData) {
            calculateDiscounts(invoiceData.subtotal);
        }
    }, [redeemPoints, selectedVoucher, specialDiscount, invoiceData]);

    const handleCameraScan = () => {
        launchCamera(
            {
                mediaType: 'photo',
                cameraType: 'back',
                quality: 1,
                includeBase64: false,
            },
            async response => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    Alert.alert('Error', response.errorMessage);
                    return;
                }

                const uri = response.assets[0].uri;
                console.log('Camera image URI:', uri);

                try {
                    // For ML Kit, we need to pass the URI directly
                    // The library handles file:// and content:// URIs internally
                    console.log('Scanning URI:', uri);
                    const barcodes = await BarcodeScanning.scan(uri);
                    console.log('Barcodes found:', barcodes.length);

                    if (barcodes.length > 0) {
                        const barcode = barcodes[0];
                        console.log('Barcode object:', JSON.stringify(barcode));
                        
                        // Try different properties that might contain the value
                        const scannedValue = barcode.rawValue || barcode.value || barcode.displayValue || barcode.text;
                        console.log('Scanned value:', scannedValue);
                        
                        if (scannedValue) {
                            // Set the scanned value in search field and trigger search
                            setSearchQuery(scannedValue);
                            // Small delay to ensure state is updated before searching
                            setTimeout(() => {
                                handleSearchProducts(scannedValue);
                            }, 100);
                        } else {
                            Alert.alert('Error', 'Could not read barcode value. Please try again.');
                        }
                    } else {
                        Alert.alert('No Barcode', 'No barcode found in image. Please try again with a clearer image.');
                    }
                } catch (e) {
                    console.error('Barcode scan error:', e);
                    Alert.alert('Error', `Failed to scan barcode: ${e.message || 'Unknown error'}`);
                }
            },
        );
    };

    const { totalItems, subtotal } = calculateTotals();

    return (
        <View style={styles.container}>
            <Loading isloading={loading} />
            
            <ScrollView style={styles.scrollView}>
                {/* Header Section */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>Title</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.title}
                                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                                    placeholder="Sale"
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <Text style={styles.label}>Entry No.</Text>
                                <TextInput
                                    style={[styles.input, styles.disabledInput]}
                                    value={formData.entryNo}
                                    editable={false}
                                />
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Customer Details */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.row}>
                            <View style={styles.thirdWidth}>
                                <Text style={styles.label}>Mobile</Text>
                                <View style={styles.mobileInputContainer}>
                                    <TextInput
                                        style={[styles.input, styles.mobileInput, isCustomerLoading && styles.loadingInput]}
                                        value={formData.mobile}
                                        onChangeText={handleMobileChange}
                                        placeholder="Enter mobile"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                    />
                                    {isCustomerLoading && (
                                        <Text style={styles.loadingText}>Checking...</Text>
                                    )}
                                </View>
                            </View>
                            <View style={styles.thirdWidth}>
                                <Text style={styles.label}>Customer Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={formData.customerName}
                                    onChangeText={(text) => setFormData({ ...formData, customerName: text })}
                                    placeholder="Enter name"
                                />
                            </View>
                            <View style={styles.thirdWidth}>
                                <Text style={styles.label}>Staff Name</Text>
                                <Menu
                                    visible={staffMenuVisible}
                                    onDismiss={() => setStaffMenuVisible(false)}
                                    anchor={
                                        <Pressable 
                                            style={styles.dropdownTrigger}
                                            onPress={() => setStaffMenuVisible(true)}
                                        >
                                            <Text style={formData.staffName ? styles.dropdownText : styles.placeholder}>
                                                {formData.staffName || '--Select--'}
                                            </Text>
                                            <Icon name="chevron-down" size={20} color="#666" />
                                        </Pressable>
                                    }
                                >
                                    {staffList.map((staff) => (
                                        <Menu.Item
                                            key={staff.id}
                                            onPress={() => {
                                                setFormData({ ...formData, staffId: staff.id, staffName: staff.name });
                                                setStaffMenuVisible(false);
                                            }}
                                            title={staff.name}
                                        />
                                    ))}
                                </Menu>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Product Search */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.label}>Search Products</Text>
                        <View style={styles.searchRow}>
                            <TextInput
                                style={[styles.input, styles.searchInput]}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search by product code or name"
                                onSubmitEditing={handleSearchProducts}
                            />
                            <IconButton
                                icon="magnify"
                                mode="contained" 
                                size={24}
                                iconColor="white"
                                onPress={handleSearchProducts}
                                style={styles.searchButton}
                            />
                            <IconButton
                                icon="camera"
                                mode="contained"
                                size={24}
                                iconColor="white"
                                onPress={handleCameraScan}
                                style={styles.cameraButton}
                            />
                        </View>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <View style={styles.searchResults}>
                                {searchResults.map((product, index) => (
                                    <Pressable
                                        key={product.product_id || index}
                                        style={styles.searchResultItem}
                                        onPress={() => addToCart(product)}
                                    >
                                        <View style={styles.productInfo}>
                                            {product.image_path && (
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
                                            )}
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.productName}>
                                                    {product.product_name || product.product}
                                                </Text>
                                                <Text style={styles.productDetails}>
                                                    {product.product_code} | {product.category_name}
                                                </Text>
                                                <Text style={styles.productMeta}>
                                                    Stock: {product.qty || 0} | {product.size_length} | {product.color}
                                                </Text>
                                            </View>
                                            <Text style={styles.productPrice}>₹{product.price || 0}</Text>
                                        </View>
                                    </Pressable>
                                ))}
                            </View>
                        )}
                    </Card.Content>
                </Card>

                {/* Cart Items */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Cart Items</Text>
                        {cartItems.length === 0 ? (
                            <View style={styles.noDataBox}>
                                <Text style={styles.noDataText}>No Data</Text>
                            </View>
                        ) : (
                            cartItems.map((item, index) => (
                                <Pressable 
                                    key={`cart-item-${index}`} 
                                    style={styles.cartItem}
                                    onPress={() => openCartItemPopup(item)}
                                >
                                    {/* Product Image */}
                                    {item.image_path ? (
                                        <Image
                                            source={{
                                                uri: item.isImageUrl
                                                    ? item.image_path.trim()
                                                    : `${item.url_image}${item.image_path}`
                                            }}
                                            style={styles.cartItemImage}
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <View style={styles.cartItemImagePlaceholder}>
                                            <Icon name="image-off" size={20} color="#ccc" />
                                        </View>
                                    )}
                                    <View style={styles.cartItemInfo}>
                                        <Text style={styles.cartItemName}>{item.product_name || item.text || 'Unknown'}</Text>
                                        <Text style={styles.cartItemCode}>{item.product_code || ''}</Text>
                                    </View>
                                    <View style={styles.qtyDisplay}>
                                        <Text style={styles.qtyLabel}>Qty: </Text>
                                        <Text style={styles.qtyText}>{item.qty || 1}</Text>
                                    </View>
                                    <Text style={styles.itemTotal}>₹{(item.price || 0) * (item.qty || 1)}</Text>
                                    <IconButton
                                        icon="delete"
                                        size={20}
                                        color="red"
                                        onPress={() => removeFromCart(item.product_id || item.id)}
                                    />
                                </Pressable>
                            ))
                        )}
                    </Card.Content>
                </Card>

                {/* Cart Item Popup Modal */}
                <Modal
                    visible={cartItemModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={closeCartItemPopup}
                >
                    <Pressable
  style={styles.modalOverlay}
  onPress={closeCartItemPopup}>
                        <Pressable
    style={styles.cartItemModal}
    onPress={(e) => e.stopPropagation()}>
                            <Text style={styles.modalTitle}>Update Quantity</Text>
                            
                            {selectedCartItem && (
                                <View style={styles.modalContent}>
                                    {(selectedVariant?.image_path || selectedCartItem.image_path) && (
                                        <Image
                                            source={{
                                                uri: (selectedVariant?.isImageUrl || selectedCartItem.isImageUrl)
                                                    ? (selectedVariant?.image_path || selectedCartItem.image_path).trim()
                                                    : `${selectedVariant?.url_image || selectedCartItem.url_image}${selectedVariant?.image_path || selectedCartItem.image_path}`
                                            }}
                                            style={styles.modalProductImage}
                                            resizeMode="contain"
                                        />
                                    )}
                                    <Text style={styles.modalProductName}>
                                        {selectedVariant?.product_name || selectedVariant?.product || selectedCartItem.product_name || selectedCartItem.text || 'Unknown'}
                                    </Text>
                                    <Text style={styles.modalProductCode}>
                                        {selectedVariant?.product_code || selectedCartItem.product_code || ''}
                                    </Text>
                                    {(selectedVariant?.size_length || selectedCartItem.size_length) && (
                                        <Text style={styles.modalProductMeta}>
                                            Size: {selectedVariant?.size_length || selectedCartItem.size_length} | Color: {selectedVariant?.color || selectedCartItem.color || '-'}
                                        </Text>
                                    )}
                                    
                                    <View style={styles.qtyUpdateRow}>
                                        <IconButton
                                            icon="minus-circle"
                                            size={36}
                                            onPress={() => {
                                                const currentQty = variantQuantities[selectedVariant?.product_id] || 0;
                                                updateVariantQuantity(selectedVariant?.product_id, Math.max(0, currentQty - 1));
                                            }}
                                        />
                                        <Text style={styles.modalQtyText}>
                                            {variantQuantities[selectedVariant?.product_id] || 0}
                                        </Text>
                                        <IconButton
                                            icon="plus-circle"
                                            size={36}
                                            onPress={() => {
                                                const currentQty = variantQuantities[selectedVariant?.product_id] || 0;
                                                updateVariantQuantity(selectedVariant?.product_id, currentQty + 1);
                                            }}
                                        />
                                    </View>
                                    
                                    <Text style={styles.modalPrice}>
                                        Total: ₹{(selectedVariant?.price || selectedCartItem.price || 0) * (variantQuantities[selectedVariant?.product_id] || 0)}
                                    </Text>

                                    {/* Product Variants Section */}
                                    {productVariants.length > 1 && (
                                        <View style={styles.variantsSection}>
                                            <Text style={styles.variantsTitle}>Available Variants:</Text>
                                            <ScrollView style={styles.variantsList}>
                                                {productVariants.map((variant, index) => (
                                                    <View
                                                        key={variant.product_id || index}
                                                        style={[
                                                            styles.variantItem,
                                                            (selectedVariant?.product_id === variant.product_id) && styles.variantItemSelected
                                                        ]}
                                                    >
                                                        <Pressable 
                                                            style={styles.variantInfo}
                                                            onPress={() => switchToVariant(variant)}
                                                        >
                                                            <Text style={styles.variantCode}>{variant.product_code}</Text>
                                                            <Text style={styles.variantDetails}>
                                                                {variant.size_length} | {variant.color} | Stock: {variant.qty || 0}
                                                            </Text>
                                                        </Pressable>
                                                        <View style={styles.variantQtyPriceRow}>
                                                            <TextInput
                                                                style={styles.variantQtyInput}
                                                                value={String(variantQuantities[variant.product_id] || 0)}
                                                                onChangeText={(text) => updateVariantQuantity(variant.product_id, text)}
                                                                keyboardType="number-pad"
                                                                maxLength={3}
                                                            />
                                                            <Text style={styles.variantPrice}>₹{variant.price || 0}</Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>
                            )}
                            
                            <View style={styles.modalButtonRow}>
                                <Button mode="contained" onPress={addAllVariantsToCart} style={styles.modalDoneButton}>
                                    Add to Cart
                                </Button>
                            </View>
                        </Pressable>
                    </Pressable>
                </Modal>

                {/* Remarks */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.label}>Remarks</Text>
                        <TextInput
                            style={[styles.input, styles.remarksInput]}
                            value={formData.remarks}
                            onChangeText={(text) => setFormData({ ...formData, remarks: text })}
                            placeholder="Enter remarks"
                            multiline
                            numberOfLines={3}
                        />
                    </Card.Content>
                </Card>

                {/* Bill Summary */}
                <Card style={[styles.card, styles.summaryCard]}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Bill Summary</Text>
                        <Divider style={styles.divider} />
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>No. of Items</Text>
                            <Text style={styles.summaryValue}>{totalItems}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
                        </View>
                    </Card.Content>
                </Card>

            </ScrollView>

            {/* Action Buttons - Fixed at bottom */}
            <View style={styles.buttonRow}>
                <Button
                    mode="contained"
                    onPress={handleCheckout}
                    style={[styles.actionButton, styles.checkoutButton, {borderRadius:6, color:'#ffffff'}]}
                    disabled={cartItems.length === 0 || !formData.customerName}
                >
                   <Text style={{color:'white'}}>Checkout</Text> 
                </Button>
            </View>

            {/* Invoice Preview Modal */}
            <Modal
                visible={invoicePreviewVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeInvoicePreview}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.invoiceModalContainer}>
                        <View style={styles.invoiceHeader}>
                            <Text style={styles.invoiceTitle}>Invoice Preview</Text>
                            <IconButton
                                icon="close"
                                size={24}
                                onPress={closeInvoicePreview}
                            />
                        </View>
                        
                        <ScrollView style={styles.invoiceContent}>
                            {invoiceData && (
                                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.invoiceBody}>
                                    {/* Header with Logo */}
                                    <View style={styles.billHeader}>
                                        <View style={styles.billLogoContainer }>
                                            <Icon name="shopping" size={28} color="#1a365d" />
                                        </View>
                                        <View style={styles.billHeaderText}>
                                            <Text style={styles.billCompanyName}>{(branchDetails?.brand_name || 'COMPANY NAME').toUpperCase()}</Text>
                                            <Text style={styles.billCompanyAddress}>{branchDetails?.address || ''}</Text>
                                            <View style={styles.billContactRow}>
                                                {/* <Icon name="phone" size={12} color="#666" /> */}
                                                {/* <Text style={styles.billCompanyPhone}> {branchDetails?.mobile || ''} | </Text> */}
                                                <Text style={styles.billCompanyGst}>GST: {branchDetails?.gst_number || ''}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    
                                    <Divider style={styles.invoiceDivider} />
                                    
                                    {/* Bill No and Date Row */}
                                    <View style={{flexDirection:'row', justifyContent: 'space-between', marginRight:8}}>
                                        <View style={{flexDirection:'row', alignItems: 'center',marginBottom: 8,gap:8}}>
                                            <View style={styles.billIconBox}>
                                                <Icon name="file-document" size={18} color="#666" />
                                            </View>
                                            <View>
                                                <Text style={styles.billInfoLabel}>Bill No.</Text>
                                                <Text style={styles.billInfoValue}>{invoiceData.entryNo}</Text>
                                            </View>
                                        </View>
                                        <View style={{flexDirection:'row', alignItems: 'center',gap:8}}>
                                            <View style={styles.billIconBox}>
                                                <Icon name="calendar" size={18} color="#666" />
                                            </View>
                                            <View>
                                                <Text style={styles.billInfoLabel}>Date</Text>
                                                <Text style={styles.billInfoValue}>{invoiceData.date}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    
                                    {/* Customer Section */}
                                    <View style={styles.billCustomerSection}>
                                        <View style={styles.billCustomerIconBox}>
                                            <Icon name="account" size={22} color="#666" />
                                        </View>
                                        <View>
                                            <Text style={styles.billCustomerLabel}>Customer</Text>
                                            <Text style={styles.billCustomerName}>{invoiceData.customerName}</Text>
                                            <Text style={styles.billCustomerMobile}>Mobile: {invoiceData.mobile}</Text>
                                        </View>
                                    </View>
                                    
                                    {/* Items Table */}
                                    <View style={styles.billTableContainer}>
                                        <View style={styles.billTableHeader}>
                                            <Text style={[styles.billTableCell, styles.billIndexCol]}>#</Text>
                                            <Text style={[styles.billTableCell, styles.billItemCol]}>Item</Text>
                                            <Text style={[styles.billTableCell, styles.billColorCol]}>Color</Text>
                                            <Text style={[styles.billTableCell, styles.billSizeCol]}>Size</Text>
                                            <Text style={[styles.billTableCell, styles.billQtyCol]}>Qty</Text>
                                            <Text style={[styles.billTableCell, styles.billPriceCol]}>Price (₹)</Text>
                                            <Text style={[styles.billTableCell, styles.billTotalCol]}>Total (₹)</Text>
                                        </View>
                                        
                                        {invoiceData.items.map((item, index) => (
                                            <View key={index} style={styles.billTableRow}>
                                                <Text style={[styles.billTableCell, styles.billIndexCol]}>{index + 1}</Text>
                                                <Text style={[styles.billTableCell, styles.billItemCol]}>{item.product_name}</Text>
                                                <Text style={[styles.billTableCell, styles.billColorCol]}>{item.color || '-'}</Text>
                                                <Text style={[styles.billTableCell, styles.billSizeCol]}>{item.size_length || '-'}</Text>
                                                <Text style={[styles.billTableCell, styles.billQtyCol]}>{item.qty || 1}</Text>
                                                <Text style={[styles.billTableCell, styles.billPriceCol]}>{item.price?.toFixed(2)}</Text>
                                                <Text style={[styles.billTableCell, styles.billTotalCol]}>{((item.price || 0) * (item.qty || 1)).toFixed(2)}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    
                                    {/* Discount Input Section - Hidden in share mode */}
                                    {!isShareMode && (
                                        <View style={styles.discountInputSection}>
                                            {/* Point Redeem Row */}
                                            <View style={styles.discountRow}>
                                                <View style={styles.discountLabelContainer}>
                                                    <Text style={styles.discountInputLabel}>Point Redeem</Text>
                                                    <Text style={styles.availableDiscountText}> ({customerPoints[0]?.total_points || 0})</Text>
                                                </View>
                                                <View style={styles.discountInputWrapper}>
                                                    <TextInput
                                                        style={[styles.billDiscountInput, pointsError ? styles.inputError : null]}
                                                        placeholder="Enter points"
                                                        value={redeemPoints}
                                                        onChangeText={(text) => {
                                                            const availablePoints = customerPoints[0]?.total_points || 0;
                                                            const enteredPoints = parseInt(text) || 0;
                                                            if (enteredPoints > availablePoints) {
                                                                setPointsError(`Cannot exceed ${availablePoints}`);
                                                                setRedeemPoints(String(availablePoints));
                                                            } else {
                                                                setPointsError('');
                                                                setRedeemPoints(text);
                                                            }
                                                        }}
                                                        keyboardType="numeric"
                                                    />
                                                    {pointsError ? (
                                                        <Text style={styles.discountErrorText}>{pointsError}</Text>
                                                    ) : null}
                                                </View>
                                            </View>
                                            
                                            {/* Voucher Redeem Row */}
                                            <View style={styles.discountRow}>
                                                <View style={styles.discountLabelContainer}>
                                                    <Text style={styles.discountInputLabel}>Voucher Redeem</Text>
                                                    <Text style={styles.availableDiscountText}> ({customerVouchers.length || 0})</Text>
                                                </View>

                                                <View style={styles.discountInputWrapper}>
                                                    <TouchableOpacity
                                                        style={styles.voucherDropdown}
                                                        onPress={() => {
                                                            console.log('Opening voucher modal, count:', customerVouchers?.length);
                                                            setVoucherModalVisible(true);
                                                        }}
                                                        activeOpacity={0.7}
                                                    >
                                                        <Text style={selectedVoucher ? styles.dropdownSelectedText : styles.dropdownPlaceholder}>
                                                            {selectedVoucher ? (() => {
                                                                const fullText = `${selectedVoucher.voucher_name} (${selectedVoucher.amount})`;
                                                                return fullText.length > 15 ? `${fullText.substring(0, 15)}...` : fullText;
                                                            })() : 'Select Voucher'}
                                                        </Text>
                                                        <Icon name="chevron-down" size={18} color="#666" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            
                                            {/* Special Discount Row */}
                                            <View style={styles.discountRow}>
                                                <View style={styles.discountLabelContainer}>
                                                    <Text style={styles.discountInputLabel}>Special Discount</Text>
                                                </View>
                                                <View style={styles.discountInputWrapper}>
                                                    <TextInput
                                                        style={styles.billDiscountInput}
                                                        placeholder="e.g. 100 or 10%"
                                                        value={specialDiscount}
                                                        onChangeText={setSpecialDiscount}
                                                    />
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                    
                                    {/* Summary Box */}
                                    <View style={styles.billSummaryBox}>
                                        <View style={styles.billSummaryRow}>
                                            <Text style={styles.billSummaryLabel}>Subtotal</Text>
                                            <Text style={styles.billSummaryValue}>₹{invoiceData.subtotal.toFixed(2)}</Text>
                                        </View>
                                        {pointDiscount > 0 && (
                                            <View style={styles.billSummaryRow}>
                                                <Text style={styles.billSummaryLabel}>Point Discount</Text>
                                                <Text style={styles.billSummaryValue}>₹{pointDiscount.toFixed(2)}</Text>
                                            </View>
                                        )}
                                        {voucherDiscount > 0 && (
                                            <View style={styles.billSummaryRow}>
                                                <Text style={styles.billSummaryLabel}>Voucher Discount</Text>
                                                <Text style={styles.billSummaryValue}>₹{voucherDiscount.toFixed(2)}</Text>
                                            </View>
                                        )}
                                        
                                            <View style={styles.billSummaryRow}>
                                                <Text style={styles.billSummaryLabel}>Special Discount</Text>
                                                <Text style={styles.billSummaryValue}>₹{specialDiscountAmount.toFixed(2)}</Text>
                                            </View>
                                        <View style={[styles.billSummaryRow, styles.billSummaryDivider]}>
                                            <Text style={styles.billSummaryLabel}>Subtotal After Discount</Text>
                                            <Text style={styles.billSummaryValue}>₹{(invoiceData.subtotal - pointDiscount - voucherDiscount - specialDiscountAmount).toFixed(2)}</Text>
                                        </View>
                                        <View style={styles.billSummaryRow}>
                                            <Text style={styles.billSummaryLabel}>CGST (0%)</Text>
                                            <Text style={styles.billSummaryValue}>₹0.00</Text>
                                        </View>
                                        <View style={styles.billSummaryRow}>
                                            <Text style={styles.billSummaryLabel}>SGST (0%)</Text>
                                            <Text style={styles.billSummaryValue}>₹0.00</Text>
                                        </View>
                                        <View style={styles.billFinalBox}>
                                            <Text style={styles.billFinalLabel}>FINAL AMOUNT</Text>
                                            <Text style={styles.billFinalValue}>₹{calculatedFinalAmount !== null ? calculatedFinalAmount.toFixed(2) : invoiceData.finalAmount.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                    
                                    {/* Thank You Footer */}
                                    <View style={styles.billThankYouSection}>
                                        <Icon name="heart" size={16} color="#1a365d" />
                                        <Text style={styles.billThankYouText}>Thank you for shopping with us!</Text>
                                        <Text style={styles.billThankYouSubtext}>We appreciate your business.</Text>
                                    </View>
                                </ViewShot>
                            )}
                        </ScrollView>
                        
                        {/* Action Buttons */}
                        <View style={styles.invoiceButtonRow}>
                            <Button
                                mode="contained"
                                onPress={handleSaveInvoice}
                                style={[styles.invoiceActionButton, styles.saveButton]}
                                loading={loading}
                                disabled={loading}
                            >
                                Save
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleShareInvoice}
                                style={[styles.invoiceActionButton, styles.shareButton]}
                            >
                                Share
                            </Button>
                            <Button
                                mode="outlined"
                                onPress={closeInvoicePreview}
                                style={[styles.invoiceActionButton, styles.closeButton]}
                            >
                                Close
                            </Button>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Voucher Selection Modal */}
            <Modal
                visible={voucherModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setVoucherModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.voucherModalContainer}>
                        <View style={styles.voucherModalHeader}>
                            <Text style={styles.voucherModalTitle}>Select Voucher</Text>
                            <TouchableOpacity onPress={() => setVoucherModalVisible(false)}>
                                <Icon name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.voucherModalContent}>
                            <TouchableOpacity
                                style={styles.voucherModalItem}
                                onPress={() => {
                                    setSelectedVoucher(null);
                                    setVoucherModalVisible(false);
                                }}
                            >
                                <Text style={styles.voucherModalItemText}>No Voucher</Text>
                            </TouchableOpacity>
                            {customerVouchers
                                .sort((a, b) => {
                                    // Active vouchers (IsvoucherExpire: 'false') first
                                    if (a.IsvoucherExpire === 'false' && b.IsvoucherExpire === 'true') return -1;
                                    if (a.IsvoucherExpire === 'true' && b.IsvoucherExpire === 'false') return 1;
                                    return 0;
                                })
                                .map((voucher, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.voucherModalItem,
                                        voucher.IsvoucherExpire === 'true' && styles.voucherModalItemDisabled
                                    ]}
                                    onPress={() => {
                                        if (voucher.IsvoucherExpire !== 'true') {
                                            setSelectedVoucher(voucher);
                                            setVoucherModalVisible(false);
                                        }
                                    }}
                                    disabled={voucher.IsvoucherExpire === 'true'}
                                >
                                    <View style={styles.voucherModalItemContent}>
                                        <Text style={[
                                            styles.voucherModalItemText,
                                            voucher.IsvoucherExpire === 'true' && styles.voucherModalItemTextDisabled
                                        ]}>
                                            {voucher.voucher_name} - {voucher.amount}
                                        </Text>
                                        {voucher.IsvoucherExpire === 'true' && (
                                            <Text style={styles.voucherExpiredText}>Expired</Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    scrollView: {
        flex: 1,
    },
    card: {
        margin: 8,
        elevation: 2,
        backgroundColor:'white'
    },
    summaryCard: {
        backgroundColor: '#fafafa',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        backgroundColor:'white'
    },
    halfWidth: {
        flex: 1,
    },
    thirdWidth: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: '#fafafa',
    },
    mobileInputContainer: {
        position: 'relative',
    },
    mobileInput: {
        // paddingRight: 70,
    },
    loadingInput: {
        borderColor: '#4CAF50',
    },
    loadingText: {
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: [{ translateY: -8 }],
        fontSize: 11,
        color: '#4CAF50',
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
        color: '#666',
    },
    remarksInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    dropdownTrigger: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fafafa',
    },
    dropdownText: {
        fontSize: 14,
        color: '#333',
    },
    placeholder: {
        fontSize: 14,
        color: '#999',
    },
    searchRow: {
        flexDirection: 'row',
        gap: 8,
    },
    searchInput: {
        flex: 1,
    },
    searchButton: {
        justifyContent: 'center',
        backgroundColor: '#deb307',
    },
    cameraButton: {
        justifyContent: 'center',
        backgroundColor: '#6395a9',
    },
    searchResults: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
        maxHeight: 200,
    },
    searchResultItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fafafa',
    },
    productInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    productDetails: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    productMeta: {
        fontSize: 11,
        color: '#999',
        marginTop: 2,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    noDataBox: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 20,
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 14,
        color: '#666',
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    cartItemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
    },
    cartItemImagePlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartItemInfo: {
        flex: 1,
    },
    cartItemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    cartItemCode: {
        fontSize: 12,
        color: '#666',
    },
    qtyDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    qtyLabel: {
        fontSize: 13,
        color: '#666',
    },
    qtyText: {
        fontSize: 16,
        fontWeight: 'bold',
        paddingHorizontal: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartItemModal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        width: '80%',
        maxWidth: 350,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
        color: '#333',
    },
    modalContent: {
        alignItems: 'center',
    },
    modalProductImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
        marginBottom: 12,
    },
    modalProductName: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        color: '#333',
        marginBottom: 4,
    },
    modalProductCode: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    qtyUpdateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
    },
    modalQtyText: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingHorizontal: 20,
        color: '#333',
    },
    modalPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#4CAF50',
    },
    modalButtonRow: {
        marginTop: 20,
    },
    modalDoneButton: {
        backgroundColor: '#4DB6AC',
    },
    modalProductMeta: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    variantsSection: {
        width: '100%',
        marginTop: 16,
        maxHeight: 200,
    },
    variantsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    variantsList: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 8,
    },
    variantItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff',
    },
    variantItemSelected: {
        backgroundColor: '#E3F2FD',
        borderLeftWidth: 3,
        borderLeftColor: '#2196F3',
    },
    variantInfo: {
        flex: 1,
    },
    variantCode: {
        fontSize: 13,
        fontWeight: '500',
        color: '#333',
    },
    variantDetails: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    variantQtyPriceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    variantQtyInput: {
        width: 50,
        height: 35,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        textAlign: 'center',
        fontSize: 10,
        backgroundColor: '#fff',
    },
    variantPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4CAF50',
        minWidth: 50,
        textAlign: 'right',
    },
    itemTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginHorizontal: 10,
    },
    divider: {
        marginVertical: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    buttonRow: {
        flexDirection: 'row',
        padding: 12,
        paddingBottom: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        gap: 12,
    },
    actionButton: {
        flex: 1,
    },
    checkoutButton: {
        backgroundColor: "#28a745",
    },
    // Invoice Preview Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    invoiceModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '100%',
        maxHeight: '90%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    invoiceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    invoiceTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    invoiceContent: {
        maxHeight: '70%',
    },
    invoiceBody: {
        padding: 16,
        backgroundColor: '#ffffff',
    },
    companySection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    companyAddress: {
        fontSize: 12,
        color: '#666',
    },
    companyMobile: {
        fontSize: 12,
        color: '#666',
    },
    companyGst: {
        fontSize: 12,
        color: '#666',
    },
    invoiceDivider: {
        marginVertical: 12,
    },
    customerSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    customerLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    customerMobile: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    entryInfo: {
        alignItems: 'flex-end',
    },
    entryNo: {
        fontSize: 12,
        color: '#333',
    },
    entryDate: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    tableContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 16,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f5f5f5',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tableCell: {
        fontSize: 12,
        paddingHorizontal: 4,
    },
    productCol: {
        flex: 2,
    },
    colorCol: {
        flex: 1.5,
    },
    qtyCol: {
        flex: 0.8,
        textAlign: 'center',
    },
    sizeCol: {
        flex: 1,
        textAlign: 'center',
    },
    priceCol: {
        flex: 1.2,
        textAlign: 'right',
    },
    totalCol: {
        flex: 1.2,
        textAlign: 'right',
    },
    summarySection: {
        marginTop: 8,
    },
    finalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    finalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    finalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4DB6AC',
    },
    invoiceButtonRow: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        gap: 8,
    },
    invoiceActionButton: {
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#26A69A',
    },
    shareButton: {
        backgroundColor: '#42A5F5',
    },
    closeButton: {
        borderColor: '#999',
    },
    discountSection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    discountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        marginRight: 12,
        justifyContent: 'space-between',
    },
    discountLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    discountInputWrapper: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        minWidth: 160,
    },
    discountLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    availableText: {
        fontSize: 12,
        color: '#E53935',
        marginLeft: 4,
        fontWeight: '500',
    },
    inputWithError: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    discountInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 13,
        backgroundColor: '#fafafa',
        width: 160,
        textAlign: 'left',
    },
    inputError: {
        borderColor: '#E53935',
        backgroundColor: '#FFEBEE',
    },
    errorText: {
        fontSize: 11,
        color: '#E53935',
        marginTop: 4,
        width: 160,
    },
    discountDropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: '#fafafa',
        width: 160,
    },
    calculationSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    billLogoContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: '#1a365d',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    billHeaderText: {
        flex: 1,
    },
    billCompanyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a365d',
        letterSpacing: 0.5,
    },
    billCompanyAddress: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    billContactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,

    },
    billCompanyPhone: {
        fontSize: 11,
        color: '#666',
    },
    billCompanyGst: {
        fontSize: 11,
        color: '#666',
    },
    billIconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    billInfoLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        fontWeight: 'bold',
    },
    billInfoValue: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    billCustomerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    billCustomerIconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    billCustomerLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        fontWeight: 'bold',
    },
    billCustomerName: {
        fontSize: 12,
        color: '#333',
        marginTop: 2,
        color: '#666',
    },
    billCustomerMobile: {
        fontSize: 12,
        color: '#666',
        marginTop: 1,
    },
    billTableContainer: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
    },
    billTableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    billTableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    billTableCell: {
        fontSize: 12,
        paddingHorizontal: 6,
        color: '#333',
    },
    billIndexCol: {
        width: 30,
        textAlign: 'center',
    },
    billItemCol: {
        flex: 2,
    },
    billColorCol: {
        flex: 1.5,
    },
    billSizeCol: {
        flex: 1,
        textAlign: 'center',
    },
    billQtyCol: {
        flex: 0.8,
        textAlign: 'center',
    },
    billPriceCol: {
        flex: 1.2,
        textAlign: 'right',
    },
    billTotalCol: {
        flex: 1.2,
        textAlign: 'right',
    },
    billDiscountInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        // paddingHorizontal: 10,
        // paddingVertical: 6,
        fontSize: 12,
        backgroundColor: '#fafafa',
        width: 120,
        textAlign: 'center',
        minWidth:140,
    },
    voucherDropdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#fafafa',
        width: 120,
        textAlign: 'center',
        minWidth: 140,
    },
    dropdownSelectedText: {
        fontSize: 12,
        color: '#333',
    },
    dropdownPlaceholder: {
        fontSize: 12,
        color: '#999',
    },
    billSummaryBox: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    billSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    billSummaryLabel: {
        fontSize: 13,
        color: '#555',
    },
    billSummaryValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    billSummaryDivider: {
        marginTop: 6,
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        borderStyle: 'dashed',
    },
    billFinalBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1a365d',
        borderRadius: 6,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginTop: 10,
    },
    billFinalLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
    },
    billFinalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    billThankYouSection: {
        alignItems: 'center',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    billThankYouText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a365d',
        marginTop: 6,
    },
    billThankYouSubtext: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    voucherModalContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 20,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    voucherModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    voucherModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    voucherModalContent: {
        padding: 8,
    },
    voucherModalItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        minWidth:'100%'
    },
    voucherModalItemDisabled: {
        opacity: 0.5,
        backgroundColor: '#f5f5f5',
    },
    voucherModalItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    voucherModalItemText: {
        fontSize: 16,
        color: '#333',
    },
    voucherModalItemTextDisabled: {
        color: '#999',
    },
    voucherExpiredText: {
        fontSize: 12,
        color: '#ff4444',
        fontWeight: 'bold',
    },
});

export default NewSale;
