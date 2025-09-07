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
  FAB,
  TextInput,
  IconButton,
  Card,
  Portal,
  Modal,
  Subheading,
  ToggleButton,
  Checkbox,
} from "react-native-paper";
import MyStyles from "../../Styles/MyStyles";
import DropDown from "../../Components/DropDown";
import DatePicker from "../../Components/DatePicker";
import moment from "moment";
import Loading from "../../Components/Loading";
import { postRequest } from "../../Services/RequestServices";
import { CapitalizeName } from "../../utils/CapitalizeName";

const StockAcceptance = (props) => {
  const { userToken, branchId, tran_id } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [isSelected, setSelected] = useState(false);
  const [param, setparam] = useState({
    tran_id: "0",
    st_id: "",
    date: "",
    entry_no: "",
    to_branch_id: "",
    remarks: "",
    status: "",
    stock_acceptance_products: [],
  });

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [acceptanceProducts, setAcceptanceProducts] = useState([]);
  const [branchlist, setbranchlist] = useState([]);

  React.useEffect(() => {
    BranchList();

    postRequest(
      "transactions/stockAcceptance/preview",
      { tran_id: tran_id },
      userToken
    ).then((item) => {

      let resp = item[0];
      let resp1 = item[1];
      
      param.tran_id = resp[0].accept_tran_id;
      param.st_id = resp[0].tran_id;
      param.date = resp[0].date;
      param.entry_no = resp[0].entry_no;
      param.to_branch_id = resp[0].to_branch_id;
      param.remarks = resp[0].remarks;
      param.status = resp[0].status;
      setparam({ ...param });

      setSelectedProducts(resp1);
      //console.log(item);
      setLoading(false);
    });
  }, []);

  const BranchList = () => {
    postRequest("transactions/stockin/getbranchlist", {}, userToken).then(
      (resp) => {
        console.log(`s a -> ${JSON.stringify(resp)}`)
        if (resp.status == 200) {
          setbranchlist(resp.data);
        } else {
          Alert.alert(
            "Error !",
            "Oops! \nSeems like we run into some Server Error"
          );
        }
      }
    );
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
            <View style={MyStyles.cover}>
              <Text style={{ textAlign: "left", fontSize: 20, marginBottom: 10 }}>Status : {param.status}</Text>
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
                  backgroundColor: "rgba(0,0,0,0)",
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
                    marginVertical: 5,
                  }}
                >
                  <Image
                    source={{ uri: resp.url_image + "" + resp.image_path }}
                    style={{
                      height: 100,
                      width: 80,
                      marginHorizontal: 5,
                      borderRadius: 5,
                      
                    }}
                  />
                  <View style={{marginLeft: 10}}>
                    <Text numberOfLines={1} style={{ paddingRight: 120, fontWeight: 'bold' }}>
                      {CapitalizeName(resp.product)}
                    </Text>
                    <Text numberOfLines={1}>{resp.product_code}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 10,
                      }}
                    >
                      <Text>QTY: <Text style={{fontWeight: 'bold'}}>{resp.qty}</Text></Text>

                      <Checkbox.Android
                        status={
                          resp.qty == resp.accept ? "checked" : "unchecked"
                        }
                        style={{ alignSelf: "center" }}
                        onPress={() => {
                          if (resp.qty == resp.accept) {
                            resp.accept = 0;
                          } else {
                            resp.accept = resp.qty;
                          }
                          setSelectedProducts([...selectedProducts]);
                        }}
                      />
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
        <View
          style={[
            MyStyles.row,
            { justifyContent: "center", marginVertical: 40 },
          ]}
        >
          {param.status == "Done" || param.status == "Cancel" ? null :
            <Button
              mode="contained"
              uppercase={false}
              labelStyle={{color: '#000'}}
              style={{borderRadius: 5}}
              onPress={() => {
                setLoading(true);
                var stock_acceptance_products = [];
                selectedProducts.forEach((item) => {
                  if (item.accept == item.qty) {
                    stock_acceptance_products.push({
                      product_id: item.product_id,
                      stp_id: item.tran_id,
                      qty: item.qty,
                    });
                  }
                });
                param.stock_acceptance_products = stock_acceptance_products;
                postRequest(
                  "transactions/stockAcceptance/insert",
                  param,
                  userToken
                ).then((resp) => {
                  if (resp.valid) {
                    props.navigation.goBack();
                  }
                  setLoading(false);
                });
              }}
            >
              Submit
            </Button>
          }
        </View>
      </View>
    </ImageBackground>
  );
};
export default StockAcceptance;
