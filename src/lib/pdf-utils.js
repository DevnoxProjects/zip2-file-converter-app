import { PDFDocument, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const PAGE_SIZES = {
  original: null,
  A4: PageSizes.A4,
  Letter: PageSizes.Letter,
  Legal: [612, 1008], // Letter size width, 14 inch height
  A3: PageSizes.A3,
  A5: PageSizes.A5,
  Tabloid: [792, 1224]
};

const UNITS = {
  mm: 72 / 25.4,
  cm: 72 / 2.54,
  in: 72,
  px: 1 // Assuming 72 DPI for PDF points
};

export function convertToPoints(value, unit) {
  return parseFloat(value) * (UNITS[unit] || 1);
}

function getTargetSize(options) {
  if (options.pageSize === 'custom' && options.customSize) {
    const { width, height, unit } = options.customSize;
    return [convertToPoints(width, unit), convertToPoints(height, unit)];
  }
  return PAGE_SIZES[options.pageSize];
}

async function resizePage(page, targetSize) {
  if (!targetSize) return;
  
  const [targetWidth, targetHeight] = targetSize;
  const { width: origWidth, height: origHeight } = page.getSize();
  
  // Scale content to fit the target size while maintaining aspect ratio
  const scale = Math.min(targetWidth / origWidth, targetHeight / origHeight);
  
  const xOffset = (targetWidth - origWidth * scale) / 2;
  const yOffset = (targetHeight - origHeight * scale) / 2;

  page.setSize(targetWidth, targetHeight);
  page.scaleContent(scale, scale);
  page.translateContent(xOffset, yOffset);
}

export async function generatePlaceholderPdf(text) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  page.drawText(text, { x: 50, y: 350, size: 30 });
  page.drawText("This is a simulated conversion output from Zip2.", { x: 50, y: 300, size: 15 });
  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
}

export async function mergePdfs(files, options = {}) {
  const { pageSize, compression, rotations, onProgress } = options;
  const targetSize = getTargetSize(options);
  
  if (onProgress) onProgress(2);
  const mergedPdf = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rotation = rotations ? (rotations[i] || 0) : 0;
    let pdf;
    
    if (file.type.startsWith('image/')) {
      // Automatic conversion: Image to PDF
      const imgBytes = await file.arrayBuffer();
      const imgPdf = await PDFDocument.create();
      let image;
      
      try {
        if (file.type === 'image/png') {
          image = await imgPdf.embedPng(imgBytes);
        } else {
          image = await imgPdf.embedJpg(imgBytes);
        }
        
        const size = targetSize || [image.width, image.height];
        const page = imgPdf.addPage(size);
        const scale = Math.min(size[0] / image.width, size[1] / image.height);
        const x = (size[0] - image.width * scale) / 2;
        const y = (size[1] - image.height * scale) / 2;
        
        page.drawImage(image, {
          x, y,
          width: image.width * scale,
          height: image.height * scale,
          rotate: { type: 'degrees', angle: rotation }
        });
        pdf = imgPdf;
      } catch (e) {
        console.warn('Failed to embed image in merge:', e);
        continue;
      }
    } else {
      try {
        const bytes = await file.arrayBuffer();
        pdf = await PDFDocument.load(bytes);
      } catch (e) {
        console.error(`Failed to load PDF file ${file.name}:`, e);
        continue; // Skip this file if it's invalid
      }
    }

    if (pdf) {
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      for (const page of copiedPages) {
        if (rotation !== 0) {
          const currentRotation = page.getRotation().angle;
          page.setRotation({ angle: (currentRotation + rotation) % 360 });
        }
        if (targetSize) {
          await resizePage(page, targetSize);
        }
        mergedPdf.addPage(page);
      }
    }
    if (onProgress) onProgress(2 + (i / files.length) * 8);
  }

  // Basic object compression by default
  const bytes = await mergedPdf.save({ 
    useObjectStreams: true,
    addDefaultPage: false,
    updateMetadata: false
  });
  
  const mergedBlob = new Blob([bytes], { type: 'application/pdf' });
  
  // If compression is requested for the merged output
  if (compression?.enabled) {
    console.log(`Zip2: Initial merge completed at ${(mergedBlob.size/1024/1024).toFixed(2)}MB. Starting precision compression...`);
    // Pass page count to help with dynamic reserve estimation
    return await compressPdf(mergedBlob, { 
      compression, 
      pageCount: mergedPdf.getPageCount(),
      onProgress: (p) => {
        if (onProgress) onProgress(10 + (p * 0.9));
      } 
    });
  }
  
  if (onProgress) onProgress(100);
  return mergedBlob;
}

async function renderPdfToImages(file, scale = 1.5, quality = 0.8) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    images.push(canvas.toDataURL('image/jpeg', quality));
  }
  return images;
}

export async function compressPdf(file, options = {}) {
  const { compression, onProgress, pageCount = 1, isRecursive = false } = options;
  const userTargetMB = compression?.targetSize || 2;
  
  // 1. SAFETY MARGIN: Aim for 97.5% of target to account for structural container bloat
  const internalTargetMB = userTargetMB * (isRecursive ? 0.95 : 0.975);
  const originalSizeMB = file.size / (1024 * 1024);
  
  if (onProgress && !isRecursive) onProgress(5);

  // 2. QUICK EXIT: If already fine (Tightened for strict ceiling)
  if (originalSizeMB <= internalTargetMB * 1.001) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const optimizedBytes = await pdf.save({ useObjectStreams: true });
    if (onProgress && !isRecursive) onProgress(100);
    return new Blob([optimizedBytes], { type: 'application/pdf' });
  }

  // 3. EXTREME FALLBACK: Render to Image
  if (internalTargetMB < 0.6 && originalSizeMB > 2.5) {
    console.log('Zip2 Engine: Activating Extreme Lossy Mode (Render-to-Image)');
    try {
      const scale = 1.25;
      const quality = Math.max(0.4, Math.min(0.8, internalTargetMB / originalSizeMB * 1.5));
      const images = await renderPdfToImages(file, scale, quality);
      const pdfDoc = await PDFDocument.create();
      for (let i = 0; i < images.length; i++) {
        const dataUrl = images[i];
        const imgBytes = await fetch(dataUrl).then(res => res.arrayBuffer());
        const image = await pdfDoc.embedJpg(imgBytes);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        if (onProgress) onProgress(10 + (i / images.length) * 80);
      }
      if (onProgress) onProgress(100);
      return new Blob([await pdfDoc.save({ useObjectStreams: true })], { type: 'application/pdf' });
    } catch (e) {
      console.warn('Aggressive compression failed, falling back to structural:', e);
    }
  }

  if (onProgress) onProgress(15);

  // 4. STRUCTURAL COMPRESSION with CLEAN-ROOM Reconstruction
  const bytes = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(bytes);
  
  const objects = srcPdf.context.enumerateIndirectObjects();
  let totalImageBytes = 0;
  const imageObjects = [];

  for (const [ref, obj] of objects) {
    if (obj.dict && obj.contents) {
      const subtype = obj.dict.get(srcPdf.context.obj('Subtype'));
      if (subtype?.toString() === '/Image') {
        imageObjects.push(obj);
        totalImageBytes += obj.contents.length;
      }
    }
  }

  if (imageObjects.length > 0) {
    const nonImageBytes = bytes.byteLength - totalImageBytes;
    const targetBytes = internalTargetMB * 1024 * 1024;
    
    // 5. ENHANCED STRUCTURAL RESERVE (Zip2 Adaptive)
    // Account for PDF structural overhead: Fixed base + Per-page cost + Safety percentage
    const structuralBaseBytes = 20 * 1024; // Base header/metadata
    const perPageCost = 8 * 1024; // Page dicts, XRef entries
    const safetyBufferRatio = 0.012; // 1.2% safety margin for unexpected bloat
    
    const estimatedStructuralBytes = structuralBaseBytes + (pageCount * perPageCost) + (targetBytes * safetyBufferRatio);
    const availableImageBytes = Math.max(targetBytes - nonImageBytes - estimatedStructuralBytes, targetBytes * 0.3);
    const idealImageRatio = Math.min(1, availableImageBytes / totalImageBytes);
    
    // Safety floor for ratio
    const imageRatio = Math.max(0.04, idealImageRatio);
    
    console.log(`ZIP2 Governor Inspection (${(userTargetMB).toFixed(1)}MB Target):
      Original: ${originalSizeMB.toFixed(2)}MB
      Internal Target: ${internalTargetMB.toFixed(2)}MB
      Structure Estimate: ${(estimatedStructuralBytes/1024).toFixed(1)}KB
      Ideal Img Ratio: ${idealImageRatio.toFixed(3)}
      Final Img Ratio: ${imageRatio.toFixed(3)}
    `);

    let compressedCount = 0;
    if (imageRatio < 0.985) {
      for (let i = 0; i < imageObjects.length; i++) {
        const obj = imageObjects[i];
        const dict = obj.dict;
        const filter = dict.get(srcPdf.context.obj('Filter'));

        if (filter?.toString() === '/DCTDecode' || !filter) {
          const originalBytes = obj.contents;
          if (originalBytes.length > 15000) { 
            try {
              const imgBudgetMB = (originalBytes.length / (1024 * 1024)) * imageRatio;
              const compressedBlob = await compressImage(
                new Blob([originalBytes], { type: 'image/jpeg' }), 
                imgBudgetMB 
              );
              const compressedBytes = new Uint8Array(await compressedBlob.arrayBuffer());
              
              if (compressedBytes.length < originalBytes.length) {
                obj.contents = compressedBytes;
                dict.set(srcPdf.context.obj('Filter'), srcPdf.context.obj('DCTDecode'));
                dict.set(srcPdf.context.obj('Length'), srcPdf.context.obj(compressedBytes.length));
                dict.set(srcPdf.context.obj('ColorSpace'), srcPdf.context.obj('DeviceRGB'));
                compressedCount++;
              }
            } catch (e) {
              console.warn('Failed to compress internal image:', e);
            }
          }
        }
        if (onProgress) onProgress(20 + (i / imageObjects.length) * 70);
      }
    }
    console.log(`Optimization Complete: ${compressedCount} images processed.`);
  }

  if (onProgress) onProgress(95);

  // 4. GARBAGE COLLECTION: Clean-Room Document Reconstruction
  const finalPdf = await PDFDocument.create();
  const pages = await finalPdf.copyPages(srcPdf, srcPdf.getPageIndices());
  pages.forEach(p => finalPdf.addPage(p));

  // 5. STRIP METADATA
  finalPdf.setTitle('');
  finalPdf.setAuthor('');
  finalPdf.setSubject('');
  finalPdf.setCreator('');
  finalPdf.setKeywords([]);
  finalPdf.setProducer('Zip2 Engine (Privacy-First)');

  const finalBytes = await finalPdf.save({ 
    useObjectStreams: true,
    addDefaultPage: false
  });
  
  const resultBlob = new Blob([finalBytes], { type: 'application/pdf' });
  const resultSizeMB = resultBlob.size / (1024 * 1024);

  // 6. GLOBAL GOVERNOR: Post-Optimization Precision Check
  if (resultSizeMB > userTargetMB && !isRecursive) {
    console.warn(`Zip2 Governor: Result (${resultSizeMB.toFixed(2)}MB) drifted over target (${userTargetMB}MB). Triggering Emergency Shave...`);
    // Pass a 5% reduced target to force compliance
    return await compressPdf(resultBlob, {
      compression: { ...compression, targetSize: userTargetMB * 0.95 },
      pageCount,
      onProgress: null,
      isRecursive: true
    });
  }

  return resultBlob;
}

async function compressImage(file, targetSizeMB) {
  const targetBytes = targetSizeMB * 1024 * 1024;
  const originalSize = file.size;
  
  if (originalSize <= targetBytes * 1.05) return file;

  // Binary Search Implementation (10 iterations for ~0.1% precision)
  let low = 0.05;
  let high = 1.0;
  let bestBlob = null;
  let iterations = 0;
  
  // Very generous base resolution to avoid artificial ceilings
  let baseMaxDim = 3840; 
  if (targetSizeMB < 0.05) baseMaxDim = 1200;
  else if (targetSizeMB < 0.15) baseMaxDim = 1800;
  else if (targetSizeMB < 0.4) baseMaxDim = 2400;

  while (iterations < 10) {
    const quality = (low + high) / 2;
    // Fractional DPI Scaling: Link resolution to quality but keep it high
    const dimMultiplier = 0.8 + (quality * 0.2); 
    const currentMaxDim = baseMaxDim * dimMultiplier;

    const blob = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          if (width > currentMaxDim || height > currentMaxDim) {
            const scale = Math.min(currentMaxDim / width, currentMaxDim / height);
            width *= scale;
            height *= scale;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    iterations++;

    if (blob.size > targetBytes) {
      high = quality;
      // Even if too big, we keep it as a potential "just over" candidate if we find nothing better
      if (!bestBlob) bestBlob = blob;
    } else {
      low = quality;
      bestBlob = blob;
      // Ultra-Precision Fill-to-Target Gate: 99.2% efficiency
      if (blob.size > targetBytes * 0.992) {
        console.log(`Zip2 Engine: Near-Perfect Convergence at ${(blob.size / targetBytes * 100).toFixed(2)}% of budget.`);
        break;
      }
    }
  }
  
  return bestBlob || await new Promise(r => {
    // Ultimate fallback: return smallest possible version
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width / 4;
        canvas.height = img.height / 4;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(r, 'image/jpeg', 0.1);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

export async function rotatePdfs(files, options = {}) {
  const { compression, rotations } = options;
  const targetSize = getTargetSize(options);
  
  const mergedPdf = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rotation = rotations ? (rotations[i] || 0) : 0;
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    
    for (const page of copiedPages) {
      const currentRotation = page.getRotation().angle;
      // If manual rotations were set, we respect them.
      // Otherwise, we default to 90deg for the Global Rotate tool.
      const hasManualRotations = rotations && rotations.some(r => r !== 0);
      const finalRotation = hasManualRotations ? (currentRotation + rotation) % 360 : (currentRotation + 90) % 360;
      
      page.setRotation({ angle: finalRotation });
      
      if (targetSize) {
        await resizePage(page, targetSize);
      }
      mergedPdf.addPage(page);
    }
  }
  const bytes = await mergedPdf.save({
    useObjectStreams: true,
    addDefaultPage: false,
    updateMetadata: false
  });

  const finalBlob = new Blob([bytes], { type: 'application/pdf' });

  if (compression?.enabled) {
    return await compressPdf(finalBlob, { compression, pageCount: files.length });
  }

  return finalBlob;
}

export async function jpgToPdf(files, options = {}) {
  const { compression, rotations } = options;
  const targetSize = getTargetSize(options);
  
  const pdfDoc = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rotation = rotations ? (rotations[i] || 0) : 0;
    let imageBytes;
    if (compression?.enabled) {
      // Functional compression by re-encoding images
      const compressedBlob = await compressImage(file, compression.targetSize / files.length);
      imageBytes = await compressedBlob.arrayBuffer();
    } else {
      imageBytes = await file.arrayBuffer();
    }

    let image;
    // Since we re-encoded to JPEG in compressImage, we can use embedJpg
    if (compression?.enabled || file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdfDoc.embedJpg(imageBytes);
    } else if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(imageBytes);
    } else {
      continue;
    }
    
    const size = targetSize || [image.width, image.height];
    const page = pdfDoc.addPage(size);
    
    const scale = Math.min(size[0] / image.width, size[1] / image.height);
    const x = (size[0] - image.width * scale) / 2;
    const y = (size[1] - image.height * scale) / 2;

    page.drawImage(image, {
      x,
      y,
      width: image.width * scale,
      height: image.height * scale,
      rotate: { type: 'degrees', angle: rotation }
    });
  }
  const bytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    updateMetadata: false
  });
  const finalBlob = new Blob([bytes], { type: 'application/pdf' });

  if (compression?.enabled) {
    return await compressPdf(finalBlob, { compression, pageCount: files.length });
  }

  return finalBlob;
}

export async function protectPdf(file, password) {
  if (!password) throw new Error('Password is required');
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const encryptedBytes = await pdf.save({
    userPassword: password,
    ownerPassword: password,
  });
  return new Blob([encryptedBytes], { type: 'application/pdf' });
}

export async function unlockPdf(file, password) {
  if (!password) throw new Error('Password is required');
  const bytes = await file.arrayBuffer();
  try {
    const pdf = await PDFDocument.load(bytes, { password });
    const decryptedBytes = await pdf.save();
    return new Blob([decryptedBytes], { type: 'application/pdf' });
  } catch (e) {
    throw new Error('Incorrect password');
  }
}

export async function removePages(file, pageNum) {
  if (!pageNum) throw new Error('Page number is required');
  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const index = parseInt(pageNum) - 1;
  if (index < 0 || index >= pdf.getPageCount()) throw new Error('Invalid page number');
  pdf.removePage(index);
  const resultBytes = await pdf.save();
  return new Blob([resultBytes], { type: 'application/pdf' });
}

import JSZip from 'jszip';

export async function pdfToJpg(files, options = {}) {
  const { onProgress } = options;
  const zip = new JSZip();
  let totalProcessed = 0;
  
  // Total pages calculation for progress
  let totalPages = 0;
  const pdfData = [];
  
  if (onProgress) onProgress(5);
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    totalPages += pdf.numPages;
    pdfData.push({ pdf, fileName: file.name.replace(/\.[^/.]+$/, "") });
  }

  for (let i = 0; i < pdfData.length; i++) {
    const { pdf, fileName } = pdfData[i];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // High quality
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const base64Data = imgData.split(',')[1];
      
      const name = pdfData.length > 1 || pdf.numPages > 1 
        ? `${fileName}_page_${pageNum}.jpg` 
        : `${fileName}.jpg`;
        
      zip.file(name, base64Data, { base64: true });
      
      totalProcessed++;
      if (onProgress) {
        onProgress(10 + (totalProcessed / totalPages) * 80);
      }
    }
  }

  if (onProgress) onProgress(95);
  
  // If only one page total across all files, just return that JPG blob
  if (totalProcessed === 1) {
    const zipFiles = zip.file(/.*\.jpg$/);
    const content = await zipFiles[0].async('blob');
    if (onProgress) onProgress(100);
    // Explicitly set the type to image/jpeg
    return new Blob([content], { type: 'image/jpeg' });
  }

  const content = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
  if (onProgress) onProgress(100);
  return content;
}

export async function splitPdfToPages(file) {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);
  const pages = [];
  const fileName = file.name.replace(/\.[^/.]+$/, "");

  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
    newPdf.addPage(copiedPage);
    const pdfBytes = await newPdf.save();
    pages.push(new File([pdfBytes], `${fileName}_page_${i + 1}.pdf`, { type: 'application/pdf' }));
  }
  return pages;
}

export async function splitPdf(files, options = {}) {
  const { onProgress, rotations } = options;
  const zip = new JSZip();
  
  if (onProgress) onProgress(5);
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const rotation = rotations ? (rotations[i] || 0) : 0;
    
    // Page files are already split by ToolInterface when shouldSplitPdf is true
    let pdfBytes;
    if (rotation !== 0) {
      try {
        const bytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(bytes);
        const page = pdfDoc.getPages()[0];
        if (page) {
          const currentRotation = page.getRotation().angle;
          page.setRotation({ angle: (currentRotation + rotation) % 360 });
        }
        pdfBytes = await pdfDoc.save();
      } catch (err) {
        console.warn(`Failed to rotate page ${i + 1} during split:`, err);
        pdfBytes = await file.arrayBuffer();
      }
    } else {
      pdfBytes = await file.arrayBuffer();
    }
    
    zip.file(file.name, pdfBytes);
    
    if (onProgress) {
      onProgress(5 + ((i + 1) / files.length) * 90);
    }
  }

  const content = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
  if (onProgress) onProgress(100);
  return content;
}

export async function organizePdf(files, options = {}) {
  return await mergePdfs(files, options);
}

export async function generateThumbnail(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.6);
  } catch (e) {
    console.error('Thumbnail generation failed:', e);
    return null;
  }
}

export async function summarizePdf(file) {
  await new Promise(r => setTimeout(r, 3000));
  return generatePlaceholderPdf("AI Summary: This is a highly intelligent summary of your document. It covers the core points efficiently.");
}
