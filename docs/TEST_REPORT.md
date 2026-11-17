# Test Report - Hostel Management System (Group 14)

**Tester:** Nandan C (PES2UG24CS301)  **Issues:** #23 (functional), #24 (security and non-functional)
**Reference:** SRS v1.0 (Sections 4, 5, 8), `docs/SPRINT1.md`, `docs/TEAM_TASKS.md`
**Test period:** November 2026
**Build under test:** Manual tests were executed on commit `dcdea84`. After a teammate update, the automated suite was re-run on commit `1455cf2` (20 of 20 passed). See section 5.
**Environment:** Windows, Node.js LTS, MySQL 8.4.9, app run locally (`npm start`, http://localhost:3000), seed data from `database/seed.js`
**Accounts used:** admin1, warden1, maint1, student1 (demo accounts from the seed script)
**Browsers used:** Microsoft Edge, Brave, Opera (see TC-COMPAT-01)

## 1. Summary

| Area | Result |
|---|---|
| Automated tests (`npm test`, commit 1455cf2) | 20 of 20 passed |
| Functional (17 tests) | 17 Pass |
| Security (6 tests) | 5 Pass, 1 Not applicable (TC-SEC-04) |
| Non-functional (6 tests) | 5 Pass, 1 Partial (TC-COMPAT-01) |
| Defects found | 1 (security: a real database password is committed in `.env.example` on main, see section 6). No functional defects. Observations are in section 5. |

## 2. Results table

| Test ID | Requirement | Result |
|---|---|---|
| TC-AUTH-01 | FR-01 | Pass |
| TC-AUTH-02 | FR-02 | Pass |
| TC-STU-01 | FR-03 | Pass |
| TC-ROOM-01 | FR-04 | Pass |
| TC-ROOM-02 | FR-05 | Pass |
| TC-ROOM-03 | FR-06 | Pass |
| TC-FEE-01 | FR-07 | Pass |
| TC-FEE-02 | FR-08 | Pass |
| TC-COMP-01 | FR-09 | Pass |
| TC-COMP-02 | FR-10 | Pass |
| TC-MAINT-01 | FR-11 | Pass |
| TC-LEAVE-01 | FR-12 | Pass |
| TC-LEAVE-02 | FR-13 | Pass |
| TC-LEAVE-03 | FR-14 | Pass |
| TC-VIS-01 | FR-15 | Pass |
| TC-ANN-01 | FR-16 | Pass |
| TC-REPORT-01 | FR-17 | Pass |
| TC-SEC-01 | SEC-01 | Pass |
| TC-SEC-02 | SEC-02 | Pass |
| TC-SEC-03 | SEC-03 | Pass |
| TC-SEC-04 | SEC-04 | Not applicable |
| TC-SEC-05 | SEC-05 | Pass |
| TC-SEC-06 | SEC-06 | Pass |
| TC-PERF-01 | NFR-01 | Pass |
| TC-UX-01 | NFR-02 | Pass |
| TC-REL-01 | NFR-03 | Pass |
| TC-MAINT-02 | NFR-04 | Pass |
| TC-COMPAT-01 | NFR-05 | Partial |
| TC-DATA-01 | NFR-06 | Pass |

## 3. Automated tests

`npm test` on commit `1455cf2`: **20 tests, 20 pass, 0 fail**.

| Automated check | What it verifies |
|---|---|
| TC-FEE-01 to TC-FEE-05 | Valid fee record passes; invalid amounts and impossible dates rejected; payment status calculated; excessive payment rejected |
| TC-COMP-01, TC-COMP-02 | Valid complaint passes; invalid complaints rejected |
| TC-MAINT-01, TC-MAINT-02 | Valid maintenance transitions allowed; invalid transitions rejected |
| TC-LEAVE-01 to TC-LEAVE-04 | Valid leave passes; invalid leave and impossible dates rejected |
| TC-VIS-01, TC-VIS-02 | Visitor requires valid date and time; missing or impossible date/time rejected |
| TC-ANN-01 | Announcement audience restricted by role |
| TC-REPORT-01 | Occupancy summary totals and percentage are correct |
| TC-STU-01 | Valid student passes validation and is normalised |
| TC-DATA-01 | Missing or invalid fields rejected |
| TC-AUTH-02 | Role guard blocks unauthenticated and wrong-role users |

These are unit-level checks written by the developers. Some IDs match SRS test IDs but test smaller pieces (for example, the automated TC-MAINT-02 checks maintenance status transitions, while SRS TC-MAINT-02 checks the modular code structure). The SRS test IDs are reported in section 4.

![Automated tests](screenshots/TC-AUTOMATED.png)

## 4. Evidence by test

### Functional (issue #23)

**TC-AUTH-01 - Login (Pass).** Valid login as admin1 opened the dashboard. A wrong password showed "Invalid username or password".
![TC-AUTH-01 valid login](screenshots/TC-AUTH-01_1.png)
![TC-AUTH-01 wrong password](screenshots/TC-AUTH-01_2.png)

**TC-AUTH-02 - Role-based access (Pass).** As a student, `/api/students` returned 403. With no session it returned 401.
![TC-AUTH-02 student gets 403](screenshots/TC-AUTH-02_1.png)
![TC-AUTH-02 no session gets 401](screenshots/TC-AUTH-02_2.png)

**TC-STU-01 - Student records (Pass).** Admin added students and they appear in the list.
![TC-STU-01](screenshots/TC-STU-01.png)

**TC-ROOM-01 - Room availability (Pass).** The list shows each bed as available or allocated.
![TC-ROOM-01](screenshots/TC-ROOM-01.png)

**TC-ROOM-02 - Bed allocation (Pass).** Allocating a bed showed "Bed allocated", the bed became allocated, and the student's room appeared in the student list.
![TC-ROOM-02](screenshots/TC-ROOM-02.png)

**TC-ROOM-03 - Duplicate allocation (Pass).** Allocating an occupied bed was rejected with 409 and "Bed already allocated, or student already has an active allocation".
![TC-ROOM-03](screenshots/TC-ROOM-03.png)

**TC-FEE-01 - Fee records (Pass).** Admin can add a fee with amount and due date and record a payment.
![TC-FEE-01](screenshots/TC-FEE-01.png)

**TC-FEE-02 - Fee status and student view (Pass).** The status was Partially Paid at 50000 of 120000 and Paid at 120000 of 120000. The student sees only their own fee.
![TC-FEE-02 partially paid](screenshots/TC-FEE-02_1.png)
![TC-FEE-02 paid](screenshots/TC-FEE-02_2.png)

**TC-COMP-01 - Submit complaint (Pass).** The student submitted a complaint, saw "Complaint submitted", and the new complaint has status open.
![TC-COMP-01](screenshots/TC-COMP-01.png)

**TC-COMP-02 - View own complaints (Pass).** The student sees their own complaints with category, description and status.
![TC-COMP-02](screenshots/TC-COMP-02.png)

**TC-MAINT-01 - Assign and update (Pass).** The warden assigned the complaint to maintenance staff. The maintenance user saw it and updated it from in progress to resolved.
![TC-MAINT-01 warden assigns](screenshots/TC-MAINT-01_1.png)
![TC-MAINT-01 maintenance in progress](screenshots/TC-MAINT-01_2.png)
![TC-MAINT-01 resolved](screenshots/TC-MAINT-01_3.png)

**TC-LEAVE-01 - Submit leave (Pass).** The student submitted a request ("Request submitted", status pending) and it appears in the warden's review list.
![TC-LEAVE-01 student](screenshots/TC-LEAVE-01_1.png)
![TC-LEAVE-01 warden queue](screenshots/TC-LEAVE-01_2.png)

**TC-LEAVE-02 - Warden decision (Pass).** Approve and Reject appear only for pending requests. After a decision the buttons are removed, so a second decision is not possible. The backend also rejects it, because the update only applies to pending requests.
![TC-LEAVE-02](screenshots/TC-LEAVE-02.png)

**TC-LEAVE-03 - Student sees decision (Pass).** The student's list shows approved and rejected statuses.
![TC-LEAVE-03](screenshots/TC-LEAVE-03.png)

**TC-VIS-01 - Visitor records (Pass).** Visitors recorded by staff appear in the list with purpose and time.
![TC-VIS-01](screenshots/TC-VIS-01.png)

**TC-ANN-01 - Announcements (Pass).** The warden published an announcement ("Published"). The student can read announcements but has no publish form (only admin and warden can publish).
![TC-ANN-01 warden publishes](screenshots/TC-ANN-01_warden.png)
![TC-ANN-01 student view](screenshots/TC-ANN-01_student.png)

**TC-REPORT-01 - Reports (Pass).** Occupancy, fee and complaint totals on the Reports tab matched the SQL results on two checks: once initially, and again after changing a fee payment (billed and collected figures and the fee status updated).
![TC-REPORT-01 Reports tab](screenshots/TC-REPORT-01_1.png)
![TC-REPORT-01 SQL output](screenshots/TC-REPORT-01_2.png)

### Security (issue #24)

**TC-SEC-01 - Password hashing (Pass).** All 4 users have bcrypt hashes (start with `$2a$10$`, length 60). No plaintext passwords.
![TC-SEC-01](screenshots/TC-SEC-01.png)

**TC-SEC-02 - Backend role authorisation (Pass).** As a student, `/api/fees` returned 403 (this screenshot) and `/api/students` returned 403 (see TC-AUTH-02).
![TC-SEC-02](screenshots/TC-SEC-02.png)

**TC-SEC-03 - Input validation / SQL injection (Pass).** The username `' OR 1=1 --` did not log in. A student name containing `' OR '1'='1` was stored as plain text and the list loaded normally (see TC-STU-01).
![TC-SEC-03](screenshots/TC-SEC-03.png)

**TC-SEC-04 - HTTPS (Not applicable).** The system was tested locally over HTTP. This requirement applies to a deployed system, so it was not tested.

**TC-SEC-05 - Logout invalidates session (Pass).** After logout, `/api/auth/me` returned 401.
![TC-SEC-05](screenshots/TC-SEC-05.png)

**TC-SEC-06 - No sensitive data in errors or logs (Pass).** A failed login returned only a generic message (401). The server terminal showed no passwords, hashes or stack traces.
![TC-SEC-06 response](screenshots/TC-SEC-06_1.png)
![TC-SEC-06 server log](screenshots/TC-SEC-06_2.png)

### Non-functional (issue #24)

**TC-PERF-01 - Performance (Pass).** A script sent 200 requests (25 concurrent users x 8 rounds) to four API endpoints. Median 13 ms, 95th percentile 59 ms, slowest 70 ms, 0 error responses. The target is 95% under 3 seconds. Measured on one local machine with the seed data set.
![TC-PERF-01](screenshots/TC-PERF-01.png)

**TC-UX-01 - Usability (Pass).** The student can view fees, submit a complaint and request leave. Forms show labels, confirmation messages ("Complaint submitted", "Request submitted") and validation messages.
![TC-UX-01](screenshots/TC-UX-01.png)

**TC-REL-01 - Reliability (Pass).** A student was added, the application was stopped and started again, and the record was still present after logging back in.
![TC-REL-01 record added](screenshots/TC-REL-01_1.png)
![TC-REL-01 app restarted](screenshots/TC-REL-01_2.png)
![TC-REL-01 record still present](screenshots/TC-REL-01_3.png)

**TC-MAINT-02 - Modular structure (Pass).** `src` is split into `config`, `controllers`, `middleware`, `routes` and `utils`, with `app.js` and `server.js`.
![TC-MAINT-02](screenshots/TC-MAINT-02.png)

**TC-COMPAT-01 - Browser compatibility (Partial).** NFR-05 names Chrome, Edge and Firefox. The core workflow (login, student records, logout) worked in Microsoft Edge, Brave and Opera. Brave and Opera use the same engine as Chrome. Google Chrome itself and Firefox were not tested.
![Edge](screenshots/TC-COMPAT-01_edge.png)
![Brave](screenshots/TC-COMPAT-01_brave.png)
![Opera](screenshots/TC-COMPAT-01_opera.png)

**TC-DATA-01 - Data integrity (Pass).** Empty or invalid fields were rejected with clear messages, and a duplicate bed allocation was refused. Automated check TC-DATA-01 also passed.
![TC-DATA-01 validation](screenshots/TC-DATA-01_1.png)
![TC-DATA-01 duplicate allocation](screenshots/TC-DATA-01_2.png)

## 5. Build tested and observations

**Build tested.** The manual tests and their screenshots were executed on commit `dcdea84`. Commit `1455cf2` (pulled afterwards) changed the fees, complaints, visitors, reports and announcements code and rewrote the portal page. For that commit, only the automated suite (20 of 20) was re-run. The manual screens were not re-run on `1455cf2`.

**Observations (not failures), from the manual run on `dcdea84`:**

- The fee due date accepted any valid date, including past dates. The SRS defines no fixed due date. Suggest the Product Owner confirm. (Commit `1455cf2` now rejects impossible dates, per automated TC-FEE-03.)
- A fee payment is stored as one overwritable total, with no payment history.
- Leave requests and visitor records cannot be edited or deleted after saving.
- Validation messages show field names such as "srn is required" and "year must be between 1 and 6".
- TC-SEC-04 (HTTPS) and the Chrome and Firefox part of TC-COMPAT-01 need a deployed system or additional browsers.
- Testing added extra demo records (students PES2UG24CS111 to 555, one fee, complaints, leave requests and announcements). Re-seed the database for a clean run.

## 6. Defects

| # | Related test | What happened | Expected | Severity | Status |
|---|---|---|---|---|---|
| 1 | SEC-06 (sensitive data handling) | `.env.example` on `main` (commit `1455cf2`, `git diff dcdea84 1455cf2 -- .env.example`) contains a real MySQL password after `DB_PASSWORD=`. The value is intentionally not repeated here. | The template holds only placeholders. Real credentials belong only in `.env`, which is in `.gitignore`. | Medium | Reported to the team. The owner should change that password and push `DB_PASSWORD=` blank. The value stays in Git history until rewritten. |

No functional defects were found in the tests above.
