import React from "react";
import { View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import MyStyles from "../Styles/MyStyles";
import { ProductsList } from "./Products/Products";
import { CategoryList } from "./Products/Category";
import { SubCategoryList } from "./Products/SubCategory";


const Tab = createMaterialTopTabNavigator();

const ProductTabs = (props) => {
  return (
    <View style={MyStyles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: "#ffba3c" },
          tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        }}
      >
        <Tab.Screen
          name="Products"
          children={() => <ProductsList {...props} />}
          initialParams={props.route.params}
        />
        <Tab.Screen
          name="Category"
          children={() => <CategoryList {...props} />}
          options={{ title: "Categories" }}
          initialParams={props.route.params}
        />
        <Tab.Screen
          name="SubCategory"
          children={() => <SubCategoryList {...props} />}
          options={{ title: "Sub Categories" }}
          initialParams={props.route.params}
        />
      </Tab.Navigator>
    </View>
  );
};

export default ProductTabs;
