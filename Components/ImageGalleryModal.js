import React, { useState } from 'react';
import {
    View,
    FlatList,
    Image,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const ImageGalleryModal = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const openModal = (imageUri) => {
        setSelectedImage(imageUri);
        setModalVisible(true);
    };

    const closeModal = () => {
        setSelectedImage(null);
        setModalVisible(false);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={images}
                numColumns={3}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => openModal(item)}>
                        <Image source={{ uri: item }} style={styles.thumbnail} />
                    </TouchableOpacity>
                )}
            />

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <TouchableOpacity style={styles.modalContainer} onPress={closeModal}>
                    <Image source={{ uri: selectedImage }} style={styles.fullImage} />
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    thumbnail: {
        width: width / 3 - 15,
        height: width / 3 - 15,
        margin: 5,
        borderRadius: 6,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '90%',
        height: '70%',
        borderRadius: 10,
        resizeMode: 'contain',
    },
});

export default ImageGalleryModal;
