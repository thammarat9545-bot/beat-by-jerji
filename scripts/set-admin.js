/**
 * Script สำหรับตั้งค่าสิทธิ์ Admin ผ่าน Firebase Admin SDK (Custom Claims)
 * วิธีใช้:
 * 1. ดาวน์โหลด Service Account JSON จาก Firebase Console > Project Settings > Service accounts
 * 2. ตั้งชื่อไฟล์ว่า serviceAccountKey.json ไว้ในโฟลเดอร์นี้
 * 3. รัน: node scripts/set-admin.js <USER_EMAIL>
 */

const admin = require('firebase-admin');
const path = require('path');

const targetEmail = process.argv[2];

if (!targetEmail) {
  console.error('กรุณาระบุอีเมลที่ต้องการตั้งค่าเป็น Admin เช่น: node scripts/set-admin.js myemail@gmail.com');
  process.exit(1);
}

try {
  const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  async function grantAdminRole(email) {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
    console.log(`✅ สำเร็จ! กำหนดสิทธิ์ Admin ให้กับ ${email} (UID: ${user.uid}) เรียบร้อยแล้ว`);
    process.exit(0);
  }

  grantAdminRole(targetEmail).catch((err) => {
    console.error('เกิดข้อผิดพลาด:', err.message);
    process.exit(1);
  });
} catch (err) {
  console.log(`ℹ️ [คำแนะนำ] หากต้องการรันสคริปต์นี้ ให้วาง serviceAccountKey.json จาก Firebase Console ไว้ในโฟลเดอร์ scripts/`);
  console.log(`ปัจจุบันระบบรองรับการกำหนด Admin ผ่าน NEXT_PUBLIC_ADMIN_EMAILS ในไฟล์ .env.local อยู่แล้ว`);
}
