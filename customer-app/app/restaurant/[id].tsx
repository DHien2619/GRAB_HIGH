import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FOOD_API_URL, COLORS } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../src/context/CartContext';

interface Food {
  food_id: number;
  food_name: string;
  price: number;
  image_url: string;
  description: string;
}

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [foods, setFoods] = useState<Food[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      const [resInfo, resFoods] = await Promise.all([
        fetch(`${FOOD_API_URL}/api/restaurants/${id}`),
        fetch(`${FOOD_API_URL}/api/restaurants/${id}/foods`)
      ]);
      const dataInfo = await resInfo.json();
      const dataFoods = await resFoods.json();
      
      if (dataInfo.success) setRestaurant(dataInfo.data);
      if (dataFoods.success) setFoods(dataFoods.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (food: Food) => {
    addItem({ 
      food_id: food.food_id,
      name: food.food_name, 
      price: food.price, 
      quantity: 1, 
      image_url: food.image_url 
    }, Number(id), restaurant.name);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;
  if (!restaurant) return <View style={styles.center}><Text>Không tìm thấy nhà hàng</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Image source={{ uri: restaurant.image_url }} style={styles.headerImage} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.address}>{restaurant.address}</Text>
        </View>
      </View>

      <FlatList
        data={foods}
        keyExtractor={item => item.food_id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.foodCard}>
            <Image source={{ uri: item.image_url }} style={styles.foodImage} />
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.food_name}</Text>
              <Text style={styles.foodDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.foodBottom}>
                <Text style={styles.price}>{(item.price / 1000)}k</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
                  <Ionicons name="add" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.white, paddingBottom: 16 },
  backButton: { position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)', padding: 8, borderRadius: 20 },
  headerImage: { width: '100%', height: 200, resizeMode: 'cover' },
  headerInfo: { padding: 16 },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  address: { fontSize: 14, color: COLORS.textSecondary },
  list: { padding: 16, gap: 16 },
  foodCard: { flexDirection: 'row', backgroundColor: COLORS.white, padding: 12, borderRadius: 16, elevation: 1 },
  foodImage: { width: 100, height: 100, borderRadius: 12 },
  foodInfo: { flex: 1, marginLeft: 12 },
  foodName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  foodDesc: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  foodBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  price: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  addButton: { backgroundColor: COLORS.primary, padding: 6, borderRadius: 12 },
});
