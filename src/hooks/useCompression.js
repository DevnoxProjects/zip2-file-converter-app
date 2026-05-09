import { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { compressPdf } from '../lib/pdf-utils';

export function useCompression() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const compressFile = useCallback(async (file, targetMB) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      if (file.type.startsWith('image/')) {
        // browser-image-compression handles iterative compression internally
        const options = {
          maxSizeMB: targetMB,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          onProgress: (p) => setProgress(p),
        };
        const compressedBlob = await imageCompression(file, options);
        return compressedBlob;
      } 
      
      if (file.type === 'application/pdf') {
        // PDF Iterative Logic (Simulation of Pi7 style)
        // Since pdf-lib is one-pass usually, we attempt to hit the target by adjusting quality
        let result = await compressPdf(file, { compression: { enabled: true, targetSize: targetMB } });
        setProgress(100);
        return result;
      }

      // Fallback for types we don't handle yet (like Video which takes complex setup)
      return file;
    } catch (error) {
      console.error('Compression failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { compressFile, isProcessing, progress };
}
