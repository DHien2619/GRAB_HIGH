import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { FOOD_API_URL, COLORS } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';

interface Order {
  id: number;
  order_code: string;
  total_amount: string;
  order_status: string;
  created_at: string;
  restaurant_name?: string;
}

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const prevOrdersRef = useRef<Order[]>([]);

  const fetchOrders = async (silent = false) => {
    if (!user) return;
    try {
      const res = await fetch(`${FOOD_API_URL}/api/orders/user/${user.user_id}`);
      const data = await res.json();
      if (data.success) {
        const newOrders = data.data;
        
        if (silent && prevOrdersRef.current.length > 0) {
          newOrders.forEach((newOrder: Order) => {
            const oldOrder = prevOrdersRef.current.find(o => o.id === newOrder.id);
            if (oldOrder && oldOrder.order_status !== newOrder.order_status) {
              let msg = '';
              if (newOrder.order_status === 'processing') msg = `Nhà hàng đã xác nhận đơn ${newOrder.order_code}!`;
              else if (newOrder.order_status === 'delivering') msg = `Tài xế đang giao đơn ${newOrder.order_code} cho bạn!`;
              else if (newOrder.order_status === 'delivered') msg = `Tài xế đã hoàn thành đơn ${newOrder.order_code}! Cảm ơn bạn.`;
              else if (newOrder.order_status === 'cancelled') msg = `Rất tiếc! Đơn ${newOrder.order_code} đã bị hủy.`;
              if (msg) Alert.alert('Thông báo đơn hàng 🚀', msg);
            }
          });
        }
        
        prevOrdersRef.current = newOrders;
        setOrders(newOrders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders(); // Initial
    const intervalId = setInterval(() => fetchOrders(true), 5000);
    return () => clearInterval(intervalId);
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(false);
  };

  const statusColors: any = {
    pending: COLORS.warning,
    processing: COLORS.secondary,
    delivering: '#3b82f6',
    delivered: COLORS.success,
    cancelled: COLORS.error,
  };

  const statusLabels: any = {
    pending: 'Chờ xác nhận',
    processing: 'Đang nấu',
    delivering: 'Đang giao',
    delivered: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.code}>{item.order_code}</Text>
        <View style={[styles.badge, { backgroundColor: statusColors[item.order_status] || COLORS.textLight }]}>
          <Text style={styles.badgeText}>{statusLabels[item.order_status] || item.order_status}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Ionicons name="storefront-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.restaurant}>{item.restaurant_name || `Đơn hàng #${item.id}`}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.date}>{new Date(item.created_at).toLocaleString('vi-VN')}</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Tổng tiền:</Text>
        <Text style={styles.totalValue}>{(Number(item.total_amount) / 1000)}k</Text>
      </View>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="receipt-outline" size={64} color={COLORS.textLight} />
        <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textSecondary },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 12, elevation: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  code: { fontWeight: 'bold', color: COLORS.text },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  restaurant: { fontSize: 16, fontWeight: '500', color: COLORS.text },
  date: { fontSize: 14, color: COLORS.textSecondary },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: 14, color: COLORS.textSecondary },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
});
