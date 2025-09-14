import { useEffect } from 'react';

// Diagnostic component to check photo functionality
export function PhotoDiagnostics() {
  useEffect(() => {
    console.log('📸 Photo Diagnostics Starting...');
    
    // Check if expo-image-picker is available
    try {
      const ImagePicker = require('expo-image-picker');
      console.log('✅ expo-image-picker module loaded');
      
      // Check if native functions are available
      if (typeof ImagePicker.requestCameraPermissionsAsync === 'function') {
        console.log('✅ Camera permission function available');
      } else {
        console.log('❌ Camera permission function NOT available');
      }
      
      if (typeof ImagePicker.requestMediaLibraryPermissionsAsync === 'function') {
        console.log('✅ Media library permission function available');
      } else {
        console.log('❌ Media library permission function NOT available');
      }
      
      if (typeof ImagePicker.launchCameraAsync === 'function') {
        console.log('✅ Camera launch function available');
      } else {
        console.log('❌ Camera launch function NOT available');
      }
      
      if (typeof ImagePicker.launchImageLibraryAsync === 'function') {
        console.log('✅ Image library function available');
      } else {
        console.log('❌ Image library function NOT available');
      }
      
      console.log('📸 Photo Diagnostics Complete');
      
    } catch (error) {
      console.log('❌ expo-image-picker module NOT available:', error);
    }
  }, []);
  
  return null; // This component doesn't render anything
}
