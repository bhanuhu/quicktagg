import React, { useState } from "react";
import { Image, View, StyleSheet } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import { Button, IconButton, Modal, Portal, Text } from "react-native-paper";
import { FlatList } from "react-native-gesture-handler";

const MultipleImages = ({ onSelect, data = [], onClearImage }) => {
  const [modal, setModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const handleImagePick = async () => {
    try {
      const images = await ImagePicker.openPicker({
        multiple: true,
        mediaType: "photo",
        compressImageQuality: 0.8,
      });

      const formattedImages = images.map((img) => ({
        uri: img.path,
        name: img.filename || `image_${Date.now()}.jpg`,
        type: img.mime,
      }));

      setSelectedImages(formattedImages);
      onSelect(formattedImages);
      setModal(false);
    } catch (error) {
      console.log("Image Picker Error:", error);
      setModal(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={styles.image} />
        )}
        horizontal
        keyExtractor={(item, index) => index.toString()}
      />

      {/* Joined Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="camera"
          onPress={handleImagePick}
          style={[styles.button, styles.chooseButton]}
          labelStyle={styles.chooseButtonText}
        >
          Choose Files
        </Button>
        <Button
          mode="contained"
          onPress={onClearImage}
          style={[styles.button, styles.clearButton]}
          labelStyle={styles.clearButtonText}
        >
          Clear
        </Button>
      </View>

      <Portal>
        <Modal visible={modal} dismissable={false} contentContainerStyle={styles.modal}>
          <View style={styles.modalHeader}>
            <IconButton icon="chevron-left" size={30} color="black" onPress={() => setModal(false)} />
            <Text style={styles.modalTitle}>Selected {selectedImages.length} files</Text>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  image: {
    height: 100,
    width: 100,
    marginRight: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  button: {
    flex: 1,
    borderRadius: 0,
    paddingVertical: 5,
  },
  chooseButton: {
    backgroundColor: "#fff", // White background
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc", // Light border to separate
  },
  chooseButtonText: {
    fontSize: 14,
    color: "black", // Black text for Choose Files
  },
  clearButton: {
    backgroundColor: "red", // Red background
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  clearButtonText: {
    fontSize: 14,
    color: "#fff", // White text for Clear
  },
  modal: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalTitle: {
    flexGrow: 1,
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default MultipleImages;
