# Initial Database Entity List (Hostel Management System)

Names and purpose only. Attributes and relationships will be defined in the database design phase (MySQL).

| # | Entity | Purpose | Used by use cases |
|---|---|---|---|
| 1 | User | Login account with a role (Student, Warden, Administrator, Maintenance Staff). | UC-01, UC-A1 |
| 2 | Student | Student-specific details linked to a User. | UC-A2, UC-W7, UC-S1 |
| 3 | Hostel | A hostel building or block. | UC-A3 |
| 4 | Room | A room within a hostel. | UC-A3, UC-W1, UC-W2 |
| 5 | Bed | A bed within a room; the unit of allocation. | UC-A3, UC-W1, UC-W2 |
| 6 | Allocation | Links a student to a bed for a period. | UC-W1, UC-W2, UC-S1 |
| 7 | FeeRecord | Fee amount, due date and status for a student. | UC-A4, UC-S2 |
| 8 | Payment | A payment made against a fee record. | UC-A4, UC-S2 |
| 9 | Complaint | Maintenance request with status and optional photo; assigned to staff. | UC-S3, UC-S4, UC-S5, UC-W4, UC-W5, UC-M1, UC-M2 |
| 10 | LeaveRequest | Leave/outpass request with dates, reason and decision. | UC-S6, UC-S7, UC-W3 |
| 11 | Visitor | Visitor log entry linked to a student. | UC-W6 |
| 12 | Announcement | Notice posted by the Administrator or Warden. | UC-03, UC-S8 |
| 13 | Notification | Message generated for a user by system events. | UC-02, UC-S9 |

## Design decision

A single `User` table holds all four roles (via a role column). `Student` stores the extra student-specific details and links to `User`.
