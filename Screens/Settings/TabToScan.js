import React, { useState, useEffect } from "react";
import { View, ImageBackground, ScrollView, Alert, Image, Card, FlatList, } from "react-native";
import { Button, Subheading, TouchableRipple, List, IconButton,Text } from "react-native-paper";
import CustomHeader from "../../Components/CustomHeader";
import ImageUpload from "../../Components/ImageUpload";
import { postRequest } from "../../Services/RequestServices";
import MultipleImages from "../../Components/MultipleImages";
import MyStyles from "../../Styles/MyStyles";
import { serviceUrl } from "../../Services/Constants";

const TabToScan = (props) => {
  const { userToken } = props.route.params;
  const [banneruploads, setbanneruploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewbanner, setpreviewbannerlist] = useState([]);

  React.useEffect(() => {
    BannerBrowse();
  }, []);
  const BannerBrowse = () => {
    postRequest("masters/customer/tabtoscanBannerBrowse", {}, userToken).then((resp) => {
      if (resp.status == 200) {
        console.log(resp);
        setpreviewbannerlist(resp.data);
      } else {
        Alert.alert("Error !", "Oops! \nSeems like we run into some Server Error");
      }
    });
  }

  return (
    <ImageBackground
      style={MyStyles.container}
      source={require("../../assets/login-bg.jpg")}
    >

      <View style={[MyStyles.cover, { backgroundColor: "" }]}>


        <Subheading style={{ marginTop: 40 }}>Choose Banner Images :</Subheading>
        {/* <MultipleImages onSelect={(files) => {}} data={[]} /> */}
        <MultipleImages
          data={[]}
          onSelect={(fileArray) => {
            let imagesdata = [];
            fileArray.map((resp, index) => {
              imagesdata.push({
                image_path: resp.uri,
                image_name: resp.name,
              });
            });
            setbanneruploads(imagesdata);
          }}
          onClearImage={() => {
            setbanneruploads([]);
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
              
              setLoading(true);

              if (banneruploads.length !== 0) {
                banneruploads.map((item, index) => {
                  postRequest("masters/customer/tabtoscanBannerinsert", { "image_path": item.image_name }, userToken).then((resp) => {

                    if (resp.length > 0) {

                      const form_data = new FormData();
                      form_data.append("files", {
                        uri: item.image_path,
                        type: "image/jpeg",
                        name: item.image_name
                      });

                      var xhr = new XMLHttpRequest();
                      xhr.open("POST", serviceUrl + "masters/customer/UploadTabToScanBannerMob", true);
                      xhr.setRequestHeader("Accept", "application/json");
                      xhr.setRequestHeader("Content-Type", "multipart/form-data");
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

                    } else {
                      Alert.alert("Error !", "Oops! \nSeems like we run into some Server Error");
                    }

                  });
                });
              }
              else {
                Alert.alert("Please select images");
              }
              setLoading(false);
              BannerBrowse();
            }}
          >
            Submit
          </Button>
        </View>
        <ScrollView>
         <Text  style={{margin:10}}>No Of Picture ({previewbanner.length})</Text>
          <FlatList
            data={previewbanner}
            numColumns={1}
            renderItem={({ item, index }) => {
              return (
                <View
                  style={{
                    margin: 5,
                    borderRadius: 10
                  }}
                >
                  <TouchableRipple
                    style={{
                      position: "absolute",
                      left: 280,
                      top: 50,
                      zIndex: 10,
                    }}
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
                            setLoading(true);
                            postRequest("masters/customer/tabtoscanBannerDelete", { tran_id: item.tran_id }, userToken).then((resp) => {
                              if (resp.status == 200) {
                                BannerBrowse();
                              }
                              setLoading(false);
                            });
                          },
                        },
                      ]);
                    }}
                  >
                    <List.Icon {...props} icon="delete" color="#aaa" />
                  </TouchableRipple>
                  <Image
                    source={{ uri: item.url + "" + item.image_path }}
                    resizeMode={"cover"}
                    style={{
                      height: 130,
                      width: 250,
                      marginBottom: 10,
                    }}
                  />

                </View>
              )
            }
            }
            keyExtractor={(item, index) => index.toString()}
          />
        </ScrollView>
      </View>

    </ImageBackground >
  );
};

export default TabToScan;
