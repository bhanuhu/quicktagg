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


const StockTransferPreview = (props) => {
  const { userToken, branchId, tran_id } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [param, setparam] = useState({
    tran_id: "0",
    date: moment(),
    entry_no: "",
    to_branch_id: "",
    remarks: "",
    status: "",
    stock_transfer_products: [],
  });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [branchlist, setbranchlist] = useState([]);

  React.useEffect(() => {
    BranchList();
    postRequest("transactions/stockTransfer/preview", { tran_id: tran_id }, userToken).then((resp) => {
      if (resp.status == 200) {
        //console.log(resp);
        param.tran_id = resp.data[0].tran_id;
        param.to_branch_id = resp.data[0].to_branch_id;
        param.entry_no = resp.data[0].entry_no;
        param.remarks = resp.data[0].remarks;
        param.status = resp.data[0].status;
        param.stock_transfer_products = resp.data[1];
        setparam({ ...param });
        setSelectedProducts(resp.data[1]);

      }
      setLoading(false);
    });

  }, []);

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

  return (
    <ImageBackground
      style={MyStyles.container}
      source={require("../../assets/login-bg.jpg")}
    >
      <Loading isloading={loading} />
      <View style={MyStyles.cover}>
        <ScrollView>
          <View style={{ borderBottomColor: "black", borderBottomWidth: 1 }}>
            <Text style={{ textAlign: "left", fontSize: 20 }}>Status : {param.status}</Text>
            <TextInput
              mode="outlined"
              placeholder="Entry No"
              value={param.entry_no}
              disabled={true}
              style={{ backgroundColor: "rgba(0,0,0,0)" }}
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
              disabled={true}
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
              disabled={true}
            />
            <TextInput
              mode="outlined"
              placeholder="Remarks"
              multiline
              numberOfLines={3}
              style={{ backgroundColor: "rgba(0,0,0,0)" }}
              value={param.remarks}
              onChangeText={(text) => {
                setparam({ ...param, remarks: text });
              }}
              disabled={true}
            />

            <View
              style={[
                MyStyles.row,
                { justifyContent: "space-evenly", marginVertical: 20 },
              ]}
            >
            </View>
          </View>

          {selectedProducts.map((resp, index) => {
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
                    source={{ uri: resp.url_image + "" + resp.image_path }}
                    style={{
                      height: 100,
                      width: 80,
                      marginHorizontal: 5,
                      borderRadius: 5,
                    }}
                  />
                  <View>
                    <Text numberOfLines={1} style={{ paddingRight: 120, fontWeight: '' }}>
                      {CapitalizeName(resp.product_name)}
                    </Text>
                    <Text numberOfLines={1}>{resp.product_code}</Text>
                  
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 10,
                      }}
                    >
                      <Text style={{ paddingRight: 40 }}>
                        {resp.transfer_qty}  
                      </Text>                     
                    </View>
                    <Text numberOfLines={1} style={{color:"green"}}>{resp.status}</Text>
                  </View>

                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export { StockTransferPreview };
