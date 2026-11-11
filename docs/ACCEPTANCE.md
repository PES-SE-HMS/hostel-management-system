# Hostel Management System
# Acceptance Testing Document

**Project:** Hostel Management System (HMS)
**Course:** Software Engineering
**Institution:** PES University
**Group:** 14
**Testing Scope:** FR-07 to FR-11 â€” Fees, Payments, Complaints and Maintenance
**Document:** Acceptance Testing
**Version:** 1.0
**Date:** 11 November 2026

---

## 1. Introduction

This document defines the acceptance testing procedures for the Hostel Management System, focusing on the functional requirements FR-07 to FR-11.

The purpose of acceptance testing is to verify that the implemented features behave according to their expected functionality and that users with different roles can perform only the operations authorized for them.

The testing covers:

- Fee record management.
- Fee payment recording.
- Student complaint submission.
- Complaint status tracking.
- Complaint assignment and maintenance updates.

Testing includes frontend functionality, backend API operations, database persistence, and role-based access control.

## 2. Testing Environment

### 2.1 Software Requirements

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js |
| Web Framework | Express.js |
| Database | MySQL 8.0 |
| Database Driver | mysql2 |
| Authentication | Express Sessions |
| Password Hashing | bcrypt |
| Runtime | Node.js |
| Browser | Mozilla Firefox / Google Chrome |
| API Testing | Browser Developer Tools |

### 2.2 Database

The application uses a MySQL database named `hms`.

The database schema includes the following relevant tables:

| Table | Purpose |
|---|---|
| `users` | Stores login credentials and user roles |
| `students` | Stores student information |
| `fees` | Stores student fee records |
| `complaints` | Stores student complaints and their statuses |

Additional tables support hostel operations such as room allocation, announcements, visitors, beds, and leave requests.

### 2.3 Application Startup

The application is started using:

```bash
npm start
```

The application is accessed at:

```text
http://localhost:3000
```

The automated test suite is executed using:

```bash
npm test
```

### 2.4 Environment Configuration

The application uses environment variables configured through `.env`.

Required variables:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<mysql-password>
DB_NAME=hms
SESSION_SECRET=<session-secret>
```

The `.env` file must not be committed to the Git repository.

## 3. User Roles

The system supports four primary user roles.

| User Role | Responsibilities |
|---|---|
| Administrator | Manages fee records, oversees complaints, assigns maintenance requests and views reports |
| Warden | Monitors hostel operations, reviews complaints and assigns maintenance requests |
| Maintenance Staff | Views assigned complaints and updates their progress |
| Student | Views personal fee records, submits complaints and tracks complaint status |

### 3.1 Demo Accounts

The database seed script provides demo accounts.

| Username | Role |
|---|---|
| `admin1` | Administrator |
| `warden1` | Warden |
| `maint1` | Maintenance Staff |
| `student1` | Student |

Passwords are defined in the project's seed configuration and are not documented here.

## 4. Functional Requirements Under Test

### FR-07: Fee Record Management

**Description:** The system shall allow authorized administrators to create, view and update fee records associated with students.

**Acceptance Criteria:**

1. An administrator can access fee management.
2. The system displays existing fee records.
3. An administrator can select a student.
4. An administrator can create a fee record with an amount and due date.
5. The system stores the fee record in the database.
6. An administrator can view and update existing fee records.
7. Students can view only their own fee records.
8. Unauthorized users cannot create or modify fee records.

**Test Procedure:**

1. Log in as an administrator.
2. Open the fee management section.
3. Verify that existing fee records are displayed.
4. Select a student.
5. Enter a fee amount and due date.
6. Submit the fee record.
7. Verify that the new record appears in the fee table.
8. Modify an existing fee record.
9. Verify that the updated values are displayed.
10. Log in as a student and verify that only personal fee records are visible.

### FR-08: Fee Payment Management

**Description:** The system shall allow authorized administrators to record payments against student fee records.

**Acceptance Criteria:**

1. An administrator can view fee records and their payment details.
2. The system displays the total fee amount.
3. The system displays the amount already paid.
4. An administrator can enter an updated paid amount.
5. The system calculates or updates the outstanding balance correctly.
6. The fee payment status reflects the payment made.
7. The updated payment information persists in the database.
8. Invalid payment amounts are rejected.
9. Unauthorized users cannot modify payment records.

**Test Procedure:**

1. Log in as an administrator.
2. Open fee management.
3. Identify an existing fee record.
4. Record a payment amount.
5. Submit the update.
6. Verify that the paid amount changes.
7. Verify that the outstanding balance is correct.
8. Verify that the payment status is updated.
9. Attempt an invalid payment amount and verify that the system rejects it.

**Expected Payment States:**

| Payment Condition | Expected Status |
|---|---|
| No payment made | Pending |
| Payment is greater than zero but below the total amount | Partially Paid |
| Entire fee amount paid | Paid |

The implementation must enforce the applicable payment validation rules.

### FR-09: Complaint Submission

**Description:** The system shall allow students to submit complaints related to hostel facilities and services.

**Acceptance Criteria:**

1. A student can access the complaint submission section.
2. The system provides complaint categories.
3. A student can enter a complaint description.
4. The system validates required fields.
5. The complaint is associated with the logged-in student.
6. The complaint is saved in the database.
7. The submitted complaint appears in the student's complaint list.
8. Other students cannot submit complaints under another student's identity.

**Test Procedure:**

1. Log in as a student.
2. Open the complaints section.
3. Select a complaint category.
4. Enter a description.
5. Submit the complaint.
6. Verify that a success message is displayed.
7. Verify that the complaint appears in the complaint list.
8. Verify that the complaint is associated with the correct student.

**Supported Frontend Categories:**

- Plumbing
- Electrical
- Furniture
- Cleanliness
- Internet
- Other

### FR-10: Complaint Tracking

**Description:** The system shall allow students to view the complaints they have submitted and track their current status.

**Acceptance Criteria:**

1. A student can view their submitted complaints.
2. Each complaint displays its category.
3. Each complaint displays its description.
4. Each complaint displays its current status.
5. Status changes made by authorized staff are reflected in the student's complaint list.
6. Students cannot modify complaint assignments or administrative statuses.
7. Students cannot view complaints belonging to other students.

**Test Procedure:**

1. Log in as a student.
2. Submit a complaint or identify an existing complaint.
3. Verify that the complaint appears in the complaint list.
4. Record its initial status.
5. Log in as an administrator or warden.
6. Assign or update the complaint.
7. Log in again as the student.
8. Verify that the updated status is displayed.

**Complaint Statuses Used by the Frontend:**

| Status | Meaning |
|---|---|
| Open | Complaint submitted and awaiting assignment |
| Assigned | Complaint assigned to maintenance staff |
| In Progress | Maintenance work has started |
| Resolved | Complaint has been completed |

The backend and frontend must use consistent status values.

### FR-11: Complaint Assignment and Maintenance Management

**Description:** The system shall allow authorized administrators and wardens to assign complaints to maintenance personnel. Maintenance staff shall be able to view assigned complaints and update their progress.

**Acceptance Criteria:**

1. Administrators and wardens can view submitted complaints.
2. Administrators and wardens can view available maintenance personnel.
3. An authorized user can assign a complaint to maintenance staff.
4. The assigned staff member is stored in the database.
5. Maintenance personnel can view their assigned complaints.
6. Maintenance personnel can update complaint status.
7. The status can be changed to In Progress.
8. The status can be changed to Resolved.
9. Resolved complaints cannot be unnecessarily reassigned or modified.
10. Students can see the updated complaint status.
11. Unauthorized users cannot assign complaints or update maintenance status.

**Test Procedure:**

1. Log in as a student.
2. Submit a complaint.
3. Log in as an administrator or warden.
4. Open complaint assignment.
5. Identify the submitted complaint.
6. Select a maintenance staff member.
7. Assign the complaint.
8. Verify that the assignment is saved.
9. Log in as maintenance staff.
10. Open assigned maintenance requests.
11. Verify that the assigned complaint is displayed.
12. Update the complaint status to In Progress.
13. Verify that the status changes.
14. Update the status to Resolved.
15. Verify that the resolved status is displayed.
16. Log in as the student and verify that the updated status is visible.

## 5. Acceptance Test Cases

The following test cases provide a structured record of the required verification.

| Test ID | Requirement | Test Scenario | Expected Result |
|---|---|---|---|
| AT-07-01 | FR-07 | View fee records | Administrator sees existing fee records |
| AT-07-02 | FR-07 | Create a fee record | New fee record is stored |
| AT-07-03 | FR-07 | Update a fee record | Updated record is displayed |
| AT-07-04 | FR-07 | Student views fees | Student sees only personal records |
| AT-08-01 | FR-08 | Record a payment | Paid amount is updated |
| AT-08-02 | FR-08 | Verify payment status | Correct payment status is displayed |
| AT-08-03 | FR-08 | Submit invalid payment | System rejects invalid amount |
| AT-09-01 | FR-09 | Submit a complaint | Complaint is successfully stored |
| AT-09-02 | FR-09 | Submit incomplete complaint | Required-field validation is applied |
| AT-09-03 | FR-09 | Verify complaint ownership | Complaint belongs to logged-in student |
| AT-10-01 | FR-10 | View complaint status | Current status is displayed |
| AT-10-02 | FR-10 | Verify updated status | Student sees staff-updated status |
| AT-10-03 | FR-10 | Access another student's complaint | Access is denied |
| AT-11-01 | FR-11 | Assign complaint | Complaint is assigned to maintenance staff |
| AT-11-02 | FR-11 | View assigned requests | Maintenance staff sees assigned complaints |
| AT-11-03 | FR-11 | Update complaint status | Status changes to In Progress |
| AT-11-04 | FR-11 | Resolve complaint | Status changes to Resolved |
| AT-11-05 | FR-11 | Unauthorized assignment | Unauthorized operation is rejected |

## 6. Role-Based Access Control Testing

Role-based access control must be verified independently of the frontend.

| Operation | Administrator | Warden | Maintenance | Student |
|---|---|---|---|---|
| Create fee records | Allowed | Not specified | Denied | Denied |
| View all fee records | Allowed | Not specified | Denied | Denied |
| View personal fee records | Not applicable | Not applicable | Denied | Allowed |
| Record fee payments | Allowed | Not specified | Denied | Denied |
| Submit complaints | Not applicable | Not applicable | Not applicable | Allowed |
| View personal complaints | Not applicable | Not applicable | Not applicable | Allowed |
| View all complaints | Allowed | Allowed | Denied | Denied |
| Assign complaints | Allowed | Allowed | Denied | Denied |
| View assigned complaints | Not applicable | Not applicable | Allowed | Denied |
| Update maintenance status | Denied | Denied | Allowed | Denied |

**Note:** "Not specified" indicates that the current acceptance scope does not establish that permission. Confirm the backend authorization policy before treating it as a requirement.

## 7. Negative Testing

Negative testing verifies that invalid operations are rejected.

| Test ID | Scenario | Expected Result |
|---|---|---|
| NT-01 | Access a protected page without login | Redirect or authentication rejection |
| NT-02 | Submit a fee without an amount | Validation error |
| NT-03 | Submit a negative fee amount | Validation error |
| NT-04 | Submit an invalid payment amount | Payment rejected |
| NT-05 | Submit a complaint without a description | Validation error |
| NT-06 | Submit a complaint with invalid data | Request rejected |
| NT-07 | Assign a complaint to an invalid staff ID | Assignment rejected |
| NT-08 | Update a complaint using an invalid status | Status update rejected |
| NT-09 | Student attempts an administrative operation | Access denied |
| NT-10 | Maintenance staff attempts to assign complaints | Access denied |

## 8. Database Verification

Database verification ensures that application operations are persisted correctly.

The following SQL statements can be used during testing.

### 8.1 Verify Fee Records

```sql
USE hms;

SELECT *
FROM fees;
```

### 8.2 Verify Student Fee Records

```sql
SELECT *
FROM fees
WHERE student_id = (
    SELECT student_id
    FROM students
    LIMIT 1
);
```

### 8.3 Verify Complaints

```sql
SELECT *
FROM complaints;
```

### 8.4 Verify Complaint Assignments

```sql
SELECT *
FROM complaints
WHERE assigned_to IS NOT NULL;
```

### 8.5 Verify Complaint Statuses

```sql
SELECT status, COUNT(*) AS total
FROM complaints
GROUP BY status;
```

These queries are intended for inspection. Actual column names and relationships must match the database schema.

## 9. Browser and API Verification

Browser Developer Tools are used to inspect frontend behavior and backend responses.

### 9.1 Console

Verify that:

- No uncaught JavaScript errors occur.
- Event handlers execute correctly.
- API failures are reported clearly.
- No unexpected runtime exceptions occur.

### 9.2 Network

Use the Fetch/XHR filter to inspect API requests.

Verify:

- Correct request URL.
- Correct HTTP method.
- Correct request payload.
- Expected HTTP response status.
- Correct response data.
- No unexpected 401, 403, 404 or 500 responses.

### 9.3 Expected API Endpoints

The frontend references the following endpoints. Their existence and behavior must be confirmed against the backend route definitions.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/fees/mine` | Retrieve student's fee records |
| GET | `/api/students` | Retrieve students |
| GET | `/api/fees` | Retrieve fee records |
| POST | `/api/fees` | Create fee record |
| PUT | `/api/fees/:id` | Update fee/payment record |
| GET | `/api/complaints/mine` | Retrieve student's complaints |
| POST | `/api/complaints` | Submit complaint |
| GET | `/api/complaints` | Retrieve complaints |
| GET | `/api/complaints/staff` | Retrieve maintenance staff |
| GET | `/api/complaints/assigned` | Retrieve assigned complaints |
| PUT | `/api/complaints/:id/assign` | Assign complaint |
| PUT | `/api/complaints/:id/status` | Update complaint status |

## 10. Acceptance Criteria Summary

The project will satisfy the acceptance scope when:

1. Fee records can be created and updated by authorized administrators.
2. Students can view their own fee records.
3. Fee payments are recorded and payment statuses are updated correctly.
4. Students can submit complaints.
5. Students can track the status of their complaints.
6. Administrators and wardens can assign complaints to maintenance personnel.
7. Maintenance personnel can view their assigned complaints.
8. Maintenance personnel can update complaint statuses.
9. Unauthorized operations are rejected.
10. Changes are persisted correctly in the MySQL database.
11. The frontend and backend communicate without unexpected errors.

## 11. Test Execution Record

Test results must be entered after executing the corresponding test cases.

| Test ID | Execution Status | Actual Result | Remarks |
|---|---|---|---|
| AT-07-01 | Not Tested | â€” | Pending execution |
| AT-07-02 | Not Tested | â€” | Pending execution |
| AT-07-03 | Not Tested | â€” | Pending execution |
| AT-07-04 | Not Tested | â€” | Pending execution |
| AT-08-01 | Not Tested | â€” | Pending execution |
| AT-08-02 | Not Tested | â€” | Pending execution |
| AT-08-03 | Not Tested | â€” | Pending execution |
| AT-09-01 | Not Tested | â€” | Pending execution |
| AT-09-02 | Not Tested | â€” | Pending execution |
| AT-09-03 | Not Tested | â€” | Pending execution |
| AT-10-01 | Not Tested | â€” | Pending execution |
| AT-10-02 | Not Tested | â€” | Pending execution |
| AT-10-03 | Not Tested | â€” | Pending execution |
| AT-11-01 | Not Tested | â€” | Pending execution |
| AT-11-02 | Not Tested | â€” | Pending execution |
| AT-11-03 | Not Tested | â€” | Pending execution |
| AT-11-04 | Not Tested | â€” | Pending execution |
| AT-11-05 | Not Tested | â€” | Pending execution |

**Execution status definitions:**

- **Not Tested:** Test has not been executed.
- **Passed:** Actual result matches expected result.
- **Failed:** Actual result differs from expected result.
- **Blocked:** Test cannot be executed because of an unresolved dependency or defect.

## 12. Defect Reporting

Any failed acceptance test must be recorded with:

| Field | Description |
|---|---|
| Defect ID | Unique defect identifier |
| Test Case ID | Related acceptance test |
| Description | Explanation of the observed issue |
| Steps to Reproduce | Exact steps that trigger the issue |
| Expected Result | Intended system behavior |
| Actual Result | Observed system behavior |
| Severity | Critical, High, Medium or Low |
| Status | Open, In Progress or Resolved |

Defects should be corrected and the corresponding acceptance tests executed again.

## 13. Final Acceptance

The implementation of FR-07 to FR-11 is accepted only after:

- All mandatory acceptance test cases have been executed.
- All critical and high-severity defects have been resolved.
- Role-based access restrictions have been verified.
- Database persistence has been confirmed.
- Relevant frontend and backend operations have been validated.

**Current document status:** Acceptance test plan prepared. Final acceptance is pending test execution and result recording.

---

**End of Acceptance Testing Document**
