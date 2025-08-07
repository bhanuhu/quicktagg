import React, { useEffect, useRef, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ScrollView, Dimensions, Alert, RefreshControl } from 'react-native';
import {
  Button,
  IconButton,
  Text,
  Modal,
  Portal,
  TouchableRipple,
} from 'react-native-paper';
import MyStyles from '../../Styles/MyStyles';
import { LineChart, PieChart } from 'react-native-chart-kit';
import DatePicker from '../../Components/DatePicker';
import { Pressable } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { postRequest } from '../../Services/RequestServices';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import TitleBar from '../../Components/TitleBar';
import RecentActivity from './RecentActivity';
import CustomHeader from '../../Components/CustomHeader';
import Loading from '../../Components/Loading';
import PromoBanner from '../../Components/PromoBanner';
const Home = (props) => {
  const { userToken, branchId } = props.route.params;
  const [branchPreviewCount, setBranchPreviewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [param, setparam] = useState({
    from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
  });
  const [visible, setVisible] = useState({
    customers_graph: false,
    new_customer_chart: false,
    not_response_chart: false,
    cart_graph: false,
    interest_graph: false,
    service_graph: false,
    voucher_graph: false,
    video_call_graph: false,
    missed_call_graph: false,
    stock_graph: false,
  });
  const [figures, setfigures] = useState({
    total_customers: '',
    total_customer_visits: '',
    total_customer_estore: '',
    total_customer_exhibition: '',
    new_customers: '',
    total_notVisitCustomer: '',
    total_cart: '',
    total_service_pending: '',
    total_service_due: '',
    total_service_overdue: '',
    total_interest_yes: '',
    total_interest_follow: '',
    total_interest_req: '',
    new_customer_estore: '',
    new_customer_visits: '',
    new_customer_exhibition: '',
    total_new_customer_estore: '',
    total_new_customer_exhibition: '',
    total_new_customer_visits: '',
    total_notVisitCustomer_estore: '',
    total_notVisitCustomer_visits: '',
    total_notVisitCustomer_exhibition: '',
    total_voucher_active: '',
    total_voucher_redeem: '',
    total_voucher_expired: '',
    vCall_request: '',
    vCall_accept: '',
    vCall_done: '',
    missedCall_request: '',
    missedCall_accept: '',
    missedCall_done: '',
    total_products_count: '',
    total_products_qty_count: '',
    total_stock_accept: '',
    total_stock_transfer: '',
    daily_sms: '',
    total_sms: '',
    feedback: '',
  });

  const [branchType, setBranchType] = useState(null)


  useEffect(() => {

    postRequest("masters/branch/preview", { branch_id: branchId }, userToken).then((resp) => {

      if (resp) {
        console.log(resp.branch_type)
        setBranchType(resp.branch_type)
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });

  }, [])

  console.log('type', branchType)

  const [categoryscountlist, setcategoryscountlist] = useState([]);
  const [chartData1, setChartData1] = React.useState({
    chartDataLabels: [0],
    chartDataEstore: [0],
    chartDataVisits: [0],
    chartDataExhibition: [0],
  });
  const [chartData2, setChartData2] = React.useState({
    chartDataLabels: [0],
    chartDataWishlist: [0],
    chartDataUploads: [0],
    chartDataExhibition: [0],
  });
  const [chartData3, setChartData3] = React.useState({
    chartDataLabels: [0],
    chartDataActive: [0],
    chartDataRedeem: [0],
    chartDataExpired: [0],
  });
  const [chartData4, setChartData4] = React.useState({
    chartDataLabels: [0],
    chartDataRequest: [0],
    chartDataAccept: [0],
    chartDataDone: [0],
  });
  const [chartData5, setChartData5] = React.useState({
    chartDataLabels: [0],
    chartDataRequest: [0],
    chartDataAccept: [0],
    chartDataDone: [0],
  });

  const [noResChartData, setNoResChartData] = React.useState({
    chartDataLabels: [0],
    chartDataEStore: [0],
    chartDataVisit: [0],
    chartDataExhibition: [0],
  });

  const [chartDataInterest, setChartDataInchart] = React.useState({
    chartDataLabels: [0],
    chartDataYes: [0],
    chartDataFollow: [0],
    chartDataReq: [0],
  });

  const [showProducts, setShowProducts] = useState(false);
  const [dateModal, setDateModal] = useState(false);
  const [count_ap, setCount_ap] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [dailySmsCount, setDailySmsCount] = useState(0);
  const [totalSmsCount, setTotalSmsCount] = useState(0);
  const [totalCartExhibition, setTotalCartExhibition] = useState(0);
  const [totalCartWishlist, setTotalCartWishlist] = useState(0);
  const [totalCartUpload, setTotalCartUpload] = useState(0);
  const [totalYes, setTotalYes] = useState(0);
  const [totalFollow, setTotalFollow] = useState(0);
  const [totalReq, setTotalReq] = useState(0);
  const [serviceData, setServiceData] = useState();

  const [bannerVisible, setBannerVisible] = useState(true);
  const scrollTimeout = useRef(null);

  const handleScroll = () => {
    // Hide the banner when scrolling
    setBannerVisible(false);

    // Clear any existing timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Show banner after 300ms of no scroll
    scrollTimeout.current = setTimeout(() => {
      setBannerVisible(true);
    }, 100);
  };

  React.useEffect(() => {
    Refresh();
  }, []);


  const Refresh = async () => {
    try {
      setLoading(true);
      // Wait for all API calls to complete
      await Promise.all([
        AllFigures(),
        SmsFigures(),
        CustomersGraphFigures(),
        CartGraphFigures(),
        ServiceGraphFigures(),
        InterestGraphFigures(),
        VoucherGraphFigures(),
        VideoGraphFigures(),
        MissedGraphFigures(),
        ProductCategorysCountList(),
        NotResponseCustomerGraphFigures(),
        InterestAppointmentCount(),
        FeedbackCount(),
        SmsCount(),
        ServiceDetails()
      ]);
    } catch (error) {
      console.error('Error during refresh:', error);
      // Optionally show an error message to the user
    } finally {
      // Always set loading to false when all operations are done or if there's an error
      setLoading(false);
    }
  };

  const ServiceDetails = async () => {
    return postRequest(
      "masters/mobile/CustomerServiceDataApp",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {



      if (resp.status == 200) {
        console.log('service', resp.data[0])
        setServiceData(resp.data[0]);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
  }

  const AllFigures = () => {
    return postRequest(
      "masters/dashboard/figuresApp",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {


        figures.total_customer_visits = resp.data[0].total_customer_visits;
        figures.total_customer_estore = resp.data[0].total_customer_estore;
        figures.total_customer_exhibition = resp.data[0].total_customer_exhibition;

        figures.total_service_pending = resp.data[0]?.total_cart_exhibition || 0;
        figures.total_service_due = resp.data[0]?.total_cart_upload || 0;
        figures.total_service_overdue = resp.data[0]?.total_cart_wish || 0;

        figures.total_interest_yes = resp.data[0]?.total_cart_wish || 0;
        figures.total_interest_follow = resp.data[0]?.total_cart_wish || 0;
        figures.total_interest_req = resp.data[0]?.total_cart_wish || 0;

        figures.total_voucher_active = resp.data[0].total_voucher_active;
        figures.total_voucher_redeem = resp.data[0].total_voucher_redeem;

        figures.vCall_request = resp.data[0].total_vCall_request;
        figures.vCall_accept = resp.data[0].total_vCall_accept;
        figures.vCall_done = resp.data[0].total_vCall_done;

        figures.missedCall_request = resp.data[0].missedCall_request;
        figures.missedCall_accept = resp.data[0].missedCall_accept;
        figures.missedCall_done = resp.data[0].missedCall_done;

        figures.total_stock_accept = resp.data[0].stock_accept;
        figures.total_stock_transfer = resp.data[0].stock_transfer;

        figures.total_new_customer_estore = resp.data[0].new_customer_estore;
        figures.total_new_customer_exhibition = resp.data[0].new_customer_exhibition;
        figures.total_new_customer_visits = resp.data[0].new_customer_visits;

        figures.total_notVisitCustomer_estore = resp.data[0].total_notVisitCustomer_estore;
        figures.total_notVisitCustomer_visits = resp.data[0].total_notVisitCustomer_exhibition;
        figures.total_notVisitCustomer_exhibition = resp.data[0].total_notVisitCustomer_visits;

        figures.feedback = resp.data[0].feedback;

        setfigures({ ...figures });

      } else {

        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
      setLoading(false);
    });
  };
  const SmsFigures = () => {
    return postRequest(
      "masters/dashboard/BalanceSMS",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        //console.log(resp.data);      
        figures2.total_sms_count = resp.data.totalSMS;
        figures2.total_daily_sms_count = resp.data.TodaySent;
        setfigures2({ ...figures2 });
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
  };


  const ProductCategorysCountList = () => {
    return postRequest(
      "masters/dashboard/productHistory?",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        //console.log(resp);
        setcategoryscountlist(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
  };

  const InterestAppointmentCount = () => {

    return postRequest(
      "customervisit/check_today_notificaton",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {
      console.log(`interest data-> ${JSON.stringify(resp.data)}`)
      if (resp.status == 200) {
        setCount_ap(resp.data[0]["check_appointment"]);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
  };

  const SmsCount = () => {

    return postRequest(
      "customervisit/get_whtsapp_credit_count",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {
      // console.log(`sms data-> ${JSON.stringify(resp.data)}`)
      if (resp.status == 200) {
        setDailySmsCount(resp.data[0]["countWht"]);
        setTotalSmsCount(resp.data[0]["whatsapp_credit"]);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
  };

  const FeedbackCount = () => {

    return postRequest(
      "masters/dashboard/feedback",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {
      // console.log(`feedback data-> ${JSON.stringify(resp.data)}`)
      if (resp.status == 200) {

        setFeedbackCount(resp.data.length);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
  };
  //---------------Customer Graph Data--------------------------//
  const CustomersGraphFigures = () => {
    return postRequest(
      "masters/dashboard/customer_graph",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        chartData1.chartDataLabels = [0];
        chartData1.chartDataEstore = [0];
        chartData1.chartDataVisits = [0];
        chartData1.chartDataExhibition = [0];
        for (const itemObj of resp.data) {
          chartData1.chartDataLabels.push(itemObj.date);
          chartData1.chartDataEstore.push(itemObj.estore);
          chartData1.chartDataVisits.push(itemObj.visits);
          chartData1.chartDataExhibition.push(itemObj.exhibitions);
        }

        //console.log(resp);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
  };

  const customergraphdata = {
    labels: chartData1.chartDataLabels,
    datasets: [
      {
        data: chartData1.chartDataEstore,
        color: (opacity = 1) => `rgba(122, 30, 120, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      {
        data: chartData1.chartDataVisits,
        color: (opacity = 1) => `rgba(10, 65, 244, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      {
        data: chartData1.chartDataExhibition,
        color: (opacity = 1) => `rgba(255,0,0, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
    ],
    legend: ["E-Store", "Visits", "Exhibition"], // optional
  };
  //-------------------------End--------------------------------//

  //---------------Cart Graph Data--------------------------//
  const CartGraphFigures = () => {
    return postRequest(
      "masters/dashboard/browse_cart",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {
      // console.log(`cart response -> ${JSON.stringify(resp.data)}`);

      if (resp.status == 200) {

        let exhibitionCount = 0;
        let uploadsCount = 0;
        let estoreCount = 0;

        for (const itemObj of resp.data) {
          if (itemObj.type.toLowerCase() === "exhibition") {
            exhibitionCount++;
          } else if (itemObj.type.toLowerCase() === "online") {
            uploadsCount++;
          } else {
            estoreCount++;
          }
        }

        setTotalCartExhibition(exhibitionCount);
        setTotalCartUpload(uploadsCount);
        setTotalCartWishlist(estoreCount)

        chartData2.chartDataLabels.push("Total");
        chartData2.chartDataExhibition.push(exhibitionCount);
        chartData2.chartDataUploads.push(uploadsCount);
        chartData2.chartDataEstore.push(estoreCount);




      } else {
        Alert.alert("Error !", "Oops! \nSeems like we ran into some Server Error");
      }
    });
  };

  const cartgraphdata = {
    labels: chartData2.chartDataLabels,
    datasets: [
      {
        data: chartData2.chartDataWishlist,
        color: (opacity = 1) => `rgba(122, 30, 120, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      {
        data: chartData2.chartDataUploads,
        color: (opacity = 1) => `rgba(10, 65, 244, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      {
        data: chartData2.chartDataExhibition,
        color: (opacity = 1) => `rgba(255,0,0, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
    ],
    legend: ["Wishlist", "Uploads", "Exhibition"], // optional
  };
  //-------------------------End--------------------------------//

  //---------------Service Graph Data--------------------------//
  const ServiceGraphFigures = () => {
    return postRequest(
      "masters/dashboard/cart_graph",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        console.log('service graph data', resp)
        chartData2.chartDataLabels = [0];
        chartData2.chartDataWishlist = [0];
        chartData2.chartDataUploads = [0];
        chartData2.chartDataExhibition = [0];
        for (const itemObj of resp.data) {
          chartData2.chartDataLabels.push(itemObj.date);
          chartData2.chartDataWishlist.push(itemObj.visits);
          chartData2.chartDataUploads.push(itemObj.designs);
          chartData2.chartDataExhibition.push(itemObj.exhibition);
        }
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
  };

  const servicegraphdata = {
    labels: chartData2.chartDataLabels,
    datasets: [
      {
        data: chartData2.chartDataWishlist,
        color: (opacity = 1) => `rgba(122, 30, 120, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      {
        data: chartData2.chartDataUploads,
        color: (opacity = 1) => `rgba(10, 65, 244, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      {
        data: chartData2.chartDataExhibition,
        color: (opacity = 1) => `rgba(255,0,0, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
    ],
    legend: ["Pending", "Due", "Overdue"], // optional
  };
  //-------------------------End--------------------------------//

  //---------------Interest Graph Data--------------------------//
  const InterestGraphFigures = () => {
    return postRequest(
      "masters/dashboard/browse_cart",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {
      // console.log(`interest response -> ${JSON.stringify(resp.data)}`);

      if (resp.status === 200) {
        let yesCount = 0;
        let followCount = 0;
        let reqCount = 0;

        for (const itemObj of resp.data) {
          let interestValue = itemObj.updated_interest && itemObj.updated_interest.toLowerCase() !== "n/a" && itemObj.updated_interest.toLowerCase() !== "null"
            ? itemObj.updated_interest.toLowerCase()
            : (itemObj.interest ? itemObj.interest.toLowerCase() : "");

          if (interestValue === "yes") {
            yesCount++;
          } else if (interestValue === "follow up" || interestValue === "follow") {
            followCount++;
          } else if (interestValue === "requirement") {
            reqCount++;
          }
        }

        setTotalYes(yesCount);
        setTotalFollow(followCount);
        setTotalReq(reqCount);

        chartDataInterest.chartDataLabels.push("Total");
        chartDataInterest.chartDataYes.push(yesCount);
        chartDataInterest.chartDataFollow.push(followCount);
        chartDataInterest.chartDataReq.push(reqCount);
      } else {
        Alert.alert("Error !", "Oops! \nSeems like we ran into some Server Error");
      }
    });
  };


  const interestgraphdata = {
    labels: chartDataInterest.chartDataLabels,
    datasets: [
      {
        data: chartDataInterest.chartDataYes,
        color: (opacity = 1) => `rgba(122, 30, 120, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      {
        data: chartDataInterest.chartDataFollow,
        color: (opacity = 1) => `rgba(10, 65, 244, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      {
        data: chartDataInterest.chartDataReq,
        color: (opacity = 1) => `rgba(255,0,0, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
    ],
    legend: ["Yes", "Follow", "Req."], // optional
  };
  //-------------------------End--------------------------------//

  //---------------Voucher Graph Data--------------------------//
  const VoucherGraphFigures = () => {
    return postRequest(
      "masters/dashboard/voucher_graph",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        chartData3.chartDataLabels = [0];
        chartData3.chartDataActive = [0];
        chartData3.chartDataRedeem = [0];
        chartData3.chartDataExpired = [0];
        for (const itemObj of resp.data) {
          chartData3.chartDataLabels.push(itemObj.date);
          chartData3.chartDataActive.push(itemObj.active);
          chartData3.chartDataRedeem.push(itemObj.redeem);
          chartData3.chartDataExpired.push(itemObj.expired);
        }
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
  };

  const vouchergraphdata = {
    labels: chartData3.chartDataLabels,
    datasets: [
      {
        data: chartData3.chartDataActive,
        color: (opacity = 1) => `rgba(122, 30, 120, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      {
        data: chartData3.chartDataRedeem,
        color: (opacity = 1) => `rgba(10, 65, 244, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      // {
      //   data: chartData3.chartDataExpired,
      //   color: (opacity = 1) => `rgba(255,0,0, ${opacity})`, // optional
      //   strokeWidth: 1, // optional
      // },
    ],
    // legend: ["Active", "Redeem", "Expired"], // optional
    legend: ["Active", "Redeem"], // optional
  };
  //-------------------------End--------------------------------//

  //---------------Video Call Graph Data--------------------------//
  const VideoGraphFigures = () => {
    return postRequest(
      "masters/dashboard/video_call_graph",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        chartData4.chartDataLabels = [0];
        chartData4.chartDataRequest = [0];
        chartData4.chartDataAccept = [0];
        chartData4.chartDataDone = [0];
        for (const itemObj of resp.data) {
          chartData4.chartDataLabels.push(itemObj.date);
          chartData4.chartDataRequest.push(itemObj.active);
          chartData4.chartDataAccept.push(itemObj.accept);
          chartData4.chartDataDone.push(itemObj.done);
        }
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
  };

  const videocallgraphdata = {
    labels: chartData4.chartDataLabels,
    datasets: [
      {
        data: chartData4.chartDataRequest,
        color: (opacity = 1) => `rgba(122, 30, 120, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      {
        data: chartData4.chartDataAccept,
        color: (opacity = 1) => `rgba(10, 65, 244, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      {
        data: chartData4.chartDataDone,
        color: (opacity = 1) => `rgba(255,0,0, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
    ],
    legend: ["Request", "Accept", "Done"], // optional
  };
  //-------------------------End--------------------------------//
  //---------------Missed Call Graph Data--------------------------//
  const MissedGraphFigures = () => {
    return postRequest(
      "masters/dashboard/miss_call_graph",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        chartData5.chartDataLabels = [0];
        chartData5.chartDataRequest = [0];
        chartData5.chartDataAccept = [0];
        chartData5.chartDataDone = [0];
        for (const itemObj of resp.data) {
          chartData5.chartDataLabels.push(itemObj.date);
          chartData5.chartDataRequest.push(itemObj.active);
          chartData5.chartDataAccept.push(itemObj.accept);
          chartData5.chartDataDone.push(itemObj.done);
        }
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
  };

  const missedcallgraphdata = {
    labels: chartData5.chartDataLabels,
    datasets: [
      {
        data: chartData5.chartDataRequest,
        color: (opacity = 1) => `rgba(122, 30, 120, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      {
        data: chartData5.chartDataAccept,
        color: (opacity = 1) => `rgba(10, 65, 244, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
      {
        data: chartData5.chartDataDone,
        color: (opacity = 1) => `rgba(255,0,0, ${opacity})`, // optional
        strokeWidth: 1, // optional
      },
    ],
    legend: ["Request", "Accept", "Done"], // optional
  };
  //-------------------------End--------------------------------//
  //---------------New Cusomer Chart Data--------------------------//
  const newcustomerchartdata = [
    {
      name: "E-Store",
      population: figures.total_new_customer_estore,
      color: "#FF6363",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
    {
      name: "Visits",
      population: figures.total_new_customer_visits,
      color: "#FFAB76",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
    {
      name: "Exhibition",
      population: figures.total_new_customer_exhibition,
      color: "#A3E4DB",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
  ];
  //------------------------End--------------------------------//

  //---------------New Cusomer Chart Data--------------------------//
  const NotResponseCustomerGraphFigures = () => {
    return postRequest(
      "masters/dashboard/notVisitingCustomers",
      {
        branch_id: branchId,
        from_date: param.from_date,
        to_date: param.to_date,
      },
      userToken
    ).then((resp) => {

      if (resp.status == 200) {
        noResChartData.chartDataLabels = [];
        noResChartData.chartDataEStore = [];
        noResChartData.chartDataVisit = [];
        noResChartData.chartDataExhibition = [];

        let visitCount = 0;
        let exhibitionCount = 0;
        let eStoreCount = 0; // Count types that are neither "visit" nor "exhibition"

        for (const itemObj of resp.data) {
          if (itemObj.type === "visit") {
            visitCount++;
          } else if (itemObj.type === "exhibition") {
            exhibitionCount++;
          } else {
            eStoreCount++; // All other types
          }
        }

        // Push data into chartData
        noResChartData.chartDataLabels.push("Visit", "Exhibition", "E-Store");
        noResChartData.chartDataVisit.push(visitCount); // Visit count
        noResChartData.chartDataExhibition.push(exhibitionCount); // Exhibition count
        noResChartData.chartDataEStore.push(eStoreCount); // Other types count
      } else {
        Alert.alert("Error !", "Oops! \nSeems like we ran into some Server Error");
      }


    });
  };

  useEffect(() => {
  postRequest("customervisit/Done/service", { branch_id: branchId }, userToken)
    .then((resp) => {
      if (resp) {
        // console.log('Branch Preview Response:', resp.data); 
        setBranchPreviewCount(resp.data[0]?.today_interest_yes_count || 0); 
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
}, []);


  const notresponsecustomerchartdata = [
    {
      name: "E-Store",
      population: noResChartData.chartDataEStore,
      color: "#BAABDA",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
    {
      name: "Visits",
      population: noResChartData.chartDataVisit,
      color: "#D6E5FA",
      legendFontColor: "#A68DAD",
      legendFontSize: 15,
    },
    {
      name: "Exhibition",
      population: noResChartData.chartDataExhibition,
      color: "#84DFFF",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
  ];
  //------------------------End--------------------------------//
  
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
                  Refresh();
                }}
              />
              <Text style={MyStyles.dateLabel}>To</Text>
              <DatePicker
                mode="text"
                value={param.to_date}
                onValueChange={(date) => {
                  param.to_date = date;
                  setparam({ ...param });
                  Refresh();
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
      <ScrollView
        onScroll={handleScroll} scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={Refresh}
          />
        }
      >
        <LinearGradient
          colors={["#F6356F", "#FF5F50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 15,
            borderRadius: 10,
            padding: 0,
            marginVertical: 5,
          }}
        >
          <View>
            <View
              style={[
                MyStyles.row,
                {
                  justifyContent: "center",
                  borderBottomColor: "#FFF",
                  borderBottomWidth: 1,
                  marginHorizontal: 15,
                },
              ]}
            >
              <View style={{ flexGrow: 1 }}></View>
              <Text
                style={{
                  textAlign: "center",
                  color: "#FFF",
                  fontSize: 18,
                  marginVertical: 5,
                  width: "50%",
                  fontWeight: 'bold'
                }}
              >
                Total Customers
              </Text>
              <IconButton
                icon="trending-up"
                iconColor="white"
                style={{
                  backgroundColor: "#F6356F",
                  flex: 1,
                  borderColor: "#FFF",
                  borderWidth: 1,

                }}
                onPress={() =>
                  setVisible({
                    ...visible,
                    customers_graph: !visible.customers_graph,
                  })
                }
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginBottom: 10,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>E-Store</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {figures.total_customer_estore}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Visits</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {figures.total_customer_visits}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Exhibition</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {figures.total_customer_exhibition}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <CustomerGraphView
          visible={visible.customers_graph}
          data={customergraphdata}
        />

        <View
          style={[MyStyles.row, { paddingHorizontal: 20 }]}
        >
          <Button
            mode="contained"
            textColor='#000'
            uppercase={false}
            style={{
              borderRadius: 5,
              fontWeight: 'bold',
            }}

            onPress={() =>
              setVisible({
                ...visible,
                new_customer_chart: !visible.new_customer_chart,
                not_response_chart: false,
              })
            }
          >
            New Customer
          </Button>
          <Button
            mode="contained"
            textColor='#000'
            uppercase={false}
            style={{ borderRadius: 5 }}
            onPress={() =>
              setVisible({
                ...visible,
                new_customer_chart: false,
                not_response_chart: !visible.not_response_chart,
              })
            }
          >
            No Response
          </Button>
        </View>
        <NewCustomersChartView
          visible={visible.new_customer_chart}
          data={newcustomerchartdata}
        />
        <NotResposeCustomersChartView
          visible={visible.not_response_chart}
          data={notresponsecustomerchartdata}
        />

        <LinearGradient
          colors={["#F6356F", "#FF5F50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 15,
            borderRadius: 10,
            padding: 0,
            marginVertical: 5,
          }}
        >
          <View>
            <View
              style={[
                MyStyles.row,
                {
                  justifyContent: "center",
                  borderBottomColor: "#FFF",
                  borderBottomWidth: 1,
                  marginHorizontal: 15,
                },
              ]}
            >
              <View style={{ flexGrow: 1 }}></View>
              <Text
                style={{
                  textAlign: "center",
                  color: "#FFF",
                  fontSize: 18,
                  marginVertical: 5,
                  width: "50%",
                  width: "50%",
                  fontWeight: 'bold'
                }}
              >
                Cart
              </Text>
              <IconButton
                icon="trending-up"
                iconColor="white"
                style={{
                  backgroundColor: "#F6356F",
                  flex: 1,
                  borderColor: "#FFF",
                  borderWidth: 1,
                }}
                onPress={() =>
                  setVisible({ ...visible, cart_graph: !visible.cart_graph })
                }
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginBottom: 10,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Wish List</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {totalCartWishlist}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Uploads</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {totalCartUpload}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Exhibition</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {totalCartExhibition}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <CartGraphView visible={visible.cart_graph} data={cartgraphdata} />

        <LinearGradient
          colors={["#F6356F", "#FF5F50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 15,
            borderRadius: 10,
            padding: 0,
            marginVertical: 5,
          }}
        >
          <View>
            <View
              style={[
                MyStyles.row,
                {
                  justifyContent: "center",
                  borderBottomColor: "#FFF",
                  borderBottomWidth: 1,
                  marginHorizontal: 15,
                },
              ]}
            >
              <View style={{ flexGrow: 1 }}>
                <Pressable onPress={() => props.navigation.navigate("Appointment")}>
                  {/* <Text style={{
                    textAlign: "center",
                    color: "#FFF",
                    fontSize: 18,
                    marginVertical: 5,
                    width: "50%",
                  }}> */}
                  <Text  style={{
                  backgroundColor: "#ec1278ff",
                  width: "50%",
                  fontSize: 18,
                  color:'#fff',
                  borderColor: "#FFF",
                  borderWidth: 1,
                  textAlign:'center',
                  marginVertical: 5,
                  borderRadius:18
                }}>
                    {count_ap}
                  </Text>
                </Pressable>
              </View>
              <Text
                style={{
                  textAlign: "center",
                  color: "#FFF",
                  fontSize: 18,
                  marginVertical: 5,
                  width: "50%",
                  width: "50%",
                  fontWeight: 'bold'
                }}
              >
                Interest
              </Text>
              <IconButton
                icon="trending-up"
                iconColor="white"
                style={{
                  backgroundColor: "#F6356F",
                  flex: 1,
                  borderColor: "#FFF",
                  borderWidth: 1,

                }}
                onPress={() =>
                  setVisible({ ...visible, interest_graph: !visible.interest_graph })
                }
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginBottom: 10,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Yes</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {totalYes}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Follow</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {totalFollow}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Req.</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {totalReq}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <InterestGraphView visible={visible.interest_graph} data={interestgraphdata} />
        {branchType == "2-Vehicle" && serviceData && (
          <>
            <LinearGradient
              colors={["#F6356F", "#FF5F50"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                marginHorizontal: 15,
                borderRadius: 10,
                padding: 0,
                marginVertical: 5,
              }}
            >
              <View>
                <View
                  style={[
                    MyStyles.row,
                    {
                      justifyContent: "center",
                      borderBottomColor: "#FFF",
                      borderBottomWidth: 1,
                      marginHorizontal: 15,
                    },
                  ]}
                >
                  <View style={{ flexGrow: 1 }}>
                <Pressable onPress={() => props.navigation.navigate("ProductServiceScreen")}>
                  <Text  style={{
                  backgroundColor: "#ec1278ff",
                  width: "50%",
                  fontSize: 18,
                  color:'#fff',
                  borderColor: "#FFF",
                  borderWidth: 1,
                  textAlign:'center',
                  marginVertical: 5,
                  borderRadius:18
                }}>
                    {branchPreviewCount}
                  </Text>
                </Pressable>
              </View>
                  <Text
                    style={{
                      textAlign: "center",
                      color: "#FFF",
                      fontSize: 18,
                      marginVertical: 5,
                      width: "50%",
                      width: "50%",
                      fontWeight: 'bold'
                    }}
                  >
                    Services
                  </Text>
                  <IconButton
                    icon="trending-up"
                    iconColor="white"
                    style={{
                      backgroundColor: "#F6356F",
                      flex: 1,
                      borderColor: "#FFF",
                      borderWidth: 1,
                    }}
                    onPress={() =>
                      setVisible({ ...visible, service_graph: !visible.service_graph })
                    }
                  />
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                    marginBottom: 10,
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Pending</Text>
                    <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                      {
                        serviceData.CountPending ?? serviceData.CountPending
                      }
                    </Text>
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Due</Text>
                    <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                      {serviceData.CountDue ?? serviceData.CountDue}
                    </Text>
                  </View>

                  <View style={{ alignItems: "center" }}>
                    <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Overdue</Text>
                    <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                      {serviceData.CountOverDue ?? serviceData.CountOverDue}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
            <ServiceGraphView visible={visible.service_graph} data={servicegraphdata} />
          </>
        )
        }


        <LinearGradient
          colors={["#F6356F", "#FF5F50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 15,
            borderRadius: 10,
            padding: 0,
            marginVertical: 5,
          }}
        >
          <View>
            <View
              style={[
                MyStyles.row,
                {
                  justifyContent: "center",
                  borderBottomColor: "#FFF",
                  borderBottomWidth: 1,
                  marginHorizontal: 15,
                },
              ]}
            >
              <View style={{ flexGrow: 1 }}></View>
              <Text
                style={{
                  textAlign: "center",
                  color: "#FFF",
                  fontSize: 18,
                  marginVertical: 5,
                  width: "50%",
                  width: "50%",
                  fontWeight: 'bold'
                }}
              >
                Voucher
              </Text>
              <IconButton
                icon="trending-up"
                iconColor="white"
                style={{
                  backgroundColor: "#F6356F",
                  flex: 1,
                  borderColor: "#FFF",
                  borderWidth: 1,
                }}
                onPress={() =>
                  setVisible({
                    ...visible,
                    voucher_graph: !visible.voucher_graph,
                  })
                }
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginBottom: 10,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Active</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {figures.total_voucher_active}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Redeem</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {figures.total_voucher_redeem}
                </Text>
              </View>

              {/* <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 20 }}>Expired</Text>
                <Text style={{ color: "#FFF", fontSize: 20 }}>
                  {figures.total_voucher_expired}
                </Text>
              </View> */}
            </View>
          </View>
        </LinearGradient>
        <VoucherGraphView
          visible={visible.voucher_graph}
          data={vouchergraphdata}
        />

        <LinearGradient
          colors={["#F6356F", "#FF5F50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 15,
            borderRadius: 10,
            padding: 0,
            marginVertical: 5,
          }}
        >
          <View>
            <View
              style={[
                MyStyles.row,
                {
                  justifyContent: "center",
                  borderBottomColor: "#FFF",
                  borderBottomWidth: 1,
                  marginHorizontal: 15,
                },
              ]}
            >
              <View style={{ flexGrow: 1 }}></View>
              <Text
                style={{
                  textAlign: "center",
                  color: "#FFF",
                  fontSize: 18,
                  marginVertical: 5,
                  width: "50%",
                  width: "50%",
                  fontWeight: 'bold'
                }}
              >
                Video Call
              </Text>
              <IconButton
                icon="trending-up"
                iconColor="white"
                style={{
                  backgroundColor: "#F6356F",
                  flex: 1,
                  borderColor: "#FFF",
                  borderWidth: 1,
                }}
                onPress={() =>
                  setVisible({
                    ...visible,
                    video_call_graph: !visible.video_call_graph,
                  })
                }
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginBottom: 10,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Request</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {figures.vCall_request}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Accept</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {figures.vCall_accept}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Done</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {figures.vCall_done}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <VideoCallGraphView
          visible={visible.video_call_graph}
          data={videocallgraphdata}
        />

        <LinearGradient
          colors={["#F6356F", "#FF5F50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 15,
            borderRadius: 10,
            padding: 0,
            marginVertical: 5,
          }}
        >
          <View>
            <View
              style={[
                MyStyles.row,
                {
                  justifyContent: "center",
                  borderBottomColor: "#FFF",
                  borderBottomWidth: 1,
                  marginHorizontal: 15,
                },
              ]}
            >
              <View style={{ flexGrow: 1 }}></View>
              <Text
                style={{
                  textAlign: "center",
                  color: "#FFF",
                  fontSize: 18,
                  marginVertical: 5,
                  width: "50%",
                  width: "50%",
                  fontWeight: 'bold'
                }}
              >
                Missed Call
              </Text>
              <IconButton
                icon="trending-up"
                iconColor="white"
                style={{
                  backgroundColor: "#F6356F",
                  flex: 1,
                  borderColor: "#FFF",
                  borderWidth: 1,
                }}
                onPress={() =>
                  setVisible({
                    ...visible,
                    missed_call_graph: !visible.missed_call_graph,
                  })
                }
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginBottom: 10,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Request</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {figures.missedCall_request}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Accept</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {figures.missedCall_accept}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Done</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {figures.missedCall_done}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <MissedCallGraphView
          visible={visible.missed_call_graph}
          data={missedcallgraphdata}
        />
        {categoryscountlist.map((item, index) => (
          <LinearGradient
            colors={["#F6356F", "#FF5F50"]}
            key={index}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              marginHorizontal: 15,
              borderRadius: 10,
              padding: 0,
              marginVertical: 5,
            }}
          >
            <View
              style={[
                MyStyles.row,
                {
                  justifyContent: "space-between",
                },
              ]}
            >
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 18,
                  marginVertical: 5,
                  marginLeft: 20,
                }}
                onPress={() => setShowProducts(!showProducts)}
              >
                Products {"  "}{item.product_count}{" "}({item.product_qty_count})
              </Text>
              <IconButton
                icon={showProducts ? "chevron-down" : "chevron-right"}
                iconColor="white"
                onPress={() => setShowProducts(!showProducts)}
              />
            </View>
            {showProducts
              ? item.categorys.map((item2, index) => (
                <LinearGradient
                  key={index}
                  colors={["#FF5F50", "#FF7F70"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    //marginHorizontal: 15,
                    borderRadius: 10,
                    padding: 0,
                    marginVertical: 5,
                  }}
                >
                  <View
                    style={[
                      MyStyles.row,
                      {
                        justifyContent: "space-between",
                      },
                    ]}
                  >

                    <Text
                      style={{
                        //textAlign: "center",
                        color: "#FFF",
                        fontSize: 16,
                        marginVertical: 5,
                        marginLeft: 30,
                      }}
                    >
                      {item2.category_name + "   " + item2.product_count + "   (" + item2.product_qty + ")"}
                    </Text>

                    <IconButton
                      icon={item2.show ? "chevron-down" : "chevron-right"}
                      color="white"
                      style={
                        {
                          //flex: 1,
                        }
                      }
                      onPress={() => {
                        item2.show = !item2.show;
                        setcategoryscountlist([...categoryscountlist]);
                      }}
                    />
                  </View>
                  <View style={item2.show ? null : { display: "none" }}>
                    {item2.innerTable.length > 0
                      ? item2.innerTable.map((item3, index) => (
                        <View
                          key={index}
                          style={[
                            MyStyles.row,
                            {
                              //justifyContent: "center",

                            },
                          ]}
                        >
                          <TouchableRipple
                            onPress={() => {
                              props.navigation.navigate("ProductTabs", {
                                search: item3.subcategory_name
                              });
                            }}
                          >
                            <Text
                              style={{
                                color: "#FFF",
                                fontSize: 16,
                                marginVertical: 5,
                                width: "90%",
                                marginLeft: 40,
                              }}
                            >

                              {item3.subcategory_name + "   " + item3.product_count + "   (" + item3.product_qty_count + ")"}
                            </Text>
                          </TouchableRipple>
                        </View>
                      ))
                      : null}
                  </View>
                </LinearGradient>
              ))
              : null}
          </LinearGradient>
        ))}
        <LinearGradient
          colors={["#F6356F", "#FF5F50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 15,
            borderRadius: 10,
            padding: 0,
            marginVertical: 5,

          }}
        >
          <View>
            <View
              style={[
                MyStyles.row,
                {
                  justifyContent: "center",
                  borderBottomColor: "#FFF",
                  borderBottomWidth: 1,
                  marginHorizontal: 15,
                },
              ]}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#FFF",
                  fontSize: 18,
                  marginVertical: 5,
                  width: "50%",
                  fontWeight: 'bold'
                }}
              >
                Stock
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginBottom: 10,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Transfer</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {figures.total_stock_transfer}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Accept</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {figures.total_stock_accept}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
        <LinearGradient
          colors={["#F6356F", "#FF5F50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 15,
            borderRadius: 10,
            padding: 0,
            marginVertical: 5,

          }}
        >
          <View>
            <View
              style={[
                MyStyles.row,
                {
                  justifyContent: "center",
                  borderBottomColor: "#FFF",
                  borderBottomWidth: 1,
                  marginHorizontal: 15,
                },
              ]}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#FFF",
                  fontSize: 18,
                  marginVertical: 5,
                  width: "50%",
                  fontWeight: 'bold'
                }}
              >
                SMS
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginBottom: 10,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Daily</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {dailySmsCount}
                </Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>Total</Text>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {totalSmsCount}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={["#F6356F", "#FF5F50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 15,
            borderRadius: 10,
            padding: 0,
            marginVertical: 5,

          }}
        >
          <View>
            <View
              style={[
                MyStyles.row,
                {
                  justifyContent: "center",
                  borderBottomColor: "#FFF",
                  borderBottomWidth: 1,
                  marginHorizontal: 15,
                },
              ]}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#FFF",
                  fontSize: 18,
                  marginVertical: 5,
                  width: "50%",
                  fontWeight: 'bold'
                }}
              >
                Feedback
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                marginBottom: 10,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={{ color: "#FFF", fontSize: 16, fontWeight: 'bold' }}>
                  {feedbackCount}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
      <PromoBanner visible={bannerVisible} userToken={userToken} branchId={branchId} />
    </View>
  );
};

const CustomerGraphView = ({ visible = false, data }) => {
  const screenWidth = Dimensions.get("window").width - 60;

  const chartConfig = {
    backgroundGradientFrom: "#000",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#000",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 1,
    useShadowColorFromDataset: true, // optional
    //decimalPlaces: 0    

  };

  if (visible) {
    return (
      <View
        style={{
          backgroundColor: "#f0f0f0",
          marginHorizontal: 15,
          borderRadius: 10,
          padding: 10,
          marginVertical: 5,
        }}
      >
        <LineChart
          data={data}
          width={screenWidth}
          height={220}
          verticalLabelRotation={40}
          chartConfig={chartConfig}
          bezier

        />
      </View>
    );
  }

  return null;
};

const NewCustomersChartView = ({ visible = false, data }) => {
  const screenWidth = Dimensions.get("window").width - 60;

  const chartConfig = {
    backgroundColor: "#1cc910",
    backgroundGradientFrom: "#eff3ff",
    backgroundGradientTo: "#efefef",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 53, 106, ${opacity})`,
    style: {
      borderRadius: 10,
    },
  };

  if (visible) {
    return (
      <View
        style={{
          backgroundColor: "#f0f0f0",
          marginHorizontal: 15,
          borderRadius: 10,
          padding: 10,
          marginVertical: 10,
        }}
      >
        <PieChart
          data={data}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={10}
          center={[0, 0]}
          absolute
        />
      </View>
    );
  }
  return null;
};
const NotResposeCustomersChartView = ({ visible = false, data }) => {
  const screenWidth = Dimensions.get("window").width - 60;

  const chartConfig = {
    backgroundColor: "#1cc910",
    backgroundGradientFrom: "#eff3ff",
    backgroundGradientTo: "#efefef",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(34, 53, 106, ${opacity})`,
    style: {
      borderRadius: 10,
    },
  };

  if (visible) {
    return (
      <View
        style={{
          backgroundColor: "#f0f0f0",
          marginHorizontal: 15,
          borderRadius: 10,
          padding: 10,
          marginVertical: 10,
        }}
      >
        <PieChart
          data={data}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={10}
          center={[0, 0]}
          absolute
        />
      </View>
    );
  }
  return null;
};
const CartGraphView = ({ visible = false, data }) => {
  const screenWidth = Dimensions.get("window").width - 60;

  const chartConfig = {
    backgroundGradientFrom: "#000",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#000",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 1,
    useShadowColorFromDataset: true, // optional

  };

  if (visible) {
    return (
      <View
        style={{
          backgroundColor: "#f0f0f0",
          marginHorizontal: 15,
          borderRadius: 10,
          padding: 10,
          marginVertical: 10,
        }}
      >
        <LineChart
          data={data}
          width={screenWidth}
          height={220}
          verticalLabelRotation={30}
          segments={4}
          chartConfig={chartConfig}
          bezier
        />
      </View>
    );
  }

  return null;
};

const ServiceGraphView = ({ visible = false, data }) => {
  const screenWidth = Dimensions.get("window").width - 60;

  const chartConfig = {
    backgroundGradientFrom: "#000",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#000",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 1,
    useShadowColorFromDataset: true, // optional

  };

  if (visible) {
    return (
      <View
        style={{
          backgroundColor: "#f0f0f0",
          marginHorizontal: 15,
          borderRadius: 10,
          padding: 10,
          marginVertical: 10,
        }}
      >
        <LineChart
          data={data}
          width={screenWidth}
          height={220}
          verticalLabelRotation={30}
          segments={4}
          chartConfig={chartConfig}
          bezier
        />
      </View>
    );
  }

  return null;
};

const InterestGraphView = ({ visible = false, data }) => {
  const screenWidth = Dimensions.get("window").width - 60;

  const chartConfig = {
    backgroundGradientFrom: "#000",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#000",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 1,
    useShadowColorFromDataset: true, // optional

  };

  if (visible) {
    return (
      <View
        style={{
          backgroundColor: "#f0f0f0",
          marginHorizontal: 15,
          borderRadius: 10,
          padding: 10,
          marginVertical: 10,
        }}
      >
        <LineChart
          data={data}
          width={screenWidth}
          height={220}
          verticalLabelRotation={30}
          segments={4}
          chartConfig={chartConfig}
          bezier
        />
      </View>
    );
  }

  return null;
};

const VoucherGraphView = ({ visible = false, data }) => {
  const screenWidth = Dimensions.get("window").width - 60;

  const chartConfig = {
    backgroundGradientFrom: "#000",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#000",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: true, // optional
  };

  if (visible) {
    return (
      <View
        style={{
          backgroundColor: "#f0f0f0",
          marginHorizontal: 15,
          borderRadius: 10,
          padding: 10,
          marginVertical: 10,
        }}
      >
        <LineChart
          data={data}
          width={screenWidth}
          height={220}
          verticalLabelRotation={30}
          segments={4}
          chartConfig={chartConfig}
          bezier
        />
      </View>
    );
  }

  return null;
};

const VideoCallGraphView = ({ visible = false, data }) => {
  const screenWidth = Dimensions.get("window").width - 60;

  const chartConfig = {
    backgroundGradientFrom: "#000",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#000",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: true, // optional
  };

  if (visible) {
    return (
      <View
        style={{
          backgroundColor: "#f0f0f0",
          marginHorizontal: 15,
          borderRadius: 10,
          padding: 10,
          marginVertical: 10,
        }}
      >
        <LineChart
          data={data}
          width={screenWidth}
          height={220}
          verticalLabelRotation={30}
          segments={4}
          chartConfig={chartConfig}
          bezier
        />
      </View>
    );
  }

  return null;
};

const MissedCallGraphView = ({ visible = false, data }) => {
  const screenWidth = Dimensions.get("window").width - 60;

  const chartConfig = {
    backgroundGradientFrom: "#000",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#000",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: true, // optional
  };

  if (visible) {
    return (
      <View
        style={{
          backgroundColor: "#f0f0f0",
          marginHorizontal: 15,
          borderRadius: 10,
          padding: 10,
          marginVertical: 10,
        }}
      >
        <LineChart
          data={data}
          width={screenWidth}
          height={220}
          verticalLabelRotation={30}
          segments={4}
          chartConfig={chartConfig}
          bezier
        />
      </View>
    );
  }

  return null;
};

const HomeStack = (props) => {
  const Stack = createStackNavigator();
  const title = props.route.params.userName;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Home"
        component={Home}
        initialParams={props.route.params}
        options={{
          headerShown: true,
          header: (props) => <CustomHeader title={title} {...props} />,
        }}
      />

      <Stack.Screen
        component={RecentActivity}
        name="RecentActivity"
        initialParams={props.route.params}
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="Recent Activity" />,
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
