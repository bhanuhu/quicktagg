import React, { useState, useEffect } from "react";
import { ImageBackground, ScrollView, View, Alert, SafeAreaView, RefreshControl } from "react-native";
import {
  Button,
  Text,
  List,
  FAB,
  TextInput,
  TouchableRipple,
} from "react-native-paper";
import DatePicker from "../Components/DatePicker";
import DropDown from "../Components/DropDown";
import MyStyles from "../Styles/MyStyles";
import { postRequest } from "../Services/RequestServices";
import { FlatList } from "react-native-gesture-handler";
import Loading from "../Components/Loading";
import { CapitalizeName } from "../utils/CapitalizeName";

const CustomerList = (props) => {
  const { userToken, search } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [griddata, setgriddata] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  React.useEffect(() => {
    // Handle refresh when navigating back from CustomerForm
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (props.route.params?.shouldRefresh) {
        fetchCustomers();
        // Clear the parameter to prevent unnecessary refreshes
        props.navigation.setParams({ shouldRefresh: false });
      }
    });

    // Initial data load
    fetchCustomers();

    // Cleanup subscription
    return unsubscribe;
  }, [search, props.navigation, props.route.params]);

  const fetchCustomers = () => {
    try {
      postRequest(
        "masters/customer/browse_app",
        { search: search == undefined ? "" : search },
        userToken
      ).then((resp) => {
        if (resp.status == 200) {
          setgriddata(resp.data);
        }

      });

    } catch (error) {
      console.log(error)

    } finally {
      setLoading(false);
    }
  }


  return (
    <View style={MyStyles.container}>
      <Loading isloading={loading} />
      <FlatList
        data={griddata}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        initialNumToRender={10}
        renderItem={({ item, index }) => (
          <List.Item
            key={item.customer_id}
            style={{ borderBottomWidth: 0.5, borderBottomColor: "#CCC" }}
            title={
              <Text
                onPress={() => {
                  props.navigation.navigate("Profile", {
                    customer_id: item.customer_id,
                    customer_mobile: item.mobile,
                  });
                }}
                style={{ fontWeight: 'bold', fontSize: 15 }}
              >
                {CapitalizeName(item.full_name) || 'Member Name'}
              </Text>
            }
            titleStyle={{ fontWeight: "bold" }}
            description={
              <Text style={{ fontSize: 14 }}>
                {item.mobile + "          " + (item.category_name && item.category_name !== 'null' ? item.category_name : '')}
              </Text>
            }
            left={() => {
              return (
                <TouchableRipple
                  style={{ marginLeft: 10, marginTop: 5 }}
                  onPress={() => {
                    props.navigation.navigate("Profile", {
                      customer_id: item.customer_id,
                      customer_mobile: item.mobile,
                    });
                  }}
                >
                  <Text style={{
                    color: "red",
                    textTransform: "uppercase",
                    borderWidth: 1,
                    borderRadius: 4,
                    borderColor: 'grey',
                    aspectRatio: 1,
                    textAlign: 'center',
                    fontWeight: "bold",
                    padding: 5,

                  }}>
                    {item.type == null ? "" : item.type.charAt(0)}
                  </Text>
                </TouchableRipple>
              );
            }}
            right={() => {
              return (
                <TouchableRipple
                  style={{ zIndex: 0, marginTop: 5 }}
                  onPress={() => {
                    props.navigation.navigate("CustomerForm", {
                      customer_id: item.customer_id,
                    });
                  }}
                >
                  <List.Icon {...props} icon="pencil" color="#aaa" />
                </TouchableRipple>
              );
            }}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <FAB
        style={{
          position: "absolute",
          bottom: 25,
          right: 25,
          zIndex: 100,
          borderRadius: 50,
          backgroundColor: MyStyles.primaryColor.backgroundColor,
        }}
        color="black"
        icon="plus"
        onPress={() =>
          props.navigation.navigate("CustomerForm", { customer_id: 0 })
        }
      />
    </View>
  );
};

const CustomerForm = (props) => {
  const { customer_id } = props.route.params;
  const { userToken } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [submiting, setSubmiting] = useState(false);
  const [categorylist, setcategorylist] = useState([]);
  const [stafflist, setstafflist] = useState([]);
  const [arealist, setarealist] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [genderlist, setgenderlist] = useState([
    { label: "Male", value: "Male" },
    { label: "Female", value: "Female" },
  ]);

  // Initial form state
  const initialFormState = {
    customer_id: "0",
    address: "",
    email: "",
    full_name: "",
    gender: "",
    mobile: "",
    area_id: "",
    category_id: "",
    doa: "",
    dob: "",
    sp_bdy: "",
    profession: "",
    ref_id: "",
    staff_id: "",
  };

  const [param, setparam] = useState(initialFormState);

  console.log(isRegistered)


  //Mobile check
  const checkMobile = async (val) => {
    if (val.length !== 10) {
      setIsRegistered(false)
      Alert.alert(
        "Error !",
        "Please enter valid 10 digit mobile number!"
      );
    } else {
      postRequest("masters/customer_check_mobile", { mobile: val }, userToken).then((data) => {
        setIsRegistered(data.data)
      });
    }
  };


  React.useEffect(() => {
    postRequest("masters/customer/category/browse", param, userToken).then(
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
    postRequest("masters/staff/browse", param, userToken).then((resp) => {
      if (resp.status == 200) {
        setstafflist(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });

    postRequest("masters/area/browse", param, userToken).then((resp) => {
      if (resp.status == 200) {
        setarealist(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });

    if (customer_id != 0) {
      postRequest(
        "masters/customer/preview",
        { customer_id: customer_id },
        userToken
      ).then((resp) => {
        console.log(``)

        if (resp.status == 200) {
          param.customer_id = resp.data.customer_id;
          param.address = resp.data.address;
          param.email = resp.data.email;
          param.full_name = resp.data.full_name;
          param.gender = resp.data.gender;
          param.mobile = resp.data.mobile;
          param.area_id = resp.data.area_id;
          param.category_id = resp.data.category_id;
          param.doa = resp.data.doa;
          param.dob = resp.data.dob;
          param.profession = resp.data.profession;
          param.ref_id = resp.data.ref_id;
          param.staff_id = resp.data.staff_id;
          setparam({ ...param });
        } else {
          Alert.alert(
            "Error !",
            "Oops! \nSeems like we run into some Server Error"
          );
        }
      });
    }
    else {
      setparam(initialFormState)
    }

  }, [customer_id]);

 
  return (
    <ImageBackground
      style={MyStyles.container}
      source={require("../assets/login-bg.jpg")}
    >
      {/* <Loading isloading={loading} /> */}
      <SafeAreaView>
        <ScrollView style={{ marginTop: 10 }}>
          <View style={MyStyles.cover}>
            <TextInput
              mode="outlined"
              label="Full Name"
              style={{ marginBottom: 2, backgroundColor: 'transparent' }}
              value={param.full_name}
              onChangeText={(text) => setparam({ ...param, full_name: text })}
            />

            <TextInput
              mode="outlined"
              label="Mobile No."
              keyboardType="number-pad"
              maxLength={10}
              style={{ marginBottom: 2, backgroundColor: 'transparent' }}
              value={param.mobile}
              onChangeText={(text) => setparam({ ...param, mobile: text })}
            />

            <TextInput
              mode="outlined"
              label="Email"
              style={{ marginBottom: 2, backgroundColor: 'transparent' }}
              value={param.email}
              onChangeText={(text) => setparam({ ...param, email: text })}
            />

            {/* Date of Birth & Date of Anniversary */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
              <DatePicker
                label="DOB"
                value={param.dob}
                onValueChange={(date) => setparam({ ...param, dob: date })}
              />
              <DatePicker
                label="DOA"
                value={param.doa}
                onValueChange={(date) => setparam({ ...param, doa: date })}
              />


            </View>





            {/* Gender & Category */}
            <View style={MyStyles.row}>
              <DropDown
                data={genderlist}
                ext_val="value"
                ext_lbl="label"
                value={param.gender}
                onChange={(val) => setparam({ ...param, gender: val })}
                placeholder="Gender"
                style={{ width: "36%", marginBottom: 5 }}
              />
              <DropDown
                data={categorylist}
                ext_val="category_id"
                ext_lbl="category_name"
                value={param.category_id}
                onChange={(val) => setparam({ ...param, category_id: val })}
                placeholder="Category"
                style={{ width: "60%", marginBottom: 5 }}
              />
            </View>

            <View style={{ marginTop: 10 }}>
              <DatePicker
                label="Spouse Birthday"
                value={param.sp_bdy}
                onValueChange={(date) => setparam({ ...param, sp_bdy: date })}
              />
            </View>

            {/* Staff & Area */}
            <View style={MyStyles.row}>
              <DropDown
                data={stafflist}
                ext_val="staff_id"
                ext_lbl="name"
                value={param.staff_id}
                onChange={(val) => setparam({ ...param, staff_id: val })}
                placeholder="Staff"
                style={{ width: "48%", marginBottom: 5 }}
              />
              <DropDown
                data={arealist}
                ext_val="area_id"
                ext_lbl="area_name"
                value={param.area_id}
                onChange={(val) => setparam({ ...param, area_id: val })}
                placeholder="Area"
                style={{ width: "48%", marginBottom: 5 }}
              />
            </View>

            <TextInput
              mode="outlined"
              label="Profession"
              style={{ marginBottom: 2, backgroundColor: 'transparent' }}
              value={param.profession}
              onChangeText={(text) => setparam({ ...param, profession: text })}
            />

            <TextInput
              mode="outlined"
              label="Address"
              multiline
              numberOfLines={3}
              style={{ marginBottom: 20, backgroundColor: 'transparent' }}
              value={param.address}
              onChangeText={(text) => setparam({ ...param, address: text })}
            />

            {/* Submit Button */}
            <View style={{ alignItems: "center", marginBottom: 40 }}>
              <Button
                mode="contained"
                uppercase={false}
                style={{ borderRadius: 5 }}
                labelStyle={{ color: "black" }}
                disabled={submiting}
                onPress={async () => {


                  // return;
                  try {
                    setSubmiting(true);
                    await checkMobile(param.mobile);
                    if (!isRegistered) {
                      const resp = await postRequest("masters/customer/insert", param, userToken);
                      console.log(`inserted data response -> ${JSON.stringify(resp)}`);
                      console.log(`inserted data param -> ${JSON.stringify(param)}`);
                      if (resp.status === 200) {
                        setLoading(false);
                        // Reset form and navigate
                        // Navigate back to CustomerList with refresh flag
                        props.navigation.navigate(
                          'CustomerList', 
                          { 
                            shouldRefresh: true,
                            screen: 'CustomerList' 
                          }
                        );
                      }
                    } else {
                      const resp = await postRequest("masters/customer/insert", param, userToken);
                      console.log(`updated data respons -> ${(resp)}`);
                      console.log(`updated data param -> ${JSON.stringify(param)}`);
                      if (resp.status === 200) {
                        setLoading(false);
                        // Reset form and navigate
                        // Navigate back to CustomerList with refresh flag
                        props.navigation.navigate(
                          'CustomerList', 
                          { 
                            shouldRefresh: true,
                            screen: 'CustomerList' 
                          }
                        );
                      }
                    }

                  } catch (error) {

                    console.log(`catch errorr ->`, error)
                  } finally {
                    setSubmiting(false)
                    setparam(initialFormState)
                  }

                }}
              >
                Submit
              </Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export { CustomerList, CustomerForm };
