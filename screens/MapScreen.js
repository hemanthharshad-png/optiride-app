import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform, StatusBar, Alert, Animated, PanResponder, Modal, TextInput, ScrollView } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = height * 0.55;
const SHEET_MIN_HEIGHT = height * 0.15;
const TRANSLATE_HIDDEN = SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT;

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#0A0A12" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#888888" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0A0A12" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#1D1240" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#a3a3a3" }] }, 
  { featureType: "poi.medical", stylers: [{ visibility: "on" }] }, 
  { featureType: "transit", stylers: [{ visibility: "on" }] }, 
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1A1A24" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#222230" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2E2E48" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#1D1240" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#05050A" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#5944FF" }] }
];

export default function MapScreen() {
  const mapRef = useRef(null);
  const [isSatellite, setIsSatellite] = useState(false);
  const [location, setLocation] = useState(null);
  
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [destinationText, setDestinationText] = useState("");
  const [selectedRide, setSelectedRide] = useState(null);

  const translateY = useRef(new Animated.Value(TRANSLATE_HIDDEN)).current;

  const expandSheet = () => {
    Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
  };

  const collapseSheet = () => {
    Animated.spring(translateY, { toValue: TRANSLATE_HIDDEN, useNativeDriver: true, bounciness: 4 }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) collapseSheet(); 
        else if (gestureState.dy < -50) expandSheet();
      },
    })
  ).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location access to find rides near you.');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      
      mapRef.current?.animateToRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    })();
  }, []);

  const recenterMap = async () => {
    let loc = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const handleSelectDestination = (placeName) => {
    setDestinationText(placeName);
    setIsSearchActive(false); 
    expandSheet(); 
  };

  const clearDestination = () => {
    setDestinationText("");
    setSelectedRide(null);
    collapseSheet();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />

      <MapView 
        ref={mapRef}
        style={styles.map} 
        provider={PROVIDER_GOOGLE}
        customMapStyle={darkMapStyle}
        mapType={isSatellite ? "hybrid" : "standard"}
        showsUserLocation={true}
        showsMyLocationButton={false} 
        showsCompass={false}
        showsToolbar={false}
        mapPadding={{ top: 120, right: 20, bottom: SHEET_MIN_HEIGHT + 20, left: 20 }} 
      />

      <View style={styles.safeArea}>
        <View style={styles.headerRow}>
          
          <TouchableOpacity style={styles.profileButton}>
            <BlurView intensity={20} tint="dark" style={styles.profileGlass}>
              <Text style={styles.profileInitial}>H</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchContainer} activeOpacity={0.8} onPress={() => setIsSearchActive(true)}>
            <BlurView intensity={20} tint="dark" style={styles.searchGlass}>
              <View style={styles.searchInner}>
                <View style={styles.pulseDot} />
                <Text style={styles.searchText}>
                  {destinationText ? destinationText : "Where to, Hemanth?"}
                </Text>
                <Ionicons name="search" size={18} color="#888" style={styles.searchIcon} />
              </View>
            </BlurView>
          </TouchableOpacity>

        </View>
      </View>

      <View style={styles.bottomControls}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setIsSatellite(!isSatellite)}>
          <BlurView intensity={20} tint="dark" style={styles.actionGlass}>
            <Ionicons name={isSatellite ? "map" : "earth"} size={22} color="#ffffff" />
          </BlurView>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={recenterMap}>
          <BlurView intensity={20} tint="dark" style={styles.actionGlass}>
            <Ionicons name="navigate" size={24} color="#5944FF" />
          </BlurView>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.customSheet, { transform: [{ translateY }] }]}>
        <View style={styles.dragZone} {...panResponder.panHandlers}>
          <View style={styles.sheetHandle} />
        </View>
        
        {destinationText ? (
          <View style={{flex: 1}}>
            <View style={styles.routeHeaderRow}>
              <View>
                <Text style={styles.sheetTitle}>Available Rides</Text>
                <Text style={styles.routeSubText}>12.4 km • ~28 mins to destination</Text>
              </View>
              <TouchableOpacity onPress={clearDestination} style={styles.clearDestBtn}>
                <Ionicons name="close" size={18} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.ridesList}>
              <TouchableOpacity style={[styles.rideCard, selectedRide === 'yatri' && styles.rideCardSelected]} onPress={() => setSelectedRide('yatri')}>
                <View style={styles.providerLogoBox}><Ionicons name="car-sport" size={22} color="#00E676" /></View>
                <View style={styles.rideInfo}>
                  <View style={styles.rideNameRow}>
                    <Text style={styles.rideProviderName}>Namma Yatri Auto</Text>
                    <View style={styles.badgeCheapest}><Text style={styles.badgeText}>Cheapest</Text></View>
                  </View>
                  <Text style={styles.rideEta}>2 mins away • No commission</Text>
                </View>
                <Text style={styles.ridePrice}>₹110</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.rideCard, selectedRide === 'ola' && styles.rideCardSelected]} onPress={() => setSelectedRide('ola')}>
                <View style={styles.providerLogoBox}><Ionicons name="car" size={22} color="#FFD600" /></View>
                <View style={styles.rideInfo}>
                  <Text style={styles.rideProviderName}>Ola Mini</Text>
                  <Text style={styles.rideEta}>3 mins away • Hatchback</Text>
                </View>
                  <Text style={styles.ridePrice}>₹140</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.rideCard, selectedRide === 'uber' && styles.rideCardSelected]} onPress={() => setSelectedRide('uber')}>
                <View style={styles.providerLogoBox}><Ionicons name="car" size={22} color="#ffffff" /></View>
                <View style={styles.rideInfo}>
                  <View style={styles.rideNameRow}>
                    <Text style={styles.rideProviderName}>Uber Go</Text>
                    <View style={styles.badgeFastest}><Text style={styles.badgeText}>Fastest</Text></View>
                  </View>
                  <Text style={styles.rideEta}>4 mins away • Top rated</Text>
                </View>
                <Text style={styles.ridePrice}>₹150</Text>
              </TouchableOpacity>
            </ScrollView>

            {selectedRide && (
              <TouchableOpacity style={styles.bookButton} activeOpacity={0.8}>
                <Text style={styles.bookButtonText}>Confirm & Book Ride</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.sheetTitle}>Good afternoon, Hemanth</Text>
            <View style={styles.quickActionRow}>
              <TouchableOpacity style={styles.quickActionButton} onPress={() => setIsSearchActive(true)}>
                <Ionicons name="search" size={20} color="#ffffff" />
                <Text style={styles.quickActionText}>Find Ride</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>

      <Modal visible={isSearchActive} animationType="slide" transparent={false} onRequestClose={() => setIsSearchActive(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsSearchActive(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={28} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Plan your ride</Text>
          </View>

          <View style={styles.inputSection}>
            <View style={styles.timelineContainer}>
              <View style={styles.timelineDotGreen} />
              <View style={styles.timelineLine} />
              <View style={styles.timelineSquarePurple} />
            </View>

            <View style={styles.inputsContainer}>
              <View style={styles.inputWrapperModal}>
                <TextInput style={styles.textInput} value="Current Location" editable={false} placeholderTextColor="#888" />
              </View>

              <View style={[styles.inputWrapperModal, styles.inputWrapperActive]}>
                <TextInput 
                  style={styles.textInputActive}
                  placeholder="Where to?"
                  placeholderTextColor="#888"
                  autoFocus={true}
                  keyboardAppearance="dark"
                  value={destinationText}
                  onChangeText={setDestinationText}
                />
              </View>
            </View>
          </View>

          <View style={styles.suggestionsList}>
            <TouchableOpacity style={styles.suggestedItem} onPress={() => handleSelectDestination('Global Academy of Technology, Rajarajeshwari Nagar')}>
              <View style={styles.suggestedIcon}><Ionicons name="location" size={20} color="#888" /></View>
              <View style={styles.suggestedTextWrap}>
                <Text style={styles.suggestedMain}>Global Academy of Technology</Text>
                <Text style={styles.suggestedSub}>Rajarajeshwari Nagar, Bengaluru</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.suggestedItem} onPress={() => handleSelectDestination('L J Iyengar Bakery, Bengaluru')}>
              <View style={styles.suggestedIcon}><Ionicons name="time" size={20} color="#888" /></View>
              <View style={styles.suggestedTextWrap}>
                <Text style={styles.suggestedMain}>L J Iyengar Bakery</Text>
                <Text style={styles.suggestedSub}>Bengaluru</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A12' },
  map: { width: width, height: height },
  safeArea: { position: 'absolute', top: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50, width: '100%', paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  
  profileButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  profileGlass: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(255, 255, 255, 0.02)', overflow: 'hidden' },
  profileInitial: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },

  searchContainer: { flex: 1, marginLeft: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  searchGlass: { height: 48, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(255, 255, 255, 0.02)', overflow: 'hidden', justifyContent: 'center' },
  searchInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#5944FF', marginRight: 12, shadowColor: '#5944FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 4 },
  searchText: { flex: 1, color: '#ffffff', fontSize: 15, fontWeight: '600' },
  searchIcon: { marginLeft: 10 },

  bottomControls: { position: 'absolute', bottom: SHEET_MIN_HEIGHT + 20, right: 20, alignItems: 'flex-end' },
  actionButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, marginBottom: 12 },
  actionGlass: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(255, 255, 255, 0.02)', overflow: 'hidden' },
  
  customSheet: { position: 'absolute', bottom: 0, width: '100%', height: SHEET_MAX_HEIGHT, backgroundColor: '#0A0A12', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', paddingHorizontal: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.5, shadowRadius: 10 },
  dragZone: { width: '100%', alignItems: 'center', paddingVertical: 15 },
  sheetHandle: { backgroundColor: '#5944FF', width: 40, height: 4, borderRadius: 2 },
  sheetTitle: { color: '#ffffff', fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  
  quickActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  quickActionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.03)' },
  quickActionText: { color: '#ffffff', fontSize: 15, fontWeight: '600', marginLeft: 8 },

  routeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  routeSubText: { color: '#888', fontSize: 13, marginTop: 3 },
  clearDestBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  
  ridesList: { maxHeight: 220 },
  rideCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 12, marginBottom: 10 },
  rideCardSelected: { borderColor: '#5944FF', backgroundColor: 'rgba(89, 68, 255, 0.08)' },
  providerLogoBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rideInfo: { flex: 1 },
  rideNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  rideProviderName: { color: '#fff', fontSize: 15, fontWeight: '700', marginRight: 8 },
  rideEta: { color: '#888', fontSize: 12 },
  ridePrice: { color: '#fff', fontSize: 18, fontWeight: '800' },

  badgeCheapest: { backgroundColor: 'rgba(0, 230, 118, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeFastest: { backgroundColor: 'rgba(89, 68, 255, 0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeText: { color: '#00E676', fontSize: 10, fontWeight: '700' },

  bookButton: { backgroundColor: '#5944FF', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 10, marginBottom: 15 },
  bookButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },

  modalContainer: { flex: 1, backgroundColor: '#0A0A12', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  backBtn: { marginRight: 20 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  inputSection: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 25, marginBottom: 20 },
  timelineContainer: { width: 30, alignItems: 'center', paddingTop: 15 },
  timelineDotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00E676' },
  timelineLine: { width: 2, height: 35, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
  timelineSquarePurple: { width: 8, height: 8, backgroundColor: '#5944FF' },
  inputsContainer: { flex: 1 },
  inputWrapperModal: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, marginBottom: 10, paddingHorizontal: 15, height: 50, justifyContent: 'center' },
  inputWrapperActive: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(89, 68, 255, 0.5)' },
  textInput: { color: '#ffffff', fontSize: 16, fontWeight: '500' },
  textInputActive: { color: '#ffffff', fontSize: 16, fontWeight: '600', height: '100%' },
  suggestionsList: { paddingHorizontal: 20 },
  suggestedItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  suggestedIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  suggestedTextWrap: { flex: 1 },
  suggestedMain: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  suggestedSub: { color: '#888', fontSize: 13 },
});