const { Component } = require("react")
import React from 'react';
import MapView ,{ Marker, AnimatedRegion} from 'react-native-maps';
import haversine from 'haversine';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import { Text, View, StyleSheet, TouchableOpacity,Image } from 'react-native';

// const { width, height } = Dimensions.get("window");
const ASPECT_RATIO = 500 / 300;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;


const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ecf0f1',
    },
    paragraph: {
      margin: 24,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#34495e',
    },
  });

class LocationTracking extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          latitude: LATITUDE,
          longitude: LONGITUDE,
          routeCoordinates: [],
          distanceTravelled: 0,
          prevLatLng: {},
          coordinate: new AnimatedRegion({
           latitude: LATITUDE,
           longitude: LONGITUDE
          }),
          mapRegion: null,
          hasLocationPermissions: false,
          locationResult: null,
        };
        
      }

      componentDidMount() {
        this.getLocationAsync();
      }

      calcDistance = newLatLng => {
        const { prevLatLng } = this.state;
        return haversine(prevLatLng, newLatLng) || 0;
      };

      getMapRegion = () => ({
        latitude: this.state.latitude,
        longitude: this.state.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      });


      getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
          this.setState({
            locationResult: 'Permission to access location was denied',
          });
        } else {
          this.setState({ hasLocationPermissions: true });
        }
     
        let location = await Location.getCurrentPositionAsync({});
        this.setState({ locationResult: JSON.stringify(location) });
        
         this.setState({mapRegion: { latitude: location.coords.latitude, longitude: location.coords.longitude, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }});
       
         this.watchID = navigator.geolocation.watchPosition(
            position => {
              const { coordinate, routeCoordinates, distanceTravelled } =   this.state;
              const { latitude, longitude } = position.coords;
              
              const newCoordinate = {
                latitude,
                longitude
              };
              if (Platform.OS === "android") {
                if (this.marker) {
                  this.marker._component.animateMarkerToCoordinate(
                    newCoordinate,
                    500
                  );
                 }
               } else {
                 coordinate.timing(newCoordinate).start();
               }
               this.setState({
                 latitude,
                 longitude,
                 routeCoordinates: routeCoordinates.concat([newCoordinate]),
                 distanceTravelled:
                 distanceTravelled + this.calcDistance(newCoordinate),
                 prevLatLng: newCoordinate
               });
             },
             error => console.log(error),
             { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
         )
        };

      render() {
          return (

            <View style={styles.container}>
                {
                this.state.locationResult === null ?
                <Text>Finding your current location...</Text> :
                this.state.hasLocationPermissions === false ?
                    <Text>Location permissions are not granted.</Text> :
                    this.state.mapRegion === null ?
                    <Text>Map region doesn't exist.</Text> :
                    <MapView
                    showUserLocation
                    followUserLocation
                    loadingEnabled
                    initialRegion={this.state.mapRegion}
                    style={{ alignSelf: 'stretch', height: 400 }}
                    >
                        <MapView.Polyline
                        coordinates={this.state.routeCoordinates}
                        strokeWidth={10}
                        strokeColor="#00a8ff"
                        />
                    <MapView.Marker
                    coordinate={{latitude: this.state.latitude,
                        longitude: this.state.longitude,}}
                    title='Current location'
                    description="Banfield"
                    >
                        <Image source={require('./assets/car.png')} style={{height: 40, width:40 }} />
                    </MapView.Marker>
                    </MapView>
                }
{/*             
                <Text>
                Location: {this.state.locationResult}
                </Text> */}

                <View style={styles.buttonContainer}>
                    <Text> Distance </Text>
                <TouchableOpacity style={[styles.bubble, styles.button]}>
                    <Text style={styles.bottomBarContent}>
                    {parseFloat(this.state.distanceTravelled).toFixed(2)} km
                    </Text>
                </TouchableOpacity>
                </View>
            </View>
          );
      }

}
export default LocationTracking;

