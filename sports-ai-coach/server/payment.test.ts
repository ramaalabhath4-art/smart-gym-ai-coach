import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { encryptPaymentData, decryptPaymentData, maskCardNumber, getLastFourDigits } from './encryption';

describe('Payment Encryption', () => {
  it('should encrypt and decrypt card number correctly', () => {
    const cardNumber = '4532123456789010';
    const encrypted = encryptPaymentData(cardNumber);
    const decrypted = decryptPaymentData(encrypted);
    
    expect(decrypted).toBe(cardNumber);
    expect(encrypted).not.toBe(cardNumber);
  });

  it('should encrypt and decrypt expiry date correctly', () => {
    const expiryDate = '12/26';
    const encrypted = encryptPaymentData(expiryDate);
    const decrypted = decryptPaymentData(encrypted);
    
    expect(decrypted).toBe(expiryDate);
  });

  it('should encrypt and decrypt CVV correctly', () => {
    const cvv = '123';
    const encrypted = encryptPaymentData(cvv);
    const decrypted = decryptPaymentData(encrypted);
    
    expect(decrypted).toBe(cvv);
  });

  it('should mask card number correctly', () => {
    const cardNumber = '4532123456789010';
    const masked = maskCardNumber(cardNumber);
    
    expect(masked).toBe('************9010');
    expect(masked).not.toContain('4532');
    expect(masked.endsWith('9010')).toBe(true);
  });

  it('should extract last four digits correctly', () => {
    const cardNumber = '4532123456789010';
    const lastFour = getLastFourDigits(cardNumber);
    
    expect(lastFour).toBe('9010');
    expect(lastFour.length).toBe(4);
  });

  it('should handle different card number lengths', () => {
    const visa = '4532123456789010'; // 16 digits
    const amex = '378282246310005'; // 15 digits
    
    expect(getLastFourDigits(visa)).toBe('9010');
    expect(getLastFourDigits(amex)).toBe('0005');
  });

  it('should produce different encrypted values for same input', () => {
    const cardNumber = '4532123456789010';
    const encrypted1 = encryptPaymentData(cardNumber);
    const encrypted2 = encryptPaymentData(cardNumber);
    
    // Different IVs should produce different encrypted values
    expect(encrypted1).not.toBe(encrypted2);
    
    // But both should decrypt to the same value
    expect(decryptPaymentData(encrypted1)).toBe(cardNumber);
    expect(decryptPaymentData(encrypted2)).toBe(cardNumber);
  });
});
