
# Issue #21 - Fees, Complaints and Maintenance Test Report

**Project:** Hostel Management System
**Issue:** Verify fees, complaints and maintenance
**Requirements:** FR-07 to FR-11
**Tester:** Kritheesh NV

## 1. Automated Tests

| Test ID | Test Description | Expected Result | Actual Result |
|---|---|---|---|
| TC-FEE-01 | Valid fee creation validation | Pass | Pending |
| TC-FEE-02 | Invalid fee amount | Rejected | Pending |
| TC-FEE-03 | Invalid calendar date | Rejected | Pending |
| TC-FEE-04 | Payment status calculation | Correct status | Pending |
| TC-FEE-05 | Payment exceeding fee | Rejected | Pending |
| TC-COMP-01 | Valid complaint submission | Pass | Pending |
| TC-COMP-02 | Invalid complaint details | Rejected | Pending |
| TC-MAINT-01 | Valid status transitions | Pass | Pending |
| TC-MAINT-02 | Invalid status transitions | Rejected | Pending |

## 2. Functional Tests

| Requirement | Test | Result |
|---|---|---|
| FR-07 | Admin creates fee records | Pending |
| FR-08 | Payment status updates correctly | Pending |
| FR-09 | Student submits complaint | Pending |
| FR-10 | Student tracks own complaints | Pending |
| FR-11 | Warden assigns maintenance request | Pending |

## 3. Authorization Tests

| Test | Expected Result | Actual Result |
|---|---|---|
| Student accesses admin fee API | 403 | Pending |
| Student accesses all complaints API | 403 | Pending |
| Maintenance accesses assigned complaints | 200 | Pending |
| Unauthenticated user accesses protected API | 401 | Pending |

## 4. Defects Identified

1. Fee validation required stricter numeric and date validation.
2. Complaint assignment required reliable handling of repeated assignments.
3. Complaint status updates required explicit transition validation.
4. Maintenance frontend required error feedback.

## 5. Final Outcome

**Automated tests:** Pending

**Functional verification:** Pending

**Overall status:** Pending
