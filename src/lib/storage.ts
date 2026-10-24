import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';

/**
 * อัปโหลดไฟล์ไปยัง Firebase Storage
 * @param file ไฟล์ที่ต้องการอัปโหลด
 * @param path โฟลเดอร์ปลายทาง เช่น 'covers', 'previews', 'masters', 'stems'
 * @param onProgress Callback รายงานความคืบหน้า (0-100%)
 */
export async function uploadFileToFirebase(
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  if (!isFirebaseConfigured || !storage) {
    console.warn('Firebase Storage is not configured. Falling back to Object URL for testing.');
    return URL.createObjectURL(file);
  }

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storageRef = ref(storage, `${path}/${timestamp}_${safeName}`);

  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}
