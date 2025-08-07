import React, { useState, useEffect } from "react";
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  View,
  Linking,
} from "react-native";


import { Button, Card, FAB, TextInput } from "react-native-paper";
import { AuthContext } from "../../Components/Context";
import { authRequest } from "../../Services/RequestServices";
import MyStyles from "../../Styles/MyStyles";

const Login = () => {
  const { signIn } = React.useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(false);
  const [secureText, setSecureText] = useState(true);
  const [param, setParam] = useState({
    user_name: "",
    password: "",
    otp: "",
  });

  return (


    <SafeAreaView
      style={[MyStyles.container, { justifyContent: 'center', height: Dimensions.get('window').height }]}
    >
      <ImageBackground
        style={{ flex: 1, justifyContent: 'center' }}
        source={require("../../assets/login-bg.jpg")}
      >
        <View style={{ width: '100%', padding: '5%' }}>
          <Image
            source={require("../../assets/logo.png")}
            style={{
              width: 350,
              resizeMode: "contain",
              marginBottom: 40,
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Mobile No."
            maxLength={10}
            keyboardType="number-pad"
            disabled={loading}
            style={{
              backgroundColor: "rgba(255,255,255,0)",
              marginBottom: 20,
            }}
            // left={
            //   <TextInput.Icon
            //     color="#555"
            //     size={25}
            //     style={{ marginBottom: 0 }}
            //     name="phone"
            //   />
            // }
            value={param.user_name}
            onChangeText={(text) => setParam({ ...param, user_name: text })}
          />

          <TextInput
            mode="outlined"
            placeholder="Password"
            secureTextEntry={secureText}
            disabled={loading}
            style={{
              backgroundColor: "rgba(255,255,255,0)",
              marginBottom: 20,
            }}
            // left={
            //   <TextInput.Icon
            //     color="#555"
            //     size={25}
            //     style={{ marginBottom: 0 }}
            //     name="lock"
            //   />
            // }
            right={
              <TextInput.Icon
                color="#aaa"
                size={25}
                style={{ marginBottom: 0 }}
                name={secureText ? "eye" : "eye-off"}
                onPress={() => setSecureText(!secureText)}
                forceTextInputFocus={false}
              />
            }
            value={param.password}
            onChangeText={(text) => setParam({ ...param, password: text })}
          />
          {otp && (
            <TextInput
              mode="outlined"
              placeholder="Otp"
              maxLength={6}
              keyboardType="name-phone-pad"
              disabled={loading}
              secureTextEntry={false}
              style={{ backgroundColor: "rgba(255,255,255,0)" }}
              // left={
              //   <TextInput.Icon
              //     color="#555"
              //     size={25}
              //     style={{ marginBottom: 0 }}
              //     name="lock"
              //   />
              // }
              value={param.otp}
              onChangeText={(text) => setParam({ ...param, otp: text })}
            />
          )}
          <View
            style={[
              MyStyles.row,
              { justifyContent: "center", marginTop: 20 },
            ]}
          >
            <Button
              color="#ffba3c"
              mode="contained"
              uppercase={false}
              style={{ borderRadius: 5 }}
            labelStyle={{ color: "black" }}
              loading={loading}
              disabled={loading}
              onPress={() => {
                setLoading(true);
                if (otp) {
                  authRequest("branch/token", param).then((resp) => {
                    //console.log(resp);
                    if (resp.status == 200) {
                      signIn({
                        userToken: resp.data.access_token,
                        userName: resp.data.company_name,
                        branchId: resp.data.branch_id,
                        branchImg: resp.data.Url_image + "" + resp.data.logo,
                        missCallUser: resp.data.miss_call_user_id
                      });
                    } else {
                      Alert.alert(
                        "Error !",
                        "Oops! \nSeems like we run into some Server Error"
                      );
                    }
                    setLoading(false);
                  });
                } else {
                  authRequest("branch/login", param).then((resp) => {
                    if (resp.status == 200) {
                      if (resp.data[0].valid) {
                        setOtp(true);
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
                  });
                }
              }}
            >
              {!otp ? "Send Otp" : "Login"}
            </Button>
          </View>

        </View>
        <FAB
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            backgroundColor: "green",
          }}
          icon="whatsapp"
          color="#fff"
          onPress={() =>
            Linking.openURL("whatsapp://send?text=&phone=91" + "8810301779")
          }
        />
        <FAB
          style={{
            position: "absolute",
            bottom: 20,
            left: 80,
            backgroundColor: "blue",
          }}
          icon="phone"
          color="#fff"
          onPress={() =>
            Linking.openURL("tel:8810301779")
          }
        />
      </ImageBackground>
    </SafeAreaView>

  );
};

export default Login;
