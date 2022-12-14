import React, { Component } from 'react';
import {
  AsyncStorage,
  StyleSheet,
  WebView,
  PermissionsAndroid,
  View,
  Text,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Platform,
  StatusBar
} from 'react-native';
import Constant from './Constants';
import {
  TwilioVideoLocalView,
  TwilioVideoParticipantView,
  TwilioVideo
} from 'react-native-twilio-video-webrtc';
import { HeaderBackButton } from 'react-navigation';
export async function requestRecordAudioPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Cool Photo App record audio Permission',
        message:
          'Cool Photo App needs access to your record audio ' +
          'so you can take awesome pictures.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.warn('You can use the camera');
    } else {
      console.warn('Camera permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}


export default class ConfrenceScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: 'Video Call Started',
      headerLeft: <HeaderBackButton onPress={() => this._goBack} />,
      headerLeftContainerStyle: {
        marginTop: StatusBar.currentHeight
      },
      headerRightContainerStyle: {
        marginTop: StatusBar.currentHeight
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
        flex: 1,
        textAlign: 'center',
        marginTop: StatusBar.currentHeight
      },
      headerStyle: {
        backgroundColor: '#26cccc',
        color: '#fff',
        height: 80
      },
      headerRight: (

        <Text style={{ flex: 1, height: 50, width: 50 }}></Text>
      ),

    }
  }
  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.state = {
      isAudioEnabled: true,
      isVideoEnabled: true,
      status: 'disconnected',
      participants: new Map(),
      videoTracks: new Map(),
      roomName: '',
      trackIdentifier: {},
      token: '',
      trackSid: '',
      isParticipant: false,
      isLoading: true,
      petId: '',
      userId: '',
      practice_id: '',
      bookingId: '',
    }
    this._goBack = this._goBack.bind(this);
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this._goBack);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this._goBack);
  }
  _goBack() {
    this.refs.twilioVideo.disconnect()
    this.props.navigation.navigate('AppointmentList');
    return true;
  }

  async componentWillMount() {
    const { params } = this.props.navigation.state;
    console.log("conference screen0 ", params);
    const petDetails = params ? params.item : null;
    // console.log("conference screen1 ", petDetails);
    if (petDetails != null && petDetails._data == null) {
      let bookingId = petDetails.bookingId ? petDetails.bookingId : petDetails.nextAppointment.bookingId;
      let petId = petDetails.id ? petDetails.id : petDetails.patientId;
      this.setState({ petId: petId, bookingId: bookingId });
    }
    if (petDetails != null && petDetails._data != null) {//from notification
      let bookingId = petDetails._data.bookingid;
      this.setState({ bookingId: bookingId });
    }
    this.props.navigation.setParams({ logout: this._signOutAsync });
    const userToken = await AsyncStorage.getItem('userToken');
    if (userToken) {
      userDetails = JSON.parse(userToken);
      // console.warn(userDetails);
      this.setState({ uid: userDetails.user.uid, roomName: userDetails.user.email });
      this.setState({ userId: userDetails.user.uid, practice_id: userDetails.user.practice.practice_id });
    } else {
      this.setState({ uid: false })
    }
    console.log("conference screen10 ", this.state.bookingId);
    const url = Constant.rootUrl + 'token?room=' + this.state.roomName + '&bookingId=' + this.state.bookingId;
    console.log("conference screen10 url ", url);
    fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          token: responseJson.token,
          isLoading: false,
          status: 'connecting'
        })

        this.refs.twilioVideo.connect({ roomName: this.state.roomName, accessToken: responseJson.token })


      })
      .catch((error) => {
        // alert('Somthing went wrong!');
        console.warn(error);
      })
    if (petDetails != null && petDetails._body == null) {
      // this._webNotification();
    }

  }
  _webNotification = () => {

    const url = Constant.rootUrl + 'webservices/mobile-to-web-notification.php';
    // console.log("conference screen ", this.state.userId, this.state.practice_id, this.state.bookingId, this.state.petId, this.state.roomName);
    fetch(url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'uid': this.state.userId,
          'practice_id': this.state.practice_id,
          'notificationType': 'withAppointment',
          'bookingId': this.state.bookingId,
          'petId': this.state.petId,
          'room': this.state.roomName,

        }),
      })
      .then((response) => response.json())
      .then((responseJson) => {
        console.warn("web notification api ", responseJson);
        if (responseJson.status === 'ok') {


        } else if (responseJson.error) {

        }

      })
      .catch((error) => {
        // alert('Something went wrong!');
        console.warn(error);
      })
  }
  _onConnectButtonPress = () => {
    this.refs.twilioVideo.connect({ roomName: this.state.roomName, accessToken: this.state.token })
    this.setState({ status: 'connecting' })
  }

  _onEndButtonPress = () => {
    this.refs.twilioVideo.disconnect()
    this.props.navigation.navigate('AppointmentList');
  }

  _onMuteButtonPress = () => {
    this.refs.twilioVideo.setLocalAudioEnabled(!this.state.isAudioEnabled)
      .then(isEnabled => this.setState({ isAudioEnabled: isEnabled }))
  }

  _onFlipButtonPress = () => {
    this.refs.twilioVideo.flipCamera()
  }

  _onRoomDidDisconnect = ({ roomName, error }) => {
    console.log("ERROR: ", error)

    this.setState({ status: 'disconnected' })
  }

  _onRoomDidFailToConnect = (error) => {
    console.log("ERROR: ", error)

    this.setState({ status: 'disconnected' })
  }

  _onParticipantAddedVideoTrack = ({ participant, track }) => {
    //console.warn("onParticipantAddedVideoTrack: ", participant, track)

    this.setState({
      videoTracks: new Map([
        ...this.state.videoTracks,
        [track.trackSid, { participantSid: participant.sid, videoTrackSid: track.trackSid }]
      ]),
    });

    this.setState({
      trackSid: track.trackSid, isParticipant: true,
      trackIdentifier: { participantSid: participant.sid, videoTrackSid: track.trackSid }
    });

    /* Array.from(this.state.videoTracks, ([trackSid, trackIdentifier]) => {
      console.warn(trackSid)
      console.warn(trackIdentifier)
    }) */
    // console.warn(this.state.trackSid)
    // console.warn(this.state.trackIdentifier)

  }

  _onParticipantRemovedVideoTrack = ({ participant, track }) => {
    console.log("onParticipantRemovedVideoTrack: ", participant, track)

    const videoTracks = this.state.videoTracks
    videoTracks.delete(track.trackSid)

    this.setState({ videoTracks: { ...videoTracks } })
  }
  render() {
    var participantScreen = this.state.isParticipant ?
      <View style={styles.remoteGrid}>
        <TwilioVideoParticipantView
          style={styles.remoteVideo}
          key={this.state.trackSid}
          trackIdentifier={this.state.trackIdentifier}
        />
      </View>
      : null
    if (this.state.isLoading) {
      return (
        <View elevation={5} style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',

        }}>
          {/* <ActivityIndicator
            color='#2ba9bc'
            size="large"
            style={styles.activityIndicator} /> */}
          <Image
            style={{
              height: 80,
              width: 80,
            }}
            source={require('./images/loader.gif')}
            resizeMethod="auto"
          />
        </View>
      )
    }
    return (
      <View style={styles.container}>
        {
          this.state.status === 'disconnected' &&
          <View>
            <Text style={styles.welcome}>
              React Native Twilio Video
            </Text>
            <TextInput
              style={styles.input}
              autoCapitalize='none'
              value={this.state.roomName}
              onChangeText={(text) => this.setState({ roomName: text })}>
            </TextInput>
            <TextInput
              style={styles.input}
              autoCapitalize='none'
              value={this.state.token}
              onChangeText={(text) => this.setState({ token: text })}>
            </TextInput>
            <Button
              title="Connect"
              style={styles.button}
              onPress={this._onConnectButtonPress}>
            </Button>
          </View>
        }

        {
          (this.state.status === 'connected' || this.state.status === 'connecting') &&
          <View style={styles.callContainer}>

            {participantScreen}
            {/*
              this.state.status === 'connected' &&
              <View style={styles.remoteGrid}>
                {
                  Array.from(this.state.videoTracks, ([trackSid, trackIdentifier]) => {
                    return (
                      <TwilioVideoParticipantView
                        style={styles.remoteVideo}
                        key={trackSid}
                        trackIdentifier={trackIdentifier}
                      />
                    )
                  })

                }

              </View>
              */}

            <View style={styles.remoteGrid} >
              <TwilioVideoLocalView
                enabled={true}
                style={styles.remoteVideo}
              />
            </View>
            <View
              style={styles.optionsContainer}>
              {/* <TwilioVideoLocalView
                enabled={true}
                style={styles.localVideo}
              /> */}
              <TouchableOpacity
                style={styles.optionButton}
                onPress={this._onEndButtonPress}>
                {/* <Text style={{ fontSize: 12 }}>End</Text> */}
                <Image style={{
                  height: 45, width: 45,
                }} source={require('./images/end_end.png')} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={this._onMuteButtonPress}>
                {/* <Text style={{ fontSize: 12 }}>{this.state.isAudioEnabled ? "Mute" : "Unmute"}</Text> */}
                {this.state.isAudioEnabled ?
                  <Image style={{
                    height: 35, width: 35,
                  }} source={require('./images/mute_voice.png')} />
                  : <Image style={{
                    height: 35, width: 35,
                  }} source={require('./images/unmute.png')} />
                }
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={this._onFlipButtonPress}>
                {/* <Text style={{ fontSize: 12 }}>Flip</Text> */}
                <Image style={{
                  height: 45, width: 45,
                }} source={require('./images/switch_camera.png')} />
              </TouchableOpacity>

            </View>
          </View>
        }

        <TwilioVideo
          ref="twilioVideo"
          onRoomDidConnect={this._onRoomDidConnect}
          onRoomDidDisconnect={this._onRoomDidDisconnect}
          onRoomDidFailToConnect={this._onRoomDidFailToConnect}
          onParticipantAddedVideoTrack={this._onParticipantAddedVideoTrack}
          onParticipantRemovedVideoTrack={this.onParticipantRemovedVideoTrack}
        />
      </View >
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  callContainer: {
    flex: 1,
    position: "absolute",
    bottom: 0,
    top: 0,
    left: 0,
    right: 0
  },
  welcome: {
    fontSize: 30,
    textAlign: 'center',
    paddingTop: 40
  },
  input: {
    height: 50,
    borderWidth: 1,
    marginRight: 70,
    marginLeft: 70,
    marginTop: 50,
    textAlign: 'center',
    backgroundColor: 'white'
  },
  button: {
    marginTop: 100
  },
  localVideo: {
    flex: 1,
    width: 150,
    height: 250,
    position: "absolute",
    right: 10,
    bottom: 90
  },
  remoteGrid: {
    flex: 1,
    //flexDirection: "row",
    //flexWrap: 'wrap'
  },
  remoteVideo: {
    flex: 1,
    //marginTop: 20,

    //alignSelf: 'stretch',


  },
  optionsContainer: {
    position: "absolute",
    left: 0,
    bottom: 0,
    right: 0,
    height: 65,
    backgroundColor: '#26cccc',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    alignItems: "center"
  },
  optionButton: {
    width: 50,
    height: 50,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 100 / 2,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: "center"
  },
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 80
  },

});
