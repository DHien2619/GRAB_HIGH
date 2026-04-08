import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS } from '../../src/constants/config';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: user.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.full_name) + '&background=16a34a&color=fff' }} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>{user.full_name}</Text>
        <Text style={styles.phone}>{user.phone_number || user.email}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="location-outline" size={24} color={COLORS.text} />
          <Text style={styles.menuText}>Sổ địa chỉ</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="heart-outline" size={24} color={COLORS.text} />
          <Text style={styles.menuText}>Quán yêu thích</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color={COLORS.text} />
          <Text style={styles.menuText}>Cài đặt tài khoản</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color={COLORS.error} />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { alignItems: 'center', padding: 32, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  phone: { fontSize: 16, color: COLORS.textSecondary },
  menu: { marginTop: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuText: { flex: 1, fontSize: 16, color: COLORS.text, marginLeft: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: COLORS.white, marginTop: 16, gap: 8 },
  logoutText: { fontSize: 16, fontWeight: 'bold', color: COLORS.error },
});
