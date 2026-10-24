/**
 * PromptPay EMVCo QR Code Payload Generator (Bank of Thailand Standard)
 * สร้าง Payload สำหรับสแกนจ่ายเงินผ่าน Mobile Banking ทุกธนาคารในไทย
 */

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  const hex = crc.toString(16).toUpperCase();
  return hex.padStart(4, '0');
}

function formatTag(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

export function formatPromptPayTarget(target: string): string {
  const clean = target.replace(/[^0-9]/g, '');
  if (clean.length === 10 && clean.startsWith('0')) {
    // หมายเลขโทรศัพท์: แปลงเป็นรูปแบบสากล 0066 + 9 หลักหลัง
    return `0066${clean.substring(1)}`;
  }
  // หมายเลขบัตรประชาชน / เลขประจำตัวผู้เสียภาษี (13 หลัก)
  return clean;
}

export function generatePromptPayPayload(target: string, amount?: number): string {
  const formattedTarget = formatPromptPayTarget(target);
  const targetTag = formattedTarget.length === 13 ? '02' : '01'; // 01 สำหรับเบอร์โทร, 02 สำหรับบัตร ปชช.

  // Sub-tags สำหรับ Merchant Information (Tag 29: PromptPay AID)
  const aid = formatTag('00', 'A000000677010111');
  const merchantTarget = formatTag(targetTag, formattedTarget);
  const merchantInfo = formatTag('29', `${aid}${merchantTarget}`);

  let payload = '';
  payload += formatTag('00', '01'); // Payload Format Indicator
  payload += formatTag('01', amount ? '12' : '11'); // 12 = Dynamic QR (ระบุจำนวนเงิน), 11 = Static QR
  payload += merchantInfo;
  payload += formatTag('53', '764'); // สกุลเงินบาท THB (ISO 4217)

  if (amount !== undefined && amount > 0) {
    payload += formatTag('54', amount.toFixed(2)); // จำนวนเงิน เช่น 1490.00
  }

  payload += formatTag('58', 'TH'); // Country Code

  // Tag 63: Checksum
  payload += '6304';
  const checksum = crc16(payload);

  return `${payload}${checksum}`;
}
