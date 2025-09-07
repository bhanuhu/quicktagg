import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  View,
  FlatList,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import {
  Button,
  Text,
  FAB,
  TextInput,
  Card,
  IconButton,
} from "react-native-paper";
import MyStyles from "../../Styles/MyStyles";
import ImageUpload from "../../Components/ImageUpload";
import { postRequest } from "../../Services/RequestServices";
import { serviceUrl } from "../../Services/Constants";
import moment from "moment";
import Autocomplete from "react-native-autocomplete-input";
import Loading from "../../Components/Loading";
import { CapitalizeName } from "../../utils/CapitalizeName";

const CategoryList = (props) => {
  const { userToken, search } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [griddata, setGridData] = useState([]);
  console.log(griddata)

  useEffect(() => {
    fetchCategoryData();
  }, [search]);

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const resp = await postRequest(
        "masters/product/category/browse_app",
        { search: search || "" }, // Fix for undefined search
        userToken
      );
      console.log(`p c -> ${JSON.stringify(resp.data)}`)
      if (resp.status === 200) {
        setGridData(resp.data);
      } else {
        Alert.alert("Error!", "Oops! Seems like we ran into a server error.");
      }
    } catch (error) {
      Alert.alert("Error!", "Failed to load data.");
    }
    setLoading(false);
  };

  const deleteCategory = async (id) => {
    setLoading(true);
    try {
      const resp = await postRequest(
        "masters/product/category/delete",
        { category_id: id },
        userToken
      );
      if (resp.status === 200 && resp.data[0]?.valid) {
        fetchCategoryData();
      }
    } catch (error) {
      Alert.alert("Error!", "Failed to delete category.");
    }
    setLoading(false);
  };

  return (
    <View style={MyStyles.container}>
      <Loading isloading={loading} />
      <FlatList
        data={griddata} // Fixed: Ensure FlatList has data
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Card style={{ margin: 10, borderRadius: 10, backgroundColor: '#fff' }}>
            <Card.Cover
              source={
                item.banner_path
                  ? { uri: `${item.url_banner}${item.banner_path}` }
                  : require("../../assets/upload.png")
              }
              style={{ height: 120 }}
            />
            <View style={{ flexDirection: "row" }}>
              {/* Image Section */}
              <View style={{ width: "25%", padding: 10, justifyContent: "center" }}>
                <Image
                  source={
                    item.image_path
                      ? { uri: `${item.url_image.replace("BranchCategory/", "")}CustomerUploads/${item.image_path}` }
                      : require("../../assets/upload.png")
                  }
                  style={{ height: 75, width: 75, borderRadius: 5 }}
                  resizeMode="cover"
                />
              </View>

              {/* Category Name Section */}
              <View style={{ width: "60%", padding: 10, justifyContent: "center" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {CapitalizeName(item.category_name)}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={{ width: "10%", padding: 10, flexDirection: "column" }}>
                <IconButton
                  icon="pencil"
                  iconColor="#aaa"
                  size={20}
                  onPress={() => {
                    props.navigation.navigate("CategoryForm", {
                      category_id: item.category_id,
                      categoryData: item // Pass the complete category data
                    });
                  }}
                />
                <IconButton
                  icon="delete"
                  iconColor="#aaa"
                  size={20}
                  onPress={() =>
                    Alert.alert("Alert", "Do you want to delete this category?", [
                      { text: "No", style: "cancel" },
                      { text: "Yes", onPress: () => deleteCategory(item.category_id) },
                    ])
                  }
                />
              </View>
            </View>
          </Card>
        )}
      />

      {/* Floating Action Button */}
      <FAB
        style={{
          position: "absolute",
          bottom: "4%",
          right: "4%",
          borderRadius: 50,
          backgroundColor: MyStyles.primaryColor.backgroundColor,
        }}
        icon="plus"
        color="#000"
        onPress={() =>
          props.navigation.navigate("CategoryForm", {
            category_id: 0,
          })
        }
      />
    </View>
  );
};

const CategoryForm = (props) => {
  const { userToken, category_id, categoryData } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [param, setparam] = useState({
    category_name: "",
    image_path: "",
    banner_path: "",
  });
  const [Banner, setBanner] = React.useState(
    require("../../assets/upload.png")
  );
  const [Image, setImage] = React.useState(require("../../assets/upload.png"));
  const [categories, setCategories] = useState([]);
  // For Filtered Data
  const [filteredData, setFilteredData] = useState([]);

  const [suggestiondata, setSuggestionData] = useState([]);

  React.useEffect(() => {
    postRequest("masters/product/subcategory/search_list_category", { search: "" }, userToken).then((resp) => {
      if (resp.status == 200) {
        setSuggestionData(resp.data);
      }
    });
    
    if (categoryData) {
      // If we have category data passed from CategoryList, use it
      setparam({
        category_name: categoryData.category_name,
        image_path: categoryData.image_path,
        banner_path: categoryData.banner_path,
        category_id: categoryData.category_id,
        is_active: categoryData.is_active
      });
      
      // Set images if they exist
      if (categoryData.image_path) {
        setImage({ uri: `${categoryData.url_image.replace("BranchCategory/", "")}CustomerUploads/${categoryData.image_path}` });
      }
      if (categoryData.banner_path) {
        setBanner({ uri: `${categoryData.url_banner}${categoryData.banner_path}` });
      }
      
      setLoading(false);
    } else if (category_id) {
      // Otherwise, fetch the data if we only have category_id
      postRequest("masters/product/category/preview", { category_id: category_id }, userToken).then((resp) => {
        if (resp.status == 200) {
          param.category_id = resp.data.category_id;
          param.image_path = resp.data.image_path;
          param.banner_path = resp.data.banner_path;
          setparam({ ...param });
        } else {
          Alert.alert(
            "Error !",
            "Oops! \nSeems like we run into some Server Error"
          );
        }
      });
    }

  }, []);


  return (
    <ImageBackground
      style={MyStyles.container}
      source={require("../../assets/login-bg.jpg")}
    >
      <Loading isloading={loading} />
      <View style={[MyStyles.cover, { backgroundColor: "" }]}>
        <Autocomplete
          {...props}
          autoCapitalize="none"
          autoCorrect={false}
          //Styles
          inputContainerStyle={{ borderWidth: 0 }}
          containerStyle={{ flex: 0, marginBottom: 20 }}
          //Default Value
          value={param.category_name}
          //data to show in suggestion
          data={filteredData}
          // onchange of the text changing the state of the query
          // which will trigger the findFilm method
          // to show the suggestions
          onChangeText={(query) => {
            // Method called every time when we change the value of the input
            if (query) {
              // Making a case insensitive regular expression
              const regex = new RegExp(`${query.trim()}`, "i");
              // Setting the filtered film array according the query
              setFilteredData(
                suggestiondata.filter((data) => data.category_name.search(regex) >= 0)
              );
            } else {
              // If the query is null then return blank
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
              disabled
              placeholder="Category Name"
              style={{
                backgroundColor: "rgba(0,0,0,0)",
              }}
            />
          )}
        />

        <View style={[MyStyles.row, { justifyContent: "space-evenly" }]}>
          <ImageUpload
            label="Choose Image :"
            source={!Image ? { uri: `${categoryData.url_image.replace("BranchCategory/", "")}CustomerUploads/${categoryData.image_path}` } : Image}
            onClearImage={() => {
              setImage({ uri: "" });
              setparam({
                ...param,
                image_path: "",
              });
            }}
            onUploadImage={(result) => {
              setImage({ uri: result.uri });
              param.image_path =
                "image-" + moment().format("YYYYMMDD-hhmmss") + ".jpg";
              setparam({ ...param });
            }}
          />
          <ImageUpload
            label="Choose Banner :"
            source={Banner}
            onClearImage={() => {
              setBanner({ uri: "" });
              setparam({
                ...param,
                banner_path: "",
              });
            }}
            onUploadImage={(result) => {
              setBanner({ uri: result.uri });
              param.banner_path =
                "banner-" + moment().format("YYYYMMDD-hhmmss") + ".jpg";
              setparam({ ...param });
            }}
          />
        </View>
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
                "masters/product/category/insert",
                param,
                userToken
              ).then((resp) => {
                if (resp.status == 200) {
                  if (resp.data[0].valid) {
                    if (Banner.uri) {
                      const form_data = new FormData();
                      form_data.append("files", {
                        uri: Banner.uri,
                        type: "image/jpeg",
                        name: param.banner_path,
                      });

                      var xhr = new XMLHttpRequest();
                      xhr.open(
                        "POST",
                        serviceUrl +
                        "masters/branch/UploadProductCategoryBannerMob",
                        true
                      );
                      xhr.setRequestHeader("Accept", "application/json");
                      xhr.setRequestHeader(
                        "Content-Type",
                        "multipart/form-data"
                      );
                      xhr.setRequestHeader("auth-token", userToken);

                      xhr.onload = function (e) {
                        const resp = xhr.response;
                        if (resp.status == 200) {
                          if (resp.data[0].valid) {
                            //console.log("banner : " + resp.data[0].valid);
                          }
                        }
                      };
                      xhr.send(form_data);
                    }
                    if (Image.uri) {

                      const form_data = new FormData();
                      form_data.append("files", {
                        uri: Image.uri,
                        type: "image/jpeg",
                        name: param.image_path,
                      });

                      var xhr = new XMLHttpRequest();
                      xhr.open(
                        "POST",
                        serviceUrl + "masters/branch/UploadProductCategoryMob",
                        true
                      );
                      xhr.setRequestHeader("Accept", "application/json");
                      xhr.setRequestHeader(
                        "Content-Type",
                        "multipart/form-data"
                      );
                      xhr.setRequestHeader("auth-token", userToken);

                      xhr.onload = function (e) {
                        const resp = xhr.response;
                        if (resp.status == 200) {
                          if (resp.data[0].valid) {
                            //console.log("image : " + resp.data[0].valid);
                          }
                        }
                      };
                      xhr.send(form_data);
                    }

                    props.navigation.navigate("ProductTabs");
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

export { CategoryForm, CategoryList };

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
