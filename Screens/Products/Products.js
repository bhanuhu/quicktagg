import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  ScrollView,
  View,
  Alert,
  FlatList,
  Image,
  Dimensions,
  StyleSheet
} from "react-native";
import {
  Button,
  Text,
  FAB,
  TextInput,
  Checkbox,
  Card,
  IconButton,
} from "react-native-paper";
import Swiper from "react-native-swiper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MyStyles from "../../Styles/MyStyles";
import DropDown from "../../Components/DropDown";
import MultipleImages from "../../Components/MultipleImages";
import { postRequest } from "../../Services/RequestServices";
import { Picker } from '@react-native-picker/picker';
import BadgeRibbon from "../../Components/BadgeRibbon";
import { serviceUrl } from "../../Services/Constants";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import Loading from "../../Components/Loading";
import { CapitalizeName } from "../../utils/CapitalizeName";
import { launchCamera } from 'react-native-image-picker';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';
import { AlignCenter } from "lucide-react-native";

const styles = StyleSheet.create({
  // Inventory Table Styles
  sectionContainer: {
    margin: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  dropdownContainer: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
      color: 'black',
    textColor: 'black'
  },
  dropdownLabel: {
    fontSize: 16,
    marginRight: 10,
    color: 'black',
    textColor: 'black'
  },
  dropdown: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    minHeight: 20,
    color:'black',
    textColor: 'black',
    labelColor:'black',
  },
  picker: {
    height: 53,
    width: '100%',
    color:'black',
  },
  inventoryScrollView: {
    maxHeight: 300,
  },
  inventoryTable: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    overflow: 'hidden',
    minWidth: '100%',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  evenRow: {
    backgroundColor: '#f9f9f9',
  },
  oddRow: {
    backgroundColor: '#fff',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 12,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
    minWidth: 80,
    maxWidth: 100,
  },
  tableCell: {
    flex: 1,
    padding: 6,
    textAlign: 'center',
    color: '#555',
    minWidth: 80,
    maxWidth: 100,
  },
  sizeCell: {
    fontWeight: '500',
    backgroundColor: '#f5f5f5',
  },
  outOfStock: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  totalRow: {
    backgroundColor: '#e8f5e9',
    borderTopWidth: 2,
    borderTopColor: '#a5d6a7',
  },
  totalCell: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  
  // Existing styles
  imageContainer: {
    height: 110,
  },
  productImage: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    height: 100,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#f5f5f5',
    marginTop: 8,
  },
  productImage1: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    height: 150,
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#f5f5f5',
    marginTop: 8,
  },
  // Header styles
  headerContainer: {
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 16,
    color: 'red',
    textDecorationLine: 'line-through',
  },
  // Toggle Container
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 5,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleButton: {
    flex: 1,
    marginHorizontal: 2,
    borderRadius: 6,
  },
  // Table styles
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    // padding: 10,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tableContainer: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableLabel: {
    flex: 1,
    color: '#666',
    fontSize: 15,
  },
  tableValue: {
    flex: 2,
    color: '#333',
    fontSize: 15,
    fontWeight: '500',
  },
  badgeContainer: {
    position: 'absolute',
    height: '20%',
    width: '100%',
    top: 0,
    left: 0,
  },
  detailsContainer: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  productName: {
    color: '#000', // Changed to black for better visibility
    fontSize: 14, // Slightly larger font
    fontWeight: 'bold',
    // marginBottom: 4,
    width: '100%',
    // padding: 2,
  },
  productCode: {
    color: '#666',
    fontSize: 11,
    // padding: 2,
  },
});

const ProductsList = (props) => {

  const { userToken, search } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [griddata, setgriddata] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Camera scan handler for barcode scanning
  const handleCameraScan = () => {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 1,
        includeBase64: false,
      },
      async response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
          return;
        }

        const uri = response.assets[0].uri;
        console.log('Camera image URI:', uri);

        try {
          console.log('Scanning URI:', uri);
          const barcodes = await BarcodeScanning.scan(uri);
          console.log('Barcodes found:', barcodes.length);

          if (barcodes.length > 0) {
            const barcode = barcodes[0];
            console.log('Barcode object:', JSON.stringify(barcode));
            
            const scannedValue = barcode.rawValue || barcode.value || barcode.displayValue || barcode.text;
            console.log('Scanned value:', scannedValue);
            
            if (scannedValue) {
              // Navigate to ProductsPreview with the scanned product code
              props.navigation.navigate('ProductsPreview', { 
                scannedProductCode: scannedValue,
                userToken: userToken,
                price: null,
                productData: null,
                showInventory: true
              });
            } else {
              Alert.alert('Error', 'Could not read barcode value. Please try again.');
            }
          } else {
            Alert.alert('No Barcode', 'No barcode found in image. Please try again with a clearer image.');
          }
        } catch (e) {
          console.error('Barcode scan error:', e);
          Alert.alert('Error', `Failed to scan barcode: ${e.message || 'Unknown error'}`);
        }
      },
    );
  };

  React.useEffect(() => {
    // console.log(search);
    fetchProducts();
  }, [search]);

  const fetchProducts = () => {
    setLoading(true);
    postRequest(
      "masters/product/browse_app",
      { search: search == undefined ? "" : search },
      userToken
    ).then((resp) => {
      if (resp.status == 200) {
        setgriddata(resp.data);
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
    setLoading(false);
  }

  const ProductItem = React.memo(({ item, index, navigation, userToken }) => {
    const firstItem = item;
    const [image, setImage] = React.useState(() => getImageSource(item));
    const [imageError, setImageError] = React.useState(false);

    function getImageSource(productItem) {
      // Handle isImageUrl flag from web-browse API
      if (productItem.isImageUrl && productItem.image_path) {
        return { uri: productItem.image_path.trim() };
      }
      if (productItem.image_url) {
        return { uri: productItem.image_url };
      }
      if (productItem.image_path && (productItem.image_path.startsWith('http') || productItem.image_path.startsWith('file'))) {
        return { uri: productItem.image_path.trim() };
      }
      if (productItem.url_image && productItem.image_path) {
        const baseUrl = productItem.url_image.endsWith('/') ? productItem.url_image : `${productItem.url_image}/`;
        const imagePath = productItem.image_path.startsWith('/') ? productItem.image_path.substring(1) : productItem.image_path;
        return { uri: `${baseUrl}${imagePath}` };
      }
      if (productItem.images?.[0]?.image_path) {
        return { uri: productItem.images[0].image_path };
      }
      return require('../../assets/thumbnail.png');
    }

    const handleImageError = (error) => {
      console.log('Image load error:', { error, itemId: item.product_id });
      setImageError(true);
      setImage(require('../../assets/thumbnail.png'));
    };

    const itemStyle = {
      width: (Dimensions.get('window').width - 32) / 3, // 3 items per row, accounting for margins
      borderRadius: 10,
      backgroundColor: 'white',
      margin: 4,
      elevation: 2,
      overflow: 'hidden',
      marginBottom: 10,
    };

    return (
      <Card
        style={itemStyle}
        onPress={() => navigation.navigate("ProductsPreview", {
          product_code: firstItem.product_code,
          userToken,
          branchId: firstItem.branch_id,
          productData: firstItem,
          price:firstItem.price

        })}
      >
        <View style={styles.imageContainer}>
          <Image
            source={imageError ? require('../../assets/thumbnail.png') : image}
            style={[
              styles.productImage,
              { opacity: imageError ? 0.3 : 1, backgroundColor: imageError ? '#ffffff' : '#f5f5f5' }
            ]}
            resizeMode={imageError ? 'center' : 'contain'}
            onError={handleImageError}
            defaultSource={require("../../assets/thumbnail.png")}
          />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
            {firstItem.exhibition && <BadgeRibbon text="E" position="left" color="red" />}
            {firstItem.trial && <BadgeRibbon text="T" position="right" color="#FFA500" />}
          </View>
        </View>
        <View style={styles.detailsContainer}>
          <View style={{ marginBottom: 0 }}>
            <Text 
              numberOfLines={1} 
              style={{ 
                fontSize: 12,
                fontWeight: 'bold',
                marginBottom: 0
              }}
            >
              {firstItem.product_name || 'No Name'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            
          

          <Text numberOfLines={0} style={{ color: "#666", fontSize: 11, textAlign: 'left', flexWrap: 'wrap' }}>
            {firstItem.product_code.length > 15 ? firstItem.product_code.slice(0, 10) + '...' : firstItem.product_code || 'N/A'}
          </Text>
          </View>
        </View>
      </Card>
    );
  });

  const renderItem = ({ item, index }) => (
    <ProductItem
      item={item}
      index={index}
      navigation={props.navigation}
      userToken={userToken}
    />
  );

  const onRefresh = () => {
    fetchProducts();
  }

  // useEffect(() => {
  //   if (griddata) {

  //   console.log("Grid Data: hii", griddata);
  //     const groupedData = griddata.reduce((acc, item) => {
  //       if (item.product_code) {
  //         const codeParts = item.product_code.split('/');
  //         if (codeParts.length > 1) {
  //           const groupKey = codeParts[1]; // Get the second part after splitting
  //           if (!acc[groupKey]) {
  //             acc[groupKey] = [];
  //           }
  //           acc[groupKey].push(item);
  //         }
  //       }
  //       return acc;
  //     }, {});
      
  //     console.log("Grouped Data:", groupedData);
  //   // If you want to convert it back to an array of groups
  //     const groupedArray = Object.entries(groupedData).map(([key, items]) => ({
  //       groupKey: key,
  //       items
  //     }));
      
  //     setFilteredData(groupedArray);
  //   }
  // }, [griddata]);
useEffect(() => {
  if (griddata) {
    console.log("Grid Data:", griddata);

    // Group all items by product_code prefix
    const groupedData = griddata.reduce((acc, item) => {
      if (item.product_code) {
        const codeParts = item.product_code.split('/');
        if (codeParts.length > 1) {
          const groupKey = codeParts[1]; // Get the second part after splitting
          if (!acc[groupKey]) {
            acc[groupKey] = [];
          }
          acc[groupKey].push(item);
        }
      }
      return acc;
    }, {});

    console.log("Grouped Data:", groupedData);
    
    // Flatten all items for proper 3-column grid layout
    const allItems = Object.values(groupedData).flat();

    setFilteredData(allItems);
  }
}, [griddata]);
  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={filteredData}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={renderItem}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        onRefresh={onRefresh}
        refreshing={loading}
        showsVerticalScrollIndicator={true}
        style={{ flex: 1 }}
      />
      <FAB
        style={{
          position: "absolute",
          bottom: '5%',
          backgroundColor: MyStyles.primaryColor.backgroundColor,
          left: 16,
        }}
        icon="camera"
        color="#000"
        onPress={handleCameraScan}
      />
      <FAB
        style={{
          position: "absolute",
          bottom: '5%',
          right: 16,
          backgroundColor: MyStyles.primaryColor.backgroundColor,
        }}
        icon="plus"
        color="#000"
        onPress={() =>
          props.navigation.navigate("ProductsForm", { product_id: null })
        }
      />
    </View>
  );
};

const ProductsPreview = (props) => {
  const { product_code, userToken,price,productData, scannedProductCode, showInventory: startWithInventory } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [param, setparam] = useState({
    brand_name:"",
    product_name:"",
    product_code:"",
    product_id: null,
  });
  const [productImages, setProductImages] = useState([]);
  const [shareOptions, setshareOptions] = useState({
    title: "",
    message: "",
    url: "",
    subject: "",
  });
  const [currentProduct, setCurrentProduct] = useState({});
  
  // View toggle state - start with inventory if param is passed
  const [showInventory, setShowInventory] = useState(startWithInventory || false);
  
  // Update showInventory when route param changes
  React.useEffect(() => {
    if (startWithInventory !== undefined) {
      setShowInventory(startWithInventory);
    }
  }, [startWithInventory]);
  
  // Inventory state
  const [selectedColor, setSelectedColor] = useState('');
  const [inventoryData, setInventoryData] = useState({
    colors: [],
    branches: [],
    sizes: [],
    quantities: {}
  });
  const [fullInventoryData, setFullInventoryData] = useState([]);

  // Helper function to render table rows
  const renderTableRow = (label, value) => {
    if (!value) return null;
    return (
      <View style={styles.tableRow}>
        <Text style={styles.tableLabel}>{label}</Text>
        <Text style={styles.tableValue}>{value}</Text>
      </View>
    );
  };

  // Process inventory data from API response
  const processInventoryData = (products) => {
    const colors = new Set();
    const branches = new Set();
    const sizes = new Set();
    const quantities = {};
    let firstColor = '';

    products.forEach(item => {
      // Extract unique colors
      if (item.color) {
        colors.add(item.color);
        if (!firstColor) firstColor = item.color;
      }
      
      // Extract unique branch names
      if (item.brand_name) branches.add(item.brand_name);
      
      // Extract unique sizes
      if (item.size_length) sizes.add(item.size_length);
      
      // Initialize color if not exists
      if (item.color && !quantities[item.color]) {
        quantities[item.color] = {};
      }
      
      // Initialize branch if not exists
      if (item.color && item.brand_name && !quantities[item.color][item.brand_name]) {
        quantities[item.color][item.brand_name] = {};
      }
      
      // Set quantity for size
      if (item.color && item.brand_name && item.size_length) {
        quantities[item.color][item.brand_name][item.size_length] = item.total_stock_qty || 0;
      }
    });

    setInventoryData({
      colors: Array.from(colors),
      branches: Array.from(branches),
      sizes: Array.from(sizes).sort((a, b) => {
        // Custom sorting for sizes: SMALL, MEDIUM, LARGE, etc.
        const sizeOrder = { 'SMALL': 1, 'MEDIUM': 2, 'LARGE': 3 };
        return (sizeOrder[a] || 4) - (sizeOrder[b] || 4) || a.localeCompare(b);
      }),
      quantities
    });

    // Set the first color as default if available
    if (firstColor) {
      setSelectedColor(firstColor);
    }
    console.log("inventory data after", inventoryData)
  };

  React.useEffect(() => {
    const effectiveProductCode = product_code || scannedProductCode;
    let data = { product_code: effectiveProductCode };
    postRequest("masters/product_details", data, userToken).then((resp) => {
      if(resp.status === 200){
         // Filter by exact productcode for display (image, name, etc.)
         const variantData = resp.data.filter(item => item.productcode === effectiveProductCode);
         console.log("Variant Data:", variantData);

         // Filter by product_code for inventory (all variants)
         const inventoryData = resp.data.filter(item => item.product_code === variantData[0]?.product_code);
         console.log("Inventory Data:", inventoryData);

         if (variantData.length > 0) {
           // Use product_id from passed productData (product list) since API response doesn't include it
           const productId = productData?.product_id || variantData[0].product_id || null;
          //  console.log("Setting product_id:", productId, "from productData:", productData?.product_id);
           
           setparam({
             brand_name: variantData[0].brand_name,
             product_name: variantData[0].product_name,
             productcode: variantData[0].productcode,
             product_id: productId,
             material: variantData[0].material,
             total_stock_qty: variantData[0].total_stock_qty,
             size_length: variantData[0].size_length,
             color: variantData[0].color,
             pattern: variantData[0].pattern,
             price: variantData[0].price,
             discounted_price: variantData[0].discounted_price,
             branch_balance_qty: variantData[0].branch_balance_qty,
             address: variantData[0].address,
             company_name: variantData[0].company_name,
             branch_id: variantData[0].branch_id,
           });

           // Process product images - get unique images from variant data
           const uniqueImages = [...new Map(variantData
             .filter(item => item.image_path)
             .map(item => {
               const trimmedPath = item.image_path.trim();
              //  console.log("Image path:", trimmedPath, "isImageUrl:", item.isImageUrl);
               // If it's a full URL, use it directly. Otherwise prepend base URL
               const fullUrl = trimmedPath.startsWith('http')
                 ? trimmedPath
                 : (item.url_image || 'https://api.quicktagg.com/Images/') + trimmedPath;
               return [trimmedPath, {
                 url: item.url_image || 'https://api.quicktagg.com/Images/',
                 image_path: trimmedPath,
                 fullUrl: fullUrl
               }];
             })
           ).values()];
          //  console.log("Unique images:", uniqueImages);
           setProductImages(uniqueImages);

           // Store full data for image updates
           console.log("Setting fullInventoryData:", inventoryData);
           setFullInventoryData(inventoryData);
           // Process inventory data with all variants
           processInventoryData(inventoryData);
         }
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
      setLoading(false);
    });

    // Cleanup when navigating back
    return () => {
      setProductImages([]);
      setparam({
        brand_name: "",
        product_name: "",
        product_code: "",
        product_id: null,
      });
      setInventoryData({
        colors: [],
        branches: [],
        sizes: [],
        quantities: {}
      });
      setFullInventoryData([]);
    };
  }, [product_code, scannedProductCode]);

  // Update images when selected color changes
  React.useEffect(() => {
    if (selectedColor && fullInventoryData.length > 0) {
      // Filter images by selected color
      const colorImages = fullInventoryData
        .filter(item => item.color === selectedColor && item.image_path)
        .map(item => {
          const trimmedPath = item.image_path.trim();
          const fullUrl = trimmedPath.startsWith('http')
            ? trimmedPath
            : (item.url_image || 'https://api.quicktagg.com/Images/') + trimmedPath;
          return {
            url: item.url_image || 'https://api.quicktagg.com/Images/',
            image_path: trimmedPath,
            fullUrl: fullUrl
          };
        });
      
      // Remove duplicates and update if we found images for this color
      const uniqueColorImages = [...new Map(colorImages.map(item => [item.image_path, item])).values()];
      if (uniqueColorImages.length > 0) {
        setProductImages(uniqueColorImages);
      }
    }
  }, [selectedColor, fullInventoryData]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, backgroundColor: '#fff' }}>
      <Loading isloading={loading} />
      <View style={styles.headerContainer}>
        <Text style={styles.productName}>
          {CapitalizeName(param.product_name)}
        </Text>
        <Text style={styles.productCode}>
          Product Code: {param.productcode}
        </Text>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={styles.priceContainer}>
          <Text style={styles.discountedPrice}>₹{productData?.discounted_price}/-</Text>
          {productData?.price > productData?.discounted_price && (
            <Text style={styles.originalPrice}>₹{productData?.price}/-</Text>
          )}
        </View>
          <View style={{ flexDirection: 'row' }}>
            <IconButton
              icon="pencil"
              size={16}
              color="#FFF"
              style={{
                margin: 5,
                backgroundColor: MyStyles.primaryColor.backgroundColor,
                zIndex: 1,
              }}
              onPress={() => {
                props.navigation.navigate("ProductsForm", {
                  product_id: param.product_id,
                  userToken: userToken,
                });
              }}
            />
            <IconButton
              icon="share-variant"
              size={16}
              color="#FFF"
              style={{
                margin: 5,
                backgroundColor: MyStyles.primaryColor.backgroundColor,
                zIndex: 1,
              }}
              onPress={async () => {
                try {
                  if (productImages.length === 0 || !productImages[0]?.fullUrl) {
                    Alert.alert('Error', 'No image available to share');
                    return;
                  }

                  const imageUrl = productImages[0].fullUrl;
                  const filename = imageUrl.split('/').pop() || 'product_image.jpg';
                  const localPath = `${RNFS.CachesDirectoryPath}/${filename}`;

                  // Download image
                  const downloadResult = await RNFS.downloadFile({
                    fromUrl: imageUrl,
                    toFile: localPath,
                  }).promise;

                  if (downloadResult.statusCode === 200) {
                    const shareOptions = {
                      title: param.product_name || 'Product',
                      message: `${param.product_name || 'Product'}\nCode: ${param.product_code}\nPrice: ₹${productData?.discounted_price || productData?.price}/-\nBrand: ${param.brand_name || 'N/A'}`,
                      url: `file://${localPath}`,
                      type: 'image/jpeg',
                    };
                    await Share.open(shareOptions);
                  } else {
                    Alert.alert('Error', 'Failed to download image');
                  }
                } catch (error) {
                  console.log('Share error:', error);
                  // Alert.alert('Error', 'Failed to share image');
                }
              }}
            />
          </View>
        </View>
      </View>

      {/* Product Images */}
      <View style={{ marginVertical: 0, height: 190 }}>
        <Swiper loop={false} activeDotColor="gray" style={{ height: '100%' }}>
          {productImages.length > 0 ? (
            productImages.map((resp, index) => (
              <View key={index}>
                <Image
                  source={{ uri: resp.fullUrl || resp.image_path }}
                  style={styles.productImage1}
                  resizeMode="contain"
                />
              </View>
            ))
          ) : (
            <Image
              source={require("../../assets/upload.png")}
              style={styles.productImage1}
              resizeMode="contain"
            />
          )}
        </Swiper>
      </View>

      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <Button
          mode={!showInventory ? "contained" : "outlined"}
          onPress={() => setShowInventory(false)}
          style={styles.toggleButton}
        >
          Details
        </Button>
        <Button
          mode={showInventory ? "contained" : "outlined"}
          onPress={() => setShowInventory(true)}
          style={styles.toggleButton}
        >
          Inventory
        </Button>
      </View>

      {!showInventory ? (
        <View style={styles.detailsContainer}>
          <View style={styles.tableContainer}>
            {renderTableRow('Brand Name', param?.brand_name? param?.brand_name  : null)}
            {renderTableRow('Availability', param.available && CapitalizeName(param.available))}
            {renderTableRow('Metal', param.Metal && CapitalizeName(param.Metal))}
            {renderTableRow('Material', param.material && CapitalizeName(param.material))}
            {renderTableRow('Disable', param.disable)}
            {renderTableRow('Exhibition', param.exhibition)}
            {renderTableRow('Businesses', param.businesses)}
            {renderTableRow('Trial', param.trial)}
            {renderTableRow('On Demand', param.on_demand)}
            {renderTableRow('Available', param.available)}
            {renderTableRow('Quantity', param.qty)}
            {renderTableRow('Weight', param.weight)}
            {renderTableRow('Size Length', param.size_length)}
            {renderTableRow('Gender', param.gender)}
            {renderTableRow('PCare', productData?.pcare)}
            {renderTableRow('Pattern', param?.pattern)}
            {renderTableRow('Package', productData?.package)}
            
            {param.remarks && (
              <View style={[styles.tableRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.tableLabel, { alignSelf: 'flex-start' }]}>Remarks</Text>
                <Text style={[styles.tableValue, { flex: 2 }]}>{param.remarks}</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.sectionContainer}>
          
          {/* Color Selection Dropdown */}
          {inventoryData.colors.length > 0 && (
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Select Color:</Text>
              <View style={styles.dropdown}>
                <Picker
                  selectedValue={selectedColor}
                  onValueChange={(itemValue) => setSelectedColor(itemValue)}
                  style={styles.picker}
                  dropdownIconColor="#000"
                >
                  {inventoryData.colors.map((color, index) => (
                    <Picker.Item key={index} label={color} value={color} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {selectedColor && inventoryData.sizes.length > 0 && inventoryData.branches.length > 0 && (
            <ScrollView 
              horizontal={true} 
              style={styles.inventoryScrollView}
              showsHorizontalScrollIndicator={true}
            >
              <View style={styles.inventoryTable}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableHeaderCell, styles.sizeCell]}>Size</Text>
                  {inventoryData.branches.map((branch, index) => (
                    <Text key={index} style={styles.tableHeaderCell}>{branch.length > 15 ? branch.slice(0, 15) + '...' : branch}</Text>
                  ))}
                </View>
                
                {/* Table Rows */}
                {inventoryData.sizes.map((size, sizeIndex) => (
                  <View key={sizeIndex} style={[
                    styles.tableRow,
                    sizeIndex % 2 === 0 ? styles.evenRow : styles.oddRow
                  ]}>
                    <Text style={[styles.tableCell, styles.sizeCell]}>{size}</Text>
                    {inventoryData.branches.map((branch, branchIndex) => (
                      <Text 
                        key={branchIndex} 
                        style={[
                          styles.tableCell,
                          (inventoryData.quantities[selectedColor]?.[branch]?.[size] || 0) <= 0 && styles.outOfStock
                        ]}
                      >
                        {inventoryData.quantities[selectedColor]?.[branch]?.[size] || 0}
                      </Text>
                    ))}
                  </View>
                ))}
              {selectedColor && inventoryData.branches.length > 0 && (
            <View style={[styles.tableRow, styles.totalRow]}>
              <Text style={[styles.tableCell, styles.totalCell]}>Total</Text>
              {inventoryData.branches.map((branch, index) => {
                const total = inventoryData.sizes.reduce((sum, size) => {
                  return sum + (inventoryData.quantities[selectedColor]?.[branch]?.[size] || 0);
                }, 0);
                return (
                  <Text key={index} style={[styles.tableCell, styles.totalCell]}>
                    {total}
                  </Text>
                );
              })}
            </View>
          )}
              </View>
            </ScrollView>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const ProductsForm = (props) => {
  const { product_id, userToken } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState(null);
  
  // Reset form when product_id is null (new product)
  useEffect(() => {
    if (product_id === null) {
      setparam({
        product_id: 0,
        product_name: "",
        branch_id: "",
        product_code: "",
        gender: "",
        category_id: "",
        sub_category_id: "",
        price: "",
        discounted_price: "",
        weight: "",
        size_length: "",
        material: "",
        available: false,
        remarks: "",
        on_demand: "In Stock",
        qty: "",
        Metal: "",
        trial: false,
        businesses: false,
        disable: false,
        exhibition: false,
        product_images: [],
        product_subcategory_list: [],
        subcategory_names: ""
      });
      setProductImages([]);
      setproductsuploads([]);
      setLoading(false);
      return;
    }
  }, [product_id]);

  // Load product data when component mounts or product_id changes
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);

        if (product_id) {
          // Fetch product details
          const resp = await postRequest("masters/product/preview", { product_id: product_id }, userToken);
          
          if (resp.status === 200 && resp.data && resp.data[0]) {
            const product = resp.data[0];
            setProductData(product);
            console.log('Fetched product data:', product);
            
            // Extract subcategories
            const subcategories = product.subcategorylist?.map(sub => sub.subcategory_id) || [];
            
            // Set form parameters - include ALL fields from API response
            setparam({
              product_id: product.product_id,
              product_name: product.product_name || '',
              product_code: product.product_code || '',
              branch_id: product.branch_id || '',
              gender: product.gender || '',
              price: product.price ? parseFloat(product.price) : 0,
              qty: product.qty ? parseInt(product.qty, 10) : 0,
              addedQty: product.addedQty || 0,
              discounted_price: product.discounted_price ? parseFloat(product.discounted_price) : 0,
              remarks: product.remarks || '',
              color: product.color || '',
              weight: product.weight ? parseFloat(product.weight) : 0,
              size_length: product.size_length || '',
              metal: product.metal || product.Metal || '',
              material: product.material || '',
              on_demand: product.on_demand || 'In Stock',
              category_id: product.category_id || '',
              sub_category_id: product.sub_category_id || '',
              subcategory_names: product.subcategory_names || '',
              product_subcategory_list: subcategories,
              image_url: Array.isArray(product.image_url) ? product.image_url : 
                        (product.image_url ? [product.image_url] : []),
              product_images: product.product_images || [],
              available: product.available || false,
              exhibition: product.exhibition || false,
              businesses: product.businesses || false,
              trial: product.trial || false,
              disable: product.disable || false,
              ptype: product.ptype || '',
              suitable: product.suitable || '',
              pcare: product.pcare || '',
              pattern: product.pattern || '',
              package: product.package || '',
              gst: String(product.gst || '0'),
              branch_type: product.branch_type || '',
              balance_qty: product.balance_qty || 0,
            });

            // Load subcategories for the product's category
            if (product.category_id) {
              SubcategoryList(product.category_id);
            }
          } else {
            throw new Error('Failed to load product data');
          }
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        Alert.alert(
          "Error",
          "Failed to load product data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [product_id, userToken]);
  
  // Handle product data and set images when productData changes
  useEffect(() => {
    if (productData) {
      console.log('Processing product data for images:', productData);
      
      let images = [];
      
      // Helper function to format image URL
      const formatImageUrl = (imageData) => {
        if (!imageData) return '';
        
        // If we have a full URL in the image path, use it directly
        if (imageData.image_path && (imageData.image_path.startsWith('http') || imageData.image_path.startsWith('file://'))) {
          return imageData.image_path;
        }
        
        // Construct URL from base URL and image path
        const baseUrl = imageData.url || 'https://api.quicktagg.com/Images/';
        const imagePath = imageData.image_path || '';
        
        // Remove any leading/trailing slashes for clean concatenation
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
        
        return `${cleanBase}${cleanPath}`;
      };
      
      // Check if we have images in the images array
      if (Array.isArray(productData?.images) && productData?.images.length > 0) {
        images = productData?.images
          .filter(img => img && (img.image_path || img.url)) // Filter out invalid images
          .map(img => {
            const imgUri = formatImageUrl(img);
            console.log('Formatted image URL:', { 
              original: img, 
              formatted: imgUri,
              name: img.image_name || (img.image_path ? img.image_path.split('/').pop() : `image_${Date.now()}.jpg`)
            });
            return {
              uri: imgUri,
              name: img.image_name || (img.image_path ? img.image_path.split('/').pop() : `image_${Date.now()}.jpg`),
              type: 'image/jpeg',
              image_path: img.image_path
            };
          });
      } 
      // Fallback to image_url if no images array is present
      else if (productData?.image_url) {
        const imageUrls = Array.isArray(productData?.image_url) 
          ? productData?.image_url 
          : [productData?.image_url];
          
        images = imageUrls
          .filter(url => url) // Filter out empty URLs
          .map((url, index) => {
            const imgObj = { 
              url: 'https://api.quicktagg.com/Images/', 
              image_path: url 
            };
            const imgUri = formatImageUrl(imgObj);
            return {
              uri: imgUri,
              name: url.split('/').pop() || `image_${Date.now()}_${index}.jpg`,
              type: 'image/jpeg',
              image_path: url
            };
          });
      }
      
      console.log('Processed images:', images);
      
      console.log('Setting product images:', images);
      setProductImages(images);
      
      // Update form params with image names
      if (images.length > 0) {
        setparam(prev => ({
          ...prev,
          product_images: images.map(img => img.name)
        }));
        setproductsuploads(images);
      }
    }
  }, [productData]);
  
  const [genderlist, setGenderlist] = useState([
    { label: "Men", value: "Men" },
    { label: "Women", value: "Women" },
    { label: "Unisex", value: "Unisex" },
    { label: "Kid", value: "Kid" }
  ]);
  const [categorylist, setcategorylist] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [subcategorylist, setsubcategorylist] = useState([]);
  const [productavailablelist, setproductavailablelist] = useState([
    { label: "In Stock", value: "In Stock" },
    { label: "Make To Order", value: "Make To Order" },
  ]);
  const [param, setparam] = useState({
    product_id: 0,
    product_name: "",
    branch_id: "",
    product_code: "",
    gender: "",
    category_id: "",
    sub_category_id: "",
    price: "",
    discounted_price: "",
    weight: "",
    size_length: "",
    material: "",
    available: false,
    remarks: "",
    on_demand: "",
    qty: "",
    Metal: "",
    trial: false,
    businesses: false,
    disable: false,
    exhibition: false,
    product_images: [],
    product_subcategory_list: [],
    subcategory_names: "",
  });
  const [productsuploads, setproductsuploads] = useState([]);

  React.useEffect(() => {
    postRequest("masters/product/subcategory/getCategory", {}, userToken).then(
      (resp) => {
        if (resp.status == 200) {
          setcategorylist(resp.data);
        } else {
          Alert.alert(
            "Error !",
            "Oops! \nSeems like we run into some Server Error"
          );
        }
        setLoading(false);
      }
    );


  }, []);

  React.useEffect(() => {
    if (product_id && productData) {
      console.log(`product dataaaa -> ${JSON.stringify(productData)}`);
      setLoading(true);
      
      // Set all product data to form state - include ALL fields
      setparam(prev => ({
        ...prev,
        product_id: product_id,
        product_code: productData?.product_code || "",
        product_name: productData?.product_name || "",
        branch_id: productData?.branch_id || "",
        remarks: productData?.remarks || "",
        price: productData?.price?.toString() || "",
        qty: productData?.qty?.toString() || "",
        addedQty: productData?.addedQty || 0,
        discounted_price: productData?.discounted_price?.toString() || "",
        color: productData?.color || "",
        weight: productData?.weight?.toString() || "",
        size_length: productData?.size_length || "",
        metal: productData?.metal || productData?.Metal || "",
        material: productData?.material || "",
        gender: productData?.gender || "",
        category_id: productData?.category_id || "",
        sub_category_id: productData?.sub_category_id || "",
        subcategory_names: productData?.subcategory_names || "",
        on_demand: productData?.available ? "In Stock" : "Make To Order",
        available: productData?.available || false,
        disable: productData?.disable || false,
        exhibition: productData?.exhibition || false,
        businesses: productData?.businesses || false,
        trial: productData?.trial || false,
        ptype: productData?.ptype || "",
        suitable: productData?.suitable || "",
        pcare: productData?.pcare || "",
        pattern: productData?.pattern || "",
        package: productData?.package || "",
        gst: String(productData?.gst || '0'),
        branch_type: productData?.branch_type || "",
        balance_qty: productData?.balance_qty || 0,
        product_images: productData?.product_images || 
                        (productData?.image_url ? [productData?.image_url] : [])
      }));

      // Set product images if available
      if (productData?.image_url || (productData?.product_images && productData?.product_images.length > 0)) {
        const imageUrl = productData?.image_url || productData?.product_images[0];
        // Format the existing image to match what MultipleImages expects
        const formattedImage = {
          uri: imageUrl,
          name: imageUrl.split('/').pop() || `product_${product_id}.jpg`,
          type: 'image/jpeg' // Default type
        };
        setProductImages([formattedImage]);
      }

      // Load subcategories for the product's category
      if (productData?.category_id) {
        SubcategoryList(productData?.category_id);
      }
      
      setLoading(false);
    } else if (product_id) {
      
      setLoading(false);
    }
  }, [product_id, productData]);


  const SubcategoryList = (category_id) => {
    if (!category_id) {
      console.log('No category_id provided, clearing subcategories');
      setsubcategorylist([]);
      setparam(prev => ({
        ...prev,
        sub_category_id: "",
        subcategory_names: ""
      }));
      return;
    }
    
    console.log('Fetching subcategories for category_id:', category_id);
    
    // Show loading state
    setLoading(true);
    
    postRequest(
      "masters/product/subcategory/getSubcategoryForm",
      { category_id: category_id },
      userToken
    )
    .then((resp) => {
      
      if (resp.status === 200 && resp.data) {
        // Ensure data is an array and has the expected structure
        const subcategories = Array.isArray(resp.data) 
          ? resp.data 
          : [resp.data];
          
        // console.log('Available subcategories:', subcategories);
        
        if (subcategories.length === 0) {
          console.log('No subcategories found for this category');
        }
        
        setsubcategorylist(subcategories);
        
        // Handle selected subcategories from productData
        if (product_id && productData?.subcategorylist?.length > 0) {
          // console.log('Product has subcategories:', productData?.subcategorylist);
          
          // Get the IDs of the selected subcategories
          const selectedSubcategoryIds = productData?.subcategorylist.map(
            sub => sub.subcategory_id
          );
          
          // Get the full subcategory objects that match the selected IDs
          const selectedSubcategories = subcategories.filter(
            subcat => selectedSubcategoryIds.includes(subcat.subcategory_id)
          );
          
          // console.log('Matching selected subcategories:', selectedSubcategories);
          
          // Update the form state with the selected subcategories
          setparam(prev => ({
            ...prev,
            sub_category_id: selectedSubcategoryIds[0] || "", // For backward compatibility
            subcategory_names: selectedSubcategories.map(s => s.subcategory_name).join(', '),
            product_subcategory_list: selectedSubcategories
          }));
        }
      } else {
        console.warn('Unexpected API response format:', resp);
        Alert.alert(
          "Error",
          "Unexpected response format from server. Please try again."
        );
      }
    })
    .catch(error => {
      console.error("Error loading subcategories:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to load subcategories. Please try again."
      );
    })
    .finally(() => {
      setLoading(false);
    });
  };
  return (
    <ImageBackground
      style={MyStyles.container}
      source={require("../../assets/login-bg.jpg")}
    >
      <Loading isloading={loading} />
      <ScrollView>
        <View style={MyStyles.cover}>
          <TextInput
            mode="outlined"
            placeholder="Product Name"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.product_name}
            onChangeText={(text) => {
              setparam({ ...param, product_name: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Product Code"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.product_code}
            onChangeText={(text) => {
              setparam({ ...param, product_code: text });
            }}
          />
          <DropDown
            data={genderlist}
            ext_val="value"
            ext_lbl="label"
            value={param.gender}
            onChange={(val) => {
              setparam({ ...param, gender: val });
            }}
            placeholder="Shop For"
          />
          <DropDown
            data={categorylist}
            ext_val="category_id"
            ext_lbl="category_name"
            value={param.category_id}
            onChange={(val) => {
              console.log('Category changed to:', val);
              setparam(prev => ({
                ...prev, 
                category_id: val,
                sub_category_id: "", // Reset subcategory when category changes
                subcategory_names: ""
              }));
              
              // Find the selected category for better debugging
              const selectedCategory = categorylist.find(cat => cat.category_id === val);
              // console.log('Selected category:', selectedCategory);
              
              // Call SubcategoryList with the new category ID
              if (val) {
                console.log('Loading subcategories...');
                SubcategoryList(val);
              } else {
                console.log('No category selected, clearing subcategories');
                setsubcategorylist([]);
              }
            }}
            placeholder="Product Category"
          />
          <DropDown
            data={subcategorylist}
            ext_val="subcategory_id"
            ext_lbl="subcategory_name"
            value={param.sub_category_id}
            onChange={(val) => {
              const selectedSubcategory = subcategorylist.find(
                subcat => subcat.subcategory_id === val
              );
              setparam(prev => ({
                ...prev,
                sub_category_id: val,
                subcategory_names: selectedSubcategory?.subcategory_name || ''
              }));
            }}
            placeholder={subcategorylist.length > 0 ? "Select Subcategory" : "No subcategories available"}
            disabled={!param.category_id || subcategorylist.length === 0}
          />
          <TextInput
            mode="outlined"
            placeholder="Price"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5, marginTop: 10 }}
            value={param.price}
            onChangeText={(text) => {
              setparam({ ...param, price: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Discounted Price"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.discounted_price}
            onChangeText={(text) => {
              setparam({ ...param, discounted_price: text });
            }}
            keyboardType="numeric"
          />
          <TextInput
            mode="outlined"
            placeholder="Quantity"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.qty}
            onChangeText={(text) => {
              // Only allow numeric input
              const numericValue = text.replace(/[^0-9]/g, '');
              setparam({ ...param, qty: numericValue });
            }}
            keyboardType="numeric"
          />
          <TextInput
            mode="outlined"
            placeholder="Weight"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.weight}
            onChangeText={(text) => {
              setparam({ ...param, weight: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Size/Length"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.size_length}
            onChangeText={(text) => {
              setparam({ ...param, size_length: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Metal"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.Metal}
            onChangeText={(text) => {
              setparam({ ...param, Metal: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Material"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.material}
            onChangeText={(text) => {
              setparam({ ...param, material: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Color"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.color}
            onChangeText={(text) => {
              setparam({ ...param, color: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Product Type"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.ptype}
            onChangeText={(text) => {
              setparam({ ...param, ptype: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Suitable For"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.suitable}
            onChangeText={(text) => {
              setparam({ ...param, suitable: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Product Care"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.pcare}
            onChangeText={(text) => {
              setparam({ ...param, pcare: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Pattern"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.pattern}
            onChangeText={(text) => {
              setparam({ ...param, pattern: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="Package"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.package}
            onChangeText={(text) => {
              setparam({ ...param, package: text });
            }}
          />
          <TextInput
            mode="outlined"
            placeholder="GST %"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginBottom: 5 }}
            value={param.gst}
            onChangeText={(text) => {
              setparam({ ...param, gst: text });
            }}
            keyboardType="numeric"
          />
          <DropDown
            data={productavailablelist}
            ext_val="value"
            ext_lbl="label"
            value={param.on_demand}
            onChange={(val) => {
              setparam({
                ...param,
                on_demand: val,
                available: val === "In Stock"
              });
            }}
            placeholder="Product Availability"
          />
          <TextInput
            mode="outlined"
            placeholder="Remarks"
            style={{ backgroundColor: "rgba(0,0,0,0)", marginTop: 10 }}
            value={param.remarks}
            onChangeText={(text) => {
              setparam({ ...param, remarks: text });
            }}
          />
          <Checkbox.Item
            label="Exhibition"
            labelStyle={{ color: "#000" }}
            status={param.exhibition ? "checked" : "unchecked"}
            onPress={(e) => {
              setparam({ ...param, exhibition: !param.exhibition });
            }}
          />
          <Checkbox.Item
            label="Business"
            labelStyle={{ color: "#000" }}
            status={param.businesses ? "checked" : "unchecked"}
            onPress={(e) => {
              setparam({ ...param, businesses: !param.businesses });
            }}
          />
          <Checkbox.Item
            label="Trial at Home"
            labelStyle={{ color: "#000" }}
            status={param.trial ? "checked" : "unchecked"}
            onPress={(e) => {
              setparam({ ...param, trial: !param.trial });
            }}
          />
          <Checkbox.Item
            label="Disable"
            labelStyle={{ color: "#000" }}
            status={param.disable ? "checked" : "unchecked"}
            onPress={(e) => {
              setparam({ ...param, disable: !param.disable });
            }}
          />

          <MultipleImages
            data={productImages}
            userToken={userToken}
            onSelect={(fileArray) => {
              let imagesname = [];
              const imagesdata = [];
              
              fileArray.forEach((resp) => {
                if (resp.uri) {
                  imagesname.push(resp.name || `image_${Date.now()}.jpg`);
                  imagesdata.push({
                    image_path: resp.uri,
                    image_name: resp.name || `image_${Date.now()}.jpg`,
                    type: resp.type || 'image/jpeg'
                  });
                }
              });
              
              // Update both the form state and local images state
              setProductImages(fileArray);
              setparam(prev => ({
                ...prev,
                product_images: imagesname
              }));
              setproductsuploads(imagesdata);
              
              // console.log('Selected images:', {
              //   fileArray,
              //   imagesname,
              //   imagesdata
              // });
            }}
          />

          <Button
            mode="contained"
            label="Submit"
            uppercase={false}
            style={{ borderRadius: 5 }}
            labelStyle={{ color: "black" }}
            onPress={async () => {
              try {
                setLoading(true);
                
                // Prepare the data to send - match expected API payload
                // Convert product_subcategory_list to array of IDs if it's an array of objects
                const subcategoryList = Array.isArray(param.product_subcategory_list) 
                  ? param.product_subcategory_list.map(item => typeof item === 'object' ? item.subcategory_id : item)
                  : [];
                
                const formData = {
                  product_id: param.product_id,
                  product_code: param.product_code || '',
                  product_name: param.product_name || '',
                  branch_id: param.branch_id || '',
                  gender: param.gender || '',
                  price: param.price && !isNaN(parseFloat(param.price)) ? parseFloat(param.price) : 0,
                  qty: param.qty && !isNaN(parseInt(param.qty, 10)) ? parseInt(param.qty, 10) : 0,
                  addedQty: 0,
                  discounted_price: param.discounted_price && !isNaN(parseFloat(param.discounted_price)) ? parseFloat(param.discounted_price) : 0,
                  remarks: param.remarks || '',
                  color: param.color || '',
                  weight: param.weight && !isNaN(parseFloat(param.weight)) ? parseFloat(param.weight) : 0,
                  size_length: param.size_length || '', // String like "Large"
                  metal: param.Metal || param.metal || '', // lowercase
                  material: param.material || '',
                  on_demand: param.on_demand || null,
                  category_id: param.category_id || '',
                  sub_category_id: param.sub_category_id || '',
                  available: param.available || false,
                  exhibition: param.exhibition || false,
                  businesses: param.businesses || false,
                  disable: param.disable || false,
                  trial: param.trial || false,
                  ptype: param.ptype || '',
                  suitable: param.suitable || '',
                  pcare: param.pcare || '',
                  pattern: param.pattern || '',
                  package: param.package || '',
                  gst: String(param.gst || '0'), // String
                  // If no new uploads, use original product_images (full URLs from API)
                  // If new uploads exist, use the original product_images (server handles new uploads separately)
                  product_images: param.product_images && param.product_images.length > 0 
                    ? param.product_images 
                    : [],
                  product_subcategory_list: subcategoryList, // Array of IDs
                  branch_type: param.branch_type || '',
                  balance_qty: param.balance_qty || 0,
                };
                
                const resp = await postRequest("masters/product/insert", formData, userToken);
                if (resp.status === 200) {
                  if (resp.data[0].valid) {
                    if (productsuploads.length > 0) {
                      const form_data = new FormData();
                      // console.log("resp.data[0].id", resp.data);
                      // attach product_id from insert response
                      form_data.append("product_id", param.product_id);
            
                      // Prepare image URLs array
                      const imageUrls = [];
                      
                      // Add existing images to the form data
                      productsuploads.forEach((item, index) => {
                        // For new uploads, add to form data
                        if (item.image_path && item.image_path.startsWith('file:')) {
                          form_data.append("files", {
                            uri: item.image_path,
                            type: item.type || "image/jpeg",
                            name: item.image_name || `image_${Date.now()}_${index}.jpg`,
                          });
                        } else if (item.image_path) {
                          // For existing images, just add to the URLs array
                          imageUrls.push(item.image_path);
                        }
                      });
                      
                      // Include existing image URLs in the form data
                      if (imageUrls.length > 0) {
                        form_data.append("existing_images", JSON.stringify(imageUrls));
                      }
                      
                      // console.log("form data", form_data);
                      const xhr = new XMLHttpRequest();
                      xhr.open("POST", serviceUrl + "masters/product/uploadImageMob", true);
                      xhr.setRequestHeader("Accept", "application/json");
                      xhr.setRequestHeader("auth-token", userToken);
                      xhr.responseType = "json";
            
                      xhr.onload = function () {
                        if (xhr.status === 200) {
                          const response = xhr.response;
                          if (response && response.data?.[0]?.valid) {
                            props.navigation.navigate("ProductTabs");
                          } else {
                            console.warn("Image upload failed:", response);
                            Alert.alert("Error", "Some images failed to upload.");
                          }
                        } else {
                          console.error("Upload error:", xhr.status, xhr.responseText);
                          Alert.alert("Error", "Upload failed. Please try again.");
                        }
                        setLoading(false);
                      };
            
                      xhr.onerror = function () {
                        console.error("Network error while uploading images");
                        Alert.alert("Error", "Network error during upload.");
                        setLoading(false);
                      };
            
                      xhr.send(form_data);
                    } else {
                      // no images, just navigate
                      props.navigation.navigate("ProductTabs");
                      setLoading(false);
                    }
                  } else {
                    Alert.alert("Error !", resp.error || "Invalid response from server");
                    setLoading(false);
                  }
                } else {
                  Alert.alert("Error !", "Oops! \nSeems like we ran into some Server Error");
                  setLoading(false);
                }
              } catch (error) {
                console.error('Error in form submission:', error);
                Alert.alert("Error", "An error occurred while processing your request. Please try again.");
                setLoading(false);
              }
            }}
          >
            Submit
          </Button>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export { ProductsForm, ProductsPreview, ProductsList };
