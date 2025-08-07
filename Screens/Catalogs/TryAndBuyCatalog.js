import React, { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  View,
  Image,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";
import {
  Button,
  Text,
  FAB,
  TextInput,
  IconButton,
  Card,
  Portal,
  Modal,
  Subheading,
} from "react-native-paper";
import MyStyles from "../../Styles/MyStyles";
import DropDown from "../../Components/DropDown";
import MultipleImages from "../../Components/MultipleImages";
import CustomHeader from "../../Components/CustomHeader";
import SelectMultiple from "../../Components/SelectMultiple";
import SelectCustomer from "../../Components/SelectCustomer";
import DatePicker from "../../Components/DatePicker";
import moment from "moment";
import Loading from "../../Components/Loading";
import { postRequest } from "../../Services/RequestServices";
import LinearGradient from 'react-native-linear-gradient';
import { CapitalizeName } from "../../utils/CapitalizeName";

const TryAndBuyCatalogList = (props) => {
  const { userToken, search } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [griddata, setgriddata] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = () => {
    setRefreshing(true);
    Browse();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  React.useEffect(() => {
    Browse();
  }, [props]);

  const Browse = (id) => {
    postRequest(
      "transactions/customer/trialsession/browse_app",
      { search: search == undefined ? "" : search },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        setgriddata(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
    setLoading(false);
  };
  const Delete = (id) => {
    setLoading(true);
    postRequest(
      "transactions/customer/trial/delete",
      { tran_id: id },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        if (resp.data[0].valid) {
          Browse();
        }
        setLoading(false);
      }
    });
  };
  return (
    <View style={MyStyles.container}>
      <Loading isloading={loading} />
      <FlatList
        data={griddata}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ marginVertical: 10 }}
        renderItem={({ item, index }) => (
          <Card
            key={item.voucher_id}
            style={{
              marginHorizontal: 20,
              padding: 0,
              borderRadius: 10,
              marginVertical: 5,
              backgroundColor: "white"
            }}
          >
            <LinearGradient
              colors={["#F6356F", "#FF5F50"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                backgroundColor: "pink",
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                margin: 0,
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: "bold",
                  color: 'white',
                  paddingVertical: 5
                }}
              >
                {CapitalizeName(item.title)}
              </Text>
            </LinearGradient>
            <Card.Content>
              <View style={MyStyles.row}>
                <View style={{ maxWidth: "80%" }}>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {item.entry_no} {"                "} {item.date}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {item.no_of_customer} {"Customers"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      marginBottom: 10,
                    }}
                  >
                    {item.product_count} {"Products"}
                  </Text>
                  <Text>{CapitalizeName(item.remarks)}</Text>
                </View>
                <View>
                  <IconButton
                    icon="pencil"
                    iconColor="#AAA"
                    onPress={() =>
                      props.navigation.navigate("TryAndBuyCatalog", {
                        tran_id: item.tran_id,
                      })
                    }
                  />
                  <IconButton
                    icon="delete"
                    iconColor="#AAA"
                    onPress={() => {
                      Alert.alert("Alert", "You want to delete?", [
                        {
                          text: "No",
                          onPress: () => { },
                          style: "cancel",
                        },
                        {
                          text: "Yes",
                          onPress: () => {
                            Delete(item.tran_id);
                          },
                        },
                      ]);
                    }}
                  />
                </View>

              </View>
            </Card.Content>
          </Card>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      <FAB
        style={{
          position: "absolute",
          bottom: '4%',
          right: '4%',
          borderRadius: 50,
          backgroundColor: MyStyles.primaryColor.backgroundColor
        }}
        icon="plus"
        color="#000"
        onPress={() =>
          props.navigation.navigate("TryAndBuyCatalog", { tran_id: 0 })
        }
      />
    </View>
  );
};

const TryAndBuyCatalog = (props) => {
  const { userToken, branchId, tran_id } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [param, setparam] = useState({
    tran_id: 0,
    subcategory_id: "",
    min_amount: "",
    max_amount: "",
    title: "",
    entry_no: "",
    remarks: "",
    product_ids: [],
    customers: [],
  });
  const [product, setProduct] = useState(false);
  const [contact, setContact] = useState(false);
  const [remarks, setRemarks] = useState(false);
  const [productList, setProductList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [subcategorylist, setsubcategorylist] = useState([]);

  React.useEffect(() => {
    postRequest(
      "transactions/customer/session/getSubcategory",
      { branch_id: branchId },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        var _subcategoryList = [];
        resp.data.map((item, index) => {
          _subcategoryList.push({
            subcategory_id: item.subcategory_id,
            subcategory_name:
              item.subcategory_name + " (" + item.category_name + ")",
          });
        });
        setsubcategorylist(_subcategoryList);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
    if (tran_id == 0) {
      postRequest(
        "transactions/customer/customerListMob",
        { branch_id: branchId },
        userToken
      ).then((resp) => {
        if (resp.status == 200) {
          setCustomerList(resp.data);
        } else {
          Alert.alert(
            "Error !",
            "Oops! \nSeems like we run into some Server Error"
          );
        }
      });
    }
    postRequest(
      "transactions/customer/trialsession/preview-session",
      { tran_id: tran_id },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        if (tran_id == 0) {
          param.entry_no = resp.data[0].entry_no;
          setparam({ ...param });
        } else {
          console.log(resp);
          param.tran_id = resp.data[0].tran_id;
          param.title = resp.data[0].title;
          param.entry_no = resp.data[0].entry_no;
          param.remarks = resp.data[0].remarks;
          param.subcategory_id = resp.data[0].products[0].subcategory_id;
          param.product_ids = resp.data[0].products;
          setparam({ ...param });
          postRequest(
            "transactions/customer/customerListMob",
            { branch_id: branchId },
            userToken
          ).then((items) => {
            if (items.status == 200) {
              let listData = [];
              listData = items.data;
              listData.map((item, index) => {
                listData[index].selected =
                  resp.data[0].customers.findIndex(
                    (e) => e.customer_id === item.customer_id
                  ) > -1
                    ? true
                    : false;
              });
              setCustomerList(listData);
            } else {
              Alert.alert(
                "Error !",
                "Oops! \nSeems like we run into some Server Error"
              );
            }
          });

          let tempData = Object.values(
            param.product_ids.reduce((acc, item) => {
              if (!acc[item.text])
                acc[item.text] = {
                  subcategory_name: item.text,
                  data: [],
                };
              acc[item.text].data.push(item);
              return acc;
            }, {})
          );

          setSelectedProducts(tempData);
        }
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });

    setLoading(false);
  }, []);

  const ProductList = () => {
    let data = {
      subcategory_id: param.subcategory_id,
      min_amount: param.min_amount == "" ? "1" : param.min_amount,
      max_amount: param.max_amount == "" ? "10000000" : param.max_amount,
    };
    postRequest(
      "transactions/customer/session/getProducts",
      data,
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        setProductList(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
    setLoading(false);
  };

  return (
    <ImageBackground
      style={MyStyles.container}
      source={require("../../assets/login-bg.jpg")}
    >
      <Loading isloading={loading} />
      <View style={MyStyles.cover}>
        <ScrollView>
          <View style={{ borderBottomColor: "black", borderBottomWidth: 1, marginBottom: 10 }}>
            <DropDown
              data={subcategorylist}
              ext_val="subcategory_id"
              ext_lbl="subcategory_name"
              value={param.subcategory_id}
              onChange={(val) => {
                param.subcategory_id = val;
                setparam({ ...param });
                ProductList();
              }}
              placeholder="SubCategory"
            />
            <TextInput
              mode="outlined"
              placeholder="Min. Amount"
              style={{ backgroundColor: "rgba(0,0,0,0)", marginVertical: 5 }}
              value={param.min_amount}
              keyboardType={"number-pad"}
              onChangeText={(text) => {
                setparam({ ...param, min_amount: text });
                ProductList();
              }}
            />
            <TextInput
              mode="outlined"
              placeholder="Max. Amount"
              style={{ backgroundColor: "rgba(0,0,0,0)" }}
              value={param.max_amount}
              keyboardType={"number-pad"}
              onChangeText={(text) => {
                setparam({ ...param, max_amount: text });
                ProductList();
              }}
            />
            <View
              style={[
                MyStyles.row,
                { justifyContent: "space-evenly", marginVertical: 20 },
              ]}
            >
              <Button
                mode="contained"
                uppercase={false}
                style={{ borderRadius: 5 }}
                labelStyle={{ color: "black" }}
                onPress={() => {
                  if (param.subcategory_id == "") {
                    Alert.alert("select subcategory!");
                  }
                  // else if (param.min_amount == "") {
                  //   Alert.alert("select min. amount!");
                  // } else if (param.max_amount == "") {
                  //   Alert.alert("select max. amount!");
                  // } 
                  else {
                    setProduct(true);
                  }
                }}
              >
                Add Products
              </Button>
              <Button
                mode="contained"
                uppercase={false}
                style={{ borderRadius: 5 }}
                labelStyle={{ color: "black" }}
                onPress={() => {
                  if (selectedProducts.length == "0") {
                    Alert.alert("add products!");
                  } else {
                    setContact(true);
                  }
                }}
              >
                Next
              </Button>
            </View>
          </View>

          {selectedProducts.map((item, index) => {
            return (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 15,
                }}
              >
                <Subheading style={{ width: "100%", color: "#000", fontSize: 14, marginBottom: 10, fontWeight: 'bold' }}>
                  {CapitalizeName(item.category_name)}
                </Subheading>
                {item.data.map((item, i) => (
                  <View key={i} style={{ marginBottom: 10 }}>
                    <IconButton
                      icon="close"
                      style={{
                        backgroundColor: "lightgray",
                        position: "absolute",
                        right: 10,
                        top: 2,
                        zIndex: 10,
                      }}
                      size={14}
                      onPress={() => {

                        selectedProducts[index].data.splice(i, 1);
                        if (selectedProducts[index].data.length == "0") {
                          selectedProducts[index].category_name = '';
                        }
                        setSelectedProducts([...selectedProducts]);
                        const newObj = param.product_ids.filter(task => task.product_id !== item.product_id);
                        param.product_ids = newObj;
                        console.log(param);
                      }}
                    />
                    <View
                      key={i}
                      style={{
                        backgroundColor: "#FFF",
                        marginRight: 10,
                        borderRadius: 5,
                        width: 100,
                        alignItems: "center",
                        zIndex: 1,
                        borderWidth: 0.5,
                        borderColor: "#AAA",
                      }}
                    >
                      <Card.Cover
                        source={{ uri: item.url_image + "" + item.image_path }}
                        style={{ width: 75, height: 75, borderRadius: 5 }}
                      />

                      <View style={{ padding: 5 }}>
                        <Text style={{ fontSize: 13, fontWeight: 'bold' }}>
                          {CapitalizeName(item.product_name)}
                        </Text>
                        <Text>{item.product_code}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* ImagePath change direct Component se kr lena */}

      <SelectMultiple
        visible={product}
        data={productList}
        onDone={(items) => {
          items.map((item, i) => {
            let checkproduct =
              param.product_ids.findIndex(
                (e) => e.product_id == item.product_id
              ) > -1
                ? false
                : true;
            if (checkproduct) {
              param.product_ids.push(item);
            }
          });
          setparam({ ...param, product_ids: param.product_ids });

          let tempData = Object.values(
            param.product_ids.reduce((acc, item) => {
              if (!acc[item.category_name])
                acc[item.category_name] = {
                  category_name: item.category_name,
                  data: [],
                };
              acc[item.category_name].data.push(item);
              return acc;
            }, {})
          );

          setSelectedProducts(tempData);
        }}
        onClose={() => setProduct(false)}
      />
      <SelectCustomer
        visible={contact}
        data={customerList}
        onDone={(items) => {
          setSelectedContacts(items);

          if (items.length == 0) {
            Alert.alert(

              "Oops! \n Please select customer!"
            );
            setparam({ ...param, customers: [] });
          } else {
            setRemarks(true);
            items.map((item, index) => {
              param.customers.push({
                customer_id: item.customer_id,
                mobile: item.mobile,
                customer_name: item.full_name,
              });
              setparam({ ...param, customers: param.customers });
            });
            setContact(false)
          }
        }}
        onClose={() => setContact(false)}
      />
      <Portal>
        <Modal visible={remarks} contentContainerStyle={{ flex: 1 }}>
          <ImageBackground
            style={MyStyles.container}
            source={require("../../assets/login-bg.jpg")}
          >
            <View style={{ flex: 1 }}>
              <View
                style={[MyStyles.row, MyStyles.primaryColor, { marginTop: 0 }]}
              >
                <IconButton
                  icon="chevron-left"
                  size={30}
                  color="black"
                  onPress={() => {
                    setContact(true);
                    setRemarks(false);
                  }}
                />
                <Text style={{ fontWeight: "bold", fontSize: 18, flexGrow: 1 }}>
                  Enter Remarks
                </Text>
              </View>
              <View style={MyStyles.cover}>
                <TextInput
                  mode="outlined"
                  placeholder="Entry No"
                  value={param.entry_no}
                  disabled={true}
                  style={{ backgroundColor: "rgba(0,0,0,0)" }}
                />
                <TextInput
                  mode="outlined"
                  placeholder="Title"
                  value={param.title}
                  onChangeText={(text) => {
                    setparam({ ...param, title: text });
                  }}
                  style={{ backgroundColor: "rgba(0,0,0,0)", marginVertical: 5 }}
                />
                <TextInput
                  mode="outlined"
                  placeholder="Remarks"
                  // multiline
                  numberOfLines={3}
                  style={{ backgroundColor: "rgba(0,0,0,0)" }}
                  value={param.remarks}
                  onChangeText={(text) => {
                    setparam({ ...param, remarks: text });
                  }}
                />
                <View
                  style={[
                    MyStyles.row,
                    { justifyContent: "center", marginVertical: 20 },
                  ]}
                >
                  {tran_id == 0 ?
                    <Button
                      mode="contained"
                      uppercase={false}
                      style={{ borderRadius: 5 }}
                      labelStyle={{ color: "black" }}
                      onPress={() => {
                        if (param.title == "") {
                          Alert.alert("please fill title !");
                        } else {
                          setLoading(true);
                          postRequest(
                            "transactions/customer/trial/insert",
                            param,
                            userToken
                          ).then((resp) => {

                            if (resp.status == 200) {
                              setRemarks(false);
                              props.navigation.navigate("TryAndBuyCatalogList");
                              setLoading(false);
                            }
                          });
                        }
                      }}
                    >
                      Submit
                    </Button>
                    : null
                  }
                </View>
              </View>
            </View>
          </ImageBackground>
        </Modal>
      </Portal>
    </ImageBackground>
  );
};

export { TryAndBuyCatalog, TryAndBuyCatalogList };
