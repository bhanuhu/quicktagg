import React, { useState, useEffect } from "react";
import { Image, View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import { Button, IconButton, Text } from "react-native-paper";

const MultipleImages = ({ onSelect, data = [], maxImages = 5, userToken = '' }) => {
  const [selectedImages, setSelectedImages] = useState(data);

  // Update local state when parent data changes
  useEffect(() => {
    setSelectedImages(data);
  }, [data]);

  const handleImagePick = async () => {
    try {
      const remainingSlots = maxImages - selectedImages.length;
      if (remainingSlots <= 0) {
        alert(`You can only upload up to ${maxImages} images.`);
        return;
      }

      const images = await ImagePicker.openPicker({
        multiple: true,
        mediaType: "photo",
        compressImageQuality: 0.8,
        maxFiles: remainingSlots,
        cropping: true,
        cropperCircleOverlay: false,
        includeBase64: false,
      });

      const formattedImages = Array.isArray(images) 
        ? images.map((img, index) => ({
            uri: img.path,
            name: img.filename || `image_${Date.now()}_${index}.jpg`,
            type: img.mime,
          }))
        : [{
            uri: images.path,
            name: images.filename || `image_${Date.now()}.jpg`,
            type: images.mime,
          }];

      const updatedImages = [...selectedImages, ...formattedImages];
      setSelectedImages(updatedImages);
      onSelect(updatedImages);
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.log("Image Picker Error:", error);
        alert("Failed to select images. Please try again.");
      }
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
    onSelect(newImages);
  };

  const handleClearAll = () => {
    setSelectedImages([]);
    onSelect([]);
  };

  // Add debug logging for the component
  console.log('MultipleImages - Selected images:', selectedImages);

  // Function to create an authenticated image source
  const getImageSource = (uri) => {
    if (!uri) return null;
    
    // For local files or data URIs, return as is
    if (uri.startsWith('file://') || uri.startsWith('data:')) {
      return { uri };
    }
    
    // For remote images, include auth headers if needed
    const source = { uri };
    
    // Only add headers if userToken is provided
    if (userToken) {
      source.headers = {
        'auth-token': userToken
      };
      source.cache = 'force-cache'; // Enable caching to reduce requests
    }
    
    return source;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={selectedImages}
        renderItem={({ item, index }) => (
          <View style={styles.imageContainer} key={index}>
            {item.uri ? (
              <Image 
                source={getImageSource(item.uri)} 
                style={styles.image}
                onError={(e) => console.log('Image load error:', e.nativeEvent.error, 'URI:', item.uri)}
                onLoad={() => console.log('Image loaded successfully:', item.uri)}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.image, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#999' }}>Invalid Image</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => handleRemoveImage(index)}
            >
              <Text style={styles.removeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <View style={styles.placeholderContainer}>
            <IconButton 
              icon="image" 
              size={40} 
              color="#999" 
              style={styles.placeholderIcon} 
              onPress={handleImagePick}
            />
            <Text style={styles.placeholderText}>Tap to add images</Text>
          </View>
        }
        contentContainerStyle={styles.imageList}
      />

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          icon="camera"
          onPress={handleImagePick}
          style={[styles.button, styles.chooseButton]}
          labelStyle={styles.chooseButtonText}
          disabled={selectedImages.length >= maxImages}
        >
          {selectedImages.length > 0 ? 'Add More' : 'Choose Files'}
        </Button>
        {selectedImages.length > 0 && (
          <Button
            mode="contained"
            onPress={handleClearAll}
            style={[styles.button, styles.clearButton]}
            labelStyle={styles.clearButtonText}
          >
            Clear All
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  imageContainer: {
    margin: 5,
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
  },
  imageList: {
    justifyContent: 'center',
  },
  removeButton: {
    position: 'absolute',
    right: 5,
    top: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    lineHeight: 16,
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  placeholderIcon: {
    margin: 0,
  },
  placeholderText: {
    color: '#999',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  button: {
    flex: 1,
    borderRadius: 5,
    marginHorizontal: 2,
  },
  chooseButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  chooseButtonText: {
    color: '#000',
  },
  clearButton: {
    backgroundColor: 'red',
  },
  clearButtonText: {
    color: '#fff',
  },
});

export default MultipleImages;
