# Masroof (مصروف) — Analytics Dashboard
**Business Requirements Document (BRD)**

| Document Control | |
|---|---|
| **Document ID** | BRD-ANALYTICS-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Date** | 2026-06-28 |
| **Author** | Senior Product Manager / Business Analyst |
| **Classification** | Internal — Confidential |

**Change History**

| Version | Date | Author | Summary of Changes |
|---|---|---|---|
| 1.0 | 2026-06-28 | PM/BA | Initial professional BRD for Analytics Dashboard overhaul |

---

## 1. Executive Summary

The Analytics Dashboard in Masroof (مصروف) is the critical point where raw transaction data is transformed into actionable financial intelligence. The current implementation is identified as "poor," lacking professional depth, actionable insights, and strict adherence to the project's Material Design 3 (MD3) theming system.

The goal of this overhaul is to move beyond simple summation. In a high-inflation environment like Egypt, users do not just need to know *how much* they spent, but *where* they can cut back and *how* their spending is evolving. This document defines a professional, insight-driven dashboard that emphasizes **Priority-Based Analysis**, **Period Comparison**, and **AI-Powered Cashflow Coaching**.

---

## 2. Business Logic & Strategic Framework

### 2.1 The "Insight-First" Philosophy
The dashboard will shift from **Descriptive Analytics** (What happened?) to **Diagnostic and Prescriptive Analytics** (Why did it happen and what should I do?).

### 2.2 Periodicity & Delta Analysis
To provide context, every primary KPI must be compared against a "Baseline Period" (the immediately preceding period of the same duration).

| Period Type | Current Period | Baseline Period (Comparison) |
|---|---|---|
| **Day** | Today | Yesterday |
| **Week** | Current Calendar Week | Previous Calendar Week |
| **Month** | Current Calendar Month | Previous Calendar Month |
| **Custom** | Selected Range $[S_1, E_1]$ | Range of equal duration $[S_1 - \Delta, E_1 - \Delta]$ |

**Calculation for Delta ($\Delta$):**
$$\text{Percentage Change} = \left( \frac{\text{Current Value} - \text{Baseline Value}}{\text{Baseline Value}} \right) \times 100$$

### 2.3 Priority-Based Spending Framework
Masroof categorizes expenses by priority to facilitate "inflation survival." 

| Priority Level | Definition | Actionable Insight |
|---|---|---|
| **Essential** | Non-negotiable (Rent, basic groceries, medicine) | Monitor for price inflation; optimize sourcing. |
| **Important** | Necessary but flexible (Internet, specific health goals) | Evaluate alternatives or subscription tiers. |
| **Normal** | Standard lifestyle (Dining out, entertainment) | Primary target for budget cuts during inflation. |
| **Luxury** | Discretionary/Wants (High-end gadgets, luxury dining) | First area to eliminate during financial stress. |

---

## 3. Functional Requirements

### 3.1 Core KPIs (The "At-a-Glance" Layer)
The top of the dashboard shall feature a KPI grid using MD3 `Card` components.

| KPI | Description | Visual Representation | Data Source |
|---|---|---|---|
| **Total Spent** | Sum of all expenses in current period | Large numeric value + $\Delta\%$ indicator | `AggregatedData.totalSpent` |
| **Daily Average** | Total spent / number of days in period | Numeric value + $\Delta\%$ indicator | `AggregatedData.dailyAverage` |
| **Transaction Count** | Total number of records | Small numeric value | `AggregatedData.totalTransactions` |
| **Budget Utilization** | % of monthly budget used | **Circular Gauge (Progress Ring)** | `BudgetRepo` / `AggregatedData.totalSpent` |

### 3.2 Professional Data Visualizations

#### 3.2.1 Spending Composition (Category Breakdown)
- **What:** A Donut Chart showing spend distribution by category.
- **Why:** To quickly identify the largest "leak" in the budget.
- **Interaction:** Tapping a slice filters the transaction list below to that category.
- **Data:** `AggregatedData.byCategory`

#### 3.2.2 Spending Velocity (Trend Line)
- **What:** A Bar or Line Chart showing daily spending over the selected period.
- **Why:** To identify spending spikes (e.g., "weekend effect") and patterns.
- **Comparison:** Overlay the baseline period as a muted line for direct comparison.
- **Data:** New query required: `getDailySpendingSum(start, end)`

#### 3.2.3 Priority Distribution (The "Cut-Back" Analysis)
- **What:** A stacked bar chart showing the ratio of Essential vs. Luxury spending.
- **Why:** To quantify how much of the spending is "waste" vs. "necessity."
- **Data:** `AggregatedData.byPriority`

### 3.3 AI-Powered Insights (The "Cashflow Coach")
A dedicated "AI Insights" section using the Gemini service to provide localized, context-aware advice.

#### 3.3.1 Prompt Strategies
The system will send the `AggregatedData` and `topItems` to Gemini with the following persona:
*"You are a professional Egyptian financial advisor specializing in high-inflation environments. Analyze the user's spending data and provide 3 concise, actionable tips in Egyptian Arabic."*

#### 3.3.2 Specific Insight Modules
| Module | Logic | Example Insight |
|---|---|---|
| **Inflation Alert** | Detect items with $>10\%$ price increase | "لاحظنا أن سعر [Product] زاد بنسبة 15% الشهر ده. ممكن تجرب بديل من [Alternative Merchant]؟" |
| **Luxury Leak** | Luxury spend $> 20\%$ of total | "مصاريف الرفاهية عالية الشهر ده (25%). لو قللت خروجة واحدة في الأسبوع، هتوفر [Amount] ج.م." |
| **Budget Warning** | Budget utilization $> 80\%$ before mid-month | "إنت استهلكت 80% من ميزانية الأكل وأحنا لسه يوم 12 في الشهر. حاول تركز على الأساسيات." |

---

## 4. Data Requirements & Mapping

### 4.1 UI to Data Map

| UI Element | Required Data Field | Source / Query | Status |
|---|---|---|---|
| KPI: Total Spent | `totalSpent` | `AggregatedData` | ✅ Existing |
| KPI: Daily Avg | `dailyAverage` | `AggregatedData` | ✅ Existing |
| Gauge: Budget % | `totalSpent` / `monthlyBudget` | `AggregatedData` + `BudgetRepo` | ⚠️ Needs Integration |
| Donut: Category | `byCategory` | `AggregatedData` | ✅ Existing |
| Bar: Trends | `dailySums[]` | **New Query Required** | ❌ Missing |
| Bar: Priority | `byPriority` | `AggregatedData` | ✅ Existing |
| AI Coach Tips | `AggregatedData` + `topItems` | Gemini API $\rightarrow$ prompt | ⚠️ Stubbed |

### 4.2 New Database Requirements
To support the "Spending Velocity" chart, a new repository method is required:
- **Method:** `getDailySpendingSum(start: string, end: string)`
- **SQL:** `SELECT date(created_at) as day, SUM(price) as total FROM expenses WHERE created_at >= ? AND created_at <= ? GROUP BY day ORDER BY day ASC`

---

## 5. Non-Functional Requirements

### 5.1 Theming & Visual Fidelity (MD3)
To resolve the "poor theming" issue, the following must be enforced:
- **Colors:** Use only `bg-surface-container`, `text-on-surface`, and `primary` tokens.
- **Contrast:** All $\Delta\%$ indicators must use semantic colors: `text-success` for spending decreases, `text-error` for spending increases.
- **Layout:** Use the `.container` utility class and `SafeAreaView` for consistent padding.
- **Components:** Use `aniUI` Card, Text, and custom Chart components.

### 5.2 Performance
- **Load Time:** Dashboard must load in $<1.5$s using `useAnalytics` hook.
- **Smoothness:** Charts must use `react-native-reanimated` for entry transitions.

---

## 6. Success Metrics (KPIs)

| Metric | Target | Measurement |
|---|---|---|
| **Insight Engagement** | $>40\%$ of users tap "See More" on AI tips | Analytics event `ai_insight_click` |
| **Budget Adoption** | $>30\%$ increase in users setting budgets | `BudgetRepo` entries count |
| **Retention (Analytics)** | $>50\%$ of users return to Analytics tab weekly | Session frequency per user |

---

## 7. Summary of Key Improvements

1.  **From Numbers to Insights**: Moved from simple totals to $\Delta\%$ comparisons and "Budget Utilization" gauges.
2.  **Priority Analysis**: Introduced a framework (Essential $\rightarrow$ Luxury) to help users identify exactly where to cut spending.
3.  **Localized Intelligence**: Integrated Gemini for "Inflation Survival" coaching specifically for the Egyptian market.
4.  **Visual Professionalism**: Enforced a strict MD3 token system to eliminate "poor theming" and inconsistent colors.
5.  **Actionable Visuals**: Added spending velocity (trends) and category drill-downs for diagnostic analysis.

**Next Steps:**
1. Implement `getDailySpendingSum` in `analytics-repo.ts`.
2. Update `useAnalytics` hook to fetch daily sums.
3. Build the UI using `aniUI` components and MD3 tokens.
4. Wire the Gemini service with the defined prompt strategies.
