import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.error("[Database] DATABASE_URL is not set!");
      return null;
    }
    try {
      const mysql2 = await import("mysql2/promise");
      const connection = await mysql2.createConnection(url);
      _db = drizzle(connection as any);
      console.log("[Database] Connected successfully ✅");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

import { paymentAccounts } from "../drizzle/schema";
import { encryptPaymentData, getLastFourDigits } from './encryption';
import { sendPaymentNotificationEmail } from './email';

// ================== PAYMENT ACCOUNTS ==================
export async function savePaymentAccount(userId: number, data: {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save payment account: database not available");
    return null;
  }

  try {
    const encryptedCardNumber = encryptPaymentData(data.cardNumber);
    const encryptedExpiryDate = encryptPaymentData(data.expiryDate);
    const encryptedCvv = encryptPaymentData(data.cvv);
    const lastFourDigits = getLastFourDigits(data.cardNumber);

    await db.insert(paymentAccounts).values({
      userId,
      cardholderName: data.cardholderName,
      cardNumber: encryptedCardNumber,
      expiryDate: encryptedExpiryDate,
      cvv: encryptedCvv,
      lastFourDigits,
      isDefault: true,
    });

    // Send email notification
    await sendPaymentNotificationEmail({
      cardholderName: data.cardholderName,
      lastFourDigits,
      expiryDate: data.expiryDate,
      action: "saved",
      timestamp: new Date(),
    });

    return await getPaymentAccount(userId);
  } catch (error) {
    console.error("[Database] Failed to save payment account:", error);
    throw error;
  }
}

export async function getPaymentAccount(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payment account: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(paymentAccounts)
      .where(eq(paymentAccounts.userId, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get payment account:", error);
    return null;
  }
}

export async function updatePaymentAccount(userId: number, data: {
  cardholderName?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update payment account: database not available");
    return null;
  }

  try {
    const updateData: Record<string, any> = {};

    if (data.cardholderName) {
      updateData.cardholderName = data.cardholderName;
    }
    if (data.cardNumber) {
      updateData.cardNumber = encryptPaymentData(data.cardNumber);
      updateData.lastFourDigits = getLastFourDigits(data.cardNumber);
    }
    if (data.expiryDate) {
      updateData.expiryDate = encryptPaymentData(data.expiryDate);
    }
    if (data.cvv) {
      updateData.cvv = encryptPaymentData(data.cvv);
    }
    updateData.updatedAt = new Date();

    await db.update(paymentAccounts)
      .set(updateData)
      .where(eq(paymentAccounts.userId, userId));

    // Send email notification
    const updatedAccount = await getPaymentAccount(userId);
    if (updatedAccount) {
      await sendPaymentNotificationEmail({
        cardholderName: updatedAccount.cardholderName,
        lastFourDigits: updatedAccount.lastFourDigits,
        expiryDate: data.expiryDate || "••••",
        action: "updated",
        timestamp: new Date(),
      });
    }

    return updatedAccount;
  } catch (error) {
    console.error("[Database] Failed to update payment account:", error);
    throw error;
  }
}
