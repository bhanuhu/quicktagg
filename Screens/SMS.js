import React, { useState, useEffect } from "react";
import { Alert, ImageBackground, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Button, Card, Checkbox, IconButton, Text, TextInput, } from "react-native-paper";
import CustomHeader from "../Components/CustomHeader";
import MyStyles from "../Styles/MyStyles";
import { postRequest } from "../Services/RequestServices";
import Loading from "../Components/Loading";
const SMS = (props) => {
  const { userToken } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [param, setParam] = useState({  
    otp_temp: "Dear Member,XXXX is your one-time password (OTP) for login. Please enter the OTP to proceed. Team MALIRAM JEWELLERS.",
    welcome: false,
    welcome_temp: "Dear Member, welcome to #VAR1# prestigious #VAR2#, MALIRAM JEWELLERS! We honoured and hope you will have a great experience.",
    anniversary: false,
    anniversary_prior: false,
    anniversary_prior_temp: "",
    anniversary_temp: "Dear Member,MALIRAM JEWELLERS wishing you a HAPPY ANNIVERSARY! Wishing you all the happiness and love in the world. Congratulation.",
    birthday: false,
    birthday_prior: false,
    birthday_prior_temp: "",
    birthday_temp: "Dear Member,MALIRAM JEWELLERS wish you a wonderful BIRTHDAY! May this day be filled with many happy hours and your life with many birthdays.",
    customer_signup: false,
    customer_signup_temp: "",
    optional_feedback: false,
    optional_feedback_temp: "",
    reference_temp: "Dear Member,thanks for referring #VAR1# to $$MemberName$$. We are grateful for your love and support. Team MALIRAM JEWELLERS.",
    reference: false,
    reminder_days: 0,
    reminder_days1: 0,
    reminder_temp: "",
    staff_check: false,
    thank_you: false,
    thank_you_temp: "Dear Member,thank you for visiting MALIRAM JEWELLERS. Hope you had a great experience. Kindly contact us #VAR1# for any assistance.",
    voucher_redeem: false,
    voucher_redeem_temp: "",
    rate_us: false,
    rate_us_temp: "Dear Member, Please rate us at http://j-qt.in/$$URL$$. Team MALIRAM JEWELLERS. Thank you.",
    upload_design: false,
    upload_design_temp: "Dear Member,thank you for sharing designs. We appreciate and will try to get back to you with the closet we have. Team MALIRAM JEWELLERS.",
    customised_catalogue: false,
    customised_catalogue_temp: "Dear Member,just click Variable Part to check Variable Part. Team MALIRAM JEWELLERS. Thank you",
    video_call_request: false,
    video_call_request_temp: "Dear Member,welcome to MALIRAM JEWELLERS live support. Our staff executive will reach you soon.",
    video_call_booked: false,
    video_call_booked_temp: "Dear Member,just click http://j-qt.in/$$URL$$ to check our #VAR1#. Team MALIRAM JEWELLERS. Thank you.",
    common: false,
    common_temp: "Dear Member, just click http://j-qt.in/$$URL$$  to check our #VAR1#. Team MALIRAM JEWELLERS. Thank you."
  });
  const [paramtemp, setParamTemp] = useState({
    welcome_var_1: "",
    welcome_var_2: "",
    referrence_var_1: "",
    thanku_var_1: "",
    general_var_1: "",
  });
  const [selectedwelcome, setSelectedWelcome] = useState(false);
  const [selectedreferrence, setSelectedReferrence] = useState(false);
  const [selectedthanku, setSelectedThanku] = useState(false);
  const [selectedgeneral, setSelectedGeneral] = useState(false);

  React.useEffect(() => {
    preview();
  }, []);

  const preview = () => {
    postRequest("sms/smssettings/preview", {}, userToken).then((resp) => {
      if (resp.status == 200) {       
        param.otp_temp = resp.data[0].otp_temp;
        param.welcome = resp.data[0].welcome;
        param.welcome_temp = resp.data[0].welcome_temp;
        param.anniversary = resp.data[0].anniversary;
        param.anniversary_prior = resp.data[0].anniversary_prior;
        param.anniversary_prior_temp = resp.data[0].anniversary_prior_temp;
        param.anniversary_temp = resp.data[0].anniversary_temp;
        param.birthday = resp.data[0].birthday;
        param.birthday_prior = resp.data[0].birthday_prior;
        param.birthday_prior_temp = resp.data[0].birthday_prior_temp;
        param.birthday_temp = resp.data[0].birthday_temp;
        param.customer_signup = resp.data[0].customer_signup;
        param.customer_signup_temp = resp.data[0].customer_signup_temp;
        param.optional_feedback = resp.data[0].optional_feedback;
        param.optional_feedback_temp = resp.data[0].optional_feedback_temp;
        param.reference_temp = resp.data[0].reference_temp;
        param.reference = resp.data[0].reference;
        param.reminder_days = resp.data[0].reminder_days;
        param.reminder_days1 = resp.data[0].reminder_days1;
        param.reminder_temp = resp.data[0].reminder_temp;
        param.staff_check = resp.data[0].staff_check;
        param.thank_you = resp.data[0].thank_you;
        param.thank_you_temp = resp.data[0].thank_you_temp;
        param.voucher_redeem = resp.data[0].voucher_redeem;
        param.voucher_redeem_temp = resp.data[0].voucher_redeem_temp;
        param.rate_us = resp.data[0].rate_us;
        param.rate_us_temp = resp.data[0].rate_us_temp;
        param.upload_design = resp.data[0].upload_design;
        param.upload_design_temp = resp.data[0].upload_design_temp;
        param.customised_catalogue = resp.data[0].customised_catalogue;
        param.customised_catalogue_temp = resp.data[0].customised_catalogue_temp;
        param.video_call_request = resp.data[0].video_call_request;
        param.video_call_request_temp = resp.data[0].video_call_request_temp;
        param.video_call_booked = resp.data[0].video_call_booked;
        param.video_call_booked_temp = resp.data[0].video_call_booked_temp;
        param.common = resp.data[0].common;
        param.common_temp = resp.data[0].common_temp;
        setParam({ ...param });
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
    <ImageBackground
      style={MyStyles.container}
      source={require("../assets/login-bg.jpg")}
    >
      <Loading isloading={loading} />
      <ScrollView>
        <Card
          style={{
            borderColor: "black",
            borderWidth: 1,
            padding: 5,
            marginVertical: 5,
            marginHorizontal: 10,
          }}
        >
          <Card.Title
            title="OTP"
          />
          <Card.Content>
            <Text>
              {param.otp_temp}
            </Text>           
          </Card.Content>
        </Card>

        <Card
          style={{
            borderColor: "black",
            borderWidth: 1,
            padding: 5,
            marginVertical: 5,
            marginHorizontal: 10,
          }}
        >
          <Card.Title title="Welcome"
            right={() => (
              <IconButton
                icon="pencil"
                onPress={() => {
                  if (selectedwelcome != 1) {
                    return setSelectedWelcome(1);
                  }
                  setSelectedWelcome(false);
                }}
              />
            )} />
          <Card.Content>
            <Text>{param.welcome_temp}</Text>
            <Checkbox.Item
              label="Active"
              status={param.welcome ? "checked" : "unchecked"}
              onPress={() => {
                Alert.alert(
                  "Are you sure ?",
                  "This message will be sent to the users",
                  [
                    {
                      text: "No",
                      style: "cancel",
                      onPress: () => {
                        param.welcome = false;
                        setParam({ ...param });
                      },
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        param.welcome = true;
                        setParam({ ...param });
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />

            {selectedwelcome == 1 && (
              <View style={styles.form}>
                <View style={styles.form__control}>
                  <Text style={styles.form__control__label}>Var 1</Text>
                  <TextInput
                    mode="flat"
                    placeholder="Var 1"
                    value={paramtemp.welcome_var_1}
                    style={styles.form__control__input}
                    onChangeText={(text) => {
                      paramtemp.welcome_var_1 = text;
                      setParamTemp({ ...paramtemp });
                      param.welcome_temp = "Dear Member, welcome to " + (paramtemp?.welcome_var_1 || "#VAR1#") + " prestigious " + (paramtemp?.welcome_var_2 || "#VAR2#") + ", MALIRAM JEWELLERS! We honoured and hope you will have a great experience."
                      setParam({ ...param });
                    }}
                  />
                </View>

                <View style={styles.form__control}>
                  <Text style={styles.form__control__label}>Var 2</Text>
                  <TextInput
                    mode="flat"
                    placeholder="Var 2"
                    value={paramtemp.welcome_var_2}
                    style={styles.form__control__input}
                    onChangeText={(text) => {
                      paramtemp.welcome_var_2 = text;
                      setParamTemp({ ...paramtemp });
                      param.welcome_temp = "Dear Member,welcome to " + (paramtemp?.welcome_var_1 || "#VAR1#") + " prestigious " + (paramtemp?.welcome_var_2 || "#VAR2#") + ", MALIRAM JEWELLERS! We honoured and hope you will have a great experience."
                      setParam({ ...param });
                    }}
                  />
                </View>

                <Button
                  mode="contained"
                  style={styles.form__control__submit}
                  onPress={() => setSelectedWelcome(false)}
                >
                  Done
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card
          style={{
            borderColor: "black",
            borderWidth: 1,
            padding: 5,
            marginVertical: 5,
            marginHorizontal: 10,
          }}
        >
          <Card.Title title="Birthday" />
          <Card.Content>
            <Text>{param.birthday_temp}</Text>
            <Checkbox.Item
              label="Active"
              status={param.birthday ? "checked" : "unchecked"}
              onPress={() => {
                Alert.alert(
                  "Are you sure ?",
                  "This message will be sent to the users",
                  [
                    {
                      text: "No",
                      style: "cancel",
                      onPress: () => {
                        param.birthday = false;
                        setParam({ ...param });
                      },
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        param.birthday = true;
                        setParam({ ...param });
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
          </Card.Content>
        </Card>

        <Card
          style={{
            borderColor: "black",
            borderWidth: 1,
            padding: 5,
            marginVertical: 5,
            marginHorizontal: 10,
          }}
        >
          <Card.Title title="ANNIVERSAY" />
          <Card.Content>
            <Text>{param.anniversary_temp}</Text>
            <Checkbox.Item
              label="Active"
              status={param.anniversary ? "checked" : "unchecked"}
              onPress={() => {
                Alert.alert(
                  "Are you sure ?",
                  "This message will be sent to the users",
                  [
                    {
                      text: "No",
                      style: "cancel",
                      onPress: () => {
                        param.anniversary = false;
                        setParam({ ...param });
                      },
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        param.anniversary = true;
                        setParam({ ...param });
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
          </Card.Content>
        </Card>

        <Card
          style={{
            borderColor: "black",
            borderWidth: 1,
            padding: 5,
            marginVertical: 5,
            marginHorizontal: 10,
          }}
        >
          <Card.Title title="REFERRENCE"
            right={() => (
              <IconButton
                icon="pencil"
                onPress={() => {
                  if (selectedreferrence != 1) {
                    return setSelectedReferrence(1);
                  }
                  setSelectedReferrence(false);
                }}
              />
            )} />
          <Card.Content>
            <Text>{param.reference_temp} </Text>
            <Checkbox.Item
              label="Active"
              status={param.reference ? "checked" : "unchecked"}
              onPress={() => {
                Alert.alert(
                  "Are you sure ?",
                  "This message will be sent to the users",
                  [
                    {
                      text: "No",
                      style: "cancel",
                      onPress: () => {
                        param.reference = false;
                        setParam({ ...param });
                      },
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        param.reference = true;
                        setParam({ ...param });
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
            {selectedreferrence == 1 && (
              <View style={styles.form}>
                <View style={styles.form__control}>
                  <Text style={styles.form__control__label}>Var 1</Text>
                  <TextInput
                    mode="flat"
                    placeholder="Var 1"
                    value={paramtemp.referrence_var_1}
                    style={styles.form__control__input}
                    onChangeText={(text) => {
                      paramtemp.referrence_var_1 = text;
                      setParamTemp({ ...paramtemp });
                      //param.welcome_temp = "Dear Member,welcome to " + (paramtemp?.referrence_var_1 || "#VAR1#") + " prestigious " + (paramtemp?.referrence_var_1 || "#VAR2#") + ", MALIRAM JEWELLERS! We honoured and hope you will have a great experience."
                      param.reference_temp = "Dear Member, thanks for referring " + (paramtemp?.referrence_var_1 || "#VAR1#") + " to $$MemberName$$. We are grateful for your love and support. Team MALIRAM JEWELLERS."
                      setParam({ ...param });
                    }}
                  />
                </View>
                <Button
                  mode="contained"
                  style={styles.form__control__submit}
                  onPress={() => setSelectedReferrence(false)}
                >
                  Done
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card
          style={{
            borderColor: "black",
            borderWidth: 1,
            padding: 5,
            marginVertical: 5,
            marginHorizontal: 10,
          }}
        >
          <Card.Title title="UPLOAD DESIGN" />
          <Card.Content>
            <Text>{param.upload_design_temp} </Text>
            <Checkbox.Item
              label="Active"
              status={param.upload_design ? "checked" : "unchecked"}
              onPress={() => {
                Alert.alert(
                  "Are you sure ?",
                  "This message will be sent to the users",
                  [
                    {
                      text: "No",
                      style: "cancel",
                      onPress: () => {
                        param.upload_design = false;
                        setParam({ ...param });
                      },
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        param.upload_design = true;
                        setParam({ ...param });
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
          </Card.Content>
        </Card>

        <Card
          style={{
            borderColor: "black",
            borderWidth: 1,
            padding: 5,
            marginVertical: 5,
            marginHorizontal: 10,
          }}
        >
          <Card.Title title="THANK YOU"
            right={() => (
              <IconButton
                icon="pencil"
                onPress={() => {
                  if (selectedthanku != 1) {
                    return setSelectedThanku(1);
                  }
                  setSelectedThanku(false);
                }}
              />
            )} />
          <Card.Content>
            <Text>{param.thank_you_temp}</Text>
            <Checkbox.Item
              label="Active"
              status={param.thank_you ? "checked" : "unchecked"}
              onPress={() => {
                Alert.alert(
                  "Are you sure ?",
                  "This message will be sent to the users",
                  [
                    {
                      text: "No",
                      style: "cancel",
                      onPress: () => {
                        param.thank_you = false;
                        setParam({ ...param });
                      },
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        param.thank_you = true;
                        setParam({ ...param });
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
            {selectedthanku == 1 && (
              <View style={styles.form}>
                <View style={styles.form__control}>
                  <Text style={styles.form__control__label}>Var 1</Text>
                  <TextInput
                    mode="flat"
                    placeholder="Var 1"
                    value={paramtemp.thanku_var_1}
                    style={styles.form__control__input}
                    onChangeText={(text) => {
                      paramtemp.thanku_var_1 = text;
                      setParamTemp({ ...paramtemp });
                      param.thank_you_temp = "Dear Member,thank you for visiting MALIRAM JEWELLERS. Hope you had a great experience. Kindly contact us " + (paramtemp?.thanku_var_1 || "#VAR1#") + " for any assistance."
                      setParam({ ...param });
                    }}
                  />
                </View>

                <Button
                  mode="contained"
                  style={styles.form__control__submit}
                  onPress={() => setSelectedThanku(false)}
                >
                  Done
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card
          style={{
            borderColor: "black",
            borderWidth: 1,
            padding: 5,
            marginVertical: 5,
            marginHorizontal: 10,
          }}
        >
          <Card.Title title="RATE US" />
          <Card.Content>
            <Text>{param.rate_us_temp} </Text>
            <Checkbox.Item
              label="Active"
              status={param.rate_us ? "checked" : "unchecked"}
              onPress={() => {
                Alert.alert(
                  "Are you sure ?",
                  "This message will be sent to the users",
                  [
                    {
                      text: "No",
                      style: "cancel",
                      onPress: () => {
                        param.rate_us = false;
                        setParam({ ...param });
                      },
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        param.rate_us = true;
                        setParam({ ...param });
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
          </Card.Content>
        </Card>

        <Card
          style={{
            borderColor: "black",
            borderWidth: 1,
            padding: 5,
            marginVertical: 5,
            marginHorizontal: 10,
          }}
        >
          <Card.Title title="GENERAL, TRY AT HOME, BUSINESS CATALOGUE"
            titleNumberOfLines={2}
            right={() => (
              <IconButton
                icon="pencil"
                onPress={() => {
                  if (selectedgeneral != 1) {
                    return setSelectedGeneral(1);
                  }
                  setSelectedGeneral(false);
                }}
              />
            )} />
          <Card.Content>
            <Text>{param.common_temp}</Text>
            <Checkbox.Item
              label="Active"
              status={param.common ? "checked" : "unchecked"}
              onPress={() => {
                Alert.alert(
                  "Are you sure ?",
                  "This message will be sent to the users",
                  [
                    {
                      text: "No",
                      style: "cancel",
                      onPress: () => {
                        param.common = false;
                        setParam({ ...param });
                      },
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        param.common = true;
                        setParam({ ...param });
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
            {selectedgeneral == 1 && (
              <View style={styles.form}>
                <View style={styles.form__control}>
                  <Text style={styles.form__control__label}>Var 1</Text>
                  <TextInput
                    mode="flat"
                    placeholder="Var 1"
                    value={paramtemp.general_var_1}
                    style={styles.form__control__input}
                    onChangeText={(text) => {
                      paramtemp.general_var_1 = text;
                      setParamTemp({ ...paramtemp });
                      param.common_temp = "Dear Member,just click http://j-qt.in/$$URL$$ to check our " + (paramtemp?.general_var_1 || "#VAR1#") + ". Team MALIRAM JEWELLERS. Thank you."
                      param.video_call_booked_temp = "Dear Member,just click http://j-qt.in/$$URL$$ to check our " + (paramtemp?.general_var_1 || "#VAR1#") + ". Team MALIRAM JEWELLERS. Thank you."
                      setParam({ ...param });
                    }}
                  />
                </View>

                <Button
                  mode="contained"
                  style={styles.form__control__submit}
                  onPress={() => setSelectedGeneral(false)}
                >
                  Done
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card
          style={{
            borderColor: "black",
            borderWidth: 1,
            padding: 5,
            marginVertical: 5,
            marginHorizontal: 10,
          }}
        >
          <Card.Title title="CUSTOMISED CATALOGUE" />
          <Card.Content>
            <Text>{param.customised_catalogue_temp} </Text>
            <Checkbox.Item
              label="Active"
              status={param.customised_catalogue ? "checked" : "unchecked"}
              onPress={() => {
                Alert.alert(
                  "Are you sure ?",
                  "This message will be sent to the users",
                  [
                    {
                      text: "No",
                      style: "cancel",
                      onPress: () => {
                        param.customised_catalogue = false;
                        setParam({ ...param });
                      },
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        param.customised_catalogue = true;
                        setParam({ ...param });
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
          </Card.Content>
        </Card>

        <Card
          style={{
            borderColor: "black",
            borderWidth: 1,
            padding: 5,
            marginVertical: 5,
            marginHorizontal: 10,
          }}
        >
          <Card.Title title="VIDEO CALL REQUEST" />
          <Card.Content>
            <Text>{param.video_call_request_temp}</Text>
            <Checkbox.Item
              label="Active"
              status={param.video_call_request ? "checked" : "unchecked"}
              onPress={() => {
                Alert.alert(
                  "Are you sure ?",
                  "This message will be sent to the users",
                  [
                    {
                      text: "No",
                      style: "cancel",
                      onPress: () => {
                        param.video_call_request = false;
                        setParam({ ...param });
                      },
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        param.video_call_request = true;
                        setParam({ ...param });
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
          </Card.Content>
        </Card>

        <Card
          style={{
            borderColor: "black",
            borderWidth: 1,
            padding: 5,
            marginVertical: 5,
            marginHorizontal: 10,
          }}
        >
          <Card.Title title="VIDEO CALL BOOKED" />
          <Card.Content>
            <Text>{param.video_call_booked_temp}</Text>
            <Checkbox.Item
              label="Active"
              status={param.video_call_booked ? "checked" : "unchecked"}
              onPress={() => {
                Alert.alert(
                  "Are you sure ?",
                  "This message will be sent to the users",
                  [
                    {
                      text: "No",
                      style: "cancel",
                      onPress: () => {
                        param.video_call_booked = false;
                        setParam({ ...param });
                      },
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        param.video_call_booked = true;
                        setParam({ ...param });
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
          </Card.Content>
        </Card>
        <View
          style={[
            MyStyles.row,
            { justifyContent: "center", marginVertical: 40 },
          ]}
        >
          <Button
            mode="contained"
            uppercase={false}
            onPress={() => {
              setLoading(true);              
              postRequest("sms/smssettings/insert", param, userToken).then((resp) => {             
                if (resp.status == 200) {
                  if (resp.data[0].valid) {

                  }
                  setLoading(false);
                }
              });
            }}
          >
            Submit
          </Button>
        </View>

      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  form: {},
  form__control: {
    marginBottom: 10,
  },
  form__control__input: {
    height: 40,
    backgroundColor: "#FFF",
  },
  form__control__submit: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  form__control__label: {
    paddingLeft: 10,
  },
});

export default SMS;
