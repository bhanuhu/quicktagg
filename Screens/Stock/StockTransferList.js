import moment from "moment";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TextInput as Input,
  Alert,
  RefreshControl
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
  Button,
  Card,
  Divider,
  FAB,
  IconButton,
  Modal,
  Portal,
  TextInput,
  ToggleButton,
} from "react-native-paper";
import MyStyles from "../../Styles/MyStyles";
import { postRequest } from "../../Services/RequestServices";
import Loading from "../../Components/Loading";
import { CapitalizeName } from "../../utils/CapitalizeName";
const StockList = (props) => {
  const { userToken, search } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [griddata, setgriddata] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  React.useEffect(() => {
    Refresh();
  }, [search, props]);

  const Refresh = () => {
    postRequest(
      "transactions/stockTransfer/browse_app",
      { search: search == undefined ? "" : search },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        console.log(resp);
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

  const Delete = (id, branch_id, to_branch_id) => {
    setLoading(true);
    let data = {
      cancel_from_branch_id: branch_id,
      cancel_to_branch_id: to_branch_id,
      tran_id: id
    };
    postRequest("transactions/stockcancel/cancel", data, userToken).then(
      (resp) => {
        if (resp.status == 200) {
          Refresh();
        }
        setLoading(false);
      }
    );
  };

  return (
    <View style={MyStyles.container}>
      <Loading isloading={loading} />
      <FlatList
        data={griddata}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={Refresh} />
        }
        initialNumToRender={10}
        renderItem={({ item, index }) => (
          <Card
            key={item.tran_id}
            style={{
              marginHorizontal: 20,
              padding: 0,
              borderRadius: 10,
              marginVertical: 5,
              backgroundColor: '#fff'
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
                }}
              >
                {CapitalizeName(item.status)}
              </Text>
            </LinearGradient>

            <Card.Content>
              <View style={[MyStyles.row, { margin: 0 }]}>
                <Text style={{ marginRight: "auto" }}>{item.entry_no}</Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    marginRight: "auto",
                  }}
                >
                  {item.entry_date}
                </Text>
              </View>
              <View style={[MyStyles.row, { margin: 0 }]}>
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    {item.to_branch}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Products {item.tranfer_product} ({item.transfer_qty})
                  </Text>
                </View>

              </View>
              <View style={{ flexDirection: "row" }}>
                {item.status == "Done" || item.status == "Cancel" ?
                  <Button
                    mode="contained"
                    uppercase={false}
                    onPress={() => {
                      props.navigation.navigate("StockTransferPreview", {
                        tran_id: item.tran_id,
                      });
                    }}
                    style={{ marginVertical: 5, fontSize: 10, marginLeft: "auto" }}
                  >
                    Check
                  </Button>
                  :

                  item.status == "Pending" ?
                    <>
                      <Button
                        mode="contained"
                        uppercase={false}

                        labelStyle={{ color: "black" }}
                        onPress={() => {
                          props.navigation.navigate("StockTransfer", {
                            tran_id: item.tran_id,
                          });
                        }}
                        style={{ marginVertical: 5, fontSize: 10, marginLeft: "auto", borderRadius: 5 }}
                      >
                        Edit
                      </Button>
                      <Button
                        mode="contained"
                        uppercase={false}
                        labelStyle={{ color: "black" }}
                        onPress={() => {
                          Alert.alert("Alert", "You want to cancel?", [
                            {
                              text: "No",
                              onPress: () => { },
                              style: "cancel",
                            },
                            {
                              text: "Yes",
                              onPress: () => {
                                Delete(item.tran_id, item.branch_id, item.to_branch_id);
                              },
                            },
                          ]);
                        }}
                        style={{ marginVertical: 5, fontSize: 10, marginLeft: 5, borderRadius: 5 }}
                      >
                        Cancel
                      </Button>
                    </>
                    : null
                }
              </View>
              {item.accept_qty == "0" ? null :
                <>
                  <Divider style={{ height: 1, marginVertical: 10 }} />
                  <View style={[MyStyles.row]}>
                    <View style={{ flex: 1, alignItems: "center" }}>
                      <Text>Transfered</Text>
                      <Text style={{ fontWeight: "bold" }}>{item.accept_product} ({item.accept_qty})</Text>
                    </View>
                    <View
                      style={{
                        flex: 1,
                        alignItems: "center",
                        borderLeftWidth: 1,
                        borderColor: "black",
                      }}
                    >
                      <Text>Pending</Text>
                      <Text style={{ fontWeight: "bold" }}>{item.tranfer_product - item.accept_product} ({item.transfer_qty - item.accept_qty})</Text>
                    </View>
                  </View>
                </>
              }
              <Divider style={{ height: 1, marginVertical: 10 }} />
              <Text>{item.remarks}</Text>
            </Card.Content>
          </Card>
        )}
        keyExtractor={(_, idx) => "key" + idx}
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
          props.navigation.navigate("StockTransfer", { tran_id: 0 })
        }
      />
    </View>
  );
};

export default StockList;
