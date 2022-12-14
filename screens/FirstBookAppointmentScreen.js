import React, { Component } from 'react';
import {
    Platform,
    ActivityIndicator,
    AsyncStorage,
    Button,
    StyleSheet,
    View,
    ScrollView,
    RefreshControl,
    Image,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';
import Constant from './Constants';
import { Icon, ListItem } from 'react-native-elements';
import Icons from 'react-native-vector-icons/FontAwesome';
import { DrawerActions } from 'react-navigation-drawer';
import DatePicker from 'react-native-datepicker';
import RNPickerSelect from 'react-native-picker-select';
import PracticeBarLogo from '../screens/PracticeBarLogo';
import moment from "moment";
import { HeaderBackButton } from 'react-navigation';

import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
var booking_source = Platform.OS === 'android' ? 'Android' : 'IOS';
var radio_props = [
    { label: 'param1', value: 0 },
    { label: 'param2', value: 1 }
];

export default class FirstBookAppointmentScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        navOptions = navigation;
        const { params = {} } = navigation.state;

        return {
            headerTitle: 'Book Appointment',
            //headerLeft: <PracticeBarLogo />,
            //headerLeft: <HeaderBackButton onPress={() => navigation.goBack()} />,
            headerTintColor: '#ffffff',
            headerStyle: {
                backgroundColor: '#26cccc',
                color: '#fff'
            },
        };
    }
    constructor(props) {
        super(props)
        this.state = {
            VetstoriaLocation: [],
            VetLocationID: '',
            VetstoriaSpecies: [],
            VetstoriaAppointmentTypes: [],
            VetstoriaSchedules: [],
            VetstoriaSpeciesID: '',
            VetstoriaAppointmentTypesID: 49257,
            VetstoriaSchedulesID: '',
            from: '',
            to: '',
            clientId: '',
            clientEmail: '',
            clientFirstName: '',
            clientLastName: '',
            clientPhone: '',
            clentNotes: '',
            petID: '',
            petName: '',
            SitesLocation: [],
            SitesAmounts: [],
            SiteLocationID: '',
            SitesSpecies: [],
            SitesAppointmentTypes: [],
            Sitesschedules: [],
            SitesSpeciesID: '',
            SitesAppointmentTypesID: '',
            appointmentDate: '',
            appointmentTime: '',
            isSlot: false,
            isBooking: false,
            slot: '',
            slotList: [],
            SitesClientId: '',
            SitesClientEmail: '',
            SitesClientFirstName: '',
            SitesClientLastName: '',
            SitesClientPhone: '',
            SitesClentNotes: '',
            SitesPetID: '',
            SitesPetName: '',
            PetList: [],
            service: '',
            agent: '',
            availabeDate: '',
            setDate: new Date(),
            chosenDate: new Date(),
            isLoading: true,
            uid: '',
            VetForm: false,
            SiteForm: false,
            success: '',
            failed: '',
            amount: '0.00',
            on_vetstoria: '',
            is_vetstoria: '',
            location_id: '',
            practice_id: '',
            practice_name: '',
            practice_alias_name: '',
            practice_address: '',
            speciesLocalId: '',
            localTimeArr: [],
            fromPetDetailPage: false,
            refreshing: false,
            GridViewItems: [

            ],

        }

    }
    // componentDidMount() {

    // }
    async componentDidMount() {
        const { params } = this.props.navigation.state;
        const itemId = params ? params.item.id : null;
        const itemName = params ? params.item.name : null;
        const speciesVetId = params ? params.item.vetstoriaId : null;
        const speciesLocId = params ? params.item.species : null;
        const fromPetDetailPage = params ? true : false;

        this.setState({ petID: itemId, petName: itemName, VetstoriaSpeciesID: speciesVetId, speciesLocalId: speciesLocId, fromPetDetailPage: fromPetDetailPage })

        this.props.navigation.setParams({ logout: this._signOutAsync });
        const userToken = await AsyncStorage.getItem('userToken');
        if (userToken) {
            userDetails = JSON.parse(userToken);
            console.warn(userDetails);
            this.setState({
                uid: userDetails.user.uid,
                clientEmail: userDetails.user.email,
                clientFirstName: userDetails.user.firstname,
                clientLastName: userDetails.user.lastname,
                clientPhone: userDetails.user.phone_number,
                is_vetstoria: userDetails.user.practice.is_vetstoria,
                practice_id: userDetails.user.practice.practice_id,
                location_id: userDetails.user.practice.location_id,
                practice_name: userDetails.user.practice.name,
                practice_alias_name: userDetails.user.practice.alias_name,
                practice_address: userDetails.user.practice.address,
                // userDetails.user.clientPhone

            });
            console.warn(userDetails.user.practice.is_vetstoria);
            if (userDetails.user.practice.is_vetstoria == 1) {
                this.setState({ VetForm: true, SiteForm: false, });

            } else {
                this.setState({ VetForm: false, SiteForm: true, });
            }
        } else {
            this.setState({ uid: false })
        }
        const url = Constant.rootUrl + 'webservices/booking-appointment.php?action=componentWillMount&uid=' + this.state.uid + '&is_vetstoria=' + this.state.is_vetstoria + '&practice_id=' + this.state.practice_id + '&location_id=' + this.state.location_id;

        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                this.setState({ isLoading: false, });

                if (responseJson.status === 'ok') {
                    console.warn(responseJson.data.species);
                    this.setState({
                        VetstoriaSpecies: responseJson.data.species,
                        VetstoriaAppointmentTypes: responseJson.data.appointmentTypes,
                        VetstoriaSchedules: responseJson.data.schedules,
                        //VetLocationID: item,
                        PetList: responseJson.data.petlist,
                        isLoading: false,
                        //SiteLocationID: null,
                        //amount: responseJson.data.amounts.amount
                    })
                    // console.warn(this.state.SitesAmounts.amount);
                } else {
                    alert(responseJson.status);
                }
            })
            .catch((error) => {
                alert('Something went wrong!');
                console.warn(error);
            })
    }
    appointmentTypeAmount = (item) => {
        this.setState({

            isLoading: false,
            //SiteLocationID: null,

        })
        this.setState({ VetstoriaAppointmentTypesID: item, SitesAppointmentTypesID: item });
        const url = Constant.rootUrl + 'webservices/booking-appointment.php?action=appointmentTypesAmouint&appointment_type_id=' + item;
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {

                // console.warn(responseJson);
                if (responseJson.status === 'ok') {
                    this.setState({
                        isLoading: false,
                        amount: responseJson.data.appointmentType.customer_fee
                    })
                    // console.log(responseJson);
                } else {
                    alert(responseJson.status);
                }
            })
            .catch((error) => {
                alert('Something went wrong!');
                console.warn(error);
            })


    }
    localAppointmentTime = (item) => {
        this.setState({ appointmentDate: item });

        //console.warn(Constant.rootUrl + ' webservices/booking-appointment.php?action=LocalAppointmentTime&checkDate=${item}&practice_id=${this.state.practice_id}`);
        const url = Constant.rootUrl + `webservices/booking-appointment.php?action=LocalAppointmentTime&checkDate=${item}&practice_id=${this.state.practice_id}`;
        fetch(url)
            .then((response) => response.json())
            .then((responseJson) => {
                // console.warn(responseJson);
                if (responseJson.status === 'ok') {
                    this.setState({ localTimeArr: responseJson.record })
                    // console.log(responseJson);
                } else {
                    alert(responseJson.status);
                }
            })
            .catch((error) => {
                alert('Something went wrong!');
                console.warn(error);
            })
    }

    findSpeciesId = (petId, index) => {
        console.warn(petId);
        if (petId == 0) {
            this.setState({ VetstoriaSpeciesID: 1, speciesLocalId: 1, petID: 0, petName: 'None' });
        } else {
            const url = Constant.rootUrl + `webservices/find-species-id.php?petId=${petId}`;
            fetch(url)
                .then((response) => response.json())
                .then((responseJson) => {
                    console.warn(responseJson.species_id.vetstoriaId)
                    this.setState({ VetstoriaSpeciesID: responseJson.species_id.vetstoriaId, speciesLocalId: responseJson.species_id.speciesId });
                })
            if (petId) {
                this.setState({ petID: petId, petName: this.state.PetList[index - 1].label });
            } else {
                this.setState({ petID: '', petName: '' });
            }
        }
    }
    vetStoriaFromDate = (from) => {
        // let  to = from ;
        // to.setDate(to.getDate() + 1);
        // let to = new Date();
        let to = moment(from).add(1, 'day').format('YYYY-MM-DD');
        this.setState({ from: from, to: to })
        if (this.state.location_id == '' || this.state.VetstoriaSchedulesID == '' || this.state.from == '' || this.state.to == '' || this.state.VetstoriaAppointmentTypesID == '' || this.state.VetstoriaSpeciesID == '') {
            alert("Please fill all fields");
        } else {

            this.setState({ isLoading: true, isSlot: false, isBooking: false })
            const url = Constant.rootUrl + 'webservices/booking-appointment.php?action=VetStoriaCheckSlot';
            fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'locationId': this.state.location_id,
                        'scheduleIds': [this.state.VetstoriaSchedulesID],
                        'period': {
                            'from': this.state.from,
                            'to': this.state.to,
                        },
                        'appointments': [
                            {
                                'index': 1,
                                'appointmentTypeId': '49257',
                                'speciesId': this.state.VetstoriaSpeciesID
                            }
                        ]

                    }),
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.slotlist.length > 0) {
                        this.setState({ slotList: responseJson.slotlist, isSlot: true, isBooking: true })
                    } else {
                        alert("Sorry no appointments left, please choose another date.");
                    }
                    this.setState({ isLoading: false });
                })
                .catch((error) => {
                    alert('Somthing went wrong!');
                    console.warn(error);
                })
        }
    }

    checkSlot = () => {
        if (this.state.location_id == '' || this.state.VetstoriaSchedulesID == '' || this.state.from == '' || this.state.to == '' || this.state.VetstoriaAppointmentTypesID == '' || this.state.VetstoriaSpeciesID == '') {
            alert("Please fill all fields");
        } else {

            this.setState({ isLoading: true, isSlot: false, isBooking: false })
            const url = Constant.rootUrl + 'webservices/booking-appointment.php?action=VetStoriaCheckSlot';
            fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'locationId': this.state.location_id,
                        'scheduleIds': [this.state.VetstoriaSchedulesID],
                        'period': {
                            'from': this.state.from,
                            'to': this.state.to,
                        },
                        'appointments': [
                            {
                                'index': 1,
                                'appointmentTypeId': '49257',
                                'speciesId': this.state.VetstoriaSpeciesID
                            }
                        ]

                    }),
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    console.warn(responseJson);
                    if (responseJson.status === 'ok') {
                        //console.warn(responseJson.slotlist);
                        this.setState({ slotList: responseJson.slotlist, isSlot: true, isBooking: true })
                    } else {
                        alert(responseJson.error);
                    }
                    this.setState({ isLoading: false });
                })
                .catch((error) => {
                    alert('Something went wrong!');
                    console.warn(error);
                })
        }
    }
    VetStoriaBooking = () => {

        if (this.state.location_id == '' || this.state.VetstoriaSchedulesID == '' || this.state.slot == '' || this.state.clientPhone == '' || this.state.VetstoriaAppointmentTypesID == '' || this.state.VetstoriaSpeciesID == '' || this.state.clentNotes == '') {
            alert("Please fill all fields");
        } else {
            this.setState({})
            this.setState({ isSlot: false, isBooking: false, isLoading: true })
            const url = Constant.rootUrl + 'webservices/booking-appointment.php?action=VetStoriaBooking';
            fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'locationId': this.state.location_id,
                        'scheduleId': this.state.VetstoriaSchedulesID,
                        'slot': this.state.slot,
                        'booking_source': booking_source,
                        'amount': this.state.amount,
                        'client': {
                            'clientId': this.state.uid,
                            'firstName': this.state.clientFirstName,
                            'lastname': this.state.clientLastName,
                            'email': this.state.clientEmail,
                            'phone': this.state.clientPhone,
                        },
                        'appointments': [
                            {
                                'index': 1,
                                'appointmentTypeId': 49257,
                                'speciesId': this.state.VetstoriaSpeciesID,
                                'patientId': this.state.petID,
                                'patientName': this.state.petName,
                                'notes': this.state.clentNotes,
                            }
                        ]

                    }),
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.status === 'ok') {
                        this.props.navigation.navigate('routeBookingConfirmation', { bookingId: responseJson.bookingId, firstapp: 1, pName: this.state.petName, pId: this.state.petID });
                        this.setState({ success: 'Your appointment has been booked!', failed: false });

                    } else {
                        this.setState({ success: false, failed: 'Your appointment booking failed.' });

                    }
                    this.setState({ isLoading: false });
                })
                .catch((error) => {
                    alert('Something went wrong!');
                    console.warn(error);
                    this.setState({ isLoading: false });
                })
        }
    }
    SiteBooking = () => {
        console.warn('<practice_id>' + this.state.practice_id + '<SitesSpeciesID>' + this.state.SitesSpeciesID + ' <SitesAppointmentTypesID>' + this.state.SitesAppointmentTypesID + ' <appointmentTime> ' + this.state.appointmentTime + '<appointmentDate>' + this.state.appointmentDate + '<VetstoriaSpeciesID>' + this.state.VetstoriaSpeciesID);
        if (this.state.practice_id == '' || this.state.SitesAppointmentTypesID == '' || this.state.appointmentTime == '' || this.state.appointmentDate == '' || this.state.VetstoriaSpeciesID == '') {
            alert("Please fill all fields");

        } else {
            this.setState({
                isLoading: true
            })
            this.setState({ isSlot: false, isBooking: false })
            const url = Constant.rootUrl + 'webservices/booking-appointment.php?action=SiteBooking';
            fetch(url,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        'locationId': this.state.practice_id,
                        'date': this.state.appointmentDate,
                        'time': this.state.appointmentTime,
                        'booking_source': booking_source,
                        'client': {
                            'clientId': this.state.uid,
                            'firstName': this.state.clientFirstName,
                            'lastname': this.state.clientLastName,
                            'email': this.state.clientEmail,
                            'phone': this.state.clientPhone,
                        },
                        'appointments': [
                            {
                                'index': 1,
                                'appointmentTypeId': this.state.SitesAppointmentTypesID,
                                'speciesId': this.state.speciesLocalId,
                                'patientId': this.state.petID,
                                'patientName': this.state.petName,
                                'notes': this.state.clentNotes,
                                'amount': this.state.amount,
                            }
                        ]
                    }),
                })
                .then((response) => response.json())
                .then((responseJson) => {
                    console.warn(responseJson);
                    if (responseJson.status === 'ok') {

                        this.props.navigation.navigate('routeBookingConfirmation', { bookingId: responseJson.bookingId, firstapp: 1, pName: this.state.petName, pId: this.state.petID });
                        this.setState({ success: 'Your appointment has been booked!', failed: false });

                    } else {
                        this.setState({ success: false, failed: 'Your appointment booking has been failed!' });

                    }
                    this.setState({ isLoading: false });
                })
                .catch((error) => {
                    alert('Something went wrong!');
                    console.warn(error);
                })
        }
    }

    render() {
        const VetstoriaLocationPlaceholder = {
            label: 'Select Vetstoria Location',
            value: null,
            color: '#9EA0A4',
        };
        const SitesLocationPlaceholder = {
            label: 'Select Location',
            value: null,
            color: '#9EA0A4',
        };
        const SpeciesPlaceholder = {
            label: 'Select Species',
            value: null,
            color: '#9EA0A4',
        };
        const AppointmentPlaceholder = {
            label: 'Select Appointment Type',
            value: null,
            color: '#9EA0A4',
        };
        const SchedulesPlaceholder = {
            label: 'Select Schedules',
            value: null,
            color: '#9EA0A4',
        };
        const PatientNamePlaceholder = {
            label: 'Select Patient Name',
            value: null,
            color: '#9EA0A4',
        };
        const SlotPlaceholder = {
            label: 'Select Time',
            value: null,
            color: '#9EA0A4',
        };
        const LocalTimePlaceholder = {
            label: 'Select Time',
            value: null,
            color: '#9EA0A4',
        }
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

        var slotItemHtml = this.state.isSlot ?
            <View>
                <RadioForm
                    radio_props={this.state.slotList}
                    initial={-1}
                    onPress={(value) => { this.setState({ value: value }) }}
                />
            </View>
            : null
        var vetformHtml = this.state.VetForm ?
            <View>
                {this.state.fromPetDetailPage ?
                    <TextInput placeholder="Patient name"
                        underlineColorAndroid="transparent"
                        placeholderTextColor='#555'
                        ref={(input) => this.passwordInput = input}
                        style={styles.input}
                        editable={false}
                        onChangeText={(text) => this.setState({ petName: text })}
                        returnKeyType="next"
                        value={this.state.petName}

                    />
                    :
                    <RNPickerSelect
                        placeholder={PatientNamePlaceholder}
                        items={this.state.PetList}
                        useNativeAndroidPickerStyle={false}
                        placeholderTextColor='#555'
                        onValueChange={(value, index) => {
                            // console.warn(this.state.PetList[index-1].label);
                            this.findSpeciesId(value, index);

                        }}
                        value={this.state.petID}
                        style={pickerSelectStyles}
                    />
                }
                <View style={{ flexDirection: "row" }}>
                    <View style={{ flex: 2 }}>
                        <RNPickerSelect
                            placeholder={AppointmentPlaceholder}
                            placeholderTextColor='#555'
                            items={this.state.VetstoriaAppointmentTypes}
                            useNativeAndroidPickerStyle={false}
                            /*  onValueChange={value => {
                                 this.setState({ VetstoriaAppointmentTypesID: value });
                             }} */
                            onValueChange={this.appointmentTypeAmount}
                            value={this.state.VetstoriaAppointmentTypesID}
                            style={pickerSelectStyles}
                        />
                    </View>
                    {/* <View style={{ flex: 1 }}>
                        <Text style={styles.text}> {'\u00A3'}{this.state.amount}</Text>
                    </View> */}
                </View>


                <RNPickerSelect
                    placeholder={SchedulesPlaceholder}
                    items={this.state.VetstoriaSchedules}
                    useNativeAndroidPickerStyle={false}
                    placeholderTextColor='#555'
                    onValueChange={value => {
                        this.setState({ VetstoriaSchedulesID: value });
                    }}
                    value={this.state.VetstoriaSchedulesID}
                    style={pickerSelectStyles}
                />

                <DatePicker
                    style={styles.datePicker}
                    date={this.state.from}
                    mode="date"
                    placeholder="Select From Date"
                    placeholderTextColor='#555'
                    format="YYYY-MM-DD"
                    minDate={new Date()}
                    confirmBtnText="Done"
                    cancelBtnText="Cancel"
                    onDateChange={this.vetStoriaFromDate}
                    //onDateChange={(from) => { this.setState({ from: from, to:  from}) }}
                    customStyles={{
                        dateInput: {
                            borderWidth: 0,
                            alignItems: 'flex-start',
                            //color: '#fff'
                        },
                        dateIcon: {
                            width: 0,
                            height: 0,
                        },
                        dateText: {

                        }, placeholderText: {
                            color: '#555'
                        }
                    }}
                />
                <TextInput placeholder="To date"
                    underlineColorAndroid="transparent"
                    placeholderTextColor='#555'
                    ref={(input) => this.passwordInput = input}
                    style={styles.input}
                    editable={false}
                    /* onChangeText={this.updatePhone} */
                    onChangeText={(text) => this.setState({ to: text })}
                    returnKeyType="next"
                    value={this.state.to}

                />

                <View style={styles.bookingTotal}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.bookingTotalLable}>Booking Total</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.bookingTotalAmount} > {'\u00A3'}{this.state.amount} </Text>
                    </View>

                </View>

            </View> : null
        var vetBookingHtml = this.state.isBooking ?
            <View style={styles.booikingForm}>
                <RNPickerSelect
                    placeholder={SlotPlaceholder}
                    placeholderTextColor='#555'
                    items={this.state.slotList}
                    useNativeAndroidPickerStyle={false}
                    onValueChange={value => {
                        this.setState({ slot: value });
                    }}
                    value={this.state.slot}
                    style={pickerSelectStyles}

                />

                <TextInput placeholder="Notes"
                    underlineColorAndroid="transparent"
                    placeholderTextColor='#555'
                    ref={(input) => this.passwordInput = input}
                    style={styles.input}
                    /* onChangeText={this.updatLastName} */
                    onChangeText={(notes) => this.setState({ clentNotes: notes })}
                    returnKeyType="next"

                />
                <TouchableOpacity onPress={this.VetStoriaBooking} style={styles.button}>
                    <Text style={styles.textcolor}>Book Appointment</Text>
                </TouchableOpacity>
            </View> : null
        var siteformHtml = this.state.SiteForm ? <View>

            {this.state.fromPetDetailPage ?
                <TextInput placeholder="Patient name"
                    underlineColorAndroid="transparent"
                    placeholderTextColor='#555'
                    ref={(input) => this.passwordInput = input}
                    style={styles.input}
                    editable={false}
                    onChangeText={(text) => this.setState({ petName: text })}
                    returnKeyType="next"
                    value={this.state.petName}

                />
                :
                <RNPickerSelect
                    placeholder={PatientNamePlaceholder}
                    items={this.state.PetList}
                    useNativeAndroidPickerStyle={false}
                    placeholderTextColor='#555'
                    onValueChange={(value, index) => {
                        // console.warn(this.state.PetList[index-1].label);
                        this.findSpeciesId(value, index);

                    }}
                    value={this.state.petID}
                    style={pickerSelectStyles}
                />
            }

            {/*<View style={{ flexDirection: "row" }}>
                <View style={{ flex: 2 }}> */}
            <RNPickerSelect
                placeholder={AppointmentPlaceholder}
                placeholderTextColor='#555'
                /*  items={this.state.SitesAppointmentTypes} */
                items={this.state.VetstoriaAppointmentTypes}
                useNativeAndroidPickerStyle={false}
                onValueChange={this.appointmentTypeAmount}

                value={this.state.SitesAppointmentTypesID}
                style={pickerSelectStyles}
            />
            {/* </View> */}
            {/* <View style={{ flex: 1 }}>
                    <Text style={styles.text} > {'\u00A3'}{this.state.amount} </Text>
                </View> 
            </View>*/}
            <DatePicker
                style={styles.datePicker}
                date={this.state.appointmentDate}
                mode="date"
                placeholderTextColor='#555'
                placeholder="Select From Date"
                format="YYYY-MM-DD"
                confirmBtnText="Done"
                cancelBtnText="Cancel"
                onDateChange={this.localAppointmentTime}
                /* onDateChange={(date) => { this.setState({ appointmentDate: date }) }}*/
                customStyles={{
                    dateInput: {
                        borderWidth: 0,
                        alignItems: 'flex-start',
                    },
                    dateIcon: {
                        width: 0,
                        height: 0,
                    },
                    dateText: {

                    }, placeholderText: {
                        color: '#555'
                    }
                }}
            />

            <RNPickerSelect
                placeholder={LocalTimePlaceholder}
                items={this.state.localTimeArr}
                useNativeAndroidPickerStyle={false}
                placeholderTextColor='#555'
                onValueChange={value => {
                    this.setState({ appointmentTime: value });
                }}
                value={this.state.appointmentTime}
                style={pickerSelectStyles}
            />
            <TextInput placeholder="Notes"
                underlineColorAndroid="transparent"
                placeholderTextColor='#555'
                ref={(input) => this.passwordInput = input}
                style={styles.input}
                onChangeText={this.updatLastName}
                onChangeText={(text) => this.setState({ clentNotes: text })}
                returnKeyType="next"

            />
            <View style={styles.bookingTotal}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.bookingTotalLable}>Booking Total</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.bookingTotalAmount} > {'\u00A3'}{this.state.amount} </Text>
                </View>

            </View>
            <TouchableOpacity onPress={this.SiteBooking} style={styles.button}>
                <Text style={styles.textcolor}>Book Appointment</Text>
            </TouchableOpacity>

        </View> : null
        var successFlashMessage = this.state.success ?
            <Text style={styles.successStyle}>{this.state.success}</Text>
            : null
        var faieldFlashMessage = this.state.failed ?
            <Text style={styles.faieldStyle}>{this.state.failed}</Text>
            : null
        return (
            <View style={styles.maincontainer}>
                <ScrollView style={styles.container}>
                    {successFlashMessage}
                    {faieldFlashMessage}
                    <View style={styles.locationStyleContainer}>
                        <Text style={styles.clinicDetails}>Clinic details</Text>
                        <Text style={styles.clinicName}>{this.state.practice_name}</Text>
                        <Text style={styles.clinicAddress}>{this.state.practice_address}</Text>
                    </View>
                    {vetformHtml}
                    {vetBookingHtml}
                    {siteformHtml}
                    <View style={styles.maincontainer}>
                    </View>
                </ScrollView>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    maincontainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        paddingHorizontal: 30,
        marginTop: 40,
    },
    locationStyleContainer: {
        marginBottom: 20,
    },
    clinicDetails: {
        color: '#09B5B5',
        fontSize: 20,
    },
    clinicName: {
        fontSize: 20,
        color: '#ccc',

    },
    clinicAddress: {
        fontSize: 20,
    },
    bookingTotal: {
        flexDirection: 'row',
        paddingVertical: 5,
        marginBottom: 15
    },
    bookingTotalLable: {
        color: '#09B5B5',
        fontSize: 22,
    },
    bookingTotalAmount: {
        color: '#09B5B5',
        fontSize: 22,
        textAlign: 'right'
    },

    booikingForm: {
    },
    text: {
        height: 40,
        color: '#000',
        fontSize: 22,
        marginBottom: 20,
        paddingHorizontal: 10,
        fontWeight: "bold",

    },

    baseStyle: {
        padding: 10,
        height: 44,
    },
    labelStyle: {
        fontWeight: "bold",
        fontSize: 16,
    },
    locationTextStyle: {
        color: '#222',
        marginLeft: 5,
        fontSize: 14,
    },
    textStyle: {
        padding: 10,
        fontSize: 18,
        height: 44,
        color: '#000'
    },
    itemStyle: {
        padding: 10,
        marginTop: 2,
        backgroundColor: '#ddd',
        borderColor: '#bbb',
        borderWidth: 1,
        borderRadius: 5,
    },
    itemTextStyle: {
        color: '#222'
    },
    input: {
        height: 50,
        backgroundColor: '#F6F6F6',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 0,
    },
    datePicker: {
        width: '100%',
        //color: '#fff',
        height: 50,
        backgroundColor: '#F6F6F6',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 0,
        borderColor: '#F6F6F6',
        alignContent: 'flex-start',
        alignItems: 'flex-start',
        borderWidth: 0
    },
    dateText: {
        color: '#fff',
        justifyContent: 'center',
        marginTop: 5
    },
    buttoncontainer: {
        marginTop: 0,
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
    textcolor: {
        color: '#FFFFFF',
        fontSize: 20
    },
    successStyle: {
        color: '#FFF',
        backgroundColor: "#ff6900",
        marginBottom: 20,
        textAlign: "center",
        padding: 15,
    },
    faieldStyle: {
        color: '#ffffff',
        backgroundColor: "#FF8C00",
        textAlign: "center",
        padding: 15,
        marginBottom: 20,
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
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
        backgroundColor: '#F6F6F6',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderColor: '#F6F6F6',
        borderWidth: 0
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: '#F6F6F6',
        paddingRight: 30,
        height: 50,
        backgroundColor: '#F6F6F6',
        marginBottom: 20,
        paddingHorizontal: 10,
        borderRadius: 0,
        borderWidth: 0,
        color: 'black'
        // to ensure the text is never behind the icon
    },
});