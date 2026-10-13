import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function HistoryScreen({ navigation }) {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRideHistory();
  }, []);

  const fetchRideHistory = async () => {
    try {
      const userEmail = auth.currentUser?.email;
      if (!userEmail) return;

      const q = query(collection(db, "rideRequests"), where("userEmail", "==", userEmail));
      const querySnapshot = await getDocs(q);
      
      const historyData = [];
      querySnapshot.forEach((doc) => {
        historyData.push({ id: doc.id, ...doc.data() });
      });

      historyData.sort((a, b) => b.timestamp - a.timestamp);
      
      setRides(historyData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching history: ", error);
      setLoading(false);
    }
  };

  const formatSafeDate = (timestamp) => {
    if (!timestamp) return 'Recent';
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return 'Recent';
    return d.toLocaleDateString();
  };

  const renderRideCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.routeContainer}>
        <Text style={styles.dot}>🟢</Text>
        <Text style={styles.locationText} numberOfLines={1}>{item.pickupLocation}</Text>
      </View>
      <View style={styles.routeLine} />
      <View style={styles.routeContainer}>
        <Text style={styles.dot}>📍</Text>
        <Text style={styles.locationText} numberOfLines={1}>{item.dropoffLocation}</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.statusText}>
          {item.status === 'pending_comparison' ? 'Search Logged' : 'Completed'}
        </Text>
        <Text style={styles.dateText}>
          {formatSafeDate(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ride History</Text>
        <View style={styles.spacer} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
      ) : rides.length === 0 ? (
        <Text style={styles.emptyText}>No rides found in your history.</Text>
      ) : (
        <FlatList
          data={rides}
          keyExtractor={(item) => item.id}
          renderItem={renderRideCard}
          contentContainerStyle={styles.listPadding}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  backButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 },
  backButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  title: { color: '#ffffff', fontSize: 24, fontWeight: 'bold' },
  spacer: { width: 60 },
  loader: { marginTop: 50 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 40, fontSize: 16 },
  listPadding: { paddingBottom: 20 },
  
  card: { backgroundColor: 'rgba(28, 28, 30, 0.9)', marginHorizontal: 20, marginBottom: 15, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  routeContainer: { flexDirection: 'row', alignItems: 'center' },
  routeLine: { width: 2, height: 15, backgroundColor: '#444', marginLeft: 10, marginVertical: 2 },
  dot: { fontSize: 16, marginRight: 15 },
  locationText: { color: '#ffffff', fontSize: 16, flex: 1, fontWeight: '500' },
  
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  statusText: { color: '#4A90E2', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 },
  dateText: { color: '#888', fontSize: 12 }
});