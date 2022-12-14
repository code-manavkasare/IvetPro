import React, { Component } from 'react';
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
    BackHandler,
    RefreshControl
} from 'react-native';
import Constant from './Constants';
import AuthLoadingScreen from './AuthLoadingScreen';
import DatePicker from 'react-native-datepicker';
import RNPickerSelect from 'react-native-picker-select';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import PracticeBarLogo from './PracticeBarLogo';
import { HeaderBackButton } from 'react-navigation';
import { DrawerActions } from 'react-navigation-drawer';
import { Icon, ListItem, SearchBar } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import App from '../App'
import firebase from 'react-native-firebase';
export default class EditProfileScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: 'Edit Profile',
            headerLeft: <PracticeBarLogo />,
            headerTintColor: '#ffffff',
            headerStyle: {
                backgroundColor: '#26cccc',
                color: '#fff',
                height: 80
            },
            headerTitleStyle: {
                flex: 1,
                textAlign: 'center',
                marginTop: StatusBar.currentHeight
            },
            headerLeftContainerStyle: {
                marginTop: StatusBar.currentHeight
            },
            headerRightContainerStyle: {
                marginTop: StatusBar.currentHeight
            },
            headerRight: (
                <Icon
                    name="menu"
                    size={50}
                    color='#fff'
                    onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                />
            ),
        }
    };
    constructor(props) {

        super(props)
        this.state = {
            username: '',
            firstname: '',
            lastname: '',
            email: '',
            uid: false,
            ImageSource: null,
            isLoading: true,
            refreshing: false,
            phoneNumber: '',
            practice_name: '',
            firstNameValidation: true,
            lastNameValidation: true,
            mobileValidation: true,
        }


    }
    selectPhotoTapped() {
        const options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
                skipBackup: true
            }
        };

        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled photo picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                let source = { uri: response.uri };
                this.setState({
                    ImageSource: source,
                    data: response.data
                });
            }
        });
    }


    editProfile = () => {
        // console.log("divide ", 1/0);
        if (!this.state.firstNameValidation) {
            alert("Please enter valid first name");
            return false;
        }

        if (!this.state.lastNameValidation) {
            alert("Please enter valid last name");
            return false;
        }
        if (!this.state.mobileValidation) {
            alert("Please enter valid phone number");
            return false;
        }

        if (this.state.name == '') {
            alert("Please fill all fields");
        } else {
            console.warn(this.state.setDate);
            this.setState({ isLoading: true })
            RNFetchBlob.fetch('POST', Constant.rootUrl + 'webservices/edit-profile.php', {
                'Content-Type': 'multipart/form-data',
            }, [
                { name: 'image', filename: 'image.png', type: 'image/png', data: this.state.data },
                { name: 'firstname', data: this.state.firstname },
                { name: 'lastname', data: this.state.lastname },
                { name: 'uid', data: this.state.uid },
                { name: 'phone_number', data: this.state.phoneNumber },
                { name: 'action', data: 'edit' }
            ])
                .then((response) => response.json())
                .then((responseJson) => {
                    console.log("upload edit profile ", responseJson);
                    if (responseJson.status === 'ok') {
                        this.setState({ isLoading: false })
                        alert(responseJson.success_msg);
                        this.props.navigation.push('Home');
                    } else {
                        this.setState({ isLoading: false })
                        alert(responseJson.error_msg);
                    }

                }).catch((err) => {

                })
        }

    }

    firstNameValidation = (firstName) => {
        let regex = /^[a-zA-Z ]+$/;

        if (regex.test(firstName) && firstName.length < 16) {
            // console.log(" no  special ", firstName)
            this.setState({ firstNameValidation: true });
        } else {
            //console.log("yes special ", firstName);
            this.setState({ firstNameValidation: false });
        }
        this.setState({ firstname: firstName })
    }
    lastNameValidation = (lastName) => {

        let regex = /^[a-zA-Z ]+$/;

        if (regex.test(lastName) && lastName.length < 16) {
            //console.log(" no  special ", lastName)
            this.setState({ lastNameValidation: true });
        } else {
            // console.log("yes special ", lastName);
            this.setState({ lastNameValidation: false });
        }
        this.setState({ lastname: lastName });
    }
    updatMobile = (text) => {
        let reg = /^[\+\d]?(?:[\d-\s() ]*)$/;
        if (reg.test(text) && text.length > 6 && text.length < 18) {
            this.setState({ mobileValidation: true });
        } else {
            this.setState({ mobileValidation: false });
        }
        this.setState({ phoneNumber: text })
    }
    checkref() {
        this.setState({
            refreshing: true
        })
        this.componentDidMount()
    }
    async componentDidMount() {
        // firebase.crashlytics().crash();
        // Alert.show.componentDidMount
        let savedValues = await AsyncStorage.getItem('userToken');
        savedValues = JSON.parse(savedValues);
        this.id = savedValues.user.uid;
        //console.log("fetUserData saved data", savedValues, this.id);
        new App().fetUserData(this.id);

        const userToken = await AsyncStorage.getItem('userToken');
        var source = '';
        if (userToken) {
            userDetails = JSON.parse(userToken);
            // console.warn(userDetails.user.practice.practice_logo_url);
            this.setState({ uid: userDetails.user.uid });
            const url = Constant.rootUrl + 'webservices/edit-profile.php';

            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'uid': userDetails.user.uid,
                    'action': 'get'
                }),
            })
                .then((response) => response.json())
                .then((responseJson) => {
                    console.log("edit profile ", responseJson);
                    if (responseJson.status === 'ok') {
                        responseJson.user.profile_pic ?
                            source = { uri: responseJson.user.profile_pic }
                            : null
                        this.setState({
                            firstname: responseJson.user.firstname,
                            lastname: responseJson.user.lastname,
                            email: responseJson.user.email,
                            phoneNumber: responseJson.user.phone_number,
                            practice_name: responseJson.user.practice_name,
                            ImageSource: source,
                            isLoading: false,
                            refreshing: false
                        })
                    } else {
                        alert(responseJson.status);
                    }
                })
                .catch((error) => {
                    alert('Somthing went wrong!');
                    this.setState({
                        isLoading: false
                    })
                    console.warn(error);
                })
        } else {
            this.setState({ uid: false, isLoading: false })
        }

    }

    render() {
        console.warn(this.state.uid);
        if (this.state.isLoading) {
            return (
                <View style={{ flex: 1, padding: 20 }}>
                    <ActivityIndicator
                        color='#2ba9bc'
                        size="large"
                        style={styles.activityIndicator} />
                </View>
            )
        }
        return (
            <View style={styles.maincontainer}>
                <ScrollView refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={() => this.checkref()}
                        title="Loading..."
                    />
                } style={styles.container}>
                    <Text style={styles.textLable}>Email Id</Text>
                    <TextInput placeholder="Email"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        style={styles.input}
                        defaultValue={this.state.email}
                        editable={false}
                    />
                    <Text style={styles.textLable}>Practice name</Text>
                    <TextInput placeholder=" Practice name"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        style={styles.input}
                        defaultValue={this.state.practice_name}
                        onChangeText={(practice_name) => this.setState({ practice_name })}
                        value={this.state.practice_name}
                        editable={false}
                    />
                    {!this.state.firstNameValidation ?
                        <Text style={styles.validation}>Only alphabets and max 15 character.</Text> : null
                    }
                    <Text style={styles.textLable}>First name</Text>
                    <TextInput placeholder="First Name"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        style={styles.input}
                        defaultValue={this.state.firstname}
                        // onChangeText={(firstname) => this.setState({ firstname })}
                        onChangeText={this.firstNameValidation}
                        value={this.state.firstname}
                    />
                    {!this.state.lastNameValidation ?
                        <Text style={styles.validation}>Only alphabets and max 15 character.</Text> : null}
                    <Text style={styles.textLable}>Last name</Text>
                    <TextInput placeholder="Last Name"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        style={styles.input}
                        defaultValue={this.state.lastname}
                        // onChangeText={(lastname) => this.setState({ lastname })}
                        onChangeText={this.lastNameValidation}
                        value={this.state.lastname}
                    />
                    {!this.state.mobileValidation ?
                        <Text style={styles.validation}>Enter valid phone number </Text> : null}
                    <Text style={styles.textLable}>Phone number</Text>
                    <TextInput placeholder="Phone number"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        style={styles.input}
                        defaultValue={this.state.phoneNumber}
                        // onChangeText={(phoneNumber) => this.setState({ phoneNumber })}
                        onChangeText={this.updatMobile}
                        value={this.state.phoneNumber}
                    />


                    <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)} style={styles.ImageContainer}>
                        <View >
                            {this.state.ImageSource === null ? <Text>Select a Photo</Text> :
                                <Image style={styles.ImageContainer} source={this.state.ImageSource} />
                            }
                        </View>
                    </TouchableOpacity>
                    <View style={styles.buttoncontainer}>
                        <TouchableOpacity onPress={this.editProfile} style={styles.button}>
                            <Text style={styles.textcolor}>Update</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    maincontainer: {
        flex: 1,
        //backgroundColor: '#FFFFFF',
        padding: 20
    },
    container: {
        flex: 1,
        //paddingHorizontal: 30,
        marginTop: 10,
    },
    input: {
        height: 50,
        backgroundColor: '#F6F6F6',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 0,
        borderColor: '#F6F6F6',
        borderWidth: 0
    },
    textLable: {
        color: '#777777',
        fontSize: 14,
        padding: 5,
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    },
    validation: {
        color: '#ff0000'
    },
    picker: {
        height: 44,
        backgroundColor: '#ffffff',
        paddingHorizontal: 10,
        borderRadius: 10,
        marginTop: 20,
        borderColor: '#d2d4d6'
    },
    pickerItem: {
        height: 44,
        color: "#fff",
        fontSize: 17
    },
    buttoncontainer: {
        marginTop: 40,
    },
    ImageContainer: {
        borderRadius: 10,
        width: 150,
        height: 150,
        //borderColor: '#9B9B9B',
        //borderWidth: 1 / PixelRatio.get(),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F6F6',

    },
    button: {
        marginTop: 5,
        height: 80,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 40,
        backgroundColor: "#09B5B5",
        alignItems: 'center'
    },
    pagetitle: {
        justifyContent: 'center',
        fontSize: 20,
        marginBottom: 15,
    },
    textcolor: {
        color: '#FFFFFF',
        fontSize: 20
    },
    progressBar: {
        transform: [{ scaleX: 1.0 }, { scaleY: 6 }],
        marginTop: 8,
        marginBottom: 15,
    },
    scrollView: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        paddingVertical: 10,
    },

    datePicker: {
        width: '100%',
        color: '#fff',
        height: 40,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingHorizontal: 0,
        borderRadius: 10,
        borderColor: '#d2d4d6',
        alignContent: 'flex-start',
    },
    dateText: {
        color: '#fff',
        justifyContent: 'center',
        marginTop: 5
    }
});
const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        paddingRight: 30, // to ensure the text is never behind the icon
        height: 40,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderColor: '#d2d4d6',
        borderWidth: 2
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: '#d2d4d6',
        paddingRight: 30,
        height: 40,
        backgroundColor: '#ffffff',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 2
        // to ensure the text is never behind the icon
    },
});


