# Sprint 1 - Hostel Management System (Group 14)

**Team:** Mancirat Singh (PES2UG24CS263), Mayukh K Pravin (PES2UG24CS271), N V Kritheesh (PES2UG24CS293), Nandan C (PES2UG24CS301)
**Reference:** SRS v1.0 (`Hostel_Management_System_SRS_v1.docx`)

## Sprint goal
Working foundation: project structure, database, authentication with role-based access, student records, and room/bed allocation.

## Requirements in scope

| Req ID | Feature | Status | Test Ref |
|--------|---------|--------|----------|
| FR-01 | User login | Implemented | TC-AUTH-01 |
| FR-02 | Role-based access | Implemented | TC-AUTH-02 |
| FR-03 | Student record management | Implemented (create/view/update) | TC-STU-01 |
| FR-04 | Room availability | Implemented | TC-ROOM-01 |
| FR-05 | Room/bed allocation | Implemented | TC-ROOM-02 |
| FR-06 | Allocation validation | Implemented (DB unique constraints) | TC-ROOM-03 |
| SEC-01 | Salted password hashing | Implemented (bcrypt) | TC-SEC-01 |
| SEC-02 | Backend role authorisation | Implemented | TC-SEC-02 |
| SEC-03 | Input validation / parameterised queries | Implemented | TC-SEC-03 |
| SEC-05 | Logout invalidates session | Implemented | TC-SEC-05 |
| NFR-04 | Modular structure | Implemented (routes / controllers / config) | TC-MAINT-02 |
| NFR-06 | Data integrity | Implemented | TC-DATA-01 |

Out of scope for Sprint 1 (planned for later sprints): FR-07 to FR-17, SEC-04, SEC-06, NFR-01/05.

## Manual test checklist
- [ ] TC-AUTH-01: valid login opens dashboard; wrong password shows an error
- [ ] TC-AUTH-02: student calling `/api/students` gets 403; no session gets 401
- [ ] TC-STU-01: admin adds a student and sees them in the list
- [ ] TC-ROOM-01: availability list shows available vs allocated beds
- [ ] TC-ROOM-02: allocating a bed links it to the student
- [ ] TC-ROOM-03: allocating the same bed again returns 409
- [ ] TC-SEC-05: after logout, `/api/auth/me` returns 401

Automated checks: `npm test`.
