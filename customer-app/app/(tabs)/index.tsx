import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { FOOD_API_URL, COLORS } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  image_url: string;
  rating: number;
  total_reviews: number;
  delivery_time_min: number;
  delivery_time_max: number;
  delivery_fee: number;
}

export default function HomeScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchRestaurants = async () => {
    try {
      const res = await fetch(`${FOOD_API_URL}/api/restaurants`);
      const data = await res.json();
      if (data.success) {
        setRestaurants(data.data.restaurants || data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRestaurants();
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/restaurant/${item.id}`)}
    >
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color={COLORS.warning} />
            <Text style={styles.statText}>{item.rating} ({item.total_reviews})</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{item.delivery_time_min}-{item.delivery_time_max}p</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="bicycle-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.statText}>{item.delivery_fee / 1000}k</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Giao đến</Text>
        <Text style={styles.location}>Vị trí hiện tại của bạn ▼</Text>
      </View>
      
      <FlatList
        data={restaurants}
        keyExtractor={item => item.id.toString()}
        renderItem={renderRestaurant}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={() => (
          <Text style={styles.sectionTitle}>Quán ngon gần bạn</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  greeting: { fontSize: 14, color: COLORS.textSecondary },
  location: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
  list: { padding: 16, gap: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: COLORS.text },
  card: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  image: { width: '100%', height: 160, resizeMode: 'cover' },
  info: { padding: 16 },
  name: { fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: COLORS.text },
  address: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
  stats: { flexDirection: 'row', gap: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
});
