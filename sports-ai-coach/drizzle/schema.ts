import { 
  int, mysqlEnum, mysqlTable, text, 
  timestamp, varchar, float, boolean, json
} from "drizzle-orm/mysql-core";

// ================== USERS ==================
export const users = mysqlTable("users", {
  id:             int("id").autoincrement().primaryKey(),
  openId:         varchar("openId", { length: 64 }).notNull().unique(),
  name:           text("name"),
  email:          varchar("email", { length: 320 }),
  password:       varchar("password", { length: 200 }), // ← كلمة مرور مشفرة
  loginMethod:    varchar("loginMethod", { length: 64 }),
  role:           mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  subscription:   mysqlEnum("subscription", ["free", "pro", "elite"]).default("free").notNull(),
  totalSessions:  int("totalSessions").default(0).notNull(),
  totalExercises: int("totalExercises").default(0).notNull(),
  createdAt:      timestamp("createdAt").defaultNow().notNull(),
  updatedAt:      timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn:   timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ================== SUBSCRIPTIONS ==================
export const subscriptions = mysqlTable("subscriptions", {
  id:             int("id").autoincrement().primaryKey(),
  userId:         int("userId").notNull().references(() => users.id),
  plan:           mysqlEnum("plan", ["free", "pro", "elite"]).default("free").notNull(),
  status:         mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  paymentMethod:  varchar("paymentMethod", { length: 50 }),
  lastFourDigits: varchar("lastFourDigits", { length: 4 }),
  startDate:      timestamp("startDate").defaultNow().notNull(),
  endDate:        timestamp("endDate"),
  autoRenew:      boolean("autoRenew").default(true).notNull(),
  price:          float("price").default(0),
  currency:       varchar("currency", { length: 3 }).default("USD"),
  createdAt:      timestamp("createdAt").defaultNow().notNull(),
  updatedAt:      timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ================== ANALYSIS HISTORY ==================
export const analysisHistory = mysqlTable("analysisHistory", {
  id:              int("id").autoincrement().primaryKey(),
  userId:          int("userId").notNull().references(() => users.id),
  exerciseClass:   varchar("exerciseClass", { length: 100 }).notNull(),
  confidence:      int("confidence").notNull(),
  similarityScore: int("similarityScore").notNull(),
  level:           varchar("level", { length: 50 }),
  dtwDistance:     float("dtwDistance"),
  corrections:     text("corrections"),
  qualityIssues:   text("qualityIssues"),
  videoUrl:        text("videoUrl"),
  createdAt:       timestamp("createdAt").defaultNow().notNull(),
});

export type AnalysisHistory = typeof analysisHistory.$inferSelect;
export type InsertAnalysisHistory = typeof analysisHistory.$inferInsert;

// ================== MOVEMENT DATA ==================
export const movementData = mysqlTable("movementData", {
  id:            int("id").autoincrement().primaryKey(),
  userId:        int("userId").notNull().references(() => users.id),
  analysisId:    int("analysisId").references(() => analysisHistory.id),
  exerciseClass: varchar("exerciseClass", { length: 100 }).notNull(),
  keypoints:     json("keypoints"),
  angles:        json("angles"),
  dtwSequence:   json("dtwSequence"),
  frameCount:    int("frameCount").default(15),
  sessionDate:   timestamp("sessionDate").defaultNow().notNull(),
  createdAt:     timestamp("createdAt").defaultNow().notNull(),
});

export type MovementData = typeof movementData.$inferSelect;
export type InsertMovementData = typeof movementData.$inferInsert;

// ================== PAYMENT ACCOUNTS ==================
export const paymentAccounts = mysqlTable("paymentAccounts", {
  id:            int("id").autoincrement().primaryKey(),
  userId:        int("userId").notNull().references(() => users.id),
  cardholderName: varchar("cardholderName", { length: 100 }).notNull(),
  cardNumber:    varchar("cardNumber", { length: 255 }).notNull(), // ← مشفر
  expiryDate:    varchar("expiryDate", { length: 255 }).notNull(), // ← مشفر
  cvv:           varchar("cvv", { length: 255 }).notNull(), // ← مشفر
  lastFourDigits: varchar("lastFourDigits", { length: 4 }).notNull(),
  isDefault:     boolean("isDefault").default(true).notNull(),
  createdAt:     timestamp("createdAt").defaultNow().notNull(),
  updatedAt:     timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentAccount = typeof paymentAccounts.$inferSelect;
export type InsertPaymentAccount = typeof paymentAccounts.$inferInsert;

// ================== MESSAGES ==================
export const messages = mysqlTable("messages", {
  id:        int("id").autoincrement().primaryKey(),
  userId:    int("userId").notNull().references(() => users.id),
  content:   text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// ================== RESULTS CHAT ==================
// Inner chat — analysis result page
export const resultsChat = mysqlTable("resultsChat", {
  id:           int("id").autoincrement().primaryKey(),
  userId:       int("userId").notNull().references(() => users.id),
  analysisId:   int("analysisId").references(() => analysisHistory.id),
  exercise:     varchar("exercise", { length: 100 }).notNull(),
  confidence:   int("confidence").default(0),
  level:        varchar("level", { length: 50 }),
  userMessage:  text("userMessage").notNull(),
  aiResponse:   text("aiResponse").notNull(),
  language:     varchar("language", { length: 10 }).default("en"),
  createdAt:    timestamp("createdAt").defaultNow().notNull(),
});

export type ResultsChat = typeof resultsChat.$inferSelect;
export type InsertResultsChat = typeof resultsChat.$inferInsert;

// ================== GENERAL CHAT ==================
// Outer chat — AdvancedAnalysis page
export const generalChat = mysqlTable("generalChat", {
  id:          int("id").autoincrement().primaryKey(),
  userId:      int("userId").notNull().references(() => users.id),
  sessionId:   varchar("sessionId", { length: 64 }),
  sessionName: varchar("sessionName", { length: 100 }),
  userMessage: text("userMessage").notNull(),
  aiResponse:  text("aiResponse").notNull(),
  language:    varchar("language", { length: 10 }).default("en"),
  createdAt:   timestamp("createdAt").defaultNow().notNull(),
});

export type GeneralChat = typeof generalChat.$inferSelect;
export type InsertGeneralChat = typeof generalChat.$inferInsert;

// ================== ERROR ANALYTICS ==================
// Track most common errors per user per exercise
export const errorAnalytics = mysqlTable("errorAnalytics", {
  id:         int("id").autoincrement().primaryKey(),
  userId:     int("userId").notNull().references(() => users.id),
  exercise:   varchar("exercise", { length: 100 }).notNull(),
  errorText:  text("errorText").notNull(),
  count:      int("count").default(1).notNull(),
  lastSeen:   timestamp("lastSeen").defaultNow().notNull(),
  createdAt:  timestamp("createdAt").defaultNow().notNull(),
});

export type ErrorAnalytics = typeof errorAnalytics.$inferSelect;
export type InsertErrorAnalytics = typeof errorAnalytics.$inferInsert;
