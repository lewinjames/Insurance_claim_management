# Project 29: Insurance Claim Management System

> **College 2nd Year Internal Marks Mini-Project**  
> Built with **React.js, Node.js (Express), MongoDB / Mongoose**, and **JWT Authentication**.

---

## 📌 Project Overview
The **Insurance Claim Management System** is a full-stack web application developed to automate and digitize the end-to-end insurance claim processing lifecycle. The system provides role-based access control for **Administrators**, **Claim Officers**, and **Policyholders**, maintaining records from policy enrollment to final claim settlement disbursement.

---

## 👥 System Roles & Capabilities

| Role | Default Email | Default Password | Permissions & Functions |
|---|---|---|---|
| **Admin** | `admin@insurance.edu` | `Admin@123` | Full system access: Assign Claim Officers, Disburse Financial Settlements, Manage Users, View Analytics Reports. |
| **Claim Officer** | `officer@insurance.edu` | `Officer@123` | Inspect incident documents, assess claim validity, record formal investigation reviews, recommend Approval / Rejection. |
| **Policyholder** | `policyholder@insurance.edu` | `User@123` | View active insurance policies, submit new claims with supporting evidence documents, track settlement progress. |

*Note: 1-click Quick Login buttons are provided on the Login screen and top navigation bar for immediate evaluator demonstration.*

---

## 🗄️ Database Architecture: The 7 Mongoose Models

1. **`User`**: Account credentials, bcrypt password hashes, and system role (`Admin`, `Claim Officer`, `Policyholder`).
2. **`Policyholder`**: Personal demographics, address, contact numbers, emergency contact, occupation, and annual income.
3. **`Policy`**: Insurance contracts with unique policy number, coverage amount, annual premium, category (`Health`, `Auto`, `Home`, `Life`), and validity dates.
4. **`Claim`**: Core incident dossier with claim number, policy link, incident date, claimed amount, cause/reason, and workflow status (`Submitted`, `Under Review`, `Approved`, `Rejected`, `Settled`).
5. **`ClaimDocument`**: Supporting evidence files (Medical Bills, Police Reports, Damage Photos, Invoices, ID Proofs).
6. **`Review`**: Field investigation findings, officer notes, eligible approved amount, and recommendation (`Approve`, `Reject`, `Request More Info`).
7. **`Settlement`**: Financial disbursement records with transaction reference ID, payment mode (`Bank Transfer`, `UPI`, `Cheque`), and clearance status.

---

## 🔄 Core Claim Resolution Workflow
```text
1. Policyholder Files Claim
   └── Selects active policy, enters incident date & claimed amount
   └── Attaches hospital bill, repair invoice, or damage photo
         ▼
2. Admin Assigns Claim Officer
   └── Review assigned from pool of active Claim Officers
   └── Status moves to 'Under Review'
         ▼
3. Officer Conducts Investigation
   └── Verifies policy clause limits and attached documentation
   └── Submits Review with eligible assessed amount and recommendation
         ▼
4. Verdict Decision (Approved / Rejected)
   └── If Approved, claim is marked ready for financial payout
         ▼
5. Settlement Disbursement (Admin)
   └── Disburses payout via NEFT / UPI / Cheque with unique Transaction ID
   └── Claim status is marked as 'Settled'
```

---

## 💻 Tech Stack & Technical Requirements
- **Frontend**: ReactJS (Vite), React Router (`react-router-dom`), Context API (`AuthContext`), Controlled Forms with `event.preventDefault()`.
- **Backend**: ExpressJS with modular architecture:
  - `/backend/routes/`: Distinct routing files for all resources
  - `/backend/controllers/`: Business logic and data manipulation
  - `/backend/middlewares/`: JWT verification and role-based access control
  - `/backend/models/`: Formal Mongoose schemas with validation and indexes
  - `/backend/config/`: Database connection with automatic embedded storage fallback
- **Security**: JWT Bearer token authentication, `bcryptjs` password hashing (10 salt rounds), environment variables.
- **API Testing**: Postman Collection JSON export available in `/public/insurance_claim_postman_collection.json`.

---

## 🚀 Running the Project Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the Full-Stack development server (Port 3000)
npm run dev

# 3. Production Build
npm run build
```

---

## 📑 Postman Collection
Download the Postman collection directly from the in-app navigation bar (`/docs` or `/public/insurance_claim_postman_collection.json`) and import it into Postman to test all endpoints.
