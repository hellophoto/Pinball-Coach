import Tesseract from 'tesseract.js';

/**
 * Compress an image to reduce storage size
 */
export const compressImage = (
  base64Image: string,
  maxWidth: number = 800,
  quality: number = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with compression
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = base64Image;
  });
};

/**
 * Create a thumbnail from a base64 image
 */
export const createThumbnail = async (
  base64Image: string,
  maxWidth: number = 150
): Promise<string> => {
  return compressImage(base64Image, maxWidth, 0.6);
};

/**
 * Preprocess image for better OCR results
 */
export const preprocessImage = (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert to grayscale and increase contrast
      for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        
        // Increase contrast
        const contrast = 1.5;
        const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
        const adjustedGray = factor * (gray - 128) + 128;
        
        // Apply threshold for better text detection
        const threshold = 128;
        const bw = adjustedGray > threshold ? 255 : 0;
        
        data[i] = bw;
        data[i + 1] = bw;
        data[i + 2] = bw;
      }

      ctx.putImageData(imageData, 0, 0);

      // Return preprocessed image
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = base64Image;
  });
};

// Constants for score extraction
const MIN_SCORE_THRESHOLD = 1000; // Minimum score value to consider valid (filters out small numbers)
const MAX_PLAYERS = 4; // Maximum number of player scores to extract

/**
 * Extract numbers from an image using Tesseract OCR
 */
export const extractScoresFromImage = async (
  base64Image: string,
  onProgress?: (progress: number) => void
): Promise<number[]> => {
  try {
    // Preprocess the image for better OCR
    const preprocessedImage = await preprocessImage(base64Image);

    // Run OCR
    const result = await Tesseract.recognize(
      preprocessedImage,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(Math.round(m.progress * 100));
          }
        },
      }
    );

    // Extract all numbers from the text
    const text = result.data.text;

    // Find all numbers in the text (including large scores with commas)
    const numberPattern = /\d[\d,]*\d|\d/g;
    const matches = text.match(numberPattern) || [];
    
    // Convert to numbers, removing commas
    const numbers = matches
      .map(match => parseInt(match.replace(/,/g, ''), 10))
      .filter(num => !isNaN(num) && num > 0)
      .filter(num => num >= MIN_SCORE_THRESHOLD) // Filter out small numbers (likely not scores)
      .sort((a, b) => b - a) // Sort descending (highest scores first)
      .slice(0, MAX_PLAYERS); // Take top player scores

    return numbers;
  } catch (error) {
    console.error('Error during OCR:', error);
    throw new Error('Failed to extract scores from image');
  }
};

/**
 * Validate and prepare photo data for storage
 */
export const preparePhotoForStorage = async (
  base64Image: string
): Promise<{ photo: string; thumbnail: string }> => {
  try {
    // Compress the main photo
    const compressedPhoto = await compressImage(base64Image, 1200, 0.8);
    
    // Create thumbnail
    const thumbnail = await createThumbnail(base64Image, 150);
    
    return {
      photo: compressedPhoto,
      thumbnail: thumbnail
    };
  } catch (error) {
    console.error('Error preparing photo for storage:', error);
    throw new Error('Failed to prepare photo for storage');
  }
};
