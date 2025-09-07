import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  ScrollView,
  View,
  FlatList,
  Alert,
} from "react-native";

import {
  Button,
  Checkbox,
  FAB,
  Text,
  TextInput,
  Card,
  IconButton,
  Portal,
  Modal,
  TouchableRipple,
  List
} from "react-native-paper";
import DatePicker from "../Components/DatePicker";
import DropDown from "../Components/DropDown";
import ImageUpload from "../Components/ImageUpload";
import MyStyles from "../Styles/MyStyles";
import moment from "moment";
import { postRequest } from "../Services/RequestServices";
import { serviceUrl } from "../Services/Constants";
import LinearGradient from "react-native-linear-gradient";
import BadgeRibbon from "../Components/BadgeRibbon";
import { head } from "lodash";
import { CapitalizeName } from "../utils/CapitalizeName";

const VoucherList = (props) => {
  console.log(props)
  const { userToken, search, show } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [griddata, setgriddata] = useState([]);

  useEffect(() => {
    if (search.trim() === '') {
      Browse()
    } else {
      const filtered = griddata.filter(item =>
        item.voucher_name.toLowerCase().includes(search.toLowerCase())
      );


      setgriddata(filtered);
    }
  }, [search]);


  const Browse = () => {
    postRequest(
      "masters/customer/voucher/browse",
      { search: search == undefined ? "" : search },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        console.log(JSON.stringify(resp.data))
        setgriddata(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
    setLoading(false);
  };

  return (
    <View style={MyStyles.container}>
      <FlatList
        style={{ marginVertical: 10 }}
        data={griddata}
        renderItem={({ item, index }) => (
          <Card
            key={item.voucher_id}
            style={{
              marginHorizontal: 20,
              padding: 0,
              borderRadius: 10,
              marginVertical: 5,
              backgroundColor: "white"
            }}
          >

            {item.disable == true && item.voucher_expire == "true" ?
              <BadgeRibbon
                text="Disable"
                color="gray"
                position="voucherRight"
                textStyle={{ top: 20, left: -20 }}
              />
              :
              (item.disable == false && item.voucher_expire == "true" ?
                <BadgeRibbon
                  text="Expire"
                  color="red"
                  position="voucherRight"
                  textStyle={{ top: 20, left: -20 }}
                />
                :
                <BadgeRibbon
                  text="Active"
                  color="green"
                  position="voucherRight"
                  textStyle={{ top: 20, left: -20 }}
                />)}


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
                {CapitalizeName(item.voucher_name)}
              </Text>
            </LinearGradient>

            <Card.Content>
              <View style={[MyStyles.row, { margin: 0 }]}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                    {CapitalizeName(item.voucher_heading)}
                  </Text>
                  <Text style={{ marginBottom: 20 }}>
                    {"Value => "}
                    {item.voucher_value}
                  </Text>
                  <Text>
                    {"Redeem Start Date => "}
                    {moment(item.start_date).format("DD MMM YYYY")}
                  </Text>
                  <Text>
                    {"Redeem End Date => "}
                    {moment(item.end_date).format("DD MMM YYYY")}
                  </Text>
                </View>
                <View>
                  <IconButton
                    icon="information"
                    iconColor="#AAA"
                    onPress={() =>
                      props.navigation.navigate("VoucherForm", {
                        voucher_id: item.voucher_id,
                      })
                    }
                  />
                  {/* <IconButton
                    icon="delete"
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
                            Delete(item.voucher_id);
                          },
                        },
                      ]);
                    }}
                    iconColor="#aaa"
                  /> */}
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        keyExtractor={(item, index) => index.toString()}
      />

      {/* <FAB
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
          props.navigation.navigate("VoucherForm", { voucher_id: 0 })
        }
      /> */}
    </View>
  );
};

const VoucherForm = (props) => {
  const { userToken, userName, voucher_id } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [vouchersession, setvouchersession] = useState(null);
  const [vouchersessionlist, setvouchersessionlist] = useState([
    { label: "duration in days", value: "duration in days" },
    { label: "datetime", value: "datetime" },
  ]);
  const [vouchertypelist, setvouchertypelist] = useState([
    { label: "first time", value: "first time" },
    { label: "birthday", value: "birthday" },
    { label: "anniversary", value: "anniversary" },
    { label: "referral", value: "referral" },
    { label: "upload design", value: "upload design" },
    { label: "other", value: "other" },
  ]);
  const [param, setparam] = useState({
    voucher_id: "0",
    voucher_session_type: "",
    duration: "",
    banner_image: "",
    disable: false,
    end_date: moment(),
    image_path: "",
    redeem_end_date: "",
    redeem_start_date: "",
    start_date: moment(),
    voucher_heading: "",
    voucher_name: "",
    voucher_sms: "",
    voucher_type: "",
    voucher_value: "",
  });

  const [Banner, setBanner] = React.useState(require("../assets/upload.png"));
  const [Image, setImage] = React.useState(require("../assets/upload.png"));
  const [voucheruploads, setvoucheruploads] = useState({
    banner_name: "banner-" + moment().format("YYYYMMDD-hhmmss") + ".png",
    banner_base64: "",
    image_name: "image-" + moment().format("YYYYMMDD-hhmmss") + ".png",
    image_base64: "",
  });
  const [visibletemp, setvisibletemp] = useState(false);
  const [smsparam, setsmsparam] = useState({
    var1: "",
    var2: "",
    var3: "",
    var4: "",
    templete: "",
    var3visible: false,
    var4visible: false,
  });

  React.useEffect(() => {
    if (voucher_id != 0) {
      postRequest(
        "masters/customer/voucher/preview",
        { voucher_id: voucher_id },
        userToken
      ).then((resp) => {
        console.log(resp);

        if (resp.status == 200) {
          param.voucher_id = resp.data.voucher_id;
          param.voucher_session_type = resp.data.voucher_session_type;
          param.duration = resp.data.duration;
          param.banner_image = resp.data.banner_image;
          param.disable = resp.data.disable;
          param.end_date = resp.data.end_date;
          param.image_path = resp.data.image_path;
          param.redeem_end_date = resp.data.redeem_end_date;
          param.redeem_start_date = resp.data.redeem_start_date;
          param.start_date = resp.data.start_date;
          param.voucher_heading = resp.data.voucher_heading;
          param.voucher_name = resp.data.voucher_name;
          param.voucher_sms = resp.data.voucher_sms;
          param.voucher_type = resp.data.voucher_type;
          param.voucher_value = resp.data.voucher_value;

          smsparam.template = resp.data.voucher_sms;

          setImage({ uri: resp.data.image_url + "" + resp.data.image_path });
          setBanner({
            uri: resp.data.banner_url + "" + resp.data.banner_image,
          });
          if (resp.data.voucher_session_type === "duration in days") {
            setvouchersession(true);
            param.redeem_end_date = "";
            param.redeem_start_date = "";
          } else if (val === "datetime") {
            setvouchersession(false);
            param.duration = "";
          }

          if (resp.data.voucher_session_type === "duration in days") {
            setvouchersession(true);
            param.redeem_end_date = "";
            param.redeem_start_date = "";
          } else if (val === "datetime") {
            setvouchersession(false);
            param.duration = "";
          }
        }
      });
    }

    setLoading(false);
  }, [voucher_id]);

  const SmsTemplete = () => {
    smsparam.var3visible = false;
    smsparam.var4visible = false;
    if (param.voucher_type == "first time") {
      smsparam.var3visible = true;
      smsparam.template =
        "Dear Customer, you have just got a " +
        (smsparam.var1 == "" ? "#var1" : smsparam.var1) +
        " gift " +
        (smsparam.var2 == "" ? "#var2" : smsparam.var2) +
        " from " +
        userName.toUpperCase() +
        ". Validity (" +
        (smsparam.var3 == "" ? "#var3" : smsparam.var3) +
        "). T and C apply.";

    } else if (param.voucher_type == "birthday") {
      smsparam.template =
        "Dear Customer, " + userName.toUpperCase() +
        " wishes u Happy Birthday. Lets make it special by " +
        (smsparam.var1 == "" ? "#var1" : smsparam.var1) +
        ". Validity (" +
        (smsparam.var2 == "" ? "#var2" : smsparam.var2) +
        "). T and C apply.";

    } else if (param.voucher_type == "anniversary") {
      smsparam.template =
        "Dear Customer, " + userName.toUpperCase() +
        "wishes u Happy Anniversary. Lets make it special by " +
        (smsparam.var1 == "" ? "#var1" : smsparam.var1) +
        ". Validity (" +
        (smsparam.var2 == "" ? "#var2" : smsparam.var2) +
        "). T and C apply.";

    } else if (param.voucher_type == "referral") {
      smsparam.var3visible = true;
      smsparam.template =
        "Dear Customer, thanks for referring $$MemberName$$ to " +
        userName.toUpperCase() +
        ". To honour, we offer " +
        (smsparam.var1 == "" ? "#var1" : smsparam.var1) +
        " gift " +
        (smsparam.var2 == "" ? "#var2" : smsparam.var2) +
        ". Validity (" +
        (smsparam.var3 == "" ? "#var3" : smsparam.var3) +
        "). T and C apply.";

    } else if (param.voucher_type == "upload design") {
      smsparam.var3visible = true;
      smsparam.template =
        "Dear Customer, thanks for sharing designs. We appreciate and offer " +
        (smsparam.var1 == "" ? "#var1" : smsparam.var1) +
        " gift " +
        (smsparam.var2 == "" ? "#var2" : smsparam.var2) +
        ". Validity (" +
        (smsparam.var3 == "" ? "#var3" : smsparam.var3) +
        "). Team " +
        userName.toUpperCase() +
        ".";

    } else if (param.voucher_type == "other") {
      smsparam.var3visible = true;
      smsparam.var4visible = true;
      smsparam.template =
        "Dear Customer, " + (smsparam.var1 == "" ? "#var1" : smsparam.var1) +
        " celebrate this special " +
        (smsparam.var2 == "" ? "#var2" : smsparam.var2) +
        " with " +
        (smsparam.var3 == "" ? "#var3" : smsparam.var3) +
        ". Validity (" +
        (smsparam.var4 == "" ? "#var4" : smsparam.var4) +
        "). Team " +
        userName.toUpperCase() +
        ". T and C apply.";

    }
    setsmsparam({ ...smsparam });
    setparam({ ...param });
  };

  return (
    <ImageBackground
      source={require("../assets/login-bg.jpg")}
      style={MyStyles.container}
    >
      <ScrollView>
        <View style={MyStyles.cover}>
          <DropDown
            data={vouchersessionlist}
            style={{ marginBottom: 5 }}
            ext_val="value"
            ext_lbl="label"
            value={param.voucher_session_type}
            onChange={(val) => {
              setparam({ ...param, voucher_session_type: val });
              if (val === "Duration in Days") {
                setvouchersession(true);
                setparam({
                  ...param,
                  redeem_start_date: "",
                  redeem_end_date: "",
                });
              } else if (val === "Date Time") {
                setvouchersession(false);
                setparam({ ...param, duration: "" });
              }
            }}
            placeholder="Voucher Session Type"
          />
          <DropDown
            data={vouchertypelist}
            style={{ marginBottom: 5 }}
            ext_val="value"
            ext_lbl="label"
            value={param.voucher_type}
            onChange={(val) => {
              param.voucher_type = val;
              param.voucher_sms = "";
              setparam({ ...param });
              smsparam.var1 = "";
              smsparam.var2 = "";
              smsparam.var3 = "";
              smsparam.var4 = "";
              setsmsparam({ ...smsparam });

              SmsTemplete();
            }}
            placeholder="Voucher Type"
          />

          <TextInput
            mode="outlined"
            placeholder="Voucher Name"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.voucher_name}
            onChangeText={(text) => {
              setparam({ ...param, voucher_name: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Voucher Heading"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.voucher_heading}
            onChangeText={(text) => {
              setparam({ ...param, voucher_heading: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Voucher Value"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.voucher_value}
            onChangeText={(text) => {
              setparam({ ...param, voucher_value: text });
            }}
          />
          <View style={MyStyles.row}>
            <DatePicker
              label="Start Date"
              inputStyles={{ backgroundColor: "rgba(0,0,0,0)", width: "48%" }}
              value={param.start_date}
              onValueChange={(date) => {
                setparam({ ...param, start_date: date });
              }}
            />
            <DatePicker
              label="End Date"
              inputStyles={{ backgroundColor: "rgba(0,0,0,0)", width: "48%" }}
              value={param.end_date}
              onValueChange={(date) => {
                setparam({ ...param, end_date: date });
              }}
            />
          </View>
          {!vouchersession ? (
            <View style={MyStyles.row}>
              <DatePicker
                label="Redeem Start Date"
                inputStyles={{ backgroundColor: "rgba(0,0,0,0)", width: "48%" }}
                value={param.redeem_start_date}
                onValueChange={(date) => {
                  setparam({ ...param, redeem_start_date: date });
                }}
              />
              <DatePicker
                label="Redeem End Date"
                inputStyles={{ backgroundColor: "rgba(0,0,0,0)", width: "48%" }}
                value={param.redeem_end_date}
                onValueChange={(date) => {
                  setparam({ ...param, redeem_end_date: date });
                }}
              />
            </View>
          ) : (
            <TextInput
              mode="outlined"
              placeholder="Duration"
              style={{ backgroundColor: "rgba(0,0,0,0)" }}
              keyboardType={"number-pad"}
              value={param.duration}
              onChangeText={(text) => {
                setparam({ ...param, duration: text });
              }}
            />
          )}

          {param.voucher_sms == "" ? (
            <TouchableRipple
              onPress={() => {
                if (param.voucher_type == "") {
                  Alert.alert("select voucher type");
                }
                else {
                  setvisibletemp(true);
                }
              }}
            >
              <View style={{
                backgroundColor: "rgba(0,0,0,0)",
                padding: 5,
                borderColor: "gray",
                height: 120,
                borderWidth: 1,
                borderRadius: 5,
                marginVertical: 5,
              }}>
                <Text style={{ textAlign: "center", top: 40, fontSize: 20 }}>Insert SMS Templete</Text>

                <List.Icon style={{ position: "absolute", bottom: 0, alignSelf: "flex-end" }} icon="pencil" color="#aaa" />
              </View>

            </TouchableRipple>
          ) :
            <TouchableRipple
              onPress={() => {
                if (param.voucher_type == "") {
                  Alert.alert("select voucher type");
                }
                else {
                  setvisibletemp(true);
                }
              }}
            >
              <View style={{
                backgroundColor: "rgba(0,0,0,0)",
                padding: 5,
                borderColor: "gray",
                height: 120,
                borderWidth: 1,
                borderRadius: 5,
                marginVertical: 5,
              }}>
                <Text style={{ textAlign: "center" }}>{param.voucher_sms}</Text>

                {/* <List.Icon style={{ position: "absolute", bottom: 0, alignSelf: "flex-end" }} icon="pencil" color="#aaa" /> */}
              </View>

            </TouchableRipple>
          }
          {/* <TouchableRipple
              onPress={() => {
                setvisibletemp(true);
              }}
            >
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={4}
                editable={false}
                value={param.voucher_sms}
                style={{ backgroundColor: "rgba(0,0,0,0)" }}
              />
            </TouchableRipple> */}

          <Checkbox.Item
            label="Disable"
            status={param.disable ? "checked" : "unchecked"}
            onPress={(e) => {
              setparam({ ...param, disable: !param.disable });
            }}
            labelStyle={{ color: "#000" }}
            color="#000"
          />
          <View style={MyStyles.row}>
            <ImageUpload
              label="Voucher Image :"
              source={Image}
              onClearImage={() => {
                setImage({ uri: "" });
                setparam({
                  ...param,
                  image_path: "",
                });
              }}
              onUploadImage={(result) => {
                setImage({ uri: result.uri });
                // setvoucheruploads({
                //   ...voucheruploads,
                //   image_base64: result.base64,
                // });
                setparam({
                  ...param,
                  image_path:
                    "image-" + moment().format("YYYYMMDD-hhmmss") + ".jpg",
                });
              }}
            />
            <ImageUpload
              label="Voucher Banner :"
              source={Banner}
              onClearImage={() => {
                setBanner({ uri: "" });
                setparam({
                  ...param,
                  banner_image: "",
                });
              }}
              onUploadImage={(result) => {
                setBanner({ uri: result.uri });
                console.log(result.uri);
                // setvoucheruploads({
                //   ...voucheruploads,
                //   banner_base64: result.base64,
                // });
                setparam({
                  ...param,
                  banner_image:
                    "banner-" + moment().format("YYYYMMDD-hhmmss") + ".jpg",
                });
              }}
            />
          </View>
          {/* <View
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
                  "masters/customer/voucher/insert",
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
                          name: param.banner_image,
                        });

                        var xhr = new XMLHttpRequest();
                        xhr.open(
                          "POST",
                          serviceUrl +
                          "masters/customer/UploadvoucherBannerMob",
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
                              console.log("banner : " + resp.data[0].valid);
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
                          serviceUrl + "masters/customer/UploadvoucherMob",
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
                              console.log("image : " + resp.data[0].valid);
                            }
                          }
                        };
                        xhr.send(form_data);
                      }

                      props.navigation.navigate("VoucherList");
                    }
                    setLoading(false);
                  }
                });
              }}
            >
              Submit
            </Button>
          </View> */}
        </View>
      </ScrollView>
      <Portal>
        <Modal visible={visibletemp} contentContainerStyle={MyStyles.container}>
          <View
            style={[
              MyStyles.row,
              MyStyles.primaryColor,
              {
                marginVertical: 0,
              },
            ]}
          >
            <IconButton
              icon="arrow-left"
              onPress={() => {
                param.voucher_sms = smsparam.template;
                // smsparam.var1 = "";
                // smsparam.var2 = "";
                // smsparam.var3 = "";
                // smsparam.var4 = "";
                // setsmsparam({ ...smsparam });
                setvisibletemp(false);
              }}
            />
            <Text style={{ fontWeight: "bold", fontSize: 18, flexGrow: 1 }}>
              Insert SMS
            </Text>
          </View>
          <ImageBackground
            source={require("../assets/login-bg.jpg")}
            style={MyStyles.container}
          >
            <View style={MyStyles.cover}>
              <TextInput
                mode="outlined"
                placeholder="Var1"
                style={{ backgroundColor: "rgba(0,0,0,0)" }}
                value={smsparam.var1}
                onChangeText={(text) => {
                  smsparam.var1 = text;
                  setsmsparam({ ...smsparam });
                  SmsTemplete();
                }}
              />
              <TextInput
                mode="outlined"
                placeholder="Var2"
                style={{ backgroundColor: "rgba(0,0,0,0)", marginTop: 5 }}
                value={smsparam.var2}
                onChangeText={(text) => {
                  smsparam.var2 = text;
                  setsmsparam({ ...smsparam });
                  SmsTemplete();
                }}
              />
              <TextInput
                mode="outlined"
                placeholder="Var3"
                style={{ backgroundColor: "rgba(0,0,0,0)", marginTop: 5 }}
                value={smsparam.var2}
                onChangeText={(text) => {
                  smsparam.var3 = text;
                  setsmsparam({ ...smsparam });
                  SmsTemplete();
                }}
              />
              {smsparam.var3visible ? (
                <TextInput
                  mode="outlined"
                  placeholder="Var3"
                  style={{ backgroundColor: "rgba(0,0,0,0)" }}
                  value={smsparam.var3}
                  onChangeText={(text) => {
                    smsparam.var3 = text;
                    setsmsparam({ ...smsparam });
                    SmsTemplete();
                  }}
                />
              ) : null}
              {smsparam.var4visible ? (
                <TextInput
                  mode="outlined"
                  placeholder="Var4"
                  style={{ backgroundColor: "rgba(0,0,0,0)" }}
                  value={smsparam.var4}
                  onChangeText={(text) => {
                    smsparam.var4 = text;
                    setsmsparam({ ...smsparam });
                    SmsTemplete();
                  }}
                />
              ) : null}

              <View style={{ marginTop: 50 }}>
                <Text style={{ textAlign: "center" }}>Sms Preview</Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  editable={false}
                  value={smsparam.template}
                  style={{ backgroundColor: "rgba(0,0,0,0)" }}
                />
              </View>
            </View>
            <FAB
              style={{ position: "absolute", bottom: 20, right: 20 }}
              icon="check"
              color="#000"
              onPress={() => {
                param.voucher_sms = smsparam.template;
                setparam({ ...param });
                // smsparam.var1 = "";
                // smsparam.var2 = "";
                // smsparam.var3 = "";
                // smsparam.var4 = "";
                // setsmsparam({ ...smsparam });
                setvisibletemp(false);
              }}
            />
          </ImageBackground>
        </Modal>
      </Portal>
    </ImageBackground>
  );
};


export { VoucherList, VoucherForm };
