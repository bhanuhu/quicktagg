import React, { useState, useEffect } from "react";
import { View } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import MyStyles from "../Styles/MyStyles";
import { CustomerReviewList } from "./Reviews&Feedbacks/CustomerReview";
import CustomerFeedback from "./Reviews&Feedbacks/CustomerFeedback";

const ReviewTabs = (props) => {
  const Tab = createMaterialTopTabNavigator();

  return (
    <View style={MyStyles.container}>
      <Tab.Navigator
        tabBarOptions={{
          style: { backgroundColor: "#ffba3c", },
          tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        }}
      >
        <Tab.Screen
          name="Customer Reviews"
          children={() => <CustomerReviewList {...props} />}
          // initialParams={props.route.params}
        />
        <Tab.Screen
          name="Customer Feedback"
          children={() => <CustomerFeedback {...props} />}
          // initialParams={props.route.params}
        />
        {/* <Tab.Screen
          name="Customer Reviews"
          component={CustomerReviewList}
          initialParams={props.route.params}
        />
        <Tab.Screen
          name="Customer Feedback"
          component={CustomerFeedback}
          initialParams={props.route.params}
        /> */}
      </Tab.Navigator>
    </View>
  );
};

export default ReviewTabs;
