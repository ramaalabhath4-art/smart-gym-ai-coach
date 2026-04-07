import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

// Ensure key is 32 bytes for AES-256
const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();

export function encryptPaymentData(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Combine IV and encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptPaymentData(encryptedData: string): string {
  const [ivHex, encrypted] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export function maskCardNumber(cardNumber: string): string {
  return cardNumber.slice(-4).padStart(cardNumber.length, '*');
}

export function getLastFourDigits(cardNumber: string): string {
  return cardNumber.slice(-4);
}
