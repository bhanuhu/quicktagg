import React, { useState, useEffect } from "react";
import {
  ImageBackground,
  ScrollView,
  View,
  Alert,
  FlatList,
  Image,
  Dimensions,
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
import BadgeRibbon from "../../Components/BadgeRibbon";
import { serviceUrl } from "../../Services/Constants";
import Share from "react-native-share";
import RNFS from "react-native-fs";
import Loading from "../../Components/Loading";
import { CapitalizeName } from "../../utils/CapitalizeName";

const ProductsList = (props) => {

  const { userToken, search } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [griddata, setgriddata] = useState([]);

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

  const renderItem = ({ item, index }) => {


    const ItemComponent = (props) => {
      const { item } = props;
      console.log(`item -> ${JSON.stringify(item)}`);
      // Handle different possible image URL formats
      const getImageSource = () => {
        // Check if we have a direct image URL
        if (item.image_url) {
          return { uri: item.image_url };
        } 
        // Check if we have a full URL in image_path
        else if (item.image_path && (item.image_path.startsWith('http') || item.image_path.startsWith('file'))) {
          return { uri: item.image_path };
        }
        // Check if we have base URL and path components
        else if (item.url_image && item.image_path) {
          // Ensure proper URL joining
          const baseUrl = item.url_image.endsWith('/') ? item.url_image : `${item.url_image}/`;
          const imagePath = item.image_path.startsWith('/') ? item.image_path.substring(1) : item.image_path;
          return { uri: `${baseUrl}${imagePath}` };
        }
        // Check if we have an images array with URLs
        else if (item.images && item.images.length > 0 && item.images[0].image_path) {
          return { uri: item.images[0].image_path };
        }
        // Fallback to thumbnail if no valid image URL is found
        console.log('No valid image URL found for item:', item);
        return require('../../assets/thumbnail.png');
      };
      
      const [image, setImage] = useState(getImageSource());
      const [imageError, setImageError] = useState(false);
      const [imageOpacity, setImageOpacity] = useState(1);
      const itemStyle = {
        height: 160,
        width: Dimensions.get('window').width / 3.2,
        borderRadius: 10,
        backgroundColor: 'white',
        margin: Dimensions.get('window').width * 0.01,
      };

      return (<Card
        style={itemStyle}
        key={index}
        onPress={() =>
          props.navigation.navigate("ProductsForm", {
            product_id: item.product_id,
            userToken: userToken,
            branchId: item.branch_id,
            productData: item,
          })
        }>
        <View style={{ height: '70%' }}>
          <Image
            source={imageError ? require('../../assets/thumbnail.png') : image}
            style={{
              flex: 1,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
              height: '90%',
              width: '90%',
              margin: 5,
              opacity: imageError ? 0.7 : imageOpacity,
              backgroundColor: imageError ? '#e0e0e0' : '#f5f5f5',
              alignSelf: 'center'
            }}
            resizeMode={imageError ? 'center' : 'contain'}
            onError={(error) => {
              console.log('ERROR_IMAGE:', {
                error,
                itemId: item.product_id,
                attemptedUrl: image.uri,
                itemData: item
              });
              setImageError(true);
              setImage(require('../../assets/thumbnail.png'));
              setImageOpacity(0.4);
            }}
            defaultSource={require("../../assets/thumbnail.png")}
            onLoadStart={() => {
              setImageError(false);
            }}
            onLoadEnd={() => console.log('Image loaded successfully:', image.uri || 'thumbnail')}
          />
          <View style={{ position: 'absolute', height: '20%', width: '100%' }}>
            {item.exhibition && <BadgeRibbon text="E" position="left" color="red" />}
            {item.trial && <BadgeRibbon text="T" position="right" />}
          </View>

        </View>

        <View style={{ height: '30%', width: '100%', padding: 4, alignItems: 'flex-start' }}>
          <Text numberOfLines={2} style={{ color: "#333", fontSize: 11, textAlign: 'left', flexWrap: 'wrap', fontWeight: 'bold' }}>
            {item.product_name ? CapitalizeName(item.product_name) : ''}
          </Text>
          <Text style={{ color: "gray", fontSize: 10 }}>{item.product_code}</Text>

        </View>
      </Card>)

    }

    return (
      <ItemComponent item={item} navigation={props.navigation} />
    )
  };

  const onRefresh = () => {
    fetchProducts();
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={griddata}
        contentContainerStyle={{ alignItems: 'flex-start' }}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: 'space-evenly' }}
        keyExtractor={(item, index) => index.toString()}
        onRefresh={onRefresh}
        refreshing={loading}
      />
      <FAB
        style={{
          position: "absolute",
          bottom: '5%',
          right: '5%',
          borderRadius: 50,
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
  const { product_id, userToken } = props.route.params;
  const [loading, setLoading] = useState(true);
  const [param, setparam] = useState({
    product_id: "",
    product_code: "",
    product_name: "",
    remarks: "",
    price: "",
    disable: "",
    exhibition: "",
    businesses: "",
    trial: "",
    discounted_price: "",
    weight: "",
    size_length: "",
    gender: "",
    Metal: "",
    material: "",
    on_demand: "",
    available: "",
    qty: "",
  });
  const [productImages, setProductImages] = useState([]);
  const [shareOptions, setshareOptions] = useState({
    title: "",
    message: "",
    url: "",
    subject: "",
  });
  const [currentProduct, setCurrentProduct] = useState({});

  React.useEffect(() => {
    let data = { product_id: product_id };
    postRequest("masters/product/preview", data, userToken).then((resp) => {
      if (resp.status == 200) {
        param.product_id = resp.data[0].product_id;
        param.product_code = resp.data[0].product_code;
        param.product_name = resp.data[0].product_name;
        param.remarks = resp.data[0].remarks;
        param.price = resp.data[0].price;
        param.disable = resp.data[0].disable;
        param.exhibition = resp.data[0].exhibition;
        param.businesses = resp.data[0].businesses;
        param.trial = resp.data[0].trial;
        param.discounted_price = resp.data[0].discounted_price;
        param.weight = resp.data[0].weight;
        param.size_length = resp.data[0].size_length;
        param.gender = resp.data[0].gender;
        param.Metal = resp.data[0].Metal;
        param.material = resp.data[0].material;
        param.on_demand = resp.data[0].on_demand;
        param.available = resp.data[0].available;
        param.qty = resp.data[0].qty;
        setparam({ ...param });

        let ImagesList = [];
        ImagesList = resp.data[0].images;
        setProductImages(ImagesList);
        setCurrentProduct(ImageList.length > 0 ? ImagesList[0] : {});
      } else {
        Alert.alert(
          "Error !",
          "Oops! \nSeems like we run into some Server Error"
        );
      }
    });
    setLoading(false);
  }, []);

  return (
    <ScrollView contentContainerStyle={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
      <Loading isloading={loading} />
      <View>
        <Text style={{ fontWeight: "bold", fontSize: 18 }}>
          {CapitalizeName(param.product_name)}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>SKU:</Text>{"   "}{param.product_code}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Price:</Text>{"   "}{param.price}/-{"  "}
          <Text
            style={{
              color: "red",
              textDecorationLine: "line-through",
            }}
          >
            {param.price}/-
          </Text>
        </Text>
      </View>
      <View style={{ marginVertical: 10, height: 250 }}>
        <IconButton
          icon="share-variant"
          size={16}
          color="#FFF"
          style={{
            margin: 5,
            backgroundColor: MyStyles.primaryColor.backgroundColor,
            alignSelf: 'flex-end'
          }}
          onPress={() => {
            Share.isAvailableAsync().then((result) => {
              if (result) {
                setLoading(true);
                const options = {
                  dialogTitle: param.product_name.toString(),
                  mimeType: "image/jpeg"
                };
                FileSystem.downloadAsync(currentProduct.url + "" + currentProduct.image_path, FileSystem.cacheDirectory + currentProduct.image_path)
                  .then(async ({ uri }) => {
                    Share.shareAsync(uri, options);
                  })
                  .catch((error) => {
                    console.error(error);
                  });
                setLoading(false);
              }
            });
          }}
        />
        <Swiper key={productImages.length} loop={false} activeDotColor="gray" onIndexChanged={(index) => {
          setCurrentProduct(productImages[index]);
        }} style={{ height: '100%' }}>
          {productImages.length > 0 ? (
            productImages.map((resp, index) => {
              return (
                <View>
                  <Image
                    source={{ uri: resp.url + "" + resp.image_path }}
                    style={[{ height: '100%', width: "100%", borderRadius: 5 }]}
                  />
                </View>
              );
            })) :
            (<Image
              source={require("../../assets/upload.png")}
              style={[{ height: '100%', width: "100%", borderRadius: 5 }]}
            />)}
        </Swiper>
      </View>
      <View>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Availablity:</Text>{"   "}{CapitalizeName(param.available) || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Metal:</Text>{"   "}{CapitalizeName(param.Metal) || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Material:</Text>{"   "}{CapitalizeName(param.material) || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Disable:</Text>{"   "}{param.disable || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Exhibition:</Text>{"   "}{param.exhibition || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Weight:</Text>{"   "}{param.weight || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Size/Length:</Text>{"   "}{param.size_length || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Gender:</Text>{"   "}{CapitalizeName(param.gender) || '-'}
        </Text>
        <Text style={{ fontSize: 15, marginTop: 10 }}>
          <Text style={{ color: 'gray' }}>Description:</Text>{"   "}{param.product_code || '-'}
        </Text>
      </View>
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
            
            // Set form parameters
            setparam({
              product_id: product.product_id,
              product_name: product.product_name || '',
              product_code: product.product_code || '',
              price: product.price ? parseFloat(product.price) : 0,
              qty: product.qty ? parseInt(product.qty, 10) : 0,
              remarks: product.remarks || '',
              gender: product.gender || '',
              discounted_price: product.discounted_price ? parseFloat(product.discounted_price) : 0,
              exhibition: product.exhibition || false,
              available: product.available || false,
              businesses: product.businesses || false,
              trial: product.trial || false,
              disable: product.disable || false,
              weight: product.weight ? parseFloat(product.weight) : 0,
              size_length: product.size_length ? parseFloat(product.size_length) : 0,
              Metal: product.Metal || '',
              material: product.material || '',
              on_demand: product.on_demand || 'In Stock',
              product_images: [], // Will be set in the separate useEffect
              category_id: product.category_id || '',
              sub_category_id: product.sub_category_id || '',
              subcategory_names: product.subcategory_names || '',
              product_subcategory_list: subcategories,
              image_url: Array.isArray(product.image_url) ? product.image_url : 
                        (product.image_url ? [product.image_url] : [])
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
      if (Array.isArray(productData.images) && productData.images.length > 0) {
        images = productData.images
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
      else if (productData.image_url) {
        const imageUrls = Array.isArray(productData.image_url) 
          ? productData.image_url 
          : [productData.image_url];
          
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
      
      // Set all product data to form state
      setparam(prev => ({
        ...prev,
        product_id: product_id,
        product_code: productData.product_code || "",
        product_name: productData.product_name || "",
        remarks: productData.remarks || "",
        price: productData.price?.toString() || "",
        disable: productData.disable || false,
        exhibition: productData.exhibition || false,
        businesses: productData.businesses || false,
        trial: productData.trial || false,
        discounted_price: productData.discounted_price?.toString() || "",
        weight: productData.weight?.toString() || "",
        size_length: productData.size_length?.toString() || "",
        gender: productData.gender || "",
        category_id: productData.category_id || "",
        sub_category_id: productData.sub_category_id || "",
        subcategory_names: productData.subcategory_names || "",
        Metal: productData.Metal || "",
        material: productData.material || "",
        on_demand: productData.available ? "In Stock" : "Make To Order",
        available: productData.available || false,
        qty: productData.qty?.toString() || ""
      }));

      // Set product images if available
      if (productData.image_url) {
        // Format the existing image to match what MultipleImages expects
        const formattedImage = {
          uri: productData.image_url,
          name: productData.image_url.split('/').pop() || `product_${product_id}.jpg`,
          type: 'image/jpeg' // Default type
        };
        setProductImages([formattedImage]);
      }

      // Load subcategories for the product's category
      if (productData.category_id) {
        SubcategoryList(productData.category_id);
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
      console.log('Subcategory API response status:', resp.status);
      console.log('Subcategory API response data:', resp.data);
      
      if (resp.status === 200 && resp.data) {
        // Ensure data is an array and has the expected structure
        const subcategories = Array.isArray(resp.data) 
          ? resp.data 
          : [resp.data];
          
        console.log('Available subcategories:', subcategories);
        
        if (subcategories.length === 0) {
          console.log('No subcategories found for this category');
        }
        
        setsubcategorylist(subcategories);
        
        // Handle selected subcategories from productData
        if (product_id && productData?.subcategorylist?.length > 0) {
          console.log('Product has subcategories:', productData.subcategorylist);
          
          // Get the IDs of the selected subcategories
          const selectedSubcategoryIds = productData.subcategorylist.map(
            sub => sub.subcategory_id
          );
          
          // Get the full subcategory objects that match the selected IDs
          const selectedSubcategories = subcategories.filter(
            subcat => selectedSubcategoryIds.includes(subcat.subcategory_id)
          );
          
          console.log('Matching selected subcategories:', selectedSubcategories);
          
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
              console.log('Selected category:', selectedCategory);
              
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
            la
            uppercase={false}
            style={{ borderRadius: 5 }}
            labelStyle={{ color: "black" }}
            onPress={async () => {
              try {
                setLoading(true);
                
                // Prepare the data to send
                const formData = {
                  ...param,
                  subcategory_names: param.subcategory_names || '',
                  sub_category_id: param.sub_category_id || '',
                  category_id: param.category_id || '',
                  price: param.price ? parseFloat(param.price) : 0,
                  discounted_price: param.discounted_price ? parseFloat(param.discounted_price) : 0,
                  weight: param.weight ? parseFloat(param.weight) : 0,
                  size_length: param.size_length ? parseFloat(param.size_length) : 0,
                  qty: param.qty ? parseInt(param.qty, 10) : 0,
                  // Convert single image_url to array if it exists
                  image_url: param.image_url ? (Array.isArray(param.image_url) ? param.image_url : [param.image_url]) : []
                };
              
                const resp = await postRequest("masters/product/insert", formData, userToken);
                if (resp.status === 200) {
                  if (resp.data[0].valid) {
                    if (productsuploads.length > 0) {
                      const form_data = new FormData();
                      console.log("resp.data[0].id", resp.data);
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
                      
                      console.log("form data", form_data);
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
