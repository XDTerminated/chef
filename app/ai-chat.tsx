import { useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import AIChat from '../components/AIChat';

export default function AIChatScreen() {
  const router = useRouter();

  const handleClose = () => {
    console.log('Back button pressed - navigating back to main app');
    // Navigate back to the main app tabs - use replace to ensure we go to discovery
    router.replace('/(tabs)/discovery');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AIChat onClose={handleClose} isFullScreen={true} showBackButton={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});