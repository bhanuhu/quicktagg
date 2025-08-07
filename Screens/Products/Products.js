import React, { useState } from "react";
import {
  ImageBackground,
  ScrollView,
  View,
  Alert,
  FlatList,
  Image,
  Dimensions,
} from "react-native";
import {
  Button,
  Text,
  FAB,
  TextInput,
  Checkbox,
  Card,
  IconButton,
} from "react-native-paper";
import Swiper from "react-native-swiper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MyStyles from "../../Styles/MyStyles";
import DropDown from "../../Components/DropDown";
import MultipleImages from "../../Components/MultipleImages";
import { postRequest } from "../../Services/RequestServices";
import BadgeRibbon from "../../Components/BadgeRibbon";
import { serviceUrl } from "../../Services/Constants";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import Loading from "../../Components/Loading";
import { CapitalizeName } from "../../utils/CapitalizeName";

const ProductsList = (props) => {

  const { userToken, search } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [griddata, setgriddata] = useState([]);

  React.useEffect(() => {
    // console.log(search);
    fetchProducts();
  }, [search]);

  const fetchProducts = () => {
    setLoading(true);
    postRequest(
      "masters/product/browse_app",
      { search: search == undefined ? "" : search },
      userToken
    ).then((resp) => {
      console.log(`Product data -> ${JSON.stringify(resp.data)}`)
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
  }

  const renderItem = ({ item, index }) => {


    const ItemComponent = (props) => {
      const { item } = props;
      const [image, setImage] = useState({ uri: item.url_image + "" + item.image_path });
      const [imageOpacity, setImageOpacity] = useState(1);
      const itemStyle = {
        height: 160,
        width: Dimensions.get('window').width / 3.2,
        borderRadius: 10,
        backgroundColor: 'white',
        margin: Dimensions.get('window').width * 0.01,
      };

      return (<Card
        style={itemStyle}
        key={index}
        onPress={() =>
          props.navigation.navigate("ProductsPreview", {
            product_id: item.product_id,
          })
        }>
        <View style={{ height: '70%' }}>
          <Image
            source={image}
            style={{
              flex: 1,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              height: '90%',
              width: '90%',
              margin: 5,
              opacity: imageOpacity
            }}
            resizeMode='contain'
            onError={(error) => {
              console.log('ERROR_IMAGE', error);
              if (error) {
                setImage(require('../../assets/thumbnail.png'));
                setImageOpacity(0.2);
              }
            }}
            defaultSource={require("../../assets/thumbnail.png")}
          />
          <View style={{ position: 'absolute', height: '20%', width: '100%' }}>
            {item.exhibition && <BadgeRibbon text="E" position="left" color="red" />}
            {item.trial && <BadgeRibbon text="T" position="right" />}
          </View>

        </View>

        <View style={{ height: '30%', width: '100%', padding: 4, alignItems: 'flex-start' }}>
          <Text numberOfLines={2} style={{ color: "#333", fontSize: 11, textAlign: 'left', flexWrap: 'wrap', fontWeight: 'bold' }}>
            {item.product_name ? CapitalizeName(item.product_name) : ''}
          </Text>
          <Text style={{ color: "gray", fontSize: 10 }}>{item.product_code}</Text>

        </View>
      </Card>)

    }

    return (
      <ItemComponent item={item} navigation={props.navigation} />
    )
  };

  const onRefresh = () => {
    fetchProducts();
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={griddata}
        contentContainerStyle={{ alignItems: 'flex-start' }}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-evenly' }}
        keyExtractor={(item, index) => index.toString()}
        onRefresh={onRefresh}
        refreshing={loading}
      />
      <FAB
        style={{
          position: "absolute",
          bottom: '5%',
          right: '5%',
          borderRadius: 50,
          backgroundColor: MyStyles.primaryColor.backgroundColor,
        }}
        icon="plus"
        color="#000"
        onPress={() =>
          props.navigation.navigate("ProductsForm", { product_id: 0 })
        }
      />
    </View>
  );
};

const ProductsPreview = (props) => {
  const { userToken } = props.route.params;
  const { product_id } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [param, setparam] = useState({
    product_id: "",
    product_code: "",
    product_name: "",
    remarks: "",
    price: "",
    disable: "",
    exhibition: "",
    businesses: "",
    trial: "",
    discounted_price: "",
    weight: "",
    size_length: "",
    gender: "",
    Metal: "",
    material: "",
    on_demand: "",
    available: "",
    qty: "",
  });
  const [productImages, setProductImages] = useState([]);
  const [shareOptions, setshareOptions] = useState({
    title: "",
    message: "",
    url: "",
    subject: "",
  });
  const [currentProduct, setCurrentProduct] = useState({});

  React.useEffect(() => {
    let data = { product_id: product_id };
    postRequest("masters/product/preview", data, userToken).then((resp) => {
      if (resp.status == 200) {
        param.product_id = resp.data[0].product_id;
        param.product_code = resp.data[0].product_code;
        param.product_name = resp.data[0].product_name;
        param.remarks = resp.data[0].remarks;
        param.price = resp.data[0].price;
        param.disable = resp.data[0].disable;
        param.exhibition = resp.data[0].exhibition;
        param.businesses = resp.data[0].businesses;
        param.trial = resp.data[0].trial;
        param.discounted_price = resp.data[0].discounted_price;
        param.weight = resp.data[0].weight;
        param.size_length = resp.data[0].size_length;
        param.gender = resp.data[0].gender;
        param.Metal = resp.data[0].Metal;
        param.material = resp.data[0].material;
        param.on_demand = resp.data[0].on_demand;
        param.available = resp.data[0].available;
        param.qty = resp.data[0].qty;
        setparam({ ...param });

        let ImagesList = [];
        ImagesList = resp.data[0].images;
        setProductImages(ImagesList);
        setCurrentProduct(ImageList.length > 0 ? ImagesList[0] : {});
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
    setLoading(false);
  }, []);

  return (
    <ScrollView contentContainerStyle={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Loading isloading={loading} />
      <View>
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
          {CapitalizeName(param.product_name)}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>SKU:</Text>{"   "}{param.product_code}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Price:</Text>{"   "}{param.price}/-{"  "}
          <Text
            style={{
              color: "red",
              textDecorationLine: "line-through",
            }}
          >
            {param.price}/-
          </Text>
        </Text>
      </View>
      <View style={{ marginVertical: 10, height: 250 }}>
        <IconButton
          icon="share-variant"
          size={16}
          color="#FFF"
          style={{
            margin: 5,
            backgroundColor: MyStyles.primaryColor.backgroundColor,
            alignSelf: 'flex-end'
          }}
          onPress={() => {
            Share.isAvailableAsync().then((result) => {
              if (result) {
                setLoading(true);
                const options = {
                  dialogTitle: param.product_name.toString(),
                  mimeType: "image/jpeg"
                };
                FileSystem.downloadAsync(currentProduct.url + "" + currentProduct.image_path, FileSystem.cacheDirectory + currentProduct.image_path)
                  .then(async ({ uri }) => {
                    Share.shareAsync(uri, options);
                  })
                  .catch((error) => {
                    console.error(error);
                  });
                setLoading(false);
              }
            });
          }}
        />
        <Swiper key={productImages.length} loop={false} activeDotColor="gray" onIndexChanged={(index) => {
          setCurrentProduct(productImages[index]);
        }} style={{ height: '100%' }}>
          {productImages.length > 0 ? (
            productImages.map((resp, index) => {
              return (
                <View>
                  <Image
                    source={{ uri: resp.url + "" + resp.image_path }}
                    style={[{ height: '100%', width: "100%", borderRadius: 5 }]}
                  />
                </View>
              );
            })) :
            (<Image
              source={require("../../assets/upload.png")}
              style={[{ height: '100%', width: "100%", borderRadius: 5 }]}
            />)}
        </Swiper>
      </View>
      <View>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Availablity:</Text>{"   "}{CapitalizeName(param.available) || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Metal:</Text>{"   "}{CapitalizeName(param.Metal) || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Material:</Text>{"   "}{CapitalizeName(param.material) || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Disable:</Text>{"   "}{param.disable || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Exhibition:</Text>{"   "}{param.exhibition || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Weight:</Text>{"   "}{param.weight || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Size/Length:</Text>{"   "}{param.size_length || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Gender:</Text>{"   "}{CapitalizeName(param.gender) || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Description:</Text>{"   "}{param.product_code || '-'}
        </Text>
      </View>
    </ScrollView>
  );

};

const ProductsForm = (props) => {
  const { product_id } = props.route.params;
  const { userToken } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [genderlist, setgenderlist] = useState([
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ]);
  const [categorylist, setcategorylist] = useState([]);
  const [subcategorylist, setsubcategorylist] = useState([]);
  const [productavailablelist, setproductavailablelist] = useState([
    { label: "In Stock", value: "In Stock" },
    { label: "Make To Order", value: "Make To Order" },
  ]);
  const [param, setparam] = useState({
    product_id: 0,
    product_name: "",
    branch_id: "",
    product_code: "",
    gender: "",
    category_id: "",
    sub_category_id: "",
    price: "",
    discounted_price: "",
    weight: "",
    size_length: "",
    metal: "",
    material: "",
    available: false,
    remarks: "",
    on_demand: "",
    qty: "",
    Metal: "",
    trial: false,
    businesses: false,
    disable: false,
    exhibition: false,
    product_images: [],
    product_subcategory_list: [],
  });
  const [productsuploads, setproductsuploads] = useState([]);

  React.useEffect(() => {
    postRequest("masters/product/subcategory/getCategory", {}, userToken).then(
      (resp) => {
        if (resp.status == 200) {
          setcategorylist(resp.data);
        } else {
          Alert.alert(
            "Error !",
            "Oops! \nSeems like we run into some Server Error"
          );
        }
        setLoading(false);
      }
    );


  }, []);


  const SubcategoryList = (category_id) => {

    postRequest(
      "masters/product/subcategory/getSubcategoryForm",
      { category_id: category_id },
      userToken
    ).then((resp) => {
      console.log(`sub cats -> ${JSON.stringify(resp)}`)
      if (resp.status == 200) {
        setsubcategorylist(resp.data);
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
      <ScrollView>
        <View style={MyStyles.cover}>
          <TextInput
            mode="outlined"
            placeholder="Product Name"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.product_name}
            onChangeText={(text) => {
              setparam({ ...param, product_name: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Product Code"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.product_code}
            onChangeText={(text) => {
              setparam({ ...param, product_code: text });
            }}
          />
          <DropDown
            data={genderlist}
            ext_val="value"
            ext_lbl="label"
            value={param.gender}
            onChange={(val) => {
              setparam({ ...param, gender: val });
            }}
            placeholder="Shop For"
          />
          <DropDown
            data={categorylist}
            ext_val="category_id"
            ext_lbl="category_name"
            value={param.category_id}
            onChange={(val) => {
              setparam({ ...param, category_id: val });
              SubcategoryList(val);
            }}
            placeholder="Product Category"
          />
          <DropDown
            data={subcategorylist}
            ext_val="subcategory_id"
            ext_lbl="subcategory_name"
            value={param.sub_category_id}
            onChange={(val) => {
              setparam({ ...param, sub_category_id: val });
            }}
            placeholder="Product Sub Category"
          />
          <TextInput
            mode="outlined"
            placeholder="Price"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5, marginTop: 10 }}
            value={param.price}
            onChangeText={(text) => {
              setparam({ ...param, price: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Discoounted Price"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.discounted_price}
            onChangeText={(text) => {
              setparam({ ...param, discounted_price: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Weight"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.weight}
            onChangeText={(text) => {
              setparam({ ...param, weight: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Size/Length"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.size_length}
            onChangeText={(text) => {
              setparam({ ...param, size_length: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Metal"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.metal}
            onChangeText={(text) => {
              setparam({ ...param, metal: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Material"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.material}
            onChangeText={(text) => {
              setparam({ ...param, material: text });
            }}
          />
          <DropDown
            data={productavailablelist}
            ext_val="value"
            ext_lbl="label"
            value={param.on_demand}
            onChange={(val) => {
              setparam({ ...param, on_demand: val });
            }}
            placeholder="Product Availablity"
          />
          <TextInput
            mode="outlined"
            placeholder="Remarks"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginTop: 10 }}
            value={param.remarks}
            onChangeText={(text) => {
              setparam({ ...param, remarks: text });
            }}
          />
          <Checkbox.Item
            label="Exhibition"
            labelStyle={{ color: "#000" }}
            status={param.exhibition ? "checked" : "unchecked"}
            onPress={(e) => {
              setparam({ ...param, exhibition: !param.exhibition });
            }}
          />
          <Checkbox.Item
            label="Business"
            labelStyle={{ color: "#000" }}
            status={param.businesses ? "checked" : "unchecked"}
            onPress={(e) => {
              setparam({ ...param, businesses: !param.businesses });
            }}
          />
          <Checkbox.Item
            label="Trial at Home"
            labelStyle={{ color: "#000" }}
            status={param.trial ? "checked" : "unchecked"}
            onPress={(e) => {
              setparam({ ...param, trial: !param.trial });
            }}
          />
          <Checkbox.Item
            label="Disable"
            labelStyle={{ color: "#000" }}
            status={param.disable ? "checked" : "unchecked"}
            onPress={(e) => {
              setparam({ ...param, disable: !param.disable });
            }}
          />

          <MultipleImages
            data={[]}
            onSelect={(fileArray) => {
              let imagesname = [],
                imagesdata = [];
              fileArray.map((resp, index) => {
                imagesname.push(resp.name);
                imagesdata.push({
                  image_path: resp.uri,
                  image_name: resp.name,
                });
              });
              setparam({ ...param, product_images: imagesname });
              setproductsuploads(imagesdata);
            }}
          />

          <Button
            mode="contained"
            la
            uppercase={false}
            style={{ borderRadius: 5 }}
            labelStyle={{ color: "black" }}
            onPress={() => {
              setLoading(true);
              postRequest("masters/product/insert", param, userToken).then(
                (resp) => {
                  console.log(`Insert Product -> ${JSON.stringify(resp.data)}`)
                  console.log(param)
                  if (resp.status == 200) {
                    console.log(`Insert Product -> ${resp.data}`)
                    // return;
                    if (resp.data[0].valid) {
                      if (param.product_images.length !== 0) {
                        productsuploads.map((item, index) => {
                          const form_data = new FormData();
                          form_data.append("files", {
                            uri: item.image_path,
                            type: "image/jpeg",
                            name: item.image_name,
                          });

                          var xhr = new XMLHttpRequest();
                          xhr.open(
                            "POST",
                            serviceUrl + "masters/product/uploadImageMob",
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
                                // console.log("Images : " + resp.data[0].valid);
                              }
                            }
                          };
                          xhr.send(form_data);
                        });
                      }

                      props.navigation.navigate("ProductTabs");
                    } else {
                      Alert.alert("Error !", resp.error);
                    }
                  } else {
                    Alert.alert(
                      "Error !",
                      "Oops! \nSeems like we run into some Server Error"
                    );
                  }
                  setLoading(false);
                }
              );
            }}
          >
            Submit
          </Button>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export { ProductsForm, ProductsPreview, ProductsList };
