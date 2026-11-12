# Issue #22 - Leave, Visitors, Announcements, Reports and Portal Verification

## Scope

- FR-12: Leave/outpass request submission
- FR-13: Leave approval/rejection
- FR-14: Student leave status visibility
- FR-15: Visitor records
- FR-16: Announcements
- FR-17: Administrative reports
- Portal page: `public/portal.html`

## Changes made

- Replaced permissive JavaScript date parsing with strict calendar-date and date-time validation.
- Reject impossible leave dates such as `2026-02-31`.
- Require visitor date/time and validate the calendar date and clock-time components.
- Added a `datetime-local` input to the visitor form and submit the selected value to the API.
- Expanded visitor search to include visitor name, associated student SRN, and student name.
- Display the leave review timestamp in the student's leave request list.
- Protected direct requests for `/portal.html` with the login middleware; API endpoints continue to enforce their own role permissions.
- Reworked occupancy aggregation to avoid join fan-out and added consistent numeric summary values.
- Extracted announcement audience filtering and occupancy calculation into testable functions.

## Automated verification

Command: `npm test`

Result: **20 passed, 0 failed**.

Additional checks: `node --check` passed for the modified JavaScript files.

## Verification limitation

The automated tests cover pure validation and calculation logic. They do not constitute live MySQL/API integration tests or browser-based end-to-end tests. Those require the project database and a running application. FR-12 through FR-17 must not be marked fully accepted until the integration and role-based workflows are exercised in the configured environment.
