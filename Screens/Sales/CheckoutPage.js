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
    Platform,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.route.params?.triggerCheckoutBackReset]);

    // Calculated discount values
    const [pointDiscount, setPointDiscount] = useState(0);
    const [voucherDiscount, setVoucherDiscount] = useState(0);
    const [specialDiscountAmount, setSpecialDiscountAmount] = useState(0);
    const [calculatedFinalAmount, setCalculatedFinalAmount] = useState(null);
    const [cgstAmount, setCgstAmount] = useState(0);
    const [sgstAmount, setSgstAmount] = useState(0);
    const [igstAmount, setIgstAmount] = useState(0);
    const [subtotalAfterDiscountsState, setSubtotalAfterDiscountsState] = useState(0);
    const [subtotalBeforeTax, setSubtotalBeforeTax] = useState(0);

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
        setCgstAmount(0);
        setSgstAmount(0);
        setIgstAmount(0);
        setSubtotalAfterDiscountsState(0);
        setSubtotalBeforeTax(0);
    };

    // Handle back navigation and clear fields
    const handleBack = () => {
        clearCheckoutFields();
        props.navigation.goBack();
    };

    const calculateBillSummary = () => {
        if (!invoiceData) return null;

        const subtotalRaw = invoiceData.subtotal || 0;
        const points = parseInt(redeemPoints) || 0;

        let voucherAmount = 0;
        if (selectedVoucher && selectedVoucher.amount) {
            const amountStr = selectedVoucher.amount.toString();
            const match = amountStr.match(/[\d.]+/);
            if (match) {
                const numericValue = parseFloat(match[0]);
                if (amountStr.includes('%')) {
                    voucherAmount = (numericValue / 100) * subtotalRaw;
                } else {
                    voucherAmount = numericValue;
                }
            }
        }

        let specialDisc = 0;
        if (specialDiscount) {
            const discountStr = specialDiscount.trim();
            if (discountStr.endsWith('%')) {
                const percentage = parseFloat(discountStr) || 0;
                specialDisc = (subtotalRaw * percentage) / 100;
            } else {
                specialDisc = parseFloat(discountStr) || 0;
            }
        }

        const totalDiscount = points + voucherAmount + specialDisc;

        const productsList = invoiceData.items || [];
        const gstPercent = productsList.length > 0 ? Number(productsList[0].gst) || 0 : 0;
        const halfGst = gstPercent / 2;

        let subtotal = subtotalRaw;
        let subtotalAfterDiscounts = 0;
        let cgst = 0;
        let sgst = 0;
        let igst = 0;
        let finalAmount = 0;

        if (branchDetails?.gst_type === 'Inclusive') {
            finalAmount = Math.max(0, subtotalRaw - totalDiscount);
            const totalTax = finalAmount - (finalAmount / (1 + gstPercent / 100));
            subtotal = subtotalRaw / (1 + gstPercent / 100);
            subtotalAfterDiscounts = finalAmount - totalTax;

            if (branchDetails?.gst_mode === 'IGST') {
                igst = totalTax;
            } else {
                cgst = totalTax / 2;
                sgst = totalTax / 2;
            }
        } else {
            subtotalAfterDiscounts = Math.max(0, subtotalRaw - totalDiscount);
            if (branchDetails?.gst_mode === 'IGST') {
                igst = subtotalAfterDiscounts * (gstPercent / 100);
            } else {
                cgst = subtotalAfterDiscounts * (halfGst / 100);
                sgst = subtotalAfterDiscounts * (halfGst / 100);
            }
            finalAmount = subtotalAfterDiscounts + igst + cgst + sgst;
        }

        return {
            subtotal,
            pointDiscount: points,
            voucherDiscount: voucherAmount,
            specialDiscount: specialDisc,
            subtotalAfterDiscounts,
            cgst,
            sgst,
            igst,
            finalAmount,
        };
    };

    // Calculate all discounts based on inputs
    const calculateDiscounts = (subtotal) => {
        const summary = calculateBillSummary();
        if (summary) {
            setPointDiscount(summary.pointDiscount);
            setVoucherDiscount(summary.voucherDiscount);
            setSpecialDiscountAmount(summary.specialDiscount);
            setCgstAmount(summary.cgst);
            setSgstAmount(summary.sgst);
            setIgstAmount(summary.igst);
            setSubtotalAfterDiscountsState(summary.subtotalAfterDiscounts);
            setSubtotalBeforeTax(summary.subtotal);
            setCalculatedFinalAmount(summary.finalAmount);

            return {
                points: summary.pointDiscount,
                voucherAmount: summary.voucherDiscount,
                specialDisc: summary.specialDiscount,
                final: summary.finalAmount
            };
        }
        return { points: 0, voucherAmount: 0, specialDisc: 0, final: subtotal };
    };

    // Recalculate discounts when inputs change
    useEffect(() => {
        if (invoiceData) {
            calculateDiscounts(invoiceData.subtotal);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

                // ✅ 1. Calculate Final Summary (Single Source of Truth)
                const summary = calculateBillSummary();
                if (!summary) {
                    setLoading(false);
                    Alert.alert('Error', 'Calculation error!');
                    return;
                }

                const {
                    subtotal,
                    pointDiscount,
                    voucherDiscount,
                    specialDiscount: specialDiscountAmt,
                    subtotalAfterDiscounts,
                    cgst,
                    sgst,
                    igst,
                    finalAmount,
                } = summary;

                const productsList = invoiceData?.items || [];
                const gstPercent = productsList.length > 0 ? Number(productsList[0].gst) || 0 : 0;
                const halfGst = gstPercent / 2;

                // ✅ 2. Generate Product Rows
                const productRows = productsList
                    .map((p, index) => {
                        const priceWithGST = Number(p.price) || 0;
                        const itemGstPercent = Number(p.gst) || 0;
                        const priceWithoutGST =
                            branchDetails?.gst_type === "Inclusive"
                                ? priceWithGST / (1 + itemGstPercent / 100)
                                : priceWithGST;

                        const total = priceWithoutGST * Number(p.qty || 0);

                        return `
                        <tr class="invoice-row">
                            <td class="index-col">${index + 1}</td>
                            <td class="item-col">${p.product_name || "-"}</td>
                            <td>${p.color || "-"}</td>
                            <td>${p.size_length || p.size || "-"}</td>
                            <td>${p.qty || 1}</td>
                            <td class="money">${priceWithoutGST.toFixed(2)}</td>
                            <td class="money">${total.toFixed(2)}</td>
                        </tr>
                        `;
                    })
                    .join("");

                // ✅ 3. Build Styled Invoice HTML
                const htmlContent = `
                <style>
                    .invoice-print-shell {
                    width: 390px;
                    box-sizing: border-box;
                    padding: 18px;
                    background: #ffffff;
                    color: #1f2937;
                    font-family: Arial, sans-serif;
                    font-size: 13px;
                    overflow: hidden;
                    }
                    .invoice-header {
                    display: block;
                    }
                    .invoice-logo {
                    width: 58px;
                    height: 58px;
                    border-radius: 50%;
                    border: 2px solid #1a365d;
                    background: #ffffff;
                    color: #1a365d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 10px;
                    }
                    .bag-icon {
                    position: relative;
                    width: 26px;
                    height: 22px;
                    border-radius: 3px;
                    background: #1a365d;
                    display: block;
                    }
                    .bag-icon::before {
                    content: "";
                    position: absolute;
                    left: 7px;
                    top: -8px;
                    width: 12px;
                    height: 12px;
                    border: 3px solid #1a365d;
                    border-bottom: 0;
                    border-radius: 12px 12px 0 0;
                    }
                    .invoice-header h1 {
                    margin: 0;
                    color: #1a365d;
                    font-size: 20px;
                    font-weight: 900;
                    letter-spacing: 0;
                    line-height: 1.25;
                    }
                    .invoice-header p {
                    margin: 4px 0 0;
                    color: #555555;
                    font-size: 14px;
                    font-weight: 500;
                    line-height: 1.35;
                    }
                    .divider {
                    height: 1px;
                    background: #dcdcdc;
                    margin: 16px 0 14px;
                    }
                    .info-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 18px;
                    margin-bottom: 12px;
                    }
                    .info-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-sizing: border-box;
                    min-height: 44px;
                    }
                    .info-card {
                    flex: 1 1 0;
                    width: auto;
                    }
                    .customer-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-sizing: border-box;
                    margin-bottom: 12px;
                    width: 100%;
                    }
                    .info-icon,
                    .customer-icon {
                    width: 40px;
                    height: 40px;
                    border: 1px solid #d8d8d8;
                    border-radius: 10px;
                    background: #ffffff;
                    color: #666666;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex: 0 0 40px;
                    position: relative;
                    }
                    .doc-icon::before {
                    content: "";
                    width: 16px;
                    height: 20px;
                    border: 2px solid #666;
                    border-radius: 2px;
                    box-sizing: border-box;
                    }
                    .doc-icon::after {
                    content: "";
                    position: absolute;
                    width: 9px;
                    height: 2px;
                    background: #666;
                    top: 22px;
                    left: 15px;
                    box-shadow: 0 -5px 0 #666;
                    }
                    .calendar-icon::before {
                    content: "";
                    width: 20px;
                    height: 18px;
                    border: 2px solid #666;
                    border-radius: 2px;
                    box-sizing: border-box;
                    box-shadow: inset 0 5px 0 #666;
                    }
                    .person-icon::before {
                    content: "";
                    position: absolute;
                    top: 10px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #666;
                    }
                    .person-icon::after {
                    content: "";
                    position: absolute;
                    bottom: 8px;
                    width: 22px;
                    height: 10px;
                    border-radius: 12px 12px 2px 2px;
                    background: #666;
                    }
                    label {
                    display: block;
                    color: #555555;
                    font-size: 16px;
                    font-weight: 800;
                    margin-bottom: 3px;
                    }
                    .info-card strong,
                    .customer-card strong {
                    display: block;
                    color: #555555;
                    font-size: 14px;
                    font-weight: 500;
                    line-height: 1.25;
                    }
                    .info-card strong {
                    font-size: 15px;
                    }
                    .customer-card p {
                    margin: 2px 0 0;
                    color: #555555;
                    font-size: 14px;
                    font-weight: 500;
                    }
                    .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid #dddddd;
                    border-radius: 8px;
                    overflow: hidden;
                    margin: 14px 0 20px;
                    table-layout: fixed;
                    }
                    .invoice-table th {
                    background: #f6f7f9;
                    color: #333333;
                    font-size: 13px;
                    font-weight: 500;
                    padding: 10px 6px;
                    text-align: center;
                    border-bottom: 1px solid #dddddd;
                    line-height: 1.25;
                    }
                    .invoice-table td {
                    color: #333333;
                    font-size: 13px;
                    font-weight: 500;
                    padding: 12px 6px;
                    border-bottom: 1px solid #eeeeee;
                    vertical-align: top;
                    line-height: 1.25;
                    word-break: break-word;
                    text-align: center;
                    }
                    .invoice-table tr:last-child td {
                    border-bottom: 0;
                    }
                    .index-col {
                    width: 28px;
                    text-align: center !important;
                    }
                    .item-col {
                    width: 72px;
                    text-align: left !important;
                    }
                    .money {
                    text-align: right;
                    }
                    .summary-box {
                    width: 100%;
                    border: 1px solid #dddddd;
                    border-radius: 8px;
                    background: #f8f8f8;
                    padding: 16px 20px;
                    box-sizing: border-box;
                    }
                    .summary-row,
                    .final-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 12px;
                    color: #444444;
                    font-size: 15px;
                    font-weight: 500;
                    padding: 6px 0;
                    }
                    .summary-row strong {
                    color: #222222;
                    font-weight: 500;
                    }
                    .divider-row {
                    border-top: 1px dashed #dddddd;
                    margin-top: 6px;
                    padding-top: 12px;
                    }
                    .final-row {
                    align-items: center;
                    margin-top: 14px;
                    padding: 18px;
                    border-radius: 8px;
                    background: #1a365d;
                    color: #ffffff;
                    font-size: 17px;
                    font-weight: 900;
                    }
                    .final-row strong {
                    color: #ffffff;
                    font-size: 18px;
                    font-weight: 900;
                    }
                    .footer-divider {
                    height: 1px;
                    background: #dddddd;
                    margin: 20px 0;
                    }
                    .thank-you {
                    margin-top: 0;
                    text-align: center;
                    color: #1a365d;
                    }
                    .heart-icon {
                    font-size: 18px;
                    line-height: 1;
                    margin-bottom: 10px;
                    }
                    .thank-you strong,
                    .thank-you span {
                    display: block;
                    }
                    .thank-you strong {
                    font-size: 16px;
                    font-weight: 500;
                    }
                    .thank-you span {
                    margin-top: 7px;
                    color: #666666;
                    font-size: 13px;
                    font-weight: 500;
                    }
                </style>
                <div class="invoice-print-shell">
                    <div class="invoice-header">
                    <div class="invoice-logo"><span class="bag-icon"></span></div>
                    <div>
                        <h1>${(branchDetails?.brand_name || branchDetails?.bill_describe || "COMPANY NAME").toUpperCase()}</h1>
                        <p>${branchDetails?.address || ""}</p>
                        <p>GST: ${branchDetails?.gst_number || "-"}</p>
                    </div>
                    </div>

                    <div class="divider"></div>

                    <div class="info-row">
                    <div class="info-card">
                        <span class="info-icon doc-icon"></span>
                        <div>
                        <label>Bill No.</label>
                        <strong>${invoiceData.entryNo || checkoutPayload.entry_no || "-"}</strong>
                        </div>
                    </div>
                    <div class="info-card">
                        <span class="info-icon calendar-icon"></span>
                        <div>
                        <label>Date</label>
                        <strong>${invoiceData.date || new Date().toLocaleDateString("en-GB")}</strong>
                        </div>
                    </div>
                    </div>

                    <div class="customer-card">
                    <span class="customer-icon person-icon"></span>
                    <div>
                        <label>Customer</label>
                        <strong>${invoiceData.customerName || "-"}</strong>
                        <p>Mobile: ${invoiceData.mobile || "-"}</p>
                    </div>
                    </div>

                    <table class="invoice-table">
                    <thead>
                        <tr>
                        <th class="index-col">#</th>
                        <th class="item-col">Item</th>
                        <th>Color</th>
                        <th>Size</th>
                        <th>Qty</th>
                        <th>Price (₹)</th>
                        <th>Total (₹)</th>
                        </tr>
                    </thead>
                    <tbody>${productRows}</tbody>
                    </table>

                    <div class="summary-box">
                    <div class="summary-row"><span>Subtotal</span><strong>₹${subtotal.toFixed(2)}</strong></div>
                    ${pointDiscount > 0 ? `<div class="summary-row"><span>Point Discount</span><strong>₹${pointDiscount.toFixed(2)}</strong></div>` : ""}
                    ${voucherDiscount > 0 ? `<div class="summary-row"><span>Voucher Discount</span><strong>₹${voucherDiscount.toFixed(2)}</strong></div>` : ""}
                    ${specialDiscountAmt > 0 ? `<div class="summary-row"><span>Special Discount</span><strong>₹${specialDiscountAmt.toFixed(2)}</strong></div>` : ""}
                        ${pointDiscount === 0 && voucherDiscount === 0 && specialDiscountAmt === 0
                        ? "" : `<div class="summary-row divider-row"><span>Subtotal After Discount</span><strong>₹${subtotalAfterDiscounts.toFixed(2)}</strong></div>`
                    }
                    ${branchDetails?.gst_mode === "IGST"
                        ? igst === 0 ? "" : `<div class="summary-row"><span>IGST (${gstPercent.toFixed(2)}%)</span><strong>₹${igst.toFixed(2)}</strong></div>`
                        : cgst === 0 && sgst === 0 ? "" : `
                            <div class="summary-row"><span>CGST (${halfGst.toFixed(2)}%)</span><strong>₹${cgst.toFixed(2)}</strong></div>
                            <div class="summary-row"><span>SGST (${halfGst.toFixed(2)}%)</span><strong>₹${sgst.toFixed(2)}</strong></div>
                        `
                    }
                    <div class="final-row"><span>FINAL AMOUNT</span><strong>₹${finalAmount.toFixed(2)}</strong></div>
                    </div>

                    <div class="footer-divider"></div>
                    <div class="thank-you">
                    <div class="heart-icon">♥</div>
                    <strong>Thank you for shopping with us!</strong>
                    <span>We appreciate your business.</span>
                    </div>
                </div>
                `;

                // ✅ 7. Upload to Server (HTML only)
                const billFormData = new FormData();
                billFormData.append('invoice_html', htmlContent);

                console.log('UploadBill FormData:', JSON.stringify(billFormData));

                // Call uploadBill API
                const uploadResp = await uploadImage(
                    'transactions/customer/uploadBill',
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

    const productsList = invoiceData?.items || [];
    const gstPercent = productsList.length > 0 ? Number(productsList[0].gst) || 0 : 0;
    const halfGst = gstPercent / 2;

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
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginRight: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                                <View style={styles.billIconBox}>
                                    <Icon name="file-document" size={18} color="#666" />
                                </View>
                                <View>
                                    <Text style={styles.billInfoLabel}>Bill No.</Text>
                                    <Text style={styles.billInfoValue}>{invoiceData.entryNo}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
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
                                {customerPoints[0]?.total_points > 0 ?
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
                                    </View> : ""}

                                {/* Voucher Redeem Row */}
                                {customerVouchers?.length > 0 ?
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
                                    </View> : ""}

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
                                <Text style={styles.billSummaryValue}>₹{subtotalBeforeTax.toFixed(2)}</Text>
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
                            {specialDiscountAmount > 0 && (
                                <View style={styles.billSummaryRow}>
                                    <Text style={styles.billSummaryLabel}>Special Discount</Text>
                                    <Text style={styles.billSummaryValue}>₹{specialDiscountAmount.toFixed(2)}</Text>
                                </View>
                            )}
                            <View style={[styles.billSummaryRow, styles.billSummaryDivider]}>
                                <Text style={styles.billSummaryLabel}>Subtotal After Discount</Text>
                                <Text style={styles.billSummaryValue}>₹{subtotalAfterDiscountsState.toFixed(2)}</Text>
                            </View>
                            {branchDetails?.gst_mode === "IGST" ? (
                                igstAmount > 0 && (
                                    <View style={styles.billSummaryRow}>
                                        <Text style={styles.billSummaryLabel}>IGST ({gstPercent.toFixed(2)}%)</Text>
                                        <Text style={styles.billSummaryValue}>₹{igstAmount.toFixed(2)}</Text>
                                    </View>
                                )
                            ) : (
                                (cgstAmount > 0 || sgstAmount > 0) && (
                                    <>
                                        <View style={styles.billSummaryRow}>
                                            <Text style={styles.billSummaryLabel}>CGST ({halfGst.toFixed(2)}%)</Text>
                                            <Text style={styles.billSummaryValue}>₹{cgstAmount.toFixed(2)}</Text>
                                        </View>
                                        <View style={styles.billSummaryRow}>
                                            <Text style={styles.billSummaryLabel}>SGST ({halfGst.toFixed(2)}%)</Text>
                                            <Text style={styles.billSummaryValue}>₹{sgstAmount.toFixed(2)}</Text>
                                        </View>
                                    </>
                                )
                            )}
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
                    style={[styles.actionButton, styles.saveButton, { borderRadius: 6 }]}
                    loading={loading}
                    disabled={loading}
                >
                    Save
                </Button>
                <Button
                    mode="contained"
                    onPress={handleShareInvoice}
                    style={[styles.actionButton, styles.shareButton, { borderRadius: 6 }]}
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
        backgroundColor: "#ffba3c",
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
        minWidth: '100%'
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
