# Vet Clinical Toolbox 5.0-r08 — AI Clinical OS Final

## AI ↔ Clinical OS 双向同步
- AI Clinical Copilot now requests strict structured JSON.
- AI reads Patient State + Clinical OS context + recent timeline/tasks/risks.
- AI response is rendered as an auditable Clinical Plan.
- Patient facts are synchronized to Patient State.
- Problems, recommended tests, treatment options, medication options, monitoring and reassessment are automatically synchronized to Clinical OS as `Suggested（建议）`.
- Suggested items never become active medical orders automatically.
- Lifecycle semantics: Suggested → Reviewed → Active → Completed / Rejected / Deferred / Cancelled.
- High-risk medication, fluids, anesthesia, transfusion and toxicology actions remain clinician-reviewed.
- AI Plan Inbox stores the latest structured plan locally.

## 小白兽医可读性
English clinical terms are paired with concise Chinese explanations throughout the AI plan and Clinical OS.

## Safety
No new fixed drug doses or fabricated product-label claims were introduced. AI is instructed to distinguish facts, inference, differentials and recommendations, and to flag missing evidence.

## Version
Product version remains **5.0-r08**. No database migration.
