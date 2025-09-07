import React, { useState, useEffect } from "react";
import { View, FlatList, Alert } from "react-native";
import { List, Text, TouchableRipple, Portal, Modal, IconButton } from "react-native-paper";
import MyStyles from "../../Styles/MyStyles";
import { postRequest } from "../../Services/RequestServices";
import DatePicker from "../../Components/DatePicker";
import { TouchableOpacity } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import moment from "moment";
import Loading from "../../Components/Loading";
import { CapitalizeName } from "../../utils/CapitalizeName";
const Stock = (props) => {
  const { userToken, branchId, search } = props.route.params;
  const [loading, setLoading] = useState(false);
  const [griddata, setgriddata] = useState([]);
  const [param, setparam] = useState({
    from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
    to_date: moment().format('YYYY-MM-DD'),
  });
  const [dateModal, setDateModal] = useState(false);
  React.useEffect(() => {
    fetchStockList();
  }, []);

  const fetchStockList = () => {
    setLoading(true);
    postRequest(
      "masters/dashboard/stock",
      { from_date: param.from_date, to_date: param.to_date, search: "" },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        console.log("Data------->",JSON.stringify(resp.data));
        setgriddata(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
      setLoading(false);
    });
  };
//name, mobile, branch
   const filteredData = React.useMemo(() => {
          
          if (!search || !griddata?.length) {
            return griddata || [];
          }
          
          const searchTerm = search.toLowerCase().trim();
          
          const result = griddata.filter((item) => {
            if (!item) return false;
            
            // Check each field for the search term
            const fieldsToSearch = [
              { name: 'branch_name', value: item.branch },
              { name: 'status', value: item.status},
              { name: 'entry_date', value: item.entry_date.replace("-", "/").replace("-", "/") ===
                moment().format("DD/MM/YYYY")
                ? item.created_time
                : item.created_time + "\n" + item.entry_date.replace("-", "/").replace("-", "/")},
            ];
            
            const hasMatch = fieldsToSearch.some(({ name, value }) => {
              if (!value) return false;
              const strValue = String(value).toLowerCase();
              const match = strValue.includes(searchTerm);
              if (match) {
                console.log(`Match found in ${name}:`, value);
              }
              return match;
            });
            
            return hasMatch;
          });
          
          return result;
        }, [griddata, search]);

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
          }}
          onDismiss={() => setDateModal(false)}
        >
          <View style={MyStyles.row}>
            <DatePicker
              mode="text"
              value={param.from_date}
              onValueChange={(date) => {
                param.from_date = date;
                setparam({ ...param });
                fetchStockList();
              }}
            />
            <Text>To</Text>
            <DatePicker
              mode="text"
              value={param.to_date}
              onValueChange={(date) => {
                param.to_date = date;
                setparam({ ...param });
                fetchStockList();
              }}
            />
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
        <TouchableOpacity
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
        </TouchableOpacity>
      </View>
      {filteredData?.length > 0 ? (
      <FlatList
        data={filteredData}
        initialNumToRender={10}
        refreshing={loading}
        onRefresh={fetchStockList}
        renderItem={({ item, index }) => (
          <View style={{ borderBottomWidth: 0.5, borderBottomColor: "#CCC" ,marginLeft:5}}>
            <List.Item
              key={item.tran_id}
              title={
                <Text style={{ fontWeight: 'bold' }}>
                  {CapitalizeName(item.branch)}
                </Text>
              }
              titleStyle={{ fontWeight: "bold" }}
              descriptionStyle={{ marginTop: 5 }}
              description={() => (
                <View>
                  <View style={{ flexDirection: 'row' }}>
                    <Text>#{item.entry_no}</Text>
                    <View style={{ marginLeft: 125 }}>
                      {
                        item.from == 'Transfer' ? <Icon name="transfer-right" color="red" size={25} /> : <Icon name="transfer-left" color="green" size={25} />
                      }

                    </View>
                  </View>
                  <Text>Product {item.transfer_product}({item.transfer_qty})</Text>
                </View>

              )}
              left={() => (
                <Icon
                  name="brightness-1"
                  size={10}
                  style={[{
                    marginHorizontal: 2,
                    color: item.status == "Pending" ? "red" : "lightgreen",
                    alignSelf: "center",
                  }]}
                />
              )}
              right={() => (
                <Text style={{
                  fontSize: 12,
                  color: "#888",
                  alignSelf: "flex-start",
                  textAlign: "right",
                  marginLeft: 20,
                }}>
                  {item.entry_date.replace("-", "/").replace("-", "/") ===
                    moment().format("DD/MM/YYYY")
                    ? item.created_time
                    : item.created_time + "\n" + item.entry_date.replace("-", "/").replace("-", "/")}

                </Text>
              )}
            />
            <Text style={{ marginLeft: 30, marginBottom: 10, fontSize: 14, fontWeight: 'bold' }}>
              {item.from == "Transfer" && item.status == "Pending" ? "Pending Transfer of " + (item.transfer_qty - item.accept_qty) + " Qty" : null}
              {item.from == "Transfer" && item.status == "Cancel" ? "Cancel Transfer of " + (item.transfer_qty - item.accept_qty) + " Qty" : null}
              {item.from == "Transfer" && item.status == "Done" ? "Done Transfer of all stock" : null}

              {item.from == "Acceptance" && item.status == "Pending" ? "Pending acceptance of " + (item.transfer_qty - item.accept_qty) + " Qty" : null}
              {item.from == "Acceptance" && item.status == "Cancel" ? "Cancel acceptance of " + (item.transfer_qty - item.accept_qty) + " Qty" : null}
              {item.from == "Acceptance" && item.status == "Done" ? "Done acceptance of all stock" : null}
            </Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />):(
        <Text style={{ textAlign: "center"}}>No records found</Text>
      )}
    </View>
  );
};

export default Stock;
