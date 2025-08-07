import React, { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  View,
  Image,
  FlatList,
  Alert,
  TextInput as Input,
} from "react-native";
import {
  Button,
  Text,

  TextInput,
  IconButton,

  Portal,
  Modal,

} from "react-native-paper";
import MyStyles from "../../Styles/MyStyles";
import SelectMultiple from "../../Components/SelectMultiple";
import SelectCustomer from "../../Components/SelectCustomer";
import DatePicker from "../../Components/DatePicker";
import moment from "moment";
import Loading from "../../Components/Loading";
import { postRequest } from "../../Services/RequestServices";
import { CapitalizeName } from "../../utils/CapitalizeName";


const StockSales = (props) => {
  const { userToken, branchId, tran_id } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [param, setparam] = useState({
    subcategory_id: "",
    min_amount: "",
    max_amount: "",
    tran_id: "0",
    mobile: "",
    customer_id: "",
    customer_name: "",
    date: moment(),
    entry_no: "",
    title: "",
    remarks: "",
    customer_sale_products: [],
  });
  const [product, setProduct] = useState(false);
  const [contact, setContact] = useState(false);
  const [remarks, setRemarks] = useState(false);
  const [productList, setProductList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [subcategorylist, setsubcategorylist] = useState([]);
  const [customerList, setCustomerList] = useState([]);

  React.useEffect(() => {
    ProductList();
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
    postRequest("transactions/stockSales/preview", { tran_id: tran_id }, userToken).then((resp) => {
      if (resp.status == 200) {

        if (tran_id == 0) {
          param.entry_no = resp.data[0].entry_no;
          setparam({ ...param });
        } else {
          console.log(resp);
          param.tran_id = tran_id;
          param.entry_no = resp.data[0].entry_no;
          param.title = resp.data[0].title;
          param.remarks = resp.data[0].remarks;
          param.customer_id = resp.data[0].customer_id;
          param.customer_name = resp.data[0].customer_name;
          param.customer_sale_products = resp.data[0].products;
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
                  item.customer_id === resp.data[0].customer_id;
              });
              console.log(listData);
              setCustomerList(listData);

            } else {
              Alert.alert(
                "Error !",
                "Oops! \nSeems like we run into some Server Error"
              );
            }
          });



          setSelectedProducts(resp.data[0].products);
        }
        setLoading(false);
      }
    });

  }, []);


  const ProductList = () => {
    postRequest(
      "transactions/stockTransfer/getProducts",
      { search: "" },
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
          <View style={{ borderBottomColor: "black", borderBottomWidth: 1 }}>
            <View
              style={[
                MyStyles.row,
                { justifyContent: "space-evenly", marginVertical: 40 },
              ]}
            >
              <Button
                mode="contained"
                uppercase={false}
                style={{ borderRadius: 5 }}
                labelStyle={{ color: "black" }}
                onPress={() => {
                  setProduct(true);
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
                  let validate1 = false, validate2 = false;
                  if (param.tran_id == 0) {

                    selectedProducts.map((item, i) => {
                      if (item.qty2 == undefined) {
                        validate1 = true;
                      }
                      else if (item.qty2 == "") {
                        validate2 = true;
                      }
                      else if (item.qty < item.qty2) {
                        validate2 = true;
                      }
                    });
                  }
                  if (selectedProducts.length == "0") {
                    Alert.alert("Add Products!");
                  }
                  else if (validate1 == true) {
                    Alert.alert("Please Fill Qty!");
                  }
                  else if (validate2 == true) {
                    Alert.alert("Please Check Qty!");
                  }
                  else {
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
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    width: "100%",
                    marginVertical: 8,
                  }}
                >
                  <Image
                    source={{ uri: item.url_image + "" + item.image_path }}
                    style={{
                      height: 100,
                      width: 80,
                      marginHorizontal: 5,
                      borderRadius: 5,
                    }}
                  />
                  <View>
                    <Text numberOfLines={1} style={{ paddingRight: 120, fontWeight: 'bold' }}>
                      {CapitalizeName(item.product_name)}
                    </Text>
                    <Text numberOfLines={1}>{item.product_code}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 20,
                      }}
                    >
                      <Text style={{ paddingRight: 40, fontWeight: 'bold' }}>
                        {item.qty}
                      </Text>
                      {param.tran_id == 0 ?
                        <TextInput
                          mode="outlined"
                          placeholder="QTY"
                          style={{
                            backgroundColor: "rgba(0,0,0,0)",
                            height: 42,
                            width: 80,
                            marginHorizontal: -2,
                            textAlign: "center",
                          }}
                          value={item.qty2}
                          onChangeText={(text) => {
                            if (text > item.qty) {
                              Alert.alert("Please Check Qty !");
                            }
                            else {
                              item.qty2 = text;
                            }
                            setSelectedProducts([...selectedProducts]);
                          }}
                          keyboardType="number-pad"
                        />
                        : null}
                    </View>
                  </View>
                  <IconButton
                    icon="close"
                    size={15}
                    style={{ marginLeft: "auto" }}
                    onPress={() => {
                      const newObj = selectedProducts.filter(task => task.product_id !== item.product_id);
                      setSelectedProducts(newObj);
                    }}
                  />
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <SelectMultiple
        visible={product}
        data={productList}
        onDone={(items) => {
          let tempProduct = [];
          items.map((item, i) => {
            let checkproduct = tempProduct.findIndex((e) => e.product_id == item.product_id) > -1 ? false : true;
            console.log('item', item);
            if (checkproduct) {
              tempProduct.push(item);
            }
          });
          setSelectedProducts(tempProduct);
        }}
        onClose={() => setProduct(false)}
      />

      <SelectCustomer
        visible={contact}
        data={customerList}
        multiple={false}
        onDone={(items) => {

          if (items.length == 0) {
            Alert.alert(
              "Oops! \n Please select customer!"
            );
            param.customer_id = "";
            param.customer_name = "";
            param.mobile = "";
            setparam({ ...param });
          } else {
            setRemarks(true);
            items.map((item, index) => {
              param.customer_id = item.customer_id;
              param.customer_name = item.full_name;
              param.mobile = item.mobile;
              setparam({ ...param });
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
                    param.title = text;
                    setparam({ ...param });
                  }}
                  style={{ backgroundColor: "rgba(0,0,0,0)", marginVertical: 10 }}
                />
                <DatePicker
                  label=" Date"
                  inputStyles={{
                    backgroundColor: "rgba(0,0,0,0)",
                  }}
                  value={param.date}
                  onValueChange={(date) => {
                    setparam({ ...param, date: date });
                  }}
                />


                <TextInput
                  mode="outlined"
                  placeholder="Remarks"
                  multiline
                  numberOfLines={3}
                  style={{ backgroundColor: "rgba(0,0,0,0)", marginTop: 10 }}
                  value={param.remarks}
                  onChangeText={(text) => {
                    setparam({ ...param, remarks: text });
                  }}
                />
                <View
                  style={[
                    MyStyles.row,
                    { justifyContent: "center", marginVertical: 40 },
                  ]}
                >
                  <Button
                    mode="contained"
                    uppercase={false} style={{ borderRadius: 5 }}
                    labelStyle={{ color: "black" }}
                    onPress={() => {
                      if (param.title == "") {
                        Alert.alert("please fill title !");
                      } else {

                        let tempData = [];
                        selectedProducts.map((item, i) => {
                          tempData.push({ "product_id": item.product_id, "qty": param.tran_id == 0 ? item.qty2 : item.qty });
                        });
                        param.customer_sale_products = tempData;
                        setparam({ ...param });
                        //console.log(param);

                        setLoading(true);
                        postRequest(
                          "transactions/stockSales/insert",
                          param,
                          userToken
                        ).then((resp) => {
                          if (resp.status == 200) {

                            if (resp.data[0].valid) {
                              setRemarks(!remarks)
                              props.navigation.navigate("StockSalesList");
                            }
                            setLoading(false);
                          }
                        });
                      }
                    }}
                  >
                    Submit
                  </Button>
                </View>
              </View>
            </View>
          </ImageBackground>
        </Modal>
      </Portal>
    </ImageBackground>
  );
};

export { StockSales };
