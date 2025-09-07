import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Image,
  ScrollView,
  RefreshControl,
  Pressable,
  TextInput,
} from 'react-native';
import { Text, Portal, Modal ,TouchableRipple,IconButton} from 'react-native-paper';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { postRequest } from '../../Services/RequestServices';
import MyStyles from '../../Styles/MyStyles';
import DatePicker from '../../Components/DatePicker';
const ProductServiceScreen = ({ route, navigation }) => {
  const [productList, setProductList] = useState([]);
  const [originalList, setOriginalList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
const [param, setparam] = useState({
        from_date: moment().subtract(7, 'days').format('YYYY-MM-DD'),
        to_date: moment().format('YYYY-MM-DD'),
    });
    const [dateModal, setDateModal] = useState(false);
  const { branchId, userToken ,search} = route.params;

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const response = await postRequest(
        'customervisit/get_product_service',
        { 
          branch_id: branchId,
          from_date: param.from_date,
          to_date: param.to_date
        },
        userToken
      );
      console.log("✅ ProductService resp:", response);
      if (response?.data) {
        // Ensure we're working with an array
        const data = Array.isArray(response.data) ? response.data : [response.data];
        console.log('Processed data:', data);
        setProductList(data);
        setOriginalList(data);
      } else {
        console.warn('No data in response');
        setProductList([]);
        setOriginalList([]);
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

  // Combined search and filter function
  const filterProducts = useCallback(() => {
    console.log('Filtering products...');
    if (!originalList?.length) {
      console.log('No original list to filter');
      return [];
    }

    const lowerSearch = searchText?.toLowerCase() || '';
    const searchTerm = search?.toLowerCase().trim() || '';
    const fromDate = moment(param.from_date).startOf('day');
    const toDate = moment(param.to_date).endOf('day');

    console.log('Filtering with params:', {
      searchText,
      searchTerm,
      fromDate: fromDate.format(),
      toDate: toDate.format(),
      itemCount: originalList.length
    });

    const filtered = originalList.filter(item => {
      if (!item) return false;

      // Text search
      const searchFields = [
        item.customer_name,
        item.mobile,
        item.vichle_number,
        item.staff_name,
        item.product_category,
        item.subcategory_name
      ].map(field => String(field || '').toLowerCase());

      const textMatch = !searchText || 
        searchFields.some(field => field.includes(lowerSearch));
      
      const propsSearchMatch = !searchTerm || 
        searchFields.some(field => field.includes(searchTerm));

      // Date range filter - only apply if we have a date field
      let dateMatch = true;
      if (item.datetime) {
        try {
          const itemDate = moment(item.datetime);
          dateMatch = itemDate.isBetween(fromDate, toDate, null, '[]');
        } catch (e) {
          console.warn('Invalid date format:', item.datetime);
          dateMatch = false;
        }
      }

      return textMatch && dateMatch && propsSearchMatch;
    });

    console.log(`Filtered ${originalList.length} items to ${filtered.length} items`);
    return filtered;
  }, [originalList, searchText, search, param.from_date, param.to_date]);

  // Update filtered data when filters change
  useEffect(() => {
    console.log('Updating filtered data...');
    const filtered = filterProducts();
    console.log('Setting filtered data:', filtered.length, 'items');
    setProductList(filtered);
  }, [filterProducts]);

  // Memoized filtered data for rendering
  const filteredData = useMemo(() => {
    return productList;
  }, [productList]);


  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
      }
    >
      <Portal>
                <Modal
                    visible={dateModal}
                    contentContainerStyle={{
                        backgroundColor: '#FFF',
                        marginHorizontal: 20,
                        paddingHorizontal: 10,
                        borderRadius: 5,
                    }}
                    onDismiss={() => setDateModal(false)}
                >
                    <View style={MyStyles.datePickerModal}>
                        <Text>Select Duration</Text>
                        <View style={MyStyles.datePickerRow}>
                            <DatePicker
                                mode="text"
                                value={param.from_date}
                                onValueChange={(date) => {
                                    param.from_date = date;
                                    setparam({ ...param });
                                    fetchData();
                                }}
                            />
                            <Text style={MyStyles.dateLabel}>To</Text>
                            <DatePicker
                                mode="text"
                                value={param.to_date}
                                onValueChange={(date) => {
                                    param.to_date = date;
                                    setparam({ ...param });
                                    fetchData();
                                }}
                            />
                        </View>
                    </View>
                </Modal>
            </Portal>
      {/* Live Button */}
      <View style={MyStyles.row}>
      {/* Date Modal */}
         
            <TouchableRipple onPress={() => setDateModal(true)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <IconButton icon="calendar" />
                        <Text style={{ fontWeight: 'bold' }}>
                            {moment(param.from_date).format('DD/MM/YYYY')} -{' '}
                            {moment(param.to_date).format('DD/MM/YYYY')}
                        </Text>
                    </View>
                </TouchableRipple>
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
