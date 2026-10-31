# Operational & Financial Reporting

> **Status: Confirmed Domain Specification**
>
> Executive dashboards, real-time metrics, revenue recognition, accounts receivable tracking, and sub-2-second query design.

---

## 1. Domain Overview

As specified in Scene 7 of the problem statement:
> *"How many subscriptions are active? How much revenue came in, and how much is still owed? Which invoices are overdue? Today, answering those questions takes days. The finance lead wants one place to see active subscriptions, revenue, payments and overdue invoices, with filters and a summary view. With thousands of subscriptions on the books, every page should still respond in under two seconds."*

---

## 2. Key Metrics & Financial Definitions

| Metric | Definition | SQL Calculation Strategy |
|---|---|---|
| **Active Subscriptions** | Count of all live subscriptions currently billing | `COUNT(*) FROM subscriptions WHERE status = 'ACTIVE'` |
| **Total Revenue** | Cumulative revenue collected from paid invoices | `SUM(amount_paid) FROM invoices WHERE status IN ('CONFIRMED', 'PAID')` |
| **Amount Owed** | Total outstanding balance on confirmed, unpaid invoices | `SUM(total_amount - amount_paid) FROM invoices WHERE status = 'CONFIRMED'` |
| **Overdue Invoices** | Count and total value of invoices whose due date has passed | `COUNT(*) / SUM(total_amount - amount_paid) WHERE status = 'CONFIRMED' AND due_date < CURRENT_DATE` |
| **MRR** | Normalized Monthly Recurring Revenue | Computed per active subscription based on interval formula |

### MRR Normalization Formula
$$\text{MRR} = \begin{cases} 
\text{Total Period Amount} \times 30 & \text{if DAILY} \\
\text{Total Period Amount} \times 4.33 & \text{if WEEKLY} \\
\text{Total Period Amount} & \text{if MONTHLY} \\
\text{Total Period Amount} / 12 & \text{if YEARLY}
\end{cases}$$

---

## 3. High-Performance Dashboard Query Design

To meet the strict sub-2-second performance target across thousands of subscriptions, all metrics are aggregated in a single database pass using conditional `FILTER` clauses:

```sql
SELECT
    -- Subscription counts
    COUNT(s.id) FILTER (WHERE s.status = 'ACTIVE') AS active_subscriptions_count,
    COUNT(s.id) FILTER (WHERE s.status = 'PAUSED') AS paused_subscriptions_count,
    
    -- Financial aggregates
    COALESCE(SUM(i.amount_paid), 0) AS total_revenue_collected,
    COALESCE(SUM(i.total_amount - i.amount_paid) FILTER (WHERE i.status = 'CONFIRMED'), 0) AS total_amount_owed,
    
    -- Overdue totals
    COUNT(i.id) FILTER (WHERE i.status = 'CONFIRMED' AND i.due_date < CURRENT_DATE) AS overdue_invoices_count,
    COALESCE(SUM(i.total_amount - i.amount_paid) FILTER (WHERE i.status = 'CONFIRMED' AND i.due_date < CURRENT_DATE), 0) AS overdue_amount
FROM subscriptions s
LEFT JOIN invoices i ON i.subscription_id = s.id;
```

Responses are cached in Redis (`cache:dashboard:summary`) with a 60-second TTL and invalidated upon payment receipt or invoice confirmation.
