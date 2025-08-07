import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  Alert,
  TouchableHighlight,
  TouchableWithoutFeedback,
  PermissionsAndroid,
} from "react-native";
import { Button, Portal, Subheading, Modal, IconButton } from "react-native-paper";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

const ImageUpload = ({ source, onUploadImage, onClearImage, label, disabled, imageStyle }) => {
  const [modal, setModal] = useState(false);
  const [viewImage, setViewImage] = useState(source);

  useEffect(() => {
    setViewImage(source);
  }, [source]);

  // Request Camera Permission (Android Only)
  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "We need access to your camera to take photos.",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const Upload = async () => {
    const options = {
      mediaType: "photo",
      quality: 0.8,
      includeBase64: false,
    };

    Alert.alert("Select Upload Option", "Choose an option to continue", [
      {
        text: "Camera",
        onPress: async () => {
          const hasPermission = await requestCameraPermission();
          if (!hasPermission) {
            Alert.alert("Permission Denied", "Camera access is required to take photos.");
            return;
          }

          launchCamera(options, (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
              Alert.alert("Error", response.errorMessage || "Something went wrong!");
              return;
            }
            onUploadImage(response.assets[0]);
          });
        },
      },
      {
        text: "Gallery",
        onPress: () => {
          launchImageLibrary(options, (response) => {
            if (response.didCancel) return;
            if (response.errorCode) {
              Alert.alert("Error", response.errorMessage || "Something went wrong!");
              return;
            }
            onUploadImage(response.assets[0]);
          });
        },
      },
    ]);
  };

  return (
    <View>
      {/* Image Preview Modal */}
      <Portal>
        <Modal
          visible={modal}
          dismissable
          transparent
          onDismiss={() => setModal(false)}
          contentContainerStyle={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
        >
          <TouchableWithoutFeedback onPress={() => setModal(false)}>
            <View style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center" }}>
              <IconButton
                icon="close"
                size={30}
                color="#fff"
                style={{ position: "absolute", top: 40, right: 20 }}
                onPress={() => setModal(false)}
              />
              {viewImage ? (
                <Image
                  source={{ uri: viewImage.uri }}
                  style={{ width: "90%", height: "80%", resizeMode: "contain" }}
                />
              ) : (
                <Subheading style={{ color: "#fff" }}>No Image Available</Subheading>
              )}
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </Portal>

      {/* Image Thumbnail */}
      <Subheading>{label}</Subheading>
      <TouchableHighlight style={{ width: "100%" }} onPress={() => setModal(true)} underlayColor="transparent">
        <Image
          source={viewImage ? { uri: viewImage.uri } : null}
          style={[
            {
              height: 100,
              width: "90%",
              borderRadius: 5,
              borderColor: "#555",
              borderWidth: 1,
              backgroundColor: "#ddd",
            },
            imageStyle,
          ]}
        />
      </TouchableHighlight>

      {/* Buttons (Grouped Together) */}
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
        <Button
          disabled={disabled}
          mode="contained"
          compact
          onPress={Upload}
          style={{
            backgroundColor: "#fff", 
            borderRadius: 5,
            borderWidth: 1,
            borderColor: "#ccc",
          }}
          labelStyle={{ color: "#000" }}
        >
          Browse
        </Button>

        <Button
          disabled={disabled}
          mode="contained"
          compact
          onPress={onClearImage}
          style={{
            backgroundColor: "red", 
            borderRadius: 5,
            marginLeft: 10,
          }}
          labelStyle={{ color: "#fff" }}
        >
          Clear
        </Button>
      </View>
    </View>
  );
};

export default ImageUpload;
