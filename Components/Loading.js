import React, { useState, useEffect, useRef } from "react";
import { View } from "react-native";
import { Modal, Portal } from "react-native-paper";
import LottieView from "lottie-react-native";

const Loading = ({ isloading }) => {
  const ref = useRef(null);

  return (
    <Portal>
      <Modal
        visible={isloading}
        contentContainerStyle={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LottieView
          ref={ref}
          style={{ width: "50%" }}
          source={require("../assets/Animations/9619-loading-dots-in-gradient.json")}
          autoPlay
        />
      </Modal>
    </Portal>
  );
};

export default Loading;
