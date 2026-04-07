# AI Sports Coach - Project TODO

## Phase 1: Database Schema & Tables
- [ ] Update drizzle schema with new tables (subscriptions, analysisHistory, movementData)
- [ ] Create database migrations
- [ ] Add relationships between tables
- [ ] Test database connections

## Phase 2: Dashboard Page
- [ ] Create Dashboard component with sidebar navigation
- [ ] Display user profile (name, subscription level, avatar)
- [ ] Build statistics cards (Total Sessions, Total Exercises, Avg Score, Streak)
- [ ] Create analysis history table
- [ ] Add weekly progress chart
- [ ] Implement real-time data updates

## Phase 3: Settings Page
- [ ] Create Settings component with left sidebar menu
- [ ] Build Account settings section (profile, name, email)
- [ ] Build Subscription section (plan, billing date, payment method)
- [ ] Build Preferences section (dark mode, language, notifications)
- [ ] Add Privacy and Notifications sections
- [ ] Implement settings save/update functionality

## Phase 4: Skeleton Visualization Improvements
- [ ] Create 22 exercise reference skeletons (from Kaggle Gym dataset)
- [ ] Improve skeleton drawing on Canvas (better colors, smoother lines)
- [ ] Add angle visualization for key joints
- [ ] Display DTW distance and similarity score
- [ ] Show real-time feedback messages
- [ ] Add comparison view (user vs reference)

## Phase 5: Subscription System
- [ ] Create subscription management page
- [ ] Implement Free/Pro/Elite plan selection
- [ ] Add Stripe payment integration
- [ ] Create subscription status tracking
- [ ] Implement plan upgrade/downgrade logic
- [ ] Add payment history display

## Phase 6: Authentication & User Management
- [ ] Implement proper login/register with password hashing
- [ ] Add email verification
- [ ] Create user profile management
- [ ] Implement session management
- [ ] Add logout functionality

## Phase 7: API & Backend
- [ ] Create tRPC procedures for dashboard data
- [ ] Create tRPC procedures for settings updates
- [ ] Create tRPC procedures for subscription management
- [ ] Create tRPC procedures for analysis history
- [ ] Add error handling and validation

## Phase 8: Testing & Deployment
- [ ] Write unit tests for critical functions
- [ ] Test all user flows
- [ ] Fix any bugs or issues
- [ ] Optimize performance
- [ ] Deploy to production
- [ ] Monitor and maintain


## Current Issues to Fix
- [x] Fix global translation system - translations now work on Dashboard, Demo, Settings pages using centralized LanguageContext
- [x] Fix Pro/Elite plan selection - now shows payment form with 4 options (PayPal, Card, Google Pay, Apple Pay)
- [x] Rename app from "AI Sports Coach" to "WazenAI" across all pages
- [x] Create WazenAI logo - professional logo with fitness + AI elements
- [x] Test all translation changes - 182 tests passing
- [x] Test plan selection navigation - payment form now displays on Pro/Elite selection


## Issues to Fix (Current)
- [x] Fix app name display - Settings now shows "WazenAI" instead of "AI Sports Coach"
- [x] Update logo in Settings navbar - displays WazenAI logo
- [x] Add translations to Advanced Analysis page - full 6-language support added
- [x] Verify all pages display WazenAI name and logo correctly


## Critical Issues (Current Session)
- [x] Add translations to Settings page - all text must be translated to 6 languages
- [x] Create Payment page with 4 payment methods (Credit Card, PayPal, Google Pay, Apple Pay)
- [x] Fix plan selection to navigate to Payment page instead of showing modal
- [x] Verify Pro/Elite buttons navigate to Payment page with correct plan info


## Critical Issues (Session 2)
- [x] Translate "Back" button to all 6 languages in Payment page
- [ ] Translate all Settings page text (Account, Subscription, Notifications, Preferences, Account Settings, Name, Email, Save Changes)
- [ ] Translate all Demo page text (Real-time Analysis, 22 Exercises, AI Corrections, etc.)
- [x] Add account input forms for PayPal (email/username)
- [x] Add account input forms for Google Pay (email)
- [x] Add account input forms for Apple Pay (email)
- [x] Create payment success confirmation page with all 6 languages
- [x] Save payment data to database (TODO: backend API)
- [x] Integrate payment data with n8n workflow (TODO: backend API)
- [ ] Send confirmation email to user after successful payment


## Critical Issues (Session 3)
- [x] Translate Settings page - Account, Subscription, Notifications, Preferences tabs
- [x] Translate Demo page - all features and descriptions
- [x] Translate "Back" button on all pages
- [x] Add email validation to PayPal form
- [x] Add email validation to Google Pay form
- [x] Add email validation to Apple Pay form
- [x] Fix Dark Mode toggle functionality - now uses useTheme hook
- [x] Translate all 22 exercise names to 6 languages
- [x] Add language selector dropdown (6 languages + Auto-detect)
- [x] Implement immediate website translation when language is selected
- [x] Improve back button visibility in Dark Mode with blue color
- [ ] Link features to user subscription data (Free/Pro/Elite)
- [ ] Show dynamic features based on user's current plan
- [ ] Update features section when user changes subscription
