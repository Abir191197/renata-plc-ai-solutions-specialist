# Renata PLC – AI Solutions Specialist (HR) Take-Home Assessment

An enterprise-grade, policy-grounded HR Leave Policy Assistant built for the **Renata PLC** take-home assessment. The assistant strictly answers employee leave queries according to **XYZ Company Leave Policy (HR-POL-004 v2.0)**, enforces mandatory citations, admits unknown queries, and strictly protects employee personal data.

---

## 🌐 Live Working Application

👉 **Live Demo URL**: [https://renata-plc-ai-solutions-specialist-rho.vercel.app/](https://renata-plc-ai-solutions-specialist-rho.vercel.app/)

*(Evaluators can test the assistant live immediately without local setup. An optional in-browser "Custom API Key" button is also provided for testing with any custom Gemini key).*

## 🌟 Key Functional Requirements Adherence

| Requirement | Implementation & Behavior |
| :--- | :--- |
| **Requirement 1: Answer Correctly & Cite the Policy** | Grounded strictly in policy sections 1 through 11. Cites specific section numbers and headings (e.g. `Section 4.2: Casual Leave`) on every answer. No hallucinated rules or numbers. |
| **Requirement 2: Admit When Not Covered** | If a query is outside the policy (e.g., study leave, pet leave, bonus, remote work), returns verbatim: `"I don't know, please contact HR."` |
| **Requirement 3: Protect Employee Personal Data** | Inquiries regarding another colleague's records (e.g., *"How many leave days has Rahim taken?"*) are politely refused under **Section 9 (Confidentiality of Leave Records)**, redirecting users to authorized HR channels. |

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router) + React
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Renata Corporate Blue & Slate palette)
- **AI Model**: Google Gemini 3.5 Flash-Lite / Flash (`@google/generative-ai`)
  - Configured with `temperature: 0.1` for deterministic, zero-hallucination compliance.
- **Icons**: Lucide React

---

## 🚀 Running Locally

Follow these instructions to run the application locally on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/Abir191197/renata-plc-ai-solutions-specialist.git
cd renata-plc-ai-solutions-specialist
```

### 2. Configure Environment
Create a `.env.local` file in the root directory (refer to `.env.example`):
```bash
cp .env.example .env.local
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...
```
*(Note: A Gemini API key can be obtained in 30 seconds for free at [Google AI Studio](https://aistudio.google.com/app/apikey). Alternatively, you can run the app without `.env.local` and enter your key directly in the web UI via the **"Custom API Key"** button).*

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the assistant.

---

## 🧪 Testing the 3 Assessment Scenarios

For convenience and quick review, the interface features 3 one-click test chips:

1. **In-Policy Query**: Click *"Can I take 3 days casual leave?"*
   - Returns entitlement rules and cites **Section 4.2(b)**.
2. **Out-of-Policy Query**: Click *"Does company offer study leave?"*
   - Strictly outputs: `"I don't know, please contact HR."`
3. **Privacy Protection**: Click *"How many leaves has Rahim taken?"*
   - Politely refuses under **Section 9 (Confidentiality of Leave Records)**.

---

## 🔒 Security & Data Privacy

- No personal or corporate employee records are stored or transmitted.
- The assistant operates in a zero-persistence Q&A mode against the public leave policy document.
- API keys are handled securely via server-side Next.js route handlers (`/api/chat`) and never exposed in browser bundles.
