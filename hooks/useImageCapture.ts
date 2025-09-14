import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';

// Import ImagePicker with error handling
let ImagePicker: any = null;
let imagePickerAvailable = false;

try {
  ImagePicker = require('expo-image-picker');
  // Additional check to ensure the native module is actually available
  if (ImagePicker && typeof ImagePicker.requestCameraPermissionsAsync === 'function') {
    imagePickerAvailable = true;
    console.log('✅ expo-image-picker loaded successfully');
  } else {
    console.warn('⚠️ expo-image-picker module loaded but native functions not available');
    imagePickerAvailable = false;
  }
} catch (error) {
  console.warn('⚠️ expo-image-picker not available - rebuild required for photo functionality');
  console.warn('Error details:', error);
  imagePickerAvailable = false;
}

export interface CapturedImage {
  uri: string;
  base64: string;
  type: string;
  width: number;
  height: number;
}

export function useImageCapture() {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = useCallback(async () => {
    if (!imagePickerAvailable) {
      Alert.alert(
        'Photo Feature Unavailable',
        'The photo capture feature requires a development build. Please rebuild the app to use this feature.',
        [{ text: 'OK' }]
      );
      return false;
    }

    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please enable camera and photo library permissions to use this feature.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  }, []);

  const captureImage = useCallback(async (fromCamera: boolean = true): Promise<CapturedImage | null> => {
    try {
      setIsLoading(true);

      if (!imagePickerAvailable) {
        Alert.alert(
          'Photo Feature Unavailable',
          'The photo capture feature requires a development build. Please rebuild the app to use this feature.',
          [{ text: 'OK' }]
        );
        return null;
      }

      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const options: any = {
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Reduce quality for faster upload
        base64: true,
      };

      let result: any;

      if (fromCamera) {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      
      if (!asset.base64) {
        Alert.alert('Error', 'Failed to process image. Please try again.');
        return null;
      }

      // Determine MIME type
      const mimeType = asset.type === 'video' ? 'video/mp4' : 'image/jpeg';

      return {
        uri: asset.uri,
        base64: asset.base64,
        type: mimeType,
        width: asset.width || 0,
        height: asset.height || 0,
      };

    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [requestPermissions]);

  const selectImageFromLibrary = useCallback(() => captureImage(false), [captureImage]);
  const takePhoto = useCallback(() => captureImage(true), [captureImage]);

  return {
    takePhoto,
    selectImageFromLibrary,
    isLoading,
    isAvailable: imagePickerAvailable,
  };
}
