import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useCart } from '../../src/context/CartContext';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, FOOD_API_URL } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const { items, restaurantId, restaurantName, updateQty, removeItem, clearCart, totalPrice } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) return;
    if (items.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        restaurant_id: restaurantId,
        user_name: user.full_name,
        user_phone: user.phone_number,
        delivery_address: 'Tòa nhà FastDeli, 123 Đường XYZ', // Fake address for demo
        delivery_latitude: 21.028511, // Fake loc
        delivery_longitude: 105.804817,
        payment_method: 'cash',
        order_items: items.map(i => ({
          food_id: i.food_id,
          food_name: i.name,
          food_price: i.price,
          quantity: i.quantity
        }))
      };

      const res = await fetch(`${FOOD_API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      const result = await res.json();
      if (result.success) {
        Alert.alert('Thành công', 'Đặt hàng thành công!');
        clearCart();
        router.push('/(tabs)/orders');
      } else {
        throw new Error(result.message || 'Lỗi đặt hàng');
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="cart-outline" size={64} color={COLORS.textLight} />
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
        <TouchableOpacity style={styles.goHomeBtn} onPress={() => router.push('/(tabs)')}>
          <Text style={styles.goHomeText}>Khám phá món ngon</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.restaurantName}>Nhà hàng: {restaurantName}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={i => i.food_id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>{(item.price * item.quantity / 1000)}k</Text>
            </View>
            <View style={styles.qtyAction}>
              <TouchableOpacity style={styles.btnAction} onPress={() => updateQty(item.food_id, item.quantity - 1)}>
                <Ionicons name="remove" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <TouchableOpacity style={styles.btnAction} onPress={() => updateQty(item.food_id, item.quantity + 1)}>
                <Ionicons name="add" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tổng cộng</Text>
          <Text style={styles.summaryValue}>{(totalPrice / 1000)}k</Text>
        </View>
        <TouchableOpacity 
          style={[styles.checkoutBtn, loading && {opacity: 0.7}]} 
          onPress={handleCheckout} 
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.checkoutText}>Đặt hàng ngay</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: COLORS.textSecondary, marginTop: 16, marginBottom: 24 },
  goHomeBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 24 },
  goHomeText: { color: COLORS.white, fontWeight: 'bold' },
  header: { padding: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  restaurantName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  list: { padding: 16, gap: 12 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  itemPrice: { fontSize: 14, color: COLORS.primary, marginTop: 4 },
  qtyAction: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  btnAction: { backgroundColor: COLORS.primaryLight, padding: 4, borderRadius: 8 },
  qtyText: { fontSize: 16, fontWeight: 'bold' },
  footer: { padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  summaryLabel: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  checkoutBtn: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center' },
  checkoutText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
});
