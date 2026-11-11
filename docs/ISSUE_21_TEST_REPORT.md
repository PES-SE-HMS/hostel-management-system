# Issue #21 - Fee, Complaint and Maintenance Verification Test Report

## 1. Test information

| Field | Details |
|---|---|
| Project | Hostel Management System |
| Team | Group 14 |
| Issue | #21 |
| Issue title | Verify fees, complaints and maintenance (FR-07 to FR-11) |
| Verification date | 11 November 2026 |
| Environment | Windows local development environment |
| Backend | Node.js and Express |
| Database | MySQL 8.0 |
| Test command | `npm test` |

## 2. Objective

The objective of this verification was to test the implementation of the following functional requirements:

- **FR-07:** Fee record management
- **FR-08:** Payment management and payment status calculation
- **FR-09:** Student complaint submission
- **FR-10:** Complaint tracking
- **FR-11:** Maintenance assignment and status updates

Role-based access control was also checked to verify that users could access only the functionality permitted by their roles.

## 3. Automated test execution

The automated test suite was executed using:

```cmd
npm test
```

**Execution result:**

| Metric | Result |
|---|---:|
| Total automated tests | 14 |
| Passed | 14 |
| Failed | 0 |
| Overall result | PASS |

## 4. Automated test cases

| Test ID | Test description | Expected result | Result |
|---|---|---|---|
| TC-FEE-01 | Valid fee record | Valid fee record is accepted | Passed |
| TC-FEE-02 | Invalid fee amounts | Invalid fee amounts are rejected | Passed |
| TC-FEE-03 | Impossible dates | Invalid dates are rejected | Passed |
| TC-FEE-04 | Payment status calculation | Payment status is calculated correctly | Passed |
| TC-FEE-05 | Excessive payment | Payment exceeding the fee amount is rejected | Passed |
| TC-COMP-01 | Valid complaint | Valid complaint data is accepted | Passed |
| TC-COMP-02 | Invalid complaint | Invalid complaint data is rejected | Passed |
| TC-MAINT-01 | Valid maintenance transitions | Valid maintenance status transitions are accepted | Passed |
| TC-MAINT-02 | Invalid maintenance transitions | Invalid maintenance status transitions are rejected | Passed |
| TC-LEAVE-01 | Valid leave request | Valid leave request is accepted | Passed |
| TC-LEAVE-02 | Invalid leave request | Invalid leave request is rejected | Passed |
| TC-STU-01 | Student normalization | Student data is normalized correctly | Passed |
| TC-DATA-01 | Invalid or missing fields | Invalid or missing fields are rejected | Passed |
| TC-AUTH-02 | Role guard | Unauthorized role access is blocked | Passed |

## 5. Manual functional verification

Manual testing of the Issue #21 functionality was completed.

| Requirement | Verification activity | Result |
|---|---|---|
| FR-07 | Fee records were created and managed through the application | Passed |
| FR-08 | Fee payment amounts and payment statuses were checked | Passed |
| FR-09 | Student complaint submission was tested | Passed |
| FR-10 | Complaint listing and status tracking were tested | Passed |
| FR-11 | Complaint assignment and maintenance status updates were tested | Passed |
| FR-02 | Role-based access restrictions were checked | Passed |

## 6. Requirement-wise verification

### FR-07 - Fee record management

**Verification:** Admin fee management functionality was manually tested.

**Result:** Passed.

### FR-08 - Payment management

**Verification:** Payment recording, payment amount validation and payment status calculation were tested.

**Result:** Passed.

### FR-09 - Complaint submission

**Verification:** Student complaint submission was manually tested.

**Result:** Passed.

### FR-10 - Complaint tracking

**Verification:** Complaint listing and status visibility were manually tested.

**Result:** Passed.

### FR-11 - Maintenance assignment and updates

**Verification:** Complaint assignment to maintenance staff and maintenance status updates were manually tested.

**Result:** Passed.

## 7. Role-based access verification

Role-based access restrictions were checked during manual testing. The automated role guard test, TC-AUTH-02, also passed.

**Result:** Passed.

## 8. Final test summary

| Category | Result |
|---|---|
| Automated tests | 14/14 passed |
| Automated test failures | 0 |
| Manual verification of FR-07 | Passed |
| Manual verification of FR-08 | Passed |
| Manual verification of FR-09 | Passed |
| Manual verification of FR-10 | Passed |
| Manual verification of FR-11 | Passed |
| Role-based access verification | Passed |

## 9. Final conclusion

All five functional requirements assigned to Issue #21 (FR-07 to FR-11) were manually verified and marked as passed.

The automated test suite completed with 14 successful tests and zero failures.

Role-based access verification also passed.

**Final Issue #21 Status: PASS**

**Verification date:** 11 November 2026