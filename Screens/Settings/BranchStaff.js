import React, { useState, useEffect } from "react";
import {
  View,
  ImageBackground,
  ScrollView,
  FlatList,
  Alert,
  StyleSheet
} from "react-native";
import {
  Button,
  FAB,
  List,
  TextInput,
  TouchableRipple,
  Text
} from "react-native-paper";
import MyStyles from "../../Styles/MyStyles";
import { postRequest } from "../../Services/RequestServices";
import Autocomplete from "react-native-autocomplete-input";
import Loading from "../../Components/Loading";

const BranchStaffList = (props) => {
  const { userToken, search } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [griddata, setgriddata] = useState([]);

  React.useEffect(() => {
    Browse();
    setLoading(false);
  }, [search, props]);

  const Browse = (id) => {
    postRequest(
      "masters/staff/browse_app",
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


  };

  const Delete = (id) => {
    setLoading(true);
    let data = { staff_id: id };
    postRequest("masters/staff/delete", data, userToken).then((resp) => {
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
        renderItem={({ item, index }) => (
          <List.Item
            key={index}
            style={{ borderBottomWidth: 0.5, borderBottomColor: "black" }}
            title={item.name}
            titleStyle={{ fontWeight: "bold" }}
            description={item.mobile}
            right={() => {
              return (
                <>
                  <TouchableRipple
                    style={{ zIndex: 0, marginRight: 5 }}
                    onPress={() => {
                      props.navigation.navigate("BranchStaff", {
                        staff_id: item.staff_id,
                      });
                    }}
                  >
                    <List.Icon {...props} icon="pencil" color="#AAA" />
                  </TouchableRipple>
                  <TouchableRipple
                    style={{ zIndex: 0 }}
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
                            Delete(item.staff_id);
                          },
                        },
                      ]);
                    }}
                  >
                    <List.Icon {...props} icon="delete" color="#AAA" />
                  </TouchableRipple>
                </>
              );
            }}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <FAB
        style={{
          position: "absolute",
          bottom: '4%',
          right: '4%',
          zIndex: 100,
          borderRadius: 50,
          backgroundColor: MyStyles.primaryColor.backgroundColor
        }}
        icon="plus"
        color="#000"
        onPress={() =>
          props.navigation.navigate("BranchStaff", { staff_id: 0 })
        }
      />
    </View>
  );
};

const BranchStaff = (props) => {
  const { staff_id } = props.route.params;
  const { userToken } = props.route.params;
  const [loading, setLoading] = useState(true);

  const [param, setparam] = useState({
    staff_id: "0",
    name: "",
    mobile: "",
  });
  const [filteredData, setFilteredData] = useState([]);
  const [filteredData2, setFilteredData2] = useState([]);
  const [suggestiondata, setSuggestionData] = useState([]);

  React.useEffect(() => {
    postRequest("customervisit/SearchStaffList", { search: "" }, userToken).then((resp) => {
      if (resp.status == 200) {
        setSuggestionData(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
    if (staff_id != 0) {
      let param = {
        staff_id: staff_id,
      };
      postRequest("masters/staff/preview", param, userToken).then((resp) => {
        if (resp.status == 200) {
          param.staff_id = resp.data[0].staff_id;
          param.name = resp.data[0].name;
          param.mobile = resp.data[0].mobile;
          setparam({ ...param });
        } else {
          Alert.alert(
            "Error !",
            "Oops! \nSeems like we run into some Server Error"
          );
        }
      });
    }
    setLoading(false);
  }, []);

  return (
    <ImageBackground
      style={MyStyles.container}
      source={require("../../assets/login-bg.jpg")}
    >
      <View style={[MyStyles.cover, { backgroundColor: "" }]}>
        {/* <TextInput
          mode="outlined"
          placeholder="Staff Name"
          style={{ backgroundColor: "rgba(0,0,0,0)" }}
          value={param.name}
          onChangeText={(text) => {
            setparam({ ...param, name: text });
          }}
        /> */}
        <Autocomplete
          {...props}
          autoCapitalize="none"
          autoCorrect={false}
          inputContainerStyle={{ borderWidth: 0 }}
          containerStyle={{ flex: 0, marginBottom: 20 }}
          value={param.name}
          data={filteredData}
          onChangeText={(query) => {
            if (query) {
              const regex = new RegExp(`${query.trim()}`, "i");
              setFilteredData(
                suggestiondata.filter((data) => data.name.search(regex) >= 0)
              );
            } else {
              setFilteredData([]);
            }
            setparam({ ...param, name: query });
          }}
          flatListProps={{
            keyExtractor: (_, idx) => idx.toString(),
            renderItem: ({ item, index }) => (
              <Text key={index} style={styles.itemText}>
                {item.name}
              </Text>
            ),
          }}
          renderTextInput={(props) => (
            <TextInput
              {...props}
              mode="outlined"
              placeholder="Staff Name"
              style={{
                backgroundColor: "rgba(0,0,0,0)",
              }}
            />
          )}
        />
        {/* <TextInput
          mode="outlined"
          placeholder="Staff Mobile"
          style={{ backgroundColor: "rgba(0,0,0,0)" }}
          value={param.mobile}
          keyboardType={"number-pad"}
          maxLength={10}
          onChangeText={(text) => {
            setparam({ ...param, mobile: text });
          }}
        /> */}
        <Autocomplete
          {...props}
          autoCapitalize="none"
          autoCorrect={false}
          inputContainerStyle={{ borderWidth: 0 }}
          containerStyle={{ flex: 0, marginBottom: 20 }}
          value={param.mobile}
          data={filteredData2}
          onChangeText={(query) => {
            if (query) {
              const regex = new RegExp(`${query.trim()}`, "i");
              setFilteredData2(
                suggestiondata.filter((data) => data.mobile.search(regex) >= 0)
              );
            } else {
              setFilteredData2([]);
            }
            setparam({ ...param, mobile: query });
          }}
          flatListProps={{
            keyExtractor: (_, idx) => idx.toString(),
            renderItem: ({ item, index }) => (
              <Text key={index} style={styles.itemText}>
                {item.mobile}
              </Text>
            ),
          }}
          renderTextInput={(props) => (
            <TextInput
              {...props}
              mode="outlined"
              placeholder="Staff Mobile"
              style={{
                backgroundColor: "rgba(0,0,0,0)",
              }}
            />
          )}
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
              setLoading(true);

              postRequest("masters/staff/insert", param, userToken).then(
                (resp) => {
                  if (resp.status == 200) {
                    if (resp.data[0].valid) {
                      props.navigation.navigate("BranchStaffList");
                    }
                    setLoading(false);
                  }
                }
              );
            }}
          >
            Submit
          </Button>
        </View>
      </View>
    </ImageBackground>
  );
};

export { BranchStaff, BranchStaffList };


const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F5FCFF",
    flex: 1,
    padding: 16,
    marginTop: 40,
  },
  autocompleteContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 0,
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: "center",
  },
  itemText: {
    fontSize: 15,
    paddingTop: 5,
    paddingBottom: 5,
    margin: 2,
  },
  infoText: {
    textAlign: "center",
    fontSize: 16,
  },
});
