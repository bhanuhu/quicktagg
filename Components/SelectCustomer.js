import React, { useState, useEffect } from "react";
import { View, FlatList, TouchableOpacity, Image } from "react-native";
import {
  Portal,
  Modal,
  IconButton,
  Button,
  Text,
  List,
  Checkbox,
  Avatar,
  FAB,
  TextInput,
  TouchableRipple,
} from "react-native-paper";
import MyStyles from "../Styles/MyStyles";
import { CapitalizeName } from "../utils/CapitalizeName";

// const SelectCustomer = ({
//   visible,
//   multiple = true,
//   data = [],
//   onDone,
//   onClose,
// }) => {
//   const [selectAll, setSelectAll] = useState(true);
//   const [listData, setListData] = useState(data);
//   const [selectedIndex, setselectedIndex] = useState(null);
//   const [show, setShow] = useState(false);

//   useEffect(() => {
//     setListData(data);
//     console.log(data,"Checked")
//   }, [data]);

//   return (
//     <Portal>
//       <Modal
//         visible={visible}
//         dismissable={false}
//         contentContainerStyle={{ flex: 1, backgroundColor: "#fff" }}
//       >
//         <View style={{ flex: 1 }}>
//           <View
//             style={[MyStyles.row, { backgroundColor: "#ffba3c", marginTop: 0 }]}
//           >
//             <IconButton
//               icon="chevron-left"
//               size={30}
//               color="black"
//               onPress={onClose}
//             />
//             {show ? (
//               <TextInput
//                 mode="flat"
//                 theme={{ colors: { primary: "black" } }}
//                 style={{
//                   backgroundColor: "rgba(0,0,0,0)",
//                   height: 45,
//                   width: "60%",
//                 }}
//                 left={<TextInput.Icon name="magnify" />}
//                 onChangeText={(text) => {
//                   const keyword = new RegExp(text.toLowerCase());
//                   const filter = data.filter((item, index) => {
//                     if (
//                       item.full_name &&
//                       item.full_name.toLowerCase().match(keyword)
//                     ) {
//                       return true;
//                     } else if (
//                       item.mobile &&
//                       item.mobile.toLowerCase().match(keyword)
//                     ) {
//                       return true;
//                     } else {
//                       return false;
//                     }
//                   });
//                   setListData(filter);
//                 }}
//                 placeholder="Search"
//               />
//             ) : (
//               <Text style={{ fontWeight: "bold", fontSize: 18, flexGrow: 1 }}>
//                 Select Customers
//               </Text>
//             )}
//             <IconButton
//               icon={show ? "close" : "magnify"}
//               size={25}
//               onPress={() => setShow(!show)}
//             />
//           </View>
//           <FlatList
//             data={listData}
//             renderItem={({ item, index }) => (
//               <List.Item
//                 style={{ borderBottomColor: "#aaa", borderBottomWidth: 0.5 }}
//                 onPress={
//                   multiple
//                     ? () => {
//                         const isSelected = !item.selected;
//                         item.selected = isSelected;
//                         data[index].selected = isSelected;
//                         setListData([...listData]);
//                         console.log(listData)
//                       }
//                     : () => {
//                         if (selectedIndex == item.customer_id) {
//                           setselectedIndex(null);
//                         } else {
//                           setselectedIndex(item.customer_id);
//                         }
//                         console.log(listData)
//                       }
//                 }
//                 title={item.full_name}
//                 titleStyle={{ fontWeight: "bold" }}
//                 description={item.mobile + "          " + item.category_name}
//                 left={() => {
//                   return (
//                     <TouchableRipple style={MyStyles.squarefixedRatio}>
//                       <Text style={{ color: "red" }}>
//                         {item.category_name == null
//                           ? ""
//                           : item.category_name.charAt(0)}
//                       </Text>
//                     </TouchableRipple>
//                   );
//                 }}
//                 right={() =>
//                   multiple ? (
//                     <Checkbox
//                       status={item.selected ? "checked" : "unchecked"}
//                     />
//                   ) : (
//                     <Checkbox
//                       status={selectedIndex == item.customer_id ? "checked" : "unchecked"}
//                     />
//                   )
//                 }
//               />
//             )}
//             keyExtractor={(item, index) =>  item.customer_id.toString()}
//           />
//         </View>
//         <FAB
//           style={{ position: "absolute", bottom: 20, right: 40 }}
//           icon="check"
//           color="#000"
//           onPress={
//             multiple
//               ? () => {
//                   const selectedCustomers = data.filter(
//                     (item) => item.selected
//                   );
//                   // console.log(selectedCustomers,"Karan")
//                   onDone(selectedCustomers);
//                   onClose();
//                 }
//               : () => {
//                   const selectedCustomer = data.filter(
//                     (item, index) => index == selectedIndex
//                   );
//                   // console.log(selectedCustomers,"Karan")
//                   onDone(selectedCustomer);
//                   onClose();
//                 }
//           }
//         />
//         {multiple ? (
//           selectAll ? (
//             <FAB
//               style={{ position: "absolute", bottom: 20, right: 100 }}
//               icon="select"
//               color="#000"
//               onPress={() => {
//                 listData.forEach((item, index) => {
//                   item.selected = true;
//                   data[index].selected = true;
//                 });
//                 setListData([...listData]);
//                 setSelectAll(false);
//               }}
//             />
//           ) : (
//             <FAB
//               style={{ position: "absolute", bottom: 20, right: 100 }}
//               icon="selection-off"
//               color="#000"
//               onPress={() => {
//                 listData.forEach((item, index) => {
//                   item.selected = false;
//                   data[index].selected = false;
//                 });
//                 setListData([...listData]);
//                 setSelectAll(true);
//               }}
//             />
//           )
//         ) : null}
//       </Modal>
//     </Portal>
//   );
// };


const SelectCustomer = ({
  visible,
  multiple = true,
  data = [],
  onDone,
  onClose,
}) => {
  // console.log(data);
  const [selectAll, setSelectAll] = useState(true);
  const [listData, setListData] = useState(data);
  const [allListData, setAllListData] = useState(data);

  const [selectedData, setSelectedData] = useState([]);
  const [selectedIndex, setselectedIndex] = useState(null);
  const [show, setShow] = useState(false);



  useEffect(() => {
    setListData(data);
    setAllListData(data)

  }, [data]);



  return (
    <Portal>
      <Modal
        visible={visible}
        dismissable={false}
        contentContainerStyle={{ flex: 1, backgroundColor: "#fff" }}
      >
        <View style={{ flex: 1 }}>
          <View
            style={[MyStyles.row, { backgroundColor: "#ffba3c", marginTop: 0 }]}
          >
            <IconButton
              icon="chevron-left"
              size={30}
              color="black"
              onPress={onClose}
            />
            {show ? (
              <TextInput
                mode="flat"
                theme={{ colors: { primary: "black" } }}
                style={{
                  backgroundColor: "rgba(0,0,0,0)",
                  height: 45,
                  width: "60%",
                }}
                left={<TextInput.Icon name="magnify" />}
                onChangeText={(text) => {
                  const keyword = new RegExp(text.toLowerCase());
                  const filter = data.filter((item, index) => {
                    if (
                      item.full_name &&
                      item.full_name.toLowerCase().match(keyword)
                    ) {
                      return true;
                    } else if (
                      item.mobile &&
                      item.mobile.toLowerCase().match(keyword)
                    ) {
                      return true;
                    } else {
                      return false;
                    }
                  });
                  setListData(filter);
                  console.log(filter, 'Clear_search')
                }}
                placeholder="Search"
              />
            ) : (
              <Text style={{ fontWeight: "bold", fontSize: 18, flexGrow: 1 }}>
                Select Customers
              </Text>
            )}
            <IconButton
              icon={show ? "close" : "magnify"}
              size={25}
              onPress={() => setShow(!show)}
            />
          </View>
          <FlatList
            data={listData}
            renderItem={({ item, index }) => (
              <List.Item
                style={{ borderBottomColor: "#aaa", borderBottomWidth: 0.5 }}
                onPress={
                  multiple
                    ? () => {
                      const isSelected = !item.selected;
                      item.selected = isSelected;
                      // if()
                      // data[index].selected = isSelected;
                      if (data[index].customer_id == item.customer_id) {
                        data[index].selected = isSelected;
                      }
                      setListData([...listData]);
                    }
                    : () => {
                      if (selectedIndex == item.customer_id) {
                        setselectedIndex(null);
                      } else {
                        setselectedIndex(item.customer_id);
                      }
                    }
                }
                title={CapitalizeName(item.full_name)}
                titleStyle={{ fontWeight: "bold", fontSize: 15 }}
                description={item.mobile + "          " + item.category_name}
                descriptionStyle={{ fontSize: 13 }}
                left={() => {
                  return (
                    <TouchableRipple style={{ marginLeft: 10, marginTop: 5 }}>
                      <Text style={{
                        color: "red",
                        textTransform: "uppercase",
                        borderWidth: 1,
                        borderRadius: 4,
                        borderColor: 'grey',
                        aspectRatio: 1,
                        textAlign: 'center',
                        fontWeight: "bold",
                        padding: 2
                      }}>
                        {item.category_name == null
                          ? ""
                          : item.category_name.charAt(0)}
                      </Text>
                    </TouchableRipple>
                  );
                }}
                right={() =>
                  multiple ? (
                    <Checkbox
                      status={item.selected == true ? "checked" : "unchecked"}
                    />
                  ) : (
                    <Checkbox
                      status={selectedIndex == item.customer_id ? "checked" : "unchecked"}
                    />
                  )
                }
              />
            )}
          // keyExtractor={(item, index) =>  item.customer_id.toString()}
          />
        </View>
        <FAB
          style={{ position: "absolute", bottom: '4%', right: '4%', backgroundColor: MyStyles.primaryColor.backgroundColor, borderRadius: 50 }}
          icon="check"
          color="#000"
          onPress={
            multiple
              ? () => {
                const selectedCustomers = data.filter(
                  (item) => item.selected
                );
                console.log(selectedCustomers, "Karan")
                onDone(selectedCustomers);

              }
              : () => {
                const selectedCustomer = data.filter(
                  (item, index) => item.customer_id == selectedIndex
                );
                // console.log(selectedCustomers, "Karan")
                onDone(selectedCustomer);

              }
          }
        />
        {multiple ? (
          selectAll ? (
            <FAB
              style={{ position: "absolute", bottom: '4%', right: 80, backgroundColor: MyStyles.primaryColor.backgroundColor, borderRadius: 50 }}
              icon="select"
              color="#000"
              onPress={() => {
                listData.forEach((item, index) => {
                  item.selected = true;
                  data[index].selected = true;
                });
                setListData([...listData]);
                setSelectAll(false);
              }}
            />
          ) : (
            <FAB
              style={{ position: "absolute", bottom: '4%', right: 80, backgroundColor: MyStyles.primaryColor.backgroundColor, borderRadius: 50 }}
              icon="selection-off"
              color="#000"
              onPress={() => {

                listData.forEach((item, index) => {
                  item.selected = false;
                  data[index].selected = false;
                });
                setListData([...listData]);
                setSelectAll(true);
              }}
            />
          )
        ) : null}
      </Modal>
    </Portal>
  );
};

export default SelectCustomer;