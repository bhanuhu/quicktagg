import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import moment from "moment";

const DatePicker = ({
  value,
  onValueChange,
  label,
  inputStyles,
  disabled = false,
}) => {
  const [text, setText] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (value) {
      setText(moment(value).format("DD/MM/YYYY"));
    } else {
      setText("");
    }
  }, [value]);

  const handleChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      const formatted = moment(selectedDate).format("YYYY-MM-DD");
      onValueChange(formatted);
    }
  };

  const handleTextInput = (val) => {
    const cleaned = val.replace(/\D/g, "");
    let formatted = "";

    if (cleaned.length <= 2) {
      formatted = cleaned;
    } else if (cleaned.length <= 4) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }

    setText(formatted);
  };

  const handleBlur = () => {
    if (text.length === 10) {
      const [day, month, year] = text.split("/");
      const formatted = `${year}-${month}-${day}`;
      onValueChange(moment(formatted).format("YYYY-MM-DD"));
    } else {
      setText(value ? moment(value).format("DD/MM/YYYY") : "");
    }
  };

  return (
    <View style={[styles.wrapper, inputStyles]}>
      
      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={handleTextInput}
          onBlur={handleBlur}
          placeholder={label}
          style={styles.textInput}
          maxLength={10}
          keyboardType="number-pad"
          editable={!disabled}
        />
        <TouchableOpacity
          onPress={() => !disabled && setShowPicker(true)}
          style={styles.iconWrapper}
        >
          <FontAwesome name="calendar" size={20} color="#555" />
        </TouchableOpacity>
      </View>
      <View style={styles.underline} />
      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginHorizontal: 4,
    // marginBottom: 12,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 6,
    paddingRight: 30,
    color: "#000",
  },
  iconWrapper: {
    position: "absolute",
    right: 0,
    padding: 6,
  },
  underline: {
    height: 1,
    backgroundColor: "#aaa",
    marginTop: 6,
  },
});

export default DatePicker;
