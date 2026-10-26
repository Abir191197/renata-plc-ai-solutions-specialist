# Streamlining Employee Probation Tracking & Confirmation with Automated AI Follow-ups

**Assessment:** AI Solutions Specialist – HR  
**Target Organization:** Renata PLC  
**Focus Area:** Employee Life Cycle & Probation Management  

---

### 1. The Process and the Problem
When a new permanent employee joins the organization, company policy dictates a mandatory 3-month probation period before formal employment confirmation (as outlined in Leave Policy Section 2.2). During this window, Line Managers must evaluate employee performance, culture fit, and role competence before HR can issue the confirmation letter.

**Where it slows down today:**
- **Tracking via Disconnected Spreadsheets:** HR teams manage hundreds of probation dates across multiple regional sales offices, factories, and head office departments on static Excel sheets. Expiry dates frequently slip past unnoticed.
- **Delayed Manager Evaluations:** Managers receive generic reminder emails, postpone evaluations due to busy schedules, and often take 4 to 5 months to submit basic feedback.
- **Employee Anxiety & Administrative Delay:** Employees remain uncertain about their confirmation status and cannot access confirmed benefits (such as taking Annual Leave under Section 2.2). HR staff spend hours manually chasing managers for signatures and drafting individual letters.

---

### 2. The AI-Based Improvement
We implement an **Automated Probation Milestone & Feedback Agent** integrated directly into the employee communications channel (Email/WhatsApp/HR Portal):

- **Proactive Milestone Triggers:** At Day 60 and Day 75 of service, the assistant automatically pings the Line Manager with a simple, conversational 3-minute performance check-in (rating key competencies, punctuality, and job knowledge).
- **Automated Summary & Recommendation:** The assistant compiles the manager's notes into a clean, standardized Probation Review Summary and categorizes the outcome: *Direct Confirmation*, *Extension of Probation*, or *Intervention Needed*.
- **Instant Documentation:** Upon manager sign-off, the system auto-generates the formal Employment Confirmation Letter for HR Director review and updates the employee record in PeopleHub on Day 90 without administrative delay.

---

### 3. Recommended Tools and Rationale
| Component | Tool / Platform | Strategic Rationale |
| :--- | :--- | :--- |
| **Workflow Automation** | **n8n / Power Automate** | Low-maintenance triggers linking HR date records with automated reminders and manager task queues. |
| **Language Model** | **Google Gemini Flash / GPT-4o-mini** | Low-cost, fast text summarization turning informal manager feedback bullets into professional HR assessment memos. |
| **Document Generation** | **DocuSign / HTML-to-PDF Engine** | Automated population of employee details into standardized company confirmation letter templates. |
| **Database Integration** | **PostgreSQL / HRIS API (PeopleHub)** | Secure, encrypted relational storage updating employee status from "Probationary" to "Confirmed". |

---

### 4. Risks and Mitigation Strategies
- **Over-Reliance on Automation:** Managers might rubber-stamp confirmation without thoughtful evaluation.  
  *Mitigation:* The AI requires explicit qualitative examples of candidate performance before generating the review document, and the final confirmation decision always requires human HR sign-off.
- **Subjective or Biased Manager Input:** A manager may provide vague or unfair remarks.  
  *Mitigation:* The prompt flags ambiguous feedback (e.g., *"not a good fit"*) and requests specific, constructive behavioral criteria aligned with job requirements.
- **Data Privacy & Confidentiality:** Performance reviews contain sensitive personnel evaluations.  
  *Mitigation:* Role-Based Access Control (RBAC) ensures only the direct line manager and authorized central HR personnel can access evaluation records.

---

### 5. Measuring Success (Key Metrics)
- **On-Time Confirmation Rate:** Increase on-time probation completions (within 90 days) from **55% to 95%+**.
- **Manager Feedback Turnaround:** Reduction in manager evaluation submission time from **18 business days to under 48 hours**.
- **HR Administrative Hours:** Saving **10–12 hours per week** for the HR operations team by eliminating manual follow-up calls and manual letter typing.
- **New Hire Experience Score:** Improved onboarding satisfaction rating from new employees due to transparent, punctual confirmation.
