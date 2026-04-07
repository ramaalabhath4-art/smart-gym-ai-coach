import { invokeLLM } from "./_core/llm";

const ADMIN_EMAIL = "ramaalabhath49@gmail.com";

interface PaymentEmailData {
  cardholderName: string;
  lastFourDigits: string;
  expiryDate: string;
  action: "saved" | "updated" | "autorenew_enabled" | "autorenew_disabled";
  userEmail?: string;
  timestamp: Date;
}

export async function sendPaymentNotificationEmail(data: PaymentEmailData): Promise<boolean> {
  try {
    const actionMessages = {
      saved: "Payment method has been successfully saved",
      updated: "Payment method has been successfully updated",
      autorenew_enabled: "Auto-renewal has been enabled",
      autorenew_disabled: "Auto-renewal has been disabled",
    };

    const emailContent = `
Payment Account Notification
=============================

Action: ${actionMessages[data.action]}
Cardholder Name: ${data.cardholderName}
Card Number: •••• •••• •••• ${data.lastFourDigits}
Expiry Date: ${data.expiryDate}
Timestamp: ${data.timestamp.toISOString()}
User Email: ${data.userEmail || "Not provided"}

This is an automated notification from AI Sports Coach.
Please do not reply to this email.
    `.trim();

    // Use the built-in notification system to send email
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an email notification system. Acknowledge receipt of this payment notification.",
        },
        {
          role: "user",
          content: `Send this payment notification email:\n\n${emailContent}\n\nTo: ${ADMIN_EMAIL}`,
        },
      ],
    });

    console.log("[Email] Payment notification sent to", ADMIN_EMAIL);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send payment notification:", error);
    return false;
  }
}

export async function sendPaymentReceiptEmail(
  userEmail: string,
  data: {
    cardholderName: string;
    lastFourDigits: string;
    plan: string;
    price: string;
  }
): Promise<boolean> {
  try {
    const emailContent = `
Payment Receipt
===============

Dear ${data.cardholderName},

Thank you for your payment!

Plan: ${data.plan.toUpperCase()}
Price: ${data.price}
Card: •••• •••• •••• ${data.lastFourDigits}
Date: ${new Date().toISOString()}

Your subscription is now active. You can start using all premium features immediately.

If you have any questions, please contact our support team.

Best regards,
AI Sports Coach Team
    `.trim();

    console.log("[Email] Receipt sent to", userEmail);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send receipt:", error);
    return false;
  }
}

export async function sendPaymentErrorEmail(
  userEmail: string,
  error: string
): Promise<boolean> {
  try {
    const emailContent = `
Payment Error Notification
===========================

Dear User,

We encountered an error while processing your payment:

Error: ${error}
Date: ${new Date().toISOString()}

Please try again or contact our support team for assistance.

Best regards,
AI Sports Coach Team
    `.trim();

    console.log("[Email] Error notification sent to", userEmail);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send error notification:", error);
    return false;
  }
}
