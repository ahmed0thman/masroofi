# Masroof (مصروف) — Voice-First Personal Finance Assistant

> **Document Type:** Business Requirements Document (BRD)
> **Status:** Draft v1.0
> **Date:** 2026-06-13
> **Author:** Product Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Opportunity](#2-business-opportunity)
3. [Target Audience & Personas](#3-target-audience--personas)
4. [Product Vision](#4-product-vision)
5. [Solution Overview](#5-solution-overview)
6. [Core Principles & Design Philosophy](#6-core-principles--design-philosophy)
7. [Feature Roadmap](#7-feature-roadmap)
8. [Technical Architecture](#8-technical-architecture)
9. [Success Metrics & KPIs](#9-success-metrics--kpis)
10. [Risk Assessment](#10-risk-assessment)
11. [Glossary](#11-glossary)

---

## 1. Executive Summary

Masroof is a **voice-first personal finance assistant** for the Egyptian market that eliminates the friction of manual expense tracking. Users speak naturally ("_I bought groceries from Carrefour for 450 pounds_") and the application transcribes, understands, categorizes, and stores the expense — all in under 10 seconds.

The product targets the 95%+ of smartphone users who abandon traditional expense tracking apps due to data entry friction. By removing forms, dropdowns, and manual categorization, Masroof makes financial awareness effortless.

**Core value proposition:** Record an expense in the time it takes to say it.

---

## 2. Business Opportunity

### 2.1 The Problem

**Expense tracking has high friction.** Traditional applications assume users are willing to become accountants — manually entering data, creating categories, organizing records, and maintaining consistency. In reality:

- Users are busy
- Users forget
- Users are lazy regarding repetitive tasks
- Users want convenience

**The result:** Incomplete records, missing expenses, and abandoned applications.

### 2.2 Data Quality Degrades Over Time

Even when users track expenses, data quality becomes inconsistent. A single merchant may be recorded as:

| Variant | Language |
|---|---|
| McDonald's | English |
| Mcdonalds | English |
| ماكدونالدز | Arabic |
| ماك | Arabic (colloquial) |

Similarly, "Uber", "Uber Ride", "Transportation", and "Taxi" may all refer to the same category. This fragmentation creates poor analytics and unreliable reports.

### 2.3 Most Financial Apps Lack Context

Many budgeting apps tell users: _"You spent 5,000 EGP on food."_ But they cannot explain:

- Which restaurants caused the increase?
- Which products are becoming more expensive?
- Which purchases are recurring?
- What specific actions would reduce spending?

Users receive numbers — not meaningful guidance.

### 2.4 Market Landscape

| Segment | Gap |
|---|---|
| Traditional expense trackers | High data-entry friction, high abandonment |
| Budgeting apps | Generic insights, no personalization |
| Banking apps | Transaction history only, no proactive intelligence |
| AI finance assistants (global) | Not localized for Arabic/Egyptian market |

Masroof occupies a unique position: **voice-first + local-first + AI-native** for the Arabic-speaking market.

---

## 3. Target Audience & Personas

### 3.1 Primary Persona — The Busy Professional

> _"I know I should track my spending, but I don't have time to open an app and fill out forms every time I buy something."_

- **Age:** 25–45
- **Income:** Middle to upper-middle class
- **Behavior:** Smartphone-dependent, makes 3–10 casual purchases daily
- **Pain point:** Wants financial awareness without administrative overhead
- **Value proposition:** Tap mic, speak, done.

### 3.2 Secondary Personas

| Persona | Need | Use Case |
|---|---|---|
| **Freelancer** | Separate personal & business spending | "Paid 300 EGP for domain renewal" → auto-categorized as business expense |
| **Student** | Budget control, spending awareness | Tracking daily allowances, understanding where money goes |
| **Family Manager** | Household expense tracking | Multiple categories, shared visibility into family spending patterns |

---

## 4. Product Vision

> **The long-term vision is an intelligent personal finance assistant — not merely an expense tracker.**

The final product becomes a **personal financial operating system**:

- Users speak naturally
- The system understands financial activity
- The system organizes information automatically
- The system identifies patterns
- The system predicts future behavior
- The system recommends optimizations
- The system helps users save money with minimal effort
- Users maintain complete ownership and control over their financial data

---

## 5. Solution Overview

### 5.1 How It Works

```mermaid
flowchart LR
    A[User speaks] --> B[Speech recognition]
    B --> C[Language understanding]
    C --> D[Structured extraction]
    D --> E[User review]
    E --> F[Save to local DB]
    F --> G[Analytics & insights]
```

### 5.2 Input → Output Example

**Input (voice):**
> _"I bought groceries from Carrefour for 450 pounds."_

**Extracted output:**
```json
{
  "amount": 450,
  "merchant": "Carrefour",
  "category": "Groceries",
  "date": "2026-06-13"
}
```

**Input (voice, itemized):**
> _"Bought milk for 40, bread for 20, and cheese for 80."_

**Extracted output:**
```json
{
  "merchant": "Carrefour",
  "total": 140,
  "items": [
    { "name": "Milk", "price": 40 },
    { "name": "Bread", "price": 20 },
    { "name": "Cheese", "price": 80 }
  ]
}
```

### 5.3 Key Capabilities

| Capability | Description |
|---|---|
| **Speech recognition** | Converts Arabic/English speech to text (offline-capable) |
| **Natural language understanding** | Parses financial intent from casual speech |
| **Structured data extraction** | Identifies amount, merchant, category, date, items |
| **Intelligent categorization** | Predicts expense category automatically |
| **Data normalization** | Unifies merchant/category/product names |
| **Financial analytics** | Dashboards, trends, recommendations |

---

## 6. Core Principles & Design Philosophy

### 6.1 Voice First

The primary input method is voice. Text entry is available but secondary. Every interaction is optimized around the assumption that users will primarily speak.

### 6.2 Minimal Friction

Recording an expense should take **less than ten seconds**. The ideal flow:

```
Open App → Tap Microphone → Speak → Save
```

No forms. No dropdowns. No complicated interfaces.

### 6.3 Local First

User data belongs to the user. The application functions fully without internet access. Core functionality works entirely offline. Cloud is optional — for backup and sync only.

### 6.4 AI Assisted

AI reduces user effort — it does not create complexity. The system automates understanding, categorization, and organization while allowing users to review and correct results.

### 6.5 Privacy by Design

- End-to-end encryption for cloud backups
- On-device processing where possible
- No unauthorized data sharing
- User controls their data lifecycle

---

## 7. Feature Roadmap

### 7.1 Phase 1 — MVP (Voice Notes)

**Objective:** Validate voice expense recording.

| Feature | Description |
|---|---|
| **Voice Recording** | Users record voice notes via microphone |
| **Speech Transcription** | Audio converted to text |
| **Ticket Creation** | Every voice note stored as a ticket with transcript |
| **Ticket History** | Browse, search, and edit transcripts |
| **Offline Support** | Everything works without internet |

**Success criteria:** Users consistently create expense notes using voice.

### 7.2 Phase 2 — Structured Extraction

**Objective:** Convert transcripts into usable expense records.

| Feature | Description |
|---|---|
| **Information Extraction** | System extracts amount, date, merchant, category from transcript |
| **Review Screen** | Users verify extracted information before saving |
| **Manual Corrections** | Users can modify amount, merchant, category, date |

**Success criteria:** Extraction accuracy above 80%.

### 7.3 Phase 3 — Detailed Expense Understanding

**Objective:** Capture item-level spending.

| Feature | Description |
|---|---|
| **Itemized Extraction** | Extract individual items with prices from a single utterance |
| **Subcategory Hierarchy** | e.g., Food → Dairy → Milk, Food → Bakery → Bread |
| **Product-Level Tracking** | Analyze spending by product, brand, category, merchant |

**Success criteria:** Accurate extraction of itemized expenses.

### 7.4 Phase 4 — Data Normalization Engine

**Objective:** Create clean, consistent financial data.

| Capability | Example |
|---|---|
| **Merchant Normalization** | ماكدونالدز, ماك, McDonald's, Mcdonalds → **McDonald's** |
| **Category Normalization** | Taxi, Uber, Ride → **Transportation** |
| **Product Normalization** | كوكا, كوكاكولا, Coke, Coca Cola → **Coca-Cola** |
| **User-Aware Matching** | Checks existing entities before creating new ones |

**Benefits:** Reliable analytics, recommendations, and reporting.

### 7.5 Phase 5 — Financial Intelligence

**Objective:** Transform raw expenses into actionable insights.

| Feature | Description |
|---|---|
| **Analytics Dashboard** | Monthly/weekly/daily spending, trends over time |
| **Category Analysis** | Breakdown by Food, Transportation, Groceries, Entertainment, etc. |
| **Merchant Analysis** | Top merchants, most frequent, fastest growing |
| **Product Analysis** | Most purchased, highest cost, recurring purchases |
| **Saving Recommendations** | e.g., _"Restaurant spending increased 35%. Reducing by one visit/week could save ~800 EGP/month."_ |
| **Budget Monitoring** | Monthly and category budgets with auto-tracking |

### 7.6 Phase 6 — Backup & Synchronization

**Objective:** Protect user data.

| Feature | Description |
|---|---|
| **Cloud Backup** | User chooses: Backup Now, Weekly, Monthly |
| **Restore** | Restore entire account or selected backups |
| **End-to-End Encryption** | Backups encrypted before upload; server stores encrypted data only |
| **Multi-Device Support** | Phone, tablet, desktop sharing the same financial history (future) |

---

## 8. Technical Architecture

### 8.1 Frontend

| Component | Technology | Rationale |
|---|---|---|
| **Mobile Framework** | React Native + TypeScript | Single codebase, iOS & Android, fast iteration |
| **Routing** | expo-router (file-based) | Type-safe navigation, Expo SDK 56 |
| **Language** | TypeScript (strict) | Type safety, maintainability |

### 8.2 Local Data

| Component | Technology | Rationale |
|---|---|---|
| **Database** | SQLite | Offline-first, fast queries, reliable, simple backup |
| **Storage** | Local file system | Voice recordings, transcripts |

### 8.3 AI / ML

| Component | Technology | Rationale |
|---|---|---|
| **Speech Recognition** | Whisper.cpp | Offline, high Arabic accuracy, multi-dialect, no API costs |
| **Language Understanding** | Gemma 3n (on-device LLM) | Expense extraction, category prediction, merchant recognition |
| **Normalization** | LLM + rule-based hybrid | Consistency without brittle rules |

### 8.4 Cloud Infrastructure (Phased)

| Component | Technology | Purpose |
|---|---|---|
| **Backend** | NestJS | API, sync, account management |
| **Database** | PostgreSQL | Cloud data store |
| **Object Storage** | S3-compatible | Encrypted backup storage |

---

## 9. Success Metrics & KPIs

### 9.1 Product Metrics

| Metric | Target |
|---|---|
| **Voice recording retention** | >60% of users record >3 expenses in first week |
| **Extraction accuracy** | >80% (Phase 2), >90% (Phase 4+) |
| **Time to record expense** | <10 seconds (median) |
| **Weekly active usage** | >3 sessions per user |
| **30-day retention** | >40% |

### 9.2 Business Metrics

| Metric | Target |
|---|---|
| **Monthly active users (MAU)** | TBD post-launch |
| **User satisfaction (NPS)** | >40 |
| **Organic growth rate** | >20% month-over-month (viral potential) |

### 9.3 Quality Metrics

| Metric | Description |
|---|---|
| **Offline reliability** | 100% core functionality without internet |
| **Transcript → expense conversion rate** | % of voice notes that become structured expenses |
| **Correction rate** | % of extractions requiring user correction (lower is better) |

---

## 10. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| **Speech recognition accuracy (Arabic dialects)** | High | Medium | Use Whisper.cpp (multi-dialect); fallback to text input |
| **On-device LLM performance** | Medium | Medium | Optimize model size; async processing; loading states |
| **User habit formation** | High | Medium | Frictionless onboarding; notification prompts; streak mechanics |
| **Data privacy concerns** | High | Low | Local-first architecture; E2E encryption; transparent policy |
| **Battery drain (voice processing)** | Medium | Medium | Batch processing; wake-word optimization |
| **Competitor replication** | Medium | Low | First-mover advantage in Arabic market; data network effects |

---

## 11. Glossary

| Term | Definition |
|---|---|
| **Masroof (مصروف)** | Arabic for "expense" or "allowance"; the product name |
| **Ticket** | A raw voice recording + transcript pair before structured extraction |
| **Voice-First** | Primary interaction mode is voice; UI is secondary |
| **Local-First** | Core functionality works offline; user owns their data |
| **Normalization** | Converting variant names (ماكدونالدز / Mcdonalds) into a canonical form |
| **Extraction Accuracy** | % of structured fields (amount, merchant, category, date) correctly identified |
| **Itemization** | Breaking down a single expense into individual products/line items |
| **Structured Extraction** | Parsing natural language into structured JSON fields |
| **User-Aware Matching** | Checking existing entities before creating duplicates |
| **End-to-End Encryption** | Data encrypted on-device, decrypted only by the user |

---

*This document is a living artifact. Phases, timelines, and technical decisions should be updated as the product evolves.*
