import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  Image,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import { IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ZoomImageDetailScreen = ({ route }) => {
  const { imageUri, details = {} } = route.params;
  const [active, setActive] = useState(false);

  const handleShare = async () => {
    try {
      await Share.share({ message: imageUri });
    } catch (error) {
      console.error('Error sharing:', error.message);
    }
  };

  const getStatusColor = (status) => {
  const normalized = (status || '').trim().toLowerCase();

  switch (normalized) {
    case 'done':
      return 'green';
    case 'overdue':
      return 'gray';
    case 'reject':
      return 'red';
    case 'pending':
    case 'pending...':
      return '#fbb534'; 
    case 'due':
      return 'purple';
    default:
      return '#000'; 
  }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView>

        {/* Title */}
        {(details.category || details.subCategory || details.status) && (
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <View>
                {details.category && (
                  <Text style={styles.title}>{details.category}</Text>
                )}
                {details.subCategory && (
                  <Text style={styles.subtitle}>{details.subCategory}</Text>
                )}
              </View>
              {details.status && (
                <View style={styles.headerRight}>
                  <Text style={{ marginLeft: 5, color: 'black', fontWeight: 'bold' }}>Status :</Text>
                  <Text style={[styles.statusText, { color: getStatusColor(details.status) }]}>
                    {details.status}
                  </Text>

                </View>
              )}
            </View>
          </View>
        )}

        {/* Image & Share */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <IconButton
            icon="share-variant"
            size={24}
            color="white"
            onPress={handleShare}
            style={styles.shareButton}
          />
        </View>

        {/* Type and Staff */}
        {(details.type || details.staff) && (
          <View style={styles.rowContainer}>
            {details.type && (
              <Text style={styles.rowLabel}>
                Type: <Text style={styles.rowValue}>{details.type}</Text>
              </Text>
            )}
            {details.staff && (
              <Text style={styles.rowLabel}>
                Staff Name: <Text style={styles.rowValue}>{details.staff}</Text>
              </Text>
            )}
          </View>
        )}

        {/* Additional Info Card */}
        <View style={styles.cardContainer}>
          {details.vehicle_number && (
            <Text style={styles.cardText}>
              Vehicle Number: <Text style={styles.cardValue}>{details.vehicle_number}</Text>
            </Text>
          )}
          {details.color && (
            <Text style={styles.cardText}>
              Color: <Text style={styles.cardValue}>{details.color}</Text>
            </Text>
          )}
          {details.payment && (
            <Text style={styles.cardText}>
              Payment: <Text style={styles.cardValue}>{details.payment}</Text>
            </Text>
          )}
          {details.kms && (
            <Text style={styles.cardText}>
              KMs: <Text style={styles.cardValue}>{details.kms}</Text>
            </Text>
          )}
          {details.last_service_date && (
            <Text style={styles.cardText}>
              Last Service Date: <Text style={styles.cardValue}>{details.last_service_date}</Text>
            </Text>
          )}
          {details.next_service && (
            <Text style={styles.cardText}>
              Next Service: <Text style={styles.cardValue}>{details.next_service}</Text>
            </Text>
          )}
        </View>
        {details.remark && (
          <Text style={styles.remarkText}>
            Remark: <Text style={styles.cardValue}>{details.remark}</Text>
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 5,
    color: 'green',
    fontWeight: 'bold',
  },
  titleContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    marginTop: 2,
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
    position: 'relative',
  },
  image: {
    width: '90%',
    height: 200,
    resizeMode: 'contain',
    borderRadius: 8,
  },
  shareButton: {
    position: 'absolute',
    right: 20,
    top: 10,
    backgroundColor: '#fbb534',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  remarkText: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
  },
  rowLabel: {
    fontSize: 15,
    color: '#000',
  },
  rowValue: {
    fontWeight: 'bold',
    color: '#000',
  },
  // Card Style for Additional Fields
  cardContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  cardValue: {
    fontWeight: 'bold',
    color: '#000',
  },
});

export default ZoomImageDetailScreen;
