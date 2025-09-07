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
const CustomerCategoryList = (props) => {
  const { userToken, search } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [griddata, setgriddata] = useState([]);

  React.useEffect(() => {
    Browse();
    setLoading(false);
  }, [props]);

  const Browse = () => {
    postRequest(
      "masters/customer/category/browse_app",
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
    let data = { category_id: id };
    postRequest("masters/customer/category/delete", data, userToken).then(
      (resp) => {
        if (resp.status == 200) {
          if (resp.data[0].valid) {
            Browse();
          }
          setLoading(false);
        }
      }
    );
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
            title={item.category_name}
            titleStyle={{ fontWeight: "bold" }}
            right={() => {
              return (
                <>
                  <TouchableRipple
                    style={{ zIndex: 0, marginRight: 5, }}
                    onPress={() => {
                      props.navigation.navigate("CustomerCategory", {
                        category_id: item.category_id,
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
                            Delete(item.category_id);
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
          backgroundColor: MyStyles.primaryColor.backgroundColor,
          borderRadius: 50
        }}
        icon="plus"
        color="#000"
        onPress={() =>
          props.navigation.navigate("CustomerCategory", { category_id: 0 })
        }
      />
    </View>
  );
};

const CustomerCategory = (props) => {
  const { category_id } = props.route.params;
  const { userToken } = props.route.params;
  const [loading, setLoading] = useState(true);

  const [param, setparam] = useState({
    category_id: "0",
    category_name: "",
  });
  const [filteredData, setFilteredData] = useState([]);
  const [suggestiondata, setSuggestionData] = useState([]);

  React.useEffect(() => {
    postRequest("masters/customer/category/getCategory", { search: "" }, userToken).then((resp) => {
      setSuggestionData(resp);
      setLoading(false);
    });
    if (category_id != 0) {
      let param = {
        category_id: category_id,
      };
      postRequest("masters/customer/category/preview", param, userToken).then(
        (resp) => {
          if (resp.status == 200) {
            param.category_id = resp.data[0].category_id;
            param.category_name = resp.data[0].category_name;
            setparam({ ...param });
          } else {
            Alert.alert(
              "Error !",
              "Oops! \nSeems like we run into some Server Error"
            );
          }
        }
      );
    }

  }, []);

  return (
    <ImageBackground
      style={MyStyles.container}
      source={require("../../assets/login-bg.jpg")}
    >
      <Loading isloading={loading} />
      <View style={[MyStyles.cover, { backgroundColor: "" }]}>
        {/* <TextInput
          mode="outlined"
          placeholder="Customer Category"
          style={{ backgroundColor: "rgba(0,0,0,0)" }}
          value={param.category_name}
          onChangeText={(text) => {
            setparam({ ...param, category_name: text });
          }}
        /> */}
        <Autocomplete
          {...props}
          autoCapitalize="none"
          autoCorrect={false}
          inputContainerStyle={{ borderWidth: 0 }}
          containerStyle={{ flex: 0, marginBottom: 20 }}
          value={param.category_name}
          data={filteredData}
          onChangeText={(query) => {
            if (query) {
              const regex = new RegExp(`${query.trim()}`, "i");
              setFilteredData(
                suggestiondata.filter((data) => data.category_name.search(regex) >= 0)
              );
            } else {
              setFilteredData([]);
            }
            setparam({ ...param, category_name: query });
          }}
          flatListProps={{
            keyExtractor: (_, idx) => idx.toString(),
            renderItem: ({ item, index }) => (
              <Text key={index} style={styles.itemText}>
                {item.category_name}
              </Text>
            ),
          }}
          renderTextInput={(props) => (
            <TextInput
              {...props}
              mode="outlined"
              placeholder="Customer Category"
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

              postRequest(
                "masters/customer/category/insert",
                param,
                userToken
              ).then((resp) => {
                if (resp.status == 200) {
                  if (resp.data[0].valid) {
                    props.navigation.navigate("CustomerCategoryList");
                  }
                  setLoading(false);
                }
              });
            }}
          >
            Submit
          </Button>
        </View>
      </View>
    </ImageBackground>
  );
};

export { CustomerCategory, CustomerCategoryList };

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