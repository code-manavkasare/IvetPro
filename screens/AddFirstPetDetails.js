import React, { Component } from "react";
import {
  Platform,
  DatePickerIOS,
  ActivityIndicator,
  AsyncStorage,
  Button,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Picker,
  ProgressViewIOS,
  ProgressBarAndroid,
  Animated,
  Image,
  Dimensions,
  PixelRatio,
} from "react-native";
import Constant from "./Constants";
import AuthLoadingScreen from "./AuthLoadingScreen";
import DatePicker from "react-native-datepicker";
import RNPickerSelect from "react-native-picker-select";
import ImagePicker from "react-native-image-picker";
import RNFetchBlob from "rn-fetch-blob";
import { Icon, ListItem } from "react-native-elements";
import { DrawerActions } from "react-navigation-drawer";
import PracticeBarLogo from "../screens/PracticeBarLogo";
import { HeaderBackButton } from "react-navigation";

const genderList = [
  {
    label: "Male",
    value: "Male",
  },
  {
    label: "Female",
    value: "Female",
  },
  {
    label: "Male Neutered",
    value: "Male Neutered",
  },
  {
    label: "Female Neutered",
    value: "Female Neutered",
  },
  {
    label: "Unknown",
    value: "Unknown",
  },
];

var moment = require("moment");
export default class AddFirstPetDetails extends Component {
  static navigationOptions = ({ navigation }) => {
    navOptions = navigation;
    const { params = {} } = navigation.state;
    return {
      headerTitle: "Add Pet",
      //headerLeft: <PracticeBarLogo />,
      // headerLeft: <HeaderBackButton  onPress={() => navigation.goBack()} />,
      headerTintColor: "#ffffff",
      headerStyle: {
        backgroundColor: "#26cccc",
        color: "#fff",
      },
    };
  };
  constructor(props) {
    super(props);

    (this.state = {
      isLoading: false,
      ImageSource: null,
      Image_TAG: "",
      data: null,
      petid: "",
      uid: "",
      name: this.props.navigation.getParam("pet_name")
        ? this.props.navigation.getParam("pet_name")
        : "",
      species: "",
      breed: "",
      sex: "",
      dob: "",
      PracticeCode: "",
      CurrentWeight: "",
      dateofRIP: "",
      setDate: new Date(),
      chosenDate: new Date(),
      showDatePicker: false,
      speciesArr: [],
    }),
      (this.setDate = this.setDate.bind(this));
    this.navigation;
  }
  componentWillMount() {
    const url = Constant.rootUrl + "webservices/species.php";
    fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.status == "ok") {
          this.setState({ speciesArr: responseJson.species });
        }
      });
  }
  setDate(newDate) {
    this.setState({ chosenDate: newDate });
  }
  async componentDidMount() {
    const userToken = await AsyncStorage.getItem("userToken");
    if (userToken) {
      userDetails = JSON.parse(userToken);
      this.setState({ uid: userDetails.user.uid });
    } else {
      this.setState({ uid: false });
    }
  }
  UpdateName = (text) => {
    this.setState({ name: text });
  };
  UpdateSpecies = (text) => {
    this.setState({ species: text });
  };
  UpdateBreed = (text) => {
    this.setState({ breed: text });
  };
  UpdateSex = (text) => {
    this.setState({ sex: text });
  };
  UpdateCurrentWeight = (text) => {
    this.setState({ currentWeight: text });
  };
  UpdatePracticeCode = (text) => {
    this.setState({ practiceCode: text });
  };
  selectPhotoTapped() {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        skipBackup: true,
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log("Response = ", response);

      if (response.didCancel) {
        console.log("User cancelled photo picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        let source = { uri: response.uri };
        this.setState({
          ImageSource: source,
          data: response.data,
        });
      }
    });
  }
  addPet = () => {
    if (this.state.name == "") {
      alert("Please fill all fields");
    } else {
      this.setState({ isLoading: true });

      RNFetchBlob.fetch(
        "POST",
        Constant.rootUrl + "webservices/add-pet.php",
        {
          "Content-Type": "multipart/form-data",
        },
        [
          {
            name: "image",
            filename: "image.png",
            type: "image/png",
            data: this.state.data,
          },
          { name: "name", data: this.state.name },
          { name: "species", data: this.state.species },
          { name: "breed", data: this.state.breed },
          { name: "sex", data: this.state.sex },
          { name: "currentWeight", data: this.state.currentWeight },
          { name: "dob", data: this.state.dob },
          { name: "practiceCode", data: this.state.practiceCode },
          { name: "uid", data: this.state.uid },
          { name: "action", data: "add" },
        ]
      )
        .then((response) => response.json())
        .then((responseJson) => {
          this.setState({ isLoading: false });
          if (responseJson.status === "ok") {
            console.log(responseJson);
            this.props.navigation.push("AddAnotherPet", {
              petName: this.state.name,
              petId: responseJson.lastid,
            });
            this.setState({
              data: null,
              name: "",
              species: "",
              breed: "",
              sex: "",
              currentWeight: "",
              dob: "",
              practiceCode: "",
            });
          } else {
            alert(responseJson.error);
          }
        })
        .catch((err) => {
          // ...
        });
    }
  };

  render() {
    const { navigate } = this.props.navigation;

    const pet_name = this.props.navigation.getParam("pet_name");
    console.warn(pet_name);
    const placeholder = {
      label: "Select Sex",
      value: null,
      color: "#9EA0A4",
    };
    const SpeciesPlaceholder = {
      label: "Select Species",
      value: null,
      color: "#9EA0A4",
    };
    if (this.state.isLoading) {
      return (
        <View style={{ flex: 1, padding: 20 }}>
          <ActivityIndicator
            color="#2ba9bc"
            size="large"
            style={styles.activityIndicator}
          />
        </View>
      );
    }
    return (
      <View style={styles.maincontainer}>
        <ScrollView style={styles.container}>
          <TextInput
            placeholder="Name"
            underlineColorAndroid="transparent"
            placeholderTextColor="#555"
            style={styles.input}
            onChangeText={this.UpdateName}
            defaultValue={this.state.name}
          />
          {/* <TextInput placeholder="Species"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        ref={(input) => this.passwordInput = input}
                        style={styles.input}
                        onChangeText={this.UpdateSpecies}

                    /> */}
          <RNPickerSelect
            placeholder={SpeciesPlaceholder}
            items={this.state.speciesArr}
            useNativeAndroidPickerStyle={false}
            placeholderTextColor="#555"
            onValueChange={(value) => {
              this.setState({ species: value });
            }}
            value={this.state.species}
            style={pickerSelectStyles}
          />
          <TextInput
            placeholder="Breed"
            underlineColorAndroid="transparent"
            placeholderTextColor="#555"
            ref={(input) => (this.passwordInput = input)}
            style={styles.input}
            onChangeText={this.UpdateBreed}
          />
          <RNPickerSelect
            placeholder={placeholder}
            items={genderList}
            placeholderTextColor="#555"
            useNativeAndroidPickerStyle={false}
            onValueChange={(value) => {
              this.setState({ sex: value });
            }}
            value={this.state.sex}
            style={pickerSelectStyles}
          />
          <DatePicker
            style={styles.datePicker}
            date={this.state.dob}
            mode="date"
            placeholder="Select Date of Birth"
            format="MM/DD/YYYY"
            placeholderTextColor="#555"
            confirmBtnText="Done"
            cancelBtnText="Cancel"
            onDateChange={(dob) => {
              this.setState({ dob: dob });
            }}
            customStyles={{
              dateInput: {
                borderWidth: 0,
                alignItems: "flex-start",
              },
              dateIcon: {
                width: 0,
                height: 0,
              },
              dateText: {},
              placeholderText: {
                color: "#555",
              },
            }}
          />
          <TextInput
            placeholder="Current Weight(Kg)"
            underlineColorAndroid="transparent"
            placeholderTextColor="#555"
            ref={(input) => (this.passwordInput = input)}
            style={styles.input}
            onChangeText={this.UpdateCurrentWeight}
          />
          {/* <TextInput placeholder="Practice Code"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        ref={(input) => this.passwordInput = input}
                        style={styles.input}
                        onChangeText={this.UpdatePracticeCode}

                    /> */}

          <TouchableOpacity
            onPress={this.selectPhotoTapped.bind(this)}
            style={styles.ImageContainer}
          >
            <View>
              {this.state.ImageSource === null ? (
                <Text>Select a Photo</Text>
              ) : (
                <Image
                  style={styles.ImageContainer}
                  source={this.state.ImageSource}
                />
              )}
            </View>
          </TouchableOpacity>
          {/* <TextInput
                        placeholder="Enter Image Name "
                        onChangeText={data => this.setState({ Image_TAG: data })}
                        underlineColorAndroid='transparent'
                        style={styles.TextInputStyle}
                    /> 
                    <TouchableOpacity onPress={this.uploadImageToServer} activeOpacity={0.6} style={styles.button} >
                        <Text style={styles.TextStyle}> UPLOAD IMAGE TO SERVER </Text>
                    </TouchableOpacity>
                    */}
          <View style={styles.buttoncontainer}>
            <TouchableOpacity onPress={this.addPet} style={styles.button}>
              <Text style={styles.textcolor}>Add your pet</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    //backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  input: {
    height: 50,
    backgroundColor: "#F6F6F6",
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 0,
  },
  buttoncontainer: {
    marginTop: 40,
  },
  activityIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 80,
  },
  button: {
    marginTop: 5,
    height: 80,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderRadius: 40,
    backgroundColor: "#09B5B5",
    alignItems: "center",
  },
  pagetitle: {
    justifyContent: "center",
    fontSize: 20,
    marginBottom: 15,
  },
  textcolor: {
    color: "#FFFFFF",
    fontSize: 20,
  },
  scrollView: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  datePicker: {
    width: "100%",
    //color: '#fff',
    height: 50,
    backgroundColor: "#F6F6F6",
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 0,
    borderColor: "#F6F6F6",
    alignContent: "flex-start",
    alignItems: "flex-start",
    borderWidth: 0,
  },
  dateText: {
    color: "#fff",
    justifyContent: "center",
    marginTop: 5,
  },
  ImageContainer: {
    borderRadius: 10,
    width: 150,
    height: 150,
    //borderColor: '#9B9B9B',
    //borderWidth: 1 / PixelRatio.get(),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F6F6",
  },
  TextInputStyle: {
    textAlign: "center",
    height: 40,
    width: "80%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#028b53",
    marginTop: 20,
  },
});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 0,
    paddingRight: 30, // to ensure the text is never behind the icon
    height: 50,
    backgroundColor: "#F6F6F6",
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderColor: "#F6F6F6",
    borderWidth: 0,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "#F6F6F6",
    paddingRight: 30,
    height: 50,
    backgroundColor: "#F6F6F6",
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 0,
    borderWidth: 0,
    color: "black",
    // to ensure the text is never behind the icon
  },
});
