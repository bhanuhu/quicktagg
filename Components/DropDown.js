import React, { useState } from "react";
import { Platform, View } from "react-native";
import { Button, Modal, Portal, Text, TextInput, TouchableRipple } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import { CapitalizeName } from "../utils/CapitalizeName";

const DropDown = ({
  ext_lbl = "label",
  ext_val = "value",
  style,
  onChange,
  placeholder = "--Select--",
  label,
  value = "",
  data = [],
  error,
  disabled,
}) => {
  const [visible, setVisible] = useState(false);

  // Handle both array and primitive values for comparison
  const isValueInArray = (itemValue, targetValue) => {
    if (Array.isArray(itemValue)) {
      return itemValue.includes(targetValue);
    }
    return itemValue === targetValue;
  };

  const selectedLabel = data.find((item) => isValueInArray(item[ext_val], value))?.[ext_lbl] || placeholder;

  return (
    <View style={style}>
      <Text
        style={[
          {
            position: "relative",
            top: 17,
            left: 10,
            zIndex: 10,
            color: disabled ? "#aaa" : "#808080",
            backgroundColor: "white",
            maxWidth: "80%",
            height: 20,
            marginTop: -17,
            marginEnd: "auto",
          },
          error ? { color: "#8B0000" } : null,
        ]}
      >
        {CapitalizeName(label)}
      </Text>

      <View
        style={[
          {
            borderBottomWidth: 1,
            borderColor: disabled ? "#555" : "#7a7a7a",
            borderRadius: 5,
            marginTop: 8,
            height: 60,
            width: "100%",
            backgroundColor: "rgba(0,0,0,0)",
          },
          error ? { borderColor: "#8B0000" } : null,
        ]}
      >
        {Platform.OS === "ios" ? (
          <>
            <Portal>
              <Modal
                visible={visible}
                onDismiss={() => setVisible(false)}
                contentContainerStyle={{
                  bottom: 0,
                  width: "100%",
                  position: "absolute",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    width: "100%",
                    backgroundColor: "#E5E4E2",
                  }}
                >
                  <Button
                    labelStyle={{ fontSize: 18 }}
                    mode="text"
                    uppercase={false}
                    textColor="#007AFF"
                    onPress={() => setVisible(false)}
                  >
                    Done
                  </Button>
                </View>

                <View
                  style={{
                    backgroundColor: "#FFF",
                    height: 200,
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <Picker
                    enabled={!disabled}
                    prompt="Select an Option"
                    selectedValue={value}
                    style={{ margin: 0, width: "100%" }}
                    onValueChange={(val, index) => {
                      onChange(val, index);
                    }}
                  >
                    <Picker.Item label={placeholder} value="" />
                    {data.map((item, index) => (
                      <Picker.Item label={item[ext_lbl]} value={item[ext_val]} key={index} />
                    ))}
                  </Picker>
                </View>
              </Modal>
            </Portal>

            <TouchableRipple
              onPress={() => setVisible(true)}
              style={{ flex: 1, justifyContent: "center", paddingLeft: 10 }}
            >
              <Text>{CapitalizeName(selectedLabel)}</Text>
            </TouchableRipple>
          </>
        ) : (
          <Picker
            enabled={!disabled}
            prompt="Select an Option"
            selectedValue={value}
            style={{ height: 60, width: "100%" }}
            onValueChange={(val, index) => {
              onChange(val, index);
            }}
          >
            <Picker.Item label={placeholder} value="" />
            {data.map((item, index) => (
              <Picker.Item label={CapitalizeName(item[ext_lbl])} value={item[ext_val]} key={index} />
            ))}
          </Picker>
        )}
      </View>
    </View>
  );
};

export default DropDown;
