import React from "react";
import { StyleSheet, StatusBar, Platform } from "react-native";

const MyStyles = StyleSheet.create({
  primaryColor: { backgroundColor: "#ffba3c" },
  barHeight: Platform.OS === "android" ? StatusBar.currentHeight : 0,

  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  wrapper: {
    marginVertical: 5,
  },


  cover: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    margin: 10,
    borderRadius: 10,
    padding: 10,
  },

  centerAlign: {
    marginTop: "auto",
    marginBottom: "auto",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    marginLeft: "auto",
    marginRight: "auto",
  },

  modal: {
    marginTop: "auto",
    backgroundColor: "white",
    marginBottom: "auto",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
    marginLeft: "auto",
    marginRight: "auto",
  },

  cardContainer: {
    borderRadius: 10,
    padding: 20,
    width: "90%",
    marginLeft: "auto",
    marginRight: "auto",
    marginVertical: 5,
  },

  title: { color: "#22356A", fontWeight: "bold", fontSize: 25 },

  text: {
    fontSize: 18,
    // fontFamily: "ElMessiri-bold"
  },

  datePickerModal: {
    flexDirection: "column",
    padding: 10,
  },
  datePickerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginVertical: 5,
  },
  dateLabel: {
    marginLeft: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  squarefixedRatio: {
    marginLeft: 20,
  },
  profile_row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
    left: 30,
  },
});

export default MyStyles;
