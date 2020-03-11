import React, { Component } from 'react';
import {
  Platform, StyleSheet, View,
  AsyncStorage,
  Button,
  Icon,
  PermissionsAndroid,
  StatusBar,
  Alert,
} from 'react-native';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});



import Navigation from './navigation/Navigation';
import DrawerNav from './navigation/DrawerNav';
//import StatusBarColor from './screens/components/StatusBarColor';
import DeviceInfo from 'react-native-device-info';
import firebase from 'react-native-firebase';



export default class App extends React.Component {
//class App extends React.Component {
  static navigationOptions = ({ navigation }) => {

    return {
      headerLeft: (
        <Button>
          <Icon
            name="menu"
            size={50}
            style={{ fontSize: 30, color: 'black' }}
          />
        </Button>
      ),
    };
  };
  
  constructor( props ) {
    super(props);
    this.state = {
      DeviceID: '',
      Token: '',
      uid: '',
      status: 0,
    }
    
  }
  getUniqueDeviceID = () => {
    var id = DeviceInfo.getUniqueId();
    this.setState({
      DeviceID: id
    })
  }

  async _requestPermissions() {
    //Checking for the permission just after component loaded
    async function requestCameraPermission() {
      //Calling the permission function
      const granted = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.CAMERA, PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]);
      console.log("permissions status: " + JSON.stringify(granted));
    }
    if (Platform.OS === 'android') {
      requestCameraPermission();
    } else {
      console.log('You can use the Camera');
    }
  }






  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    console.log('fcm: ', fcmToken);
    this.setState({
      Token: fcmToken
    });
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      console.log(fcmToken);
      this.setState({
        Token: fcmToken
      });
      if (fcmToken) {
        // this._getToken ();
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  }

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      this.getToken();
    } catch (error) {
      console.log('permission rejected');
    }
  }

  
  async componentDidMount() {
    //  this.props.navigation.navigate;

    //console.log(Navigation.navigate());
    const userToken = await AsyncStorage.getItem('userToken');
    if (userToken) {
      userDetails = JSON.parse(userToken);
      // console.log(userDetails);
      this.setState({ uid: userDetails.user.uid, status: 1 });
    } else {
      this.setState({ uid: false })
    }
    const channel = new firebase.notifications.Android.Channel('insider', 'insider channel', firebase.notifications.Android.Importance.Max)
    firebase.notifications().android.createChannel(channel);
    this._requestPermissions();
    this.checkPermission();
   // this.createNotificationListeners();

  }
  _getToken() {
    const url = 'https://videowithmyvet.com/webservices/get-token.php';
    fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'device_id': DeviceInfo.getUniqueId(),
          'token': this.state.Token,
          'uid': this.state.uid,
          'status': this.state.status
        }),
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.warn(responseJson);
      })
      .catch((error) => {
        alert('Something went wrong!');
        console.warn(error);
      })
  }
  render() {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#26cccc" />
        <Navigation />
      </View>
    )
  }
}

//export default withNavigation(App);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ccc'
  },
  statusBar: {

  }
});