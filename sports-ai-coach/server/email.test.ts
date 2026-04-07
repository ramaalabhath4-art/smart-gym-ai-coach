import { describe, it, expect, vi } from 'vitest';
import { sendPaymentNotificationEmail, sendPaymentReceiptEmail, sendPaymentErrorEmail } from './email';

describe('Email Notifications', () => {
  vi.setConfig({ testTimeout: 10000 });
  it('should send payment saved notification', async () => {
    const result = await sendPaymentNotificationEmail({
      cardholderName: 'John Doe',
      lastFourDigits: '1234',
      expiryDate: '12/26',
      action: 'saved',
      timestamp: new Date(),
    });

    expect(result).toBe(true);
  });

  it('should send payment updated notification', async () => {
    const result = await sendPaymentNotificationEmail({
      cardholderName: 'Jane Smith',
      lastFourDigits: '5678',
      expiryDate: '03/27',
      action: 'updated',
      userEmail: 'user@example.com',
      timestamp: new Date(),
    });

    expect(result).toBe(true);
  });

  it('should send auto-renewal enabled notification', async () => {
    const result = await sendPaymentNotificationEmail({
      cardholderName: 'John Doe',
      lastFourDigits: '1234',
      expiryDate: '12/26',
      action: 'autorenew_enabled',
      userEmail: 'user@example.com',
      timestamp: new Date(),
    });

    expect(result).toBe(true);
  });

  it('should send auto-renewal disabled notification', async () => {
    const result = await sendPaymentNotificationEmail({
      cardholderName: 'John Doe',
      lastFourDigits: '1234',
      expiryDate: '12/26',
      action: 'autorenew_disabled',
      userEmail: 'user@example.com',
      timestamp: new Date(),
    });

    expect(result).toBe(true);
  });

  it('should send payment receipt email', async () => {
    const result = await sendPaymentReceiptEmail('user@example.com', {
      cardholderName: 'John Doe',
      lastFourDigits: '1234',
      plan: 'pro',
      price: '$9.99/mo',
    });

    expect(result).toBe(true);
  });

  it('should send payment error email', async () => {
    const result = await sendPaymentErrorEmail(
      'user@example.com',
      'Card declined - insufficient funds'
    );

    expect(result).toBe(true);
  });

  it('should handle email with all required fields', async () => {
    const result = await sendPaymentNotificationEmail({
      cardholderName: 'Test User',
      lastFourDigits: '9999',
      expiryDate: '06/28',
      action: 'saved',
      userEmail: 'test@example.com',
      timestamp: new Date('2026-04-03T12:00:00Z'),
    });

    expect(result).toBe(true);
  });

  it('should handle email without user email', async () => {
    const result = await sendPaymentNotificationEmail({
      cardholderName: 'Anonymous User',
      lastFourDigits: '0000',
      expiryDate: '01/25',
      action: 'updated',
      timestamp: new Date(),
    });

    expect(result).toBe(true);
  });
});
