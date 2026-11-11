# Use-Case Specification Table (Hostel Management System)

Supports Figure 7.1 (Student) and Figure 7.2 (Administrator, Warden and Maintenance Staff).

## Actors

| Actor | Description |
|---|---|
| Student | Hostel resident who views room, fee and announcement information and submits complaints and leave/outpass requests. |
| Warden | Manages room and bed allocation, reviews student requests and complaints, records visitors and oversees hostel operations. |
| Administrator | Manages users and roles, student records, hostel/room/bed master data, fee and payment records, and reports. |
| Maintenance Staff | Views complaints assigned to them and updates their status. |

## Shared use cases

| ID | Use case | Actor(s) | Description | Precondition | Postcondition |
|---|---|---|---|---|---|
| UC-01 | Log in | Student, Warden, Administrator, Maintenance Staff | The user enters credentials; the system authenticates them and opens the home page for their role. | The user has an account. | The user is authenticated and a session is started. |
| UC-02 | Send Notification | None (system-triggered) | The system creates a notification for the affected user when a request is submitted, decided or updated. | Triggered by `«include»` from UC-S3, UC-S6, UC-W3, UC-W5 and UC-M2. | A notification is stored for the recipient. |
| UC-03 | Post Announcement | Administrator, Warden | The user writes and publishes an announcement for hostel residents. | Logged in as Administrator or Warden. | The announcement is published and visible to students (UC-S8). |

## Student use cases (Figure 7.1)

| ID | Use case | Actor(s) | Description | Precondition | Postcondition |
|---|---|---|---|---|---|
| UC-S1 | View Room and Bed Details | Student | Student views their allocated hostel, room and bed. | Logged in. | Allocation details are displayed (or a "not allocated" message). |
| UC-S2 | View Fee Status | Student | Student views fee amount, payments made and any dues. | Logged in; a fee record exists. | Fee status is displayed. |
| UC-S3 | Submit Complaint | Student | Student submits a maintenance complaint with a category and description. | Logged in; student has an allocated room. | Complaint is saved with status "Submitted"; the Warden is notified (UC-02). |
| UC-S4 | Attach Photo | Student | Student optionally attaches a photo to a complaint (extends UC-S3). | Complaint form is open. | Photo is stored with the complaint. |
| UC-S5 | Track Complaint Status | Student | Student views the current status of their complaints. | Logged in; at least one complaint submitted. | Complaint status is displayed. |
| UC-S6 | Submit Leave/Outpass Request | Student | Student requests leave or an outpass with dates and a reason. | Logged in. | Request is saved with status "Pending"; the Warden is notified (UC-02). |
| UC-S7 | Track Leave/Outpass Status | Student | Student views whether a request is pending, approved or rejected. | Logged in; at least one request submitted. | Request status is displayed. |
| UC-S8 | View Announcements | Student | Student reads hostel announcements. | Logged in. | Announcements are displayed. |
| UC-S9 | View Notifications | Student | Student reads their notifications. | Logged in. | Notifications are displayed and marked as read. |

## Administrator use cases (Figure 7.2)

| ID | Use case | Actor(s) | Description | Precondition | Postcondition |
|---|---|---|---|---|---|
| UC-A1 | Manage Users and Roles | Administrator | Creates, updates and deactivates user accounts and assigns roles. | Logged in as Administrator. | Account and role changes are saved. |
| UC-A2 | Manage Student Records | Administrator | Creates, updates, searches and removes student records. | Logged in as Administrator. | Student record changes are saved. |
| UC-A3 | Manage Hostel, Room and Bed Records | Administrator | Adds and edits hostels, rooms, beds and capacities. | Logged in as Administrator. | Records are saved; bed availability is updated. |
| UC-A4 | Manage Fee and Payment Records | Administrator | Defines fee structures, records payments and updates payment status. | Logged in as Administrator; student record exists. | Fee and payment records are saved; the student's fee status is updated. |
| UC-A5 | Generate Reports | Administrator | Generates occupancy, fee-due and complaint-status reports. | Logged in as Administrator. | The report is displayed or exported. |

## Warden use cases (Figure 7.2)

| ID | Use case | Actor(s) | Description | Precondition | Postcondition |
|---|---|---|---|---|---|
| UC-W1 | Allocate Room and Bed | Warden | Assigns an available bed to a student. | Logged in as Warden; student record exists; a bed is available. | Bed is marked occupied; allocation is saved. |
| UC-W2 | Reassign Room and Bed | Warden | Moves a student to a different room or bed. | Logged in as Warden; student currently allocated; target bed available. | Old bed is freed; new allocation is saved. |
| UC-W3 | Review Leave/Outpass Requests | Warden | Approves or rejects pending leave and outpass requests, with remarks. | Logged in as Warden; a pending request exists. | Request status is updated; the student is notified (UC-02). |
| UC-W4 | Review Complaints | Warden | Views submitted complaints and checks their details. | Logged in as Warden; a complaint exists. | Complaint is marked "Reviewed". |
| UC-W5 | Assign Complaint to Maintenance Staff | Warden | Assigns a reviewed complaint to a maintenance staff member (extends UC-W4). | Logged in as Warden; complaint reviewed. | Complaint is assigned; the staff member is notified (UC-02). |
| UC-W6 | Record Visitors | Warden | Records visitor name, student visited, and entry/exit time. | Logged in as Warden; student record exists. | Visitor entry is saved. |
| UC-W7 | View Student Records | Warden | Views student records (read-only). | Logged in as Warden. | Student details are displayed. |
| UC-W8 | View Warden Dashboard and Reports | Warden | Views occupancy, pending requests and open complaints. | Logged in as Warden. | Dashboard and reports are displayed. |

## Maintenance Staff use cases (Figure 7.2)

| ID | Use case | Actor(s) | Description | Precondition | Postcondition |
|---|---|---|---|---|---|
| UC-M1 | View Assigned Requests | Maintenance Staff | Views complaints and requests assigned to them. | Logged in as Maintenance Staff. | Assigned requests are displayed. |
| UC-M2 | Update Request Status | Maintenance Staff | Updates an assigned request to "In Progress" or "Resolved". | Logged in as Maintenance Staff; an assigned request exists. | Status is saved; the student is notified (UC-02). |

## Relationships

| Type | From | To |
|---|---|---|
| `«extend»` | UC-S4 Attach Photo | UC-S3 Submit Complaint |
| `«extend»` | UC-W5 Assign Complaint to Maintenance Staff | UC-W4 Review Complaints |
| `«include»` | UC-S3, UC-S6, UC-W3, UC-W5, UC-M2 | UC-02 Send Notification |

Authentication: every use case except UC-01 requires the user to be logged in (stated in a note on each diagram instead of drawing a line to UC-01 from every use case).
