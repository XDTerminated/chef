// Recipe image utility for mapping image names to asset requires
// Since React Native requires static asset imports, we use a pre-generated mapping

import { ImageSourcePropType } from 'react-native';
import { defaultRecipeImage, recipeImageMap } from './recipe-image-map';

/**
 * Get a recipe image by name
 * @param imageName - The name of the image (without extension)
 * @returns The required image asset or a default placeholder
 */
export function getRecipeImage(imageName: string): ImageSourcePropType {
  if (!imageName) {
    return defaultRecipeImage;
  }
  
  // Try to find the exact image in our static mapping
  if (recipeImageMap[imageName]) {
    return recipeImageMap[imageName];
  }
  
  // If the specific image doesn't exist, use a deterministic fallback
  // This ensures the same recipe always gets the same fallback image
  const hash = imageName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const imageNames = Object.keys(recipeImageMap);
  const fallbackIndex = hash % imageNames.length;
  
  return recipeImageMap[imageNames[fallbackIndex]] || defaultRecipeImage;
}
