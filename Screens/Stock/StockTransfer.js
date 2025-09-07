import React, { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  View,
  Image,
  FlatList,
  Alert
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
  ToggleButton,
} from "react-native-paper";
import MyStyles from "../../Styles/MyStyles";
import DropDown from "../../Components/DropDown";
import MultipleImages from "../../Components/MultipleImages";
import SelectMultiple from "../../Components/SelectMultiple";
import SelectCustomer from "../../Components/SelectCustomer";
import DatePicker from "../../Components/DatePicker";
import moment from "moment";
import Loading from "../../Components/Loading";
import { postRequest } from "../../Services/RequestServices";
import { CapitalizeName } from "../../utils/CapitalizeName";


const StockTransfer = (props) => {
  const { userToken, branchId, tran_id } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [param, setparam] = useState({
    tran_id: "0",
    date: moment(),
    entry_no: "",
    to_branch_id: "",
    remarks: "",
    stock_transfer_products: [],
  });
  const [product, setProduct] = useState(false);
  const [remarks, setRemarks] = useState(false);
  const [productList, setProductList] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [tempProducts, setTempProducts] = useState([]);
  const [branchlist, setbranchlist] = useState([]);

  React.useEffect(() => {

    ProductList();
    postRequest("transactions/stockTransfer/preview", { tran_id: tran_id }, userToken).then((resp) => {
      if (resp.status == 200) {
        BranchList();
        if (tran_id == 0) {
          param.entry_no = resp.data[0].entry_no;
          console.log("param",param)
          setparam({ ...param });
        }
        else {
          //console.log(resp);
          param.tran_id = resp.data[0].tran_id;
          param.to_branch_id = resp.data[0].to_branch_id;
          param.entry_no = resp.data[0].entry_no;
          param.remarks = resp.data[0].remarks;
          param.stock_transfer_products = resp.data[1];
          setparam({ ...param });
          setSelectedProducts(resp.data[1]);
        }
      }
      setLoading(false);
    });

  }, [props]);

  const BranchList = () => {
    postRequest(
      "transactions/stockin/getbranchlist",
      {},
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        setbranchlist(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
  }
  const ProductList = () => {

    postRequest(
      "transactions/stockTransfer/getProducts",
      { search: "" },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        //console.log(resp.data);
        setProductList(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });

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
            {/* <DropDown
              data={subcategorylist}
              ext_val="subcategory_id"
              ext_lbl="subcategory_name"
              value={param.subCategory}
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
              style={{ backgroundColor: "rgba(0,0,0,0)" }}
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
            /> */}
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
                  if (selectedProducts.length == "0") {
                    Alert.alert("add products!");
                  } else {
                    setRemarks(true);
                  }
                }}
              >
                Next
              </Button>
            </View>
          </View>

          {selectedProducts.map((resp, index) => {
            return (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  marginBottom: 10
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
                    source={{ uri: resp.url_image + "" + resp.image_path }}
                    style={{
                      height: 100,
                      width: 90,
                      marginHorizontal: 5,
                      borderRadius: 5,
                    }}
                  />
                  <View>
                    <Text numberOfLines={1} style={{ paddingRight: 120, fontWeight: 'bold' }}>
                      {CapitalizeName(resp.product_name)}
                    </Text>
                    <Text numberOfLines={1}>{resp.product_code}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 20,
                        flex: 3
                      }}
                    >
                      <View style={{ width: 60, paddingRight: 20 }}>
                        <Text>{resp.qty}</Text>
                      </View>
                      <TextInput
                        mode="outlined"
                        placeholder="QTY"
                        style={{
                          backgroundColor: "rgba(0,0,0,0)",
                          height: 15,
                          width: 70,
                          marginHorizontal: -2,
                          textAlign: "center",
                          marginRight: 10,
                          fontWeight: 'bold'

                        }}
                        value={resp.transfer_qty.toString()}
                        onChangeText={(text) => {
                          if (text > resp.qty) {
                            Alert.alert("please check qty");
                          }
                          else {
                            resp.transfer_qty = text;
                          }
                          setSelectedProducts([...selectedProducts]);
                        }}
                        keyboardType="number-pad"
                      />
                      <Text numberOfLines={1} style={{ color: resp.status == "Pending" ? "red" : "green", marginLeft: 5 }}>{resp.status}</Text>
                    </View>

                  </View>
                  <IconButton
                    icon="close"
                    size={15}
                    style={{ marginLeft: "auto" }}
                    onPress={() => {
                      const newObj = selectedProducts.filter(task => task.product_id !== resp.product_id);
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
            item.transfer_qty = 1;
            if (checkproduct) {
              tempProduct.push(item);
            }
          });
          console.log(tempProduct);
          setSelectedProducts(tempProduct);
        }}
        onClose={() => setProduct(false)}
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
                    setRemarks(false);
                  }}
                />
                <Text style={{ fontWeight: "bold", fontSize: 18, flexGrow: 1 }}>
                  Enter Remarks
                </Text>
              </View>
              <View style={{
                flex: 1,
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.6)",
                margin: 10,
                borderRadius: 10,
                padding: 10,
              }}>
                <TextInput
                  mode="outlined"
                  placeholder="Entry No"
                  value={param.entry_no}
                  disabled={true}
                  style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 10 }}
                />
                <DatePicker
                  label=" Date"
                  inputStyles={{
                    backgroundColor: "rgba(0,0,0,0)", marginBottom: 5
                  }}
                  value={param.date}
                  onValueChange={(date) => {
                    setparam({ ...param, date: date });
                  }}
                />

                <DropDown
                  data={branchlist}
                  ext_val="branch_id"
                  ext_lbl="company_name"
                  value={param.to_branch_id}
                  onChange={(val) => {
                    param.to_branch_id = val;
                    setparam({ ...param });
                  }}
                  placeholder="To Branch"

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
                    uppercase={false}
                    style={{ borderRadius: 5 }}
                    labelStyle={{ color: "black" }}
                    onPress={() => {
                      if (param.to_branch_id == "") {
                        Alert.alert("please select To Branch !");
                      }
                      else {
                        let tempData = [];
                        selectedProducts.map((item, i) => {
                          tempData.push({ "product_id": item.product_id, "transfer_qty": item.transfer_qty });
                        });
                        param.stock_transfer_products = tempData;
                        setparam({ ...param });
                        console.log(param);

                        setLoading(true);
                        postRequest(
                          "transactions/stockTransfer/insert",
                          param,
                          userToken
                        ).then((resp) => {
                          if (resp.status == 200) {
                            setRemarks(!remarks)
                            // if (resp.data[0].valid) {
                            props.navigation.navigate("StockList");
                            // }
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

export { StockTransfer };
