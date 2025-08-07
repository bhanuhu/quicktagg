import React, { useState } from "react";
import {
  TextInput,
  Portal,
  Button,
  IconButton,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import {
  Platform,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";

const TimePicker = ({
  value,
  onValueChange,
  label,
  style,
  disabled,
  error,
  mode = "time",
}) => {
  const [android, setAndroid] = useState(false);
  const [ios, setIos] = useState(false);

  const formattedValue = value
    ? moment(value).format(mode === "date" ? "DD/MM/YYYY" : "hh:mm A")
    : "";

  return (
    <View>
      {android && (
        <DateTimePicker
          testID="dateTimePicker"
          value={value ? new Date(value) : new Date()}
          mode={mode}
          display="default"
          onChange={(event, selectedDate) => {
            setIos(false);
            setAndroid(false);
            if (selectedDate) {
              onValueChange(moment(selectedDate).format("YYYY-MM-DD HH:mm"));
            }
          }}
        />
      )}
      {ios && (
        <Portal>
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerHeader}>
              <Button
                labelStyle={{ fontSize: 18 }}
                mode="text"
                uppercase={false}
                color="#007AFF"
                onPress={() => setIos(false)}
              >
                Done
              </Button>
            </View>
            <DateTimePicker
              testID="dateTimePicker"
              value={value ? new Date(value) : new Date()}
              mode={mode}
              display="spinner"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  onValueChange(moment(selectedDate).format("YYYY-MM-DD HH:mm"));
                }
              }}
            />
          </View>
        </Portal>
      )}

      <TouchableOpacity
        onPress={() => {
          if (Platform.OS === "ios") {
            setIos(true);
          } else {
            setAndroid(true);
          }
        }}
      >
        <TextInput
          mode="flat"
          disabled={disabled}
          error={!!error}
          style={style}
          value={formattedValue}
          placeholder="Time"
          editable={false}
          right={
            <TextInput.Icon
              disabled={disabled}
              size={30}
              name={mode === "date" ? "calendar" : "clock-outline"}
              onPress={() => {
                if (Platform.OS === "ios") {
                  setIos(true);
                } else {
                  setAndroid(true);
                }
              }}
            />
          }
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  iosPickerContainer: {
    backgroundColor: "white",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    backgroundColor: "#E5E4E2",
  },
});

export default TimePicker;
