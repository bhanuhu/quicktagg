import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Alert,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image,
    Modal,
} from 'react-native';
import {
    Text,
    Button,
    IconButton,
    Card,
    Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStyles from '../../Styles/MyStyles';
import { postRequest, uploadImage } from '../../Services/RequestServices';
import Loading from '../../Components/Loading';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import TitleBar from '../../Components/TitleBar';

const CheckoutPage = (props) => {
    const { userToken, branchId, checkoutPayload, invoiceData, customerVouchers, customerPoints, branchDetails } = props.route.params || {};
    
    // Debug logs
    console.log('CheckoutPage - Props received:', {
        userToken: userToken ? 'present' : 'missing',
        branchId,
        hasCheckoutPayload: !!checkoutPayload,
        hasInvoiceData: !!invoiceData,
        customerVouchersCount: customerVouchers?.length || 0,
        customerPointsCount: customerPoints?.length || 0,
        hasBranchDetails: !!branchDetails
    });
    
    console.log('CheckoutPage - Customer Vouchers:', customerVouchers);
    console.log('CheckoutPage - Customer Points:', customerPoints);
    
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        customerName: invoiceData?.customerName || '',
        mobile: invoiceData?.mobile || '',
        entryNo: invoiceData?.entryNo || '',
    });
    
    // Discount/payment state
    const [redeemPoints, setRedeemPoints] = useState('');
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [specialDiscount, setSpecialDiscount] = useState('');
    const [pointsError, setPointsError] = useState('');
    const [voucherModalVisible, setVoucherModalVisible] = useState(false);
    
    // Debug modal state changes
    useEffect(() => {
        console.log('Voucher modal visible state changed:', voucherModalVisible);
    }, [voucherModalVisible]);

    // Handle triggerCheckoutBackReset from TitleBar
    useEffect(() => {
        if (props.route.params?.triggerCheckoutBackReset) {
            console.log('Triggering checkout back reset from TitleBar');
            handleBack();
            // Clear the trigger flag
            const routeParams = props.route.params;
            delete routeParams.triggerCheckoutBackReset;
        }
    }, [props.route.params?.triggerCheckoutBackReset]);
    
    // Calculated discount values
    const [pointDiscount, setPointDiscount] = useState(0);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [specialDiscountAmount, setSpecialDiscountAmount] = useState(0);
    const [calculatedFinalAmount, setCalculatedFinalAmount] = useState(null);
    
    // Share mode - hides input fields when capturing for share
    const [isShareMode, setIsShareMode] = useState(false);
    
    // Ref for capturing invoice image
    const viewShotRef = useRef(null);

    // Function to clear all fields
    const clearCheckoutFields = () => {
        setRedeemPoints('');
        setSelectedVoucher(null);
        setSpecialDiscount('');
        setPointsError('');
        setPointDiscount(0);
        setVoucherDiscount(0);
        setSpecialDiscountAmount(0);
        setCalculatedFinalAmount(null);
    };

    // Handle back navigation and clear fields
    const handleBack = () => {
        clearCheckoutFields();
        props.navigation.goBack();
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
                // If points are being redeemed, call the point redeem API
                const pointsToRedeem = parseInt(redeemPoints) || 0;
                if (pointsToRedeem > 0) {
                    console.log('Redeeming points:', pointsToRedeem);
                    
                    const pointRedeemPayload = {
                        branch_id: branchId,
                        customer_id: customerPoints[0]?.customer_id || checkoutPayload.customer_id || 0,
                        full_name: formData.customerName,
                        mobile: formData.mobile,
                        redeemPoint: pointsToRedeem.toString(),
                        remark: "Point redeem from retailer",
                        staff_id: checkoutPayload.staff_id || ""
                    };
                    console.log("payload", pointRedeemPayload)
                    const pointRedeemResp = await postRequest(
                        'customervisit/insertPointRedeem02',
                        pointRedeemPayload,
                        userToken
                    );

                    console.log('Point redeem response:', pointRedeemResp);
                }

                // If voucher is being used, call the voucher redeem API
                if (selectedVoucher && selectedVoucher.voucher_id) {
                    console.log('Redeeming voucher:', selectedVoucher.voucher_name);
                    
                    const voucherRedeemPayload = {
                        customer_id: customerPoints[0]?.customer_id || checkoutPayload.customer_id || 0,
                        tran_id: selectedVoucher.tran_id,
                        voucher_id: selectedVoucher.voucher_id
                    };

                    const voucherRedeemResp = await postRequest(
                        'customervisit/insertVoucherRedeem',
                        voucherRedeemPayload,
                        userToken
                    );

                    console.log('Voucher redeem response:', voucherRedeemResp);
                }
                // Calculate totals for uploadBill
                const subtotal = invoiceData.subtotal;
                const finalAmount = calculatedFinalAmount !== null ? calculatedFinalAmount : subtotal;
                const subtotalAfterDiscount = subtotal - pointDiscount - voucherDiscount - specialDiscountAmount;
                
                // Prepare uploadBill FormData
                const billFormData = new FormData();
                console.log("Form Data", formData)
                // Add other fields - all values must be strings
                billFormData.append('customer_name', String(formData.customerName || ''));
                billFormData.append('mobile', String(formData.mobile || ''));
                billFormData.append('branch', String(branchId || '2060'));
                billFormData.append('entry_no', String(invoiceData.entryNo || ''));
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
                billFormData.append('staff_id', String(checkoutPayload.staff_id || '3078'));

                console.log('UploadBill FormData:', billFormData);

                // Call uploadBill API
                const uploadResp = await uploadImage(
                    'transactions/uploadBill',
                    billFormData,
                    userToken
                );

                console.log('UploadBill response:', uploadResp);

                setLoading(false);
                // Clear checkout fields before navigation
                clearCheckoutFields();
                
                Alert.alert(
                    'Success', 
                    'Sale created successfully!\nEntry No: ' + invoiceData.entryNo,
                    [
                        { 
                            text: 'OK', 
                            onPress: () => {
                                // Navigate to NewSale first to trigger reset, then to Dashboard
                                props.navigation.navigate('NewSale', {
                                    userToken,
                                    branchId,
                                    resetNewSale: true,
                                    navigateToDashboard: true // Flag to navigate to Dashboard after reset
                                });
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

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                {invoiceData && (
                    <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }} style={styles.invoiceBody}>
                        {/* Header with Logo */}
                        <View style={styles.billHeader}>
                            <View style={styles.billLogoContainer}>
                                <Icon name="shopping" size={28} color="#1a365d" />
                            </View>
                            <View style={styles.billHeaderText}>
                                <Text style={styles.billCompanyName}>{(branchDetails?.brand_name || 'COMPANY NAME').toUpperCase()}</Text>
                                <Text style={styles.billCompanyAddress}>{branchDetails?.address || ''}</Text>
                                <View style={styles.billContactRow}>
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
                                        <Text style={styles.availableDiscountText}> ({customerVouchers?.length || 0})</Text>
                                    </View>
                                    <View style={styles.discountInputWrapper}>
                                        <TouchableOpacity
                                            style={[
                                                styles.voucherDropdown,
                                                (!customerVouchers || customerVouchers.length === 0) && styles.voucherDropdownDisabled
                                            ]}
                                            onPress={() => {
                                                if (customerVouchers && customerVouchers.length > 0) {
                                                    console.log('Voucher dropdown pressed - vouchers available:', customerVouchers?.length || 0);
                                                    console.log('Voucher data:', customerVouchers);
                                                    setVoucherModalVisible(true);
                                                }
                                            }}
                                            activeOpacity={0.7}
                                            disabled={!customerVouchers || customerVouchers.length === 0}
                                        >
                                            <Text style={[
                                                selectedVoucher ? styles.dropdownSelectedText : styles.dropdownPlaceholder,
                                                (!customerVouchers || customerVouchers.length === 0) && styles.dropdownTextDisabled
                                            ]}>
                                                {(!customerVouchers || customerVouchers.length === 0) 
                                                    ? 'No vouchers' 
                                                    : selectedVoucher 
                                                        ? (() => {
                                                            const fullText = `${selectedVoucher.voucher_name} (${selectedVoucher.amount})`;
                                                            return fullText.length > 15 ? `${fullText.substring(0, 35)}...` : fullText;
                                                        })() 
                                                        : 'Select Voucher'
                                                }
                                            </Text>
                                            <Icon 
                                                name="chevron-down" 
                                                size={18} 
                                                color={(!customerVouchers || customerVouchers.length === 0) ? '#ccc' : '#666'} 
                                            />
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
            <View style={styles.buttonRow}>
                <Button
                    mode="contained"
                    onPress={handleSaveInvoice}
                    style={[styles.actionButton, styles.saveButton, {borderRadius:6}]}
                    loading={loading}
                    disabled={loading}
                >
                    Save
                </Button>
                <Button
                    mode="contained"
                    onPress={handleShareInvoice}
                    style={[styles.actionButton, styles.shareButton, {borderRadius:6}]}
                >
                    Share
                </Button>
            </View>

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
                            {customerVouchers && customerVouchers.length > 0 && 
                                customerVouchers
                                    .sort((a, b) => {
                                        // Active vouchers (IsvoucherExpire: 'false') first
                                        if (a.IsvoucherExpire === 'false' && b.IsvoucherExpire === 'true') return -1;
                                        if (a.IsvoucherExpire === 'true' && b.IsvoucherExpire === 'false') return 1;
                                        return 0;
                                    })
                                    .map((voucher, index) => (
                                        <TouchableOpacity
                                            key={voucher.voucher_id || index}
                                            style={[
                                                styles.voucherModalItem,
                                                voucher.IsvoucherExpire === 'true' && styles.voucherModalItemDisabled
                                            ]}
                                            onPress={() => {
                                                console.log('Voucher selected:', voucher.voucher_name);
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
                                    ))
                            }
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {loading && <Loading />}
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
    invoiceBody: {
        backgroundColor: '#fff',
        margin: 12,
        padding: 16,
        borderRadius: 8,
        elevation: 2,
    },
    billHeader: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    billLogoContainer: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    billHeaderText: {
        flex: 1,
    },
    billCompanyName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a365d',
        marginBottom: 4,
    },
    billCompanyAddress: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    billContactRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    billCompanyGst: {
        fontSize: 11,
        color: '#666',
        fontStyle: 'italic',
    },
    invoiceDivider: {
        marginVertical: 12,
        backgroundColor: '#e0e0e0',
    },
    billIconBox: {
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: '#f8f9fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    billInfoLabel: {
        fontSize: 11,
        color: '#666',
        marginBottom: 2,
    },
    billInfoValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    billCustomerSection: {
        flexDirection: 'row',
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    billCustomerIconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#e9ecef',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    billCustomerLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    billCustomerName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    billCustomerMobile: {
        fontSize: 12,
        color: '#666',
    },
    billTableContainer: {
        marginBottom: 16,
    },
    billTableHeader: {
        flexDirection: 'row',
        backgroundColor: '#1a365d',
        paddingVertical: 8,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    billTableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        paddingVertical: 8,
    },
    billTableCell: {
        fontSize: 11,
        color: '#333',
        paddingHorizontal: 4,
    },
    billIndexCol: {
        width: 30,
        textAlign: 'center',
    },
    billItemCol: {
        flex: 2,
    },
    billColorCol: {
        width: 50,
    },
    billSizeCol: {
        width: 50,
    },
    billQtyCol: {
        width: 40,
        textAlign: 'center',
    },
    billPriceCol: {
        width: 60,
        textAlign: 'right',
    },
    billTotalCol: {
        width: 60,
        textAlign: 'right',
        fontWeight: '600',
    },
    discountInputSection: {
        marginBottom: 16,
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
    },
    discountRow: {
        marginBottom: 12,
    },
    discountLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    discountInputLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    availableDiscountText: {
        fontSize: 11,
        color: '#666',
        marginLeft: 4,
    },
    discountInputWrapper: {
        position: 'relative',
    },
    billDiscountInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: '#dc3545',
    },
    discountErrorText: {
        color: '#dc3545',
        fontSize: 11,
        marginTop: 4,
    },
    voucherDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#fff',
    },
    dropdownPlaceholder: {
        color: '#999',
        fontSize: 14,
    },
    dropdownSelectedText: {
        color: '#333',
        fontSize: 14,
    },
    billSummaryBox: {
        marginBottom: 16,
    },
    billSummaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    billSummaryDivider: {
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        paddingTop: 12,
        marginTop: 6,
    },
    billSummaryLabel: {
        fontSize: 13,
        color: '#666',
    },
    billSummaryValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    billFinalBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1a365d',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 6,
        marginTop: 8,
    },
    billFinalLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    billFinalValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    billThankYouSection: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    billThankYouText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a365d',
        marginTop: 8,
        textAlign: 'center',
    },
    billThankYouSubtext: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        gap: 8,
    },
    actionButton: {
        flex: 1,
    },
    saveButton: {
        backgroundColor: '#28a745',
    },
    shareButton: {
        backgroundColor: "#ffba3c",
    },
    cancelButton: {
        borderColor: '#6c757d',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
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
        overflow: 'hidden',
    },
    voucherModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor:"#ffba3c",
    },
    voucherModalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'black',
    },
    voucherModalContent: {
        flex: 1,
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

export default CheckoutPage;
