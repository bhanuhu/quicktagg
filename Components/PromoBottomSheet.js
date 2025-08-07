import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';

const PromoBottomSheet = ({ sheetRef }) => {
    return (
        <RBSheet
            ref={sheetRef}
            height={500}
            openDuration={250}
            closeOnDragDown={true}
            customStyles={{
                container: {
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    padding: 16,
                },
                draggableIcon: {
                    backgroundColor: "#ccc"
                }
            }}
        >
            <TouchableOpacity style={styles.closeButton} onPress={() => sheetRef.current.close()}>
                <Icon name="close" size={22} color="#333" />
            </TouchableOpacity>

            <LinearGradient colors={['#dff1f9', '#f6f9f6']} style={styles.header}>
                <Text style={styles.badgeText}>Akshaya Tritiya Offer!</Text>
                <Text style={styles.title}>Get Free 0.5g Gold Coin (22KT)</Text>
                <Text style={styles.subtitle}>on every purchase of ₹30,000</Text>
                {/* <Image
                    source={require('./assets/gold-coin.png')}
                    style={styles.coin}
                /> */}
            </LinearGradient>

            <Text style={styles.sectionTitle}>What you will get?</Text>

            <View style={styles.offerList}>
                <Text style={styles.offerItem}>
                    1 Free 10g Silver Coin{'\n'}
                    <Text style={styles.offerNote}>On purchases of ₹15,000 – ₹30,000</Text>
                </Text>

                <Text style={styles.offerItem}>
                    1 Free 0.5g Gold Coin (22KT){'\n'}
                    <Text style={styles.offerNote}>On purchases of ₹30,000 – ₹60,000</Text>
                </Text>

                <Text style={styles.offerItem}>
                    2 Free 0.5g Gold Coins (22KT){'\n'}
                    <Text style={styles.offerNote}>On purchases of ₹60,000 – ₹90,000</Text>
                </Text>
            </View>

            <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                    • For every additional ₹30,000 spent, you'll receive an extra 0.5g gold coin{'\n'}
                    • Only Studded + Presets are eligible for the free coin offer{'\n'}
                    • Gold/Silver Coin with every purchase. For online orders, the coin will be dispatched after the 15-day return period.
                </Text>
            </View>
        </RBSheet>
    );
};

export default PromoBottomSheet;

const styles = StyleSheet.create({
    closeButton: {
        position: 'absolute',
        top: 8,
        alignSelf: 'center',
        zIndex: 10,
    },
    header: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 30,
    },
    badgeText: {
        backgroundColor: '#008080',
        color: '#fff',
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 8,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#222',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 13,
        color: '#555',
        textAlign: 'center',
        marginTop: 4,
    },
    coin: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginVertical: 12,
        color: '#222',
    },
    offerList: {
        marginBottom: 10,
    },
    offerItem: {
        fontSize: 13,
        color: '#333',
        marginBottom: 10,
    },
    offerNote: {
        fontSize: 12,
        color: '#777',
    },
    noteBox: {
        backgroundColor: '#f4f4f4',
        borderRadius: 8,
        padding: 10,
    },
    noteText: {
        fontSize: 11,
        color: '#555',
        lineHeight: 16,
    },
});
