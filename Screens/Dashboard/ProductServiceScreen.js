import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  RefreshControl,
  Pressable,
  TextInput,
} from 'react-native';
import { Text } from 'react-native-paper';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { postRequest } from '../../Services/RequestServices';
import MyStyles from '../../Styles/MyStyles';

const ProductServiceScreen = ({ route, navigation }) => {
  const [productList, setProductList] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const { branchId, userToken ,search} = route.params;

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const response = await postRequest(
        'customervisit/get_product_service',
        { branch_id: branchId },
        userToken
      );
      if (response?.data) {
        setProductList(response.data);
        setOriginalList(response.data);
      }
    } catch (error) {
      console.error('Error fetching product service data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchText ) {
      setProductList(originalList);
      return;
    }

    const lowerSearch = searchText.toLowerCase() ;
    const filtered = originalList.filter(item =>
      item.customer_name?.toLowerCase().includes(lowerSearch) ||
      item.mobile?.includes(lowerSearch) ||
      item.vichle_number?.toLowerCase().includes(lowerSearch) ||
      item.staff_name?.toLowerCase().includes(lowerSearch) ||
      item.product_category?.toLowerCase().includes(lowerSearch) ||
      item.subcategory_name?.toLowerCase().includes(lowerSearch)
    );

    setProductList(filtered);
  }, [searchText]);

    const filteredData = React.useMemo(() => {
            
            if (!search || !productList?.length) {
              return productList || [];
            }
            
            const searchTerm = search.toLowerCase().trim();
            
            const result = productList.filter((item) => {
              if (!item) return false;
              
              // Check each field for the search term
              const fieldsToSearch = [
                { name: 'customer_name', value: item.customer_name },
                { name: 'mobile', value: item.mobile},
                { name: 'vichle_number', value: item.vichle_number},
                { name: 'staff_name', value: item.staff_name},
                { name: 'product_category', value: item.product_category},
                { name: 'subcategory_name', value: item.subcategory_name},
                
              ];
              
              const hasMatch = fieldsToSearch.some(({ name, value }) => {
                if (!value) return false;
                const strValue = String(value).toLowerCase();
                const match = strValue.includes(searchTerm);
                if (match) {
                  console.log(`Match found in ${name}:`, value);
                }
                return match;
              });
              
              return hasMatch;
            });
            
            return result;
          }, [productList, search]);


  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
      }
    >
      {/* Live Button */}
      <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', padding: 10 }}>
        <Pressable
          onPress={() => navigation.navigate('RecentActivity')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'orange',
            paddingHorizontal: 15,
            borderRadius: 8,
          }}
        >
          <Icon name="circle-medium" color="red" size={20} />
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Live</Text>
        </Pressable>
      </View>

      {/* Search Box */}
      <View style={{ paddingHorizontal: 10 }}>
        <TextInput
          placeholder="Search by name, number, vehicle, staff, category..."
          placeholderTextColor="#000"  // Add this line

          value={searchText}
          onChangeText={setSearchText}
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            padding: 8,
            color:'#000',
            marginBottom: 10,
            fontSize: 14,
          }}
        />
      </View>

      {filteredData.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          No records found.
        </Text>
      ) : (
        filteredData.map((item, index) => (
          <View
            key={index}
            style={{
              borderBottomWidth: 0.5,
              borderBottomColor: 'black',
              padding: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ margin: 6, flexDirection: 'row' }}>
                <View
                  style={{
                    borderWidth: 1,
                    borderRadius: 4,
                    borderColor: 'grey',
                    width: 25,
                    height: 25,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 5,
                  }}
                >
                  <Text style={{ color: 'red', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    {item.type?.charAt(0)}
                  </Text>
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 15 }}>
                    {item.customer_name}
                  </Text>
                  <Text style={{ color: '#888', fontSize: 13 }}>{item.mobile}</Text>
                  <Text style={{ color: '#555', fontSize: 13 }}>{item.vichle_number}</Text>
                </View>
              </View>

              <Image
                source={{ uri: `https://api.quicktagg.com/CustomerUploads/${item.image_path}` }}
                style={{ width: 50, height: 50, borderRadius: 5, marginRight: 10 }}
              />

              <View style={{ marginRight: 5, position: 'relative', height: '100%' }}>
                <Text style={{ fontSize: 12, color: '#888', marginBottom: 10, textAlign: 'right' }}>
                  {moment(item.datetime).format('HH:mm')}
                  {'\n'}
                  {moment(item.datetime).format('DD/MM/YYYY')}
                </Text>
              </View>
            </View>

            {(item.product_category || item.subcategory_name || item.color || item.staff_name) && (
              <Text style={{ fontSize: 14, color: 'gray', marginTop: 5 }}>
                {item.product_category && <Text style={{ fontWeight: '700' }}>({item.product_category}) </Text>}
                {item.subcategory_name && <Text style={{ fontWeight: '700' }}>({item.subcategory_name}) </Text>}
                {item.color && <Text style={{ fontWeight: '700' }}>({item.color}) </Text>}
                {item.staff_name && <Text style={{ fontWeight: '700' }}>({item.staff_name}) </Text>}
              </Text>
            )}

            {item.remarks && (
              <Text style={{ fontSize: 14, color: 'gray', marginTop: 5 }}>
                {item.remarks}
              </Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
};

export default ProductServiceScreen;
