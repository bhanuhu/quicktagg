import React from 'react';
import { View, Image, ScrollView, Linking, Dimensions } from 'react-native';
import {
  Drawer,
  Divider,
  Avatar,
  TouchableRipple,
  Text
} from 'react-native-paper';
import { AuthContext } from './Context';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

//Screen Imports
import Dashboard from '../Screens/Dashboard';
import { CustomerForm, CustomerList } from '../Screens/Customer';
import { VoucherList, VoucherForm } from '../Screens/Voucher';
import { CustomerVoucherList, ExtraPoints, PointForm, Profile, ProfileProductsPreview } from '../Screens/Profile';
import {
  ProductsForm,
  ProductsPreview,
  ProductsList,
} from '../Screens/Products/Products';
import { CategoryForm, CategoryList } from '../Screens/Products/Category';
import {
  SubCategoryForm,
  SubCategoryList,
} from '../Screens/Products/SubCategory';
import ProductTabs from '../Screens/ProductTabs';
import {
  GeneralCatalog,
  GeneralCatalogList,
} from '../Screens/Catalogs/GeneralCatalog';
import SettingsMenu from '../Screens/SettingsMenu';
import {
  CustomerCategory,
  CustomerCategoryList,
} from '../Screens/Settings/CustomerCategory';
import { BranchStaff, BranchStaffList } from '../Screens/Settings/BranchStaff';
import { BranchArea, BranchAreaList } from '../Screens/Settings/BranchArea';
import TabToScan from '../Screens/Settings/TabToScan';
import {
  ExhibitionCatalog,
  ExhibitionCatalogList,
} from '../Screens/Catalogs/ExhibitionCatalog';
import {
  CustomerCatalog,
  CustomerCatalogList,
} from '../Screens/Catalogs/CustomerCatalog';
import {
  TryAndBuyCatalog,
  TryAndBuyCatalogList,
} from '../Screens/Catalogs/TryAndBuyCatalog';
import {
  CustomerReview,
  CustomerReviewList,
} from '../Screens/Reviews&Feedbacks/CustomerReview';
import SMS from '../Screens/SMS';
import TitleBar from './TitleBar';
import ReviewTabs from '../Screens/ReviewTabs';
import Greetings from '../Screens/Dashboard/Greetings';
import RecentActivity from '../Screens/Dashboard/RecentActivity';
import Catalogs from '../Screens/Catalogs';
import MyStyles from '../Styles/MyStyles';
import { StockTransfer } from '../Screens/Stock/StockTransfer';
import { StockTransferPreview } from '../Screens/Stock/StockTransferPreview';
import StockList from '../Screens/Stock/StockTransferList';
import StockAcceptance from '../Screens/Stock/StockAcceptance';
import StockAcceptanceList from '../Screens/Stock/StockAcceptanceList';
import { StockSales } from '../Screens/Stock/StockSales';
import StockSalesList from '../Screens/Stock/StockSalesList';
import Points from '../Screens/Dashboard/Points';
import Notifications from '../Screens/Dashboard/Notifications';
import Appointment from '../Screens/Dashboard/Appointment';
import ProductServiceScreen from '../Screens/Dashboard/ProductServiceScreen';
import ZoomImageDetailScreen from '../Screens/Dashboard/ZoomImageDetailScreen';
import { postRequest } from '../Services/RequestServices';
import { useState, useEffect } from 'react';
const DrawerComponent = ({ userDetails }) => {
  const Drawer = createDrawerNavigator();
  const [totalPoint,setTotalPoint ] = useState(0);
  const [redeemPointTitle,setRedeemPointTitle ] = useState("Redeem Points");

  useEffect(() => {
    if (!userDetails?.customer_id) {
      console.log("Waiting for user details...");
      return;
    }
  
    console.log("Fetching points for customer ID:", userDetails.customer_id);
    
    const fetchPoints = async () => {
      try {
        const temparam = { customer_id: userDetails.customer_id };
        const data = await postRequest(
          "customervisit/getCustomerPointList", 
          temparam, 
          userDetails.userToken
        );
        
        if (data?.data?.[0]?.total_points !== undefined) {
          console.log("Total Points - ", data.data[0].total_points);
          setTotalPoint(data.data[0].total_points);
          setRedeemPointTitle(`Redeem Points (${data.data[0].total_points})`);
        } else {
          console.warn("Unexpected API response format:", data);
        }
      } catch (error) {
        console.error("Error fetching points:", error);
      }
    };
  
    fetchPoints();
  }, [userDetails]);  // Add userDetails to dependency array

 
  return (
    <Drawer.Navigator
      backBehavior="history"
      detachInactiveScreens
      drawerType="slide"
      edgeWidth={10}

      screenOptions={{
        unmountOnBlur: true,
        headerShown: false,
        drawerStyle: {
          width: Dimensions.get('window').width / 1.5,
        },
      }}
      initialRouteName="Dashboard"
      drawerContent={(props) => <DrawerContent {...props} {...userDetails} />}
    // drawerStyle={{ width: "40%" }}
    >
      <Drawer.Screen
        component={Dashboard}
        name="Dashboard"
        initialParams={userDetails}
      />
      <Drawer.Screen
        component={Dashboard}
        name="GraphView"
        initialParams={userDetails}
      />
      <Drawer.Screen
        component={CustomerList}
        name="CustomerList"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="Customers" />,
        }}
      />
      <Drawer.Screen
        component={CustomerForm}
        name="CustomerForm"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Add Customer" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={VoucherList}
        name="VoucherList"
        initialParams={userDetails}
        options={{
          headerShown: true,
          show: false,
          header: (props) => <TitleBar {...props} title="Vouchers" />,
        }}
      />
      <Drawer.Screen
        component={VoucherForm}
        name="VoucherForm"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Add Vouchers" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={PointForm}
        name="PointForm"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title={redeemPointTitle} disableSearch />
          ),
        }}
      />

      <Drawer.Screen
        component={ExtraPoints}
        name="ExtraPoints"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title={`Extra Points ${totalPoint===0?'':`(${totalPoint})`}`} disableSearch />
          ),
        }}
      />

      <Drawer.Screen
        component={SMS}
        name="SMS"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="SMS" disableSearch />,
        }}
      />
      <Drawer.Screen
        component={Profile}
        name="Profile"
        initialParams={userDetails} // aise krke bhejna hai ok
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Customer Profile" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={CustomerVoucherList}
        name="CustomerVoucherList"
        initialParams={userDetails} // aise krke bhejna hai ok
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="Redeem" />,
        }}
      />
      <Drawer.Screen
        component={ProfileProductsPreview}
        name="ProfileProductsPreview"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="Product Details" disableSearch />,
        }}
      />
      {/* --------------------- Products------------------- */}
      <Drawer.Screen
        component={ProductTabs}
        name="ProductTabs"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="Products" />,
        }}
      />
      <Drawer.Screen
        component={ProductsForm}
        name="ProductsForm"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Add Products" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={ProductsPreview}
        name="ProductsPreview"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Product Details" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={ProductsList}
        name="ProductsList"
        initialParams={userDetails}
      />
      <Drawer.Screen
        component={CategoryForm}
        name="CategoryForm"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Add Category" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={CategoryList}
        name="CategoryList"
        initialParams={userDetails}
      />
      <Drawer.Screen
        component={SubCategoryForm}
        name="SubCategoryForm"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Add Subcategory" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={SubCategoryList}
        name="SubCategoryList"
        initialParams={userDetails}
      />

      {/* --------------------- Catalogs------------------- */}
      <Drawer.Screen
        component={Catalogs}
        name="Catalogs"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Catalog" disableSearch />
          ),
        }}
      />

      <Drawer.Screen
        component={GeneralCatalogList}
        name="GeneralCatalogList"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="General Catalog" />,
        }}
      />
      <Drawer.Screen
        component={GeneralCatalog}
        name="GeneralCatalog"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="General Catalog" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={ExhibitionCatalogList}
        name="ExhibitionCatalogList"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="Exhibition Catalog" />,
        }}
      />
      <Drawer.Screen
        component={ExhibitionCatalog}
        name="ExhibitionCatalog"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Exhibition Catalog" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={CustomerCatalogList}
        name="CustomerCatalogList"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="Customer Catalog" />,
        }}
      />
      
      <Drawer.Screen
        component={CustomerCatalog}
        name="CustomerCatalog"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Customer Catalog" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={TryAndBuyCatalogList}
        name="TryAndBuyCatalogList"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Try and Buy Catalog" />
          ),
        }}
      />
      <Drawer.Screen
        component={TryAndBuyCatalog}
        name="TryAndBuyCatalog"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Try and Buy Catalog" disableSearch />
          ),
        }}
      />
      {/* ----------------------Review & FeedBack----------- */}

      <Drawer.Screen
        component={CustomerReview}
        name="CustomerReview"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Customer Review" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={ReviewTabs}
        name="ReviewFeedback"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="Reviews" />,
        }}
      />

      {/* --------------------- Stocks------------------- */}
      <Drawer.Screen
        component={StockTransfer}
        name="StockTransfer"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Stock Transfer" disableSearch />
          ),
        }}
      />

      <Drawer.Screen
        component={StockTransferPreview}
        name="StockTransferPreview"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Stock Transfer" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={StockList}
        name="StockList"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Stock Transfer List" />
          ),
        }}
      />

      <Drawer.Screen
        component={StockAcceptance}
        name="StockAcceptance"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Stock Acceptance" disableSearch />
          ),
        }}
      />

      <Drawer.Screen
        component={StockAcceptanceList}
        name="StockAcceptanceList"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Stock Acceptance List"  />
          ),
        }}
      />
      <Drawer.Screen
        component={StockSales}
        name="StockSales"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Stock Sales" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={StockSalesList}
        name="StockSalesList"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="Stock Sales List" />,
        }}
      />
      {/* --------------------- Settings------------------- */}
      <Drawer.Screen
        component={SettingsMenu}
        name="SettingsMenu"
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Settings" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={CustomerCategoryList}
        name="CustomerCategoryList"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="Customer Category" />,
        }}
      />
      <Drawer.Screen
        component={CustomerCategory}
        name="CustomerCategory"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Customer Category" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={BranchArea}
        name="BranchArea"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Branch Area" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={BranchAreaList}
        name="BranchAreaList"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="Branch Area" />,
        }}
      />
      <Drawer.Screen
        component={BranchStaff}
        name="BranchStaff"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Branch Staff" disableSearch />
          ),
        }}
      />
      <Drawer.Screen
        component={BranchStaffList}
        name="BranchStaffList"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => <TitleBar {...props} title="Branch Staff" />,
        }}
      />
      <Drawer.Screen
        component={TabToScan}
        name="TabToScan"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Tab to Scan Banner" disableSearch />
          ),
        }}
      />

      <Drawer.Screen
        component={Greetings}
        name="Greetings"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Greetings 🎂" />
          ),
        }}
      />
      <Drawer.Screen
        component={Notifications}
        name="Notifications"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Notifications" />
          ),
        }}
      />
      <Drawer.Screen
        component={Points}
        name="Points"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title={`Points`} />
          ),
        }}
      />



      <Drawer.Screen
        component={Appointment}
        name="Appointment"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Appointment" />
          ),
        }}
      />

      <Drawer.Screen
        component={ProductServiceScreen}
        name="ProductServiceScreen"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Product Service" />
          ),
        }}
      />

      <Drawer.Screen
        component={ZoomImageDetailScreen}
        name="ZoomImageDetailScreen"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Service Details" />
          ),
        }}
      />


      <Drawer.Screen
        component={RecentActivity}
        name="RecentActivity"
        initialParams={userDetails}
        options={{
          headerShown: true,
          header: (props) => (
            <TitleBar {...props} title="Recent Activity" disableSearch />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const DrawerContent = (props) => {
  const { signOut } = React.useContext(AuthContext);

  return (
    <View style={{ flex: 1 }}>
      <Drawer.Section style={{ marginBottom: 20 }}>
        <Image
          source={{ uri: props.branchImg }}
          style={{ width: "100%", height: 100 }}
          resizeMode={"contain"}
        />
      </Drawer.Section>

      <ScrollView {...props}>
        <Drawer.Item
          label="Dashboard"
          icon={({ color, size }) => <Icon name="view-dashboard" color={color} size={size} />}
          onPress={() => props.navigation.navigate("Dashboard", { search: "" })}
        />
        <Drawer.Item
          label="Customer"
          icon={({ color, size }) => <Icon name="account-group" color={color} size={size} />}
          onPress={() => props.navigation.navigate("CustomerList", { search: "" })}
        />
        <Drawer.Item
          label="Products"
          icon={({ color, size }) => <Icon name="shopping" color={color} size={size} />}
          onPress={() => props.navigation.navigate("ProductTabs", { search: "" })}
        />
        <Drawer.Item
          label="Catalogs"
          icon={({ color, size }) => <Icon name="book-open-variant" color={color} size={size} />}
          onPress={() => props.navigation.navigate("Catalogs", { search: "" })}
        />
        <Drawer.Item
          label="Voucher"
          icon={({ color, size }) => <Icon name="ticket-percent" color={color} size={size} />}
          onPress={() => props.navigation.navigate("VoucherList", { search: "", show: false })}
        />
        {/* <Drawer.Item
          label="SMS"
          icon={({ color, size }) => <Icon name="message-text" color={color} size={size} />}
          onPress={() => props.navigation.navigate("SMS", { search: "" })}
        /> */}
        <Drawer.Item
          label="Settings"
          icon={({ color, size }) => <Icon name="cog" color={color} size={size} />}
          onPress={() => props.navigation.navigate("SettingsMenu", { search: "" })}
        />
        <Drawer.Item
          label="Reviews"
          icon={({ color, size }) => <Icon name="star-circle" color={color} size={size} />}
          onPress={() => props.navigation.navigate("ReviewFeedback", { search: "" })}
        />
        <Drawer.Item
          label="Stock Transfer"
          icon={({ color, size }) => <Icon name="truck-fast" color={color} size={size} />}
          onPress={() => props.navigation.navigate("StockList", { search: "" })}
        />
        <Drawer.Item
          label="Stock Acceptance"
          icon={({ color, size }) => <Icon name="check-circle" color={color} size={size} />}
          onPress={() => props.navigation.navigate("StockAcceptanceList", { search: "" })}
        />
        <Drawer.Item
          label="Stock Sales"
          icon={({ color, size }) => <Icon name="cash-multiple" color={color} size={size} />}
          onPress={() => props.navigation.navigate("StockSalesList", { search: "" })}
        />
        <Drawer.Item
          label="Log Out"
          icon={({ color, size }) => <Icon name="logout" color={color} size={size} />}
          onPress={signOut}
        />
      </ScrollView>

      <Drawer.Section title="Quicktagg (1.0.0)">
        <Divider />
        <View style={[MyStyles.row, { justifyContent: "space-evenly" }]}>
          <TouchableRipple onPress={() => Linking.openURL("tel:8810301779")}>
            <Avatar.Icon icon="phone" size={40} style={{ backgroundColor: "#2E86C1" }} />
          </TouchableRipple>
          <TouchableRipple onPress={() => Linking.openURL("whatsapp://send?text=&phone=91" + "8810301779")}>
            <Avatar.Icon icon="whatsapp" size={40} style={{ backgroundColor: "green" }} />
          </TouchableRipple>
        </View>
      </Drawer.Section>
    </View>
  );
};

export default DrawerComponent;
