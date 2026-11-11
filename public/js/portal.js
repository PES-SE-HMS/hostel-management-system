
/* =========================================================
   HOSTEL MANAGEMENT SYSTEM
   Portal Frontend
   Covers FR-07 to FR-11 and other portal features
   ========================================================= */

/* -------------------- DOM HELPERS -------------------- */

const $ = (id) => document.getElementById(id);

const J = {
  'Content-Type': 'application/json'
};

/* -------------------- SECURITY HELPER -------------------- */

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);

/* -------------------- API HANDLER -------------------- */

async function api(url, method = 'GET', body) {
  const response = await fetch(url, {
    method,
    headers: J,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (response.status === 401) {
    location.href = '/login.html';
    throw new Error('Authentication required');
  }

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      error: `Invalid server response (${response.status})`
    };
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

/* -------------------- MESSAGE HANDLER -------------------- */

const msg = (element, result, successMessage) => {
  if (!element) return;

  element.className = 'msg ' + (result.ok ? 'ok' : 'err');

  if (result.ok) {
    element.textContent = successMessage;
    return;
  }

  const details = result.data?.details;

  element.textContent = Array.isArray(details)
    ? details.join(', ')
    : details || result.data?.error || 'An unexpected error occurred';
};

/* -------------------- ERROR HANDLER -------------------- */

const showError = (element, error) => {
  if (!element) return;

  element.className = 'msg err';
  element.textContent = error.message || 'Something went wrong';
};

/* -------------------- FORM FIELD HELPER -------------------- */

const field = (id, label, type = 'text', extra = '') => `
  <div>
    <label for="${esc(id)}">${esc(label)}</label>
    <input id="${esc(id)}" type="${esc(type)}" ${extra}>
  </div>
`;

/* -------------------- TABLE GENERATOR -------------------- */

const table = (columns, rows) => `
  <table>
    <thead>
      <tr>
        ${columns.map(column => `<th>${esc(column[0])}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${
        rows.map(row => `
          <tr>
            ${columns.map(column => `<td>${column[1](row)}</td>`).join('')}
          </tr>
        `).join('')
        || `<tr><td colspan="${columns.length}">No records found</td></tr>`
      }
    </tbody>
  </table>
`;

/* -------------------- FORM VALIDATION -------------------- */

const validAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0;
};

const validDescription = (value) =>
  typeof value === 'string' && value.trim().length > 0;

/* -------------------- USER SESSION -------------------- */

let user;

/* =========================================================
   PORTAL SECTIONS
   ========================================================= */

const sections = [

  /* =======================================================
     FR-07: STUDENT FEE VIEW
     ======================================================= */

  {
    title: 'My Fees',
    roles: ['student'],

    async render(box) {
      box.innerHTML = '<p>Loading fee records...</p>';

      try {
        const result = await api('/api/fees/mine');

        if (!result.ok) {
          throw new Error(result.data?.error || 'Unable to load fees');
        }

        const data = Array.isArray(result.data) ? result.data : [];

        box.innerHTML = table([
          ['Description', r => esc(r.description)],
          ['Amount', r => esc(r.amount)],
          ['Paid', r => esc(r.paid_amount)],
          ['Due Date', r => esc(String(r.due_date ?? '').slice(0, 10))],
          ['Status', r => esc(r.status)]
        ], data);

      } catch (error) {
        box.innerHTML = '<p class="msg err">Unable to load fee records.</p>';
        console.error('Student fee loading error:', error);
      }
    }
  },

  /* =======================================================
     FR-07 AND FR-08: ADMIN FEE MANAGEMENT
     ======================================================= */

  {
    title: 'Fee Records',
    roles: ['admin'],

    async render(box) {
      box.innerHTML = '<p>Loading fee management...</p>';

      try {
        const studentResult = await api('/api/students');

        if (!studentResult.ok) {
          throw new Error(studentResult.data?.error || 'Unable to load students');
        }

        const students = Array.isArray(studentResult.data)
          ? studentResult.data
          : [];

        box.innerHTML = `
          <div class="grid">

            <div>
              <label for="feeStu">Student</label>
              <select id="feeStu">
                ${students.map(student => `
                  <option value="${esc(student.student_id)}">
                    ${esc(student.srn)} - ${esc(student.name)}
                  </option>
                `).join('')}
              </select>
            </div>

            ${field('feeAmt', 'Fee Amount', 'number', 'min="0.01" step="0.01"')}
            ${field('feeDue', 'Due Date', 'date')}

          </div>

          <button id="feeAdd" ${students.length === 0 ? 'disabled' : ''}>
            Add Fee
          </button>

          <span id="feeMsg" class="msg"></span>

          <div id="feeTbl">
            Loading records...
          </div>
        `;

        const load = async () => {
          const result = await api('/api/fees');

          if (!result.ok) {
            throw new Error(result.data?.error || 'Unable to load fee records');
          }

          const records = Array.isArray(result.data) ? result.data : [];

          $('feeTbl').innerHTML = table([
            ['SRN', r => esc(r.srn)],
            ['Student', r => esc(r.name)],
            ['Amount', r => esc(r.amount)],
            ['Paid', r => esc(r.paid_amount)],
            ['Due Date', r => esc(String(r.due_date ?? '').slice(0, 10))],
            ['Status', r => esc(r.status)],

            ['Record Payment', r => `
              <input
                type="number"
                min="0"
                step="0.01"
                id="pay${esc(r.fee_id)}"
                placeholder="Paid total"
              >
              <button data-fee="${esc(r.fee_id)}">
                Save
              </button>
            `]

          ], records);

          box.querySelectorAll('[data-fee]').forEach(button => {
            button.onclick = async () => {
              const feeId = button.dataset.fee;
              const amount = $('pay' + feeId)?.value;

              if (!validAmount(amount) && Number(amount) !== 0) {
                msg($('feeMsg'), {
                  ok: false,
                  data: { error: 'Enter a valid paid amount.' }
                });
                return;
              }

              try {
                button.disabled = true;

                const result = await api(
                  '/api/fees/' + feeId,
                  'PUT',
                  { paid_amount: amount }
                );

                msg($('feeMsg'), result, 'Payment updated successfully');

                if (result.ok) {
                  await load();
                }

              } catch (error) {
                showError($('feeMsg'), error);
              } finally {
                button.disabled = false;
              }
            };
          });
        };

        $('feeAdd').onclick = async () => {
          const amount = $('feeAmt').value;
          const dueDate = $('feeDue').value;
          const studentId = $('feeStu').value;

          if (!studentId || !validAmount(amount) || !dueDate) {
            msg($('feeMsg'), {
              ok: false,
              data: {
                error: 'Select a student and enter a valid amount and due date.'
              }
            });
            return;
          }

          try {
            $('feeAdd').disabled = true;

            const result = await api('/api/fees', 'POST', {
              student_id: studentId,
              amount,
              due_date: dueDate
            });

            msg($('feeMsg'), result, 'Fee record created successfully');

            if (result.ok) {
              $('feeAmt').value = '';
              $('feeDue').value = '';
              await load();
            }

          } catch (error) {
            showError($('feeMsg'), error);
          } finally {
            $('feeAdd').disabled = false;
          }
        };

        await load();

      } catch (error) {
        box.innerHTML = `
          <p class="msg err">
            Unable to initialize fee management.
          </p>
        `;
        console.error('Fee management error:', error);
      }
    }
  },

  /* =======================================================
     FR-09: STUDENT COMPLAINT SUBMISSION
     ======================================================= */

  {
    title: 'Complaints',
    roles: ['student'],

    async render(box) {
      box.innerHTML = `
        <div class="grid">

          <div>
            <label for="cCat">Category</label>
            <select id="cCat">
              ${[
                'plumbing',
                'electrical',
                'furniture',
                'cleanliness',
                'internet',
                'other'
              ].map(category => `
                <option value="${category}">
                  ${category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              `).join('')}
            </select>
          </div>

          ${field('cDesc', 'Description')}

        </div>

        <button id="cAdd">Submit Complaint</button>

        <span id="cMsg" class="msg"></span>

        <div id="cTbl"></div>
      `;

      const load = async () => {
        const result = await api('/api/complaints/mine');

        if (!result.ok) {
          throw new Error(result.data?.error || 'Unable to load complaints');
        }

        const records = Array.isArray(result.data) ? result.data : [];

        $('cTbl').innerHTML = table([
          ['Category', r => esc(r.category)],
          ['Description', r => esc(r.description)],
          ['Status', r => esc(r.status)]
        ], records);
      };

      $('cAdd').onclick = async () => {
        const category = $('cCat').value;
        const description = $('cDesc').value.trim();

        if (!validDescription(description)) {
          msg($('cMsg'), {
            ok: false,
            data: { error: 'Complaint description is required.' }
          });
          return;
        }

        try {
          $('cAdd').disabled = true;

          const result = await api('/api/complaints', 'POST', {
            category,
            description
          });

          msg($('cMsg'), result, 'Complaint submitted successfully');

          if (result.ok) {
            $('cDesc').value = '';
            await load();
          }

        } catch (error) {
          showError($('cMsg'), error);
        } finally {
          $('cAdd').disabled = false;
        }
      };

      try {
        await load();
      } catch (error) {
        $('cTbl').innerHTML = '<p class="msg err">Unable to load complaints.</p>';
        console.error('Complaint loading error:', error);
      }
    }
  },

  /* =======================================================
     FR-11: ADMIN / WARDEN COMPLAINT ASSIGNMENT
     ======================================================= */

  {
    title: 'Complaints - Assignment',
    roles: ['admin', 'warden'],

    async render(box) {
      box.innerHTML = '<p>Loading complaint assignments...</p>';

      try {
        const staffResult = await api('/api/complaints/staff');

        if (!staffResult.ok) {
          throw new Error(staffResult.data?.error || 'Unable to load staff');
        }

        const staff = Array.isArray(staffResult.data)
          ? staffResult.data
          : [];

        const options = staff.map(member => `
          <option value="${esc(member.user_id)}">
            ${esc(member.full_name)}
          </option>
        `).join('');

        box.innerHTML = `
          <span id="caMsg" class="msg"></span>
          <div id="caTbl">Loading complaints...</div>
        `;

        const load = async () => {
          const result = await api('/api/complaints');

          if (!result.ok) {
            throw new Error(result.data?.error || 'Unable to load complaints');
          }

          const complaints = Array.isArray(result.data)
            ? result.data
            : [];

          $('caTbl').innerHTML = table([
            ['SRN', r => esc(r.srn)],
            ['Category', r => esc(r.category)],
            ['Description', r => esc(r.description)],
            ['Status', r => esc(r.status)],
            ['Assigned To', r => esc(r.assigned_name || '-')],

            ['Assignment', r => {
              if (r.status === 'resolved') {
                return 'Resolved';
              }

              if (staff.length === 0) {
                return 'No maintenance staff available';
              }

              return `
                <select id="as${esc(r.complaint_id)}">
                  ${options}
                </select>

                <button data-as="${esc(r.complaint_id)}">
                  Assign
                </button>
              `;
            }]

          ], complaints);

          box.querySelectorAll('[data-as]').forEach(button => {
            button.onclick = async () => {
              const complaintId = button.dataset.as;
              const assignedTo = $('as' + complaintId)?.value;

              if (!assignedTo) {
                msg($('caMsg'), {
                  ok: false,
                  data: { error: 'Select a maintenance staff member.' }
                });
                return;
              }

              try {
                button.disabled = true;

                const result = await api(
                  `/api/complaints/${complaintId}/assign`,
                  'PUT',
                  { assigned_to: assignedTo }
                );

                msg($('caMsg'), result, 'Complaint assigned successfully');

                if (result.ok) {
                  await load();
                }

              } catch (error) {
                showError($('caMsg'), error);
              } finally {
                button.disabled = false;
              }
            };
          });
        };

        await load();

      } catch (error) {
        box.innerHTML = `
          <p class="msg err">
            Unable to load complaint assignment section.
          </p>
        `;
        console.error('Complaint assignment error:', error);
      }
    }
  },

  /* =======================================================
     FR-11: MAINTENANCE STAFF DASHBOARD
     ======================================================= */

  {
    title: 'Assigned Maintenance Requests',
    roles: ['maintenance'],

    async render(box) {
      const load = async () => {
        const result = await api('/api/complaints/assigned');

        if (!result.ok) {
          throw new Error(result.data?.error || 'Unable to load assigned requests');
        }

        const records = Array.isArray(result.data) ? result.data : [];

        box.innerHTML = `
          <span id="mMsg" class="msg"></span>

          ${table([
            ['Category', r => esc(r.category)],
            ['Description', r => esc(r.description)],
            ['Status', r => esc(r.status)],

            ['Update Status', r => {
              if (r.status === 'resolved') {
                return 'Completed';
              }

              return `
                <button
                  data-st="in_progress"
                  data-id="${esc(r.complaint_id)}"
                >
                  In Progress
                </button>

                <button
                  data-st="resolved"
                  data-id="${esc(r.complaint_id)}"
                >
                  Resolved
                </button>
              `;
            }]

          ], records)}
        `;

        box.querySelectorAll('[data-st]').forEach(button => {
          button.onclick = async () => {
            const complaintId = button.dataset.id;
            const status = button.dataset.st;

            try {
              button.disabled = true;

              const result = await api(
                `/api/complaints/${complaintId}/status`,
                'PUT',
                { status }
              );

              msg(
                $('mMsg'),
                result,
                result.data?.message || 'Complaint status updated'
              );

              if (result.ok) {
                await load();
              }

            } catch (error) {
              showError($('mMsg'), error);
            } finally {
              button.disabled = false;
            }
          };
        });
      };

      try {
        await load();
      } catch (error) {
        box.innerHTML = `
          <p class="msg err">
            Unable to load assigned maintenance requests.
          </p>
        `;
        console.error('Maintenance loading error:', error);
      }
    }
  },

  /* =======================================================
     STUDENT LEAVE / OUTPASS
     ======================================================= */

  {
    title: 'Leave / Outpass',
    roles: ['student'],

    async render(box) {
      box.innerHTML = `
        <div class="grid">
          ${field('lFrom', 'From', 'date')}
          ${field('lTo', 'To', 'date')}
          ${field('lReason', 'Reason')}
          ${field('lDest', 'Destination')}
        </div>

        <button id="lAdd">Submit Request</button>

        <span id="lMsg" class="msg"></span>

        <div id="lTbl"></div>
      `;

      const load = async () => {
        const result = await api('/api/leave/mine');

        if (!result.ok) {
          throw new Error(result.data?.error || 'Unable to load leave requests');
        }

        const records = Array.isArray(result.data) ? result.data : [];

        $('lTbl').innerHTML = table([
          ['From', r => esc(r.from_date)],
          ['To', r => esc(r.to_date)],
          ['Reason', r => esc(r.reason)],
          ['Status', r => esc(r.status)]
        ], records);
      };

      $('lAdd').onclick = async () => {
        const fromDate = $('lFrom').value;
        const toDate = $('lTo').value;
        const reason = $('lReason').value.trim();
        const destination = $('lDest').value.trim();

        if (!fromDate || !toDate || !reason || !destination) {
          msg($('lMsg'), {
            ok: false,
            data: { error: 'Complete all leave request fields.' }
          });
          return;
        }

        if (toDate < fromDate) {
          msg($('lMsg'), {
            ok: false,
            data: { error: 'End date cannot be before start date.' }
          });
          return;
        }

        try {
          $('lAdd').disabled = true;

          const result = await api('/api/leave', 'POST', {
            from_date: fromDate,
            to_date: toDate,
            reason,
            destination
          });

          msg($('lMsg'), result, 'Leave request submitted');

          if (result.ok) {
            $('lReason').value = '';
            $('lDest').value = '';
            await load();
          }

        } catch (error) {
          showError($('lMsg'), error);
        } finally {
          $('lAdd').disabled = false;
        }
      };

      try {
        await load();
      } catch (error) {
        $('lTbl').textContent = 'Unable to load leave requests.';
        console.error('Leave loading error:', error);
      }
    }
  },

  /* =======================================================
     WARDEN / ADMIN LEAVE REVIEW
     ======================================================= */

  {
    title: 'Leave / Outpass Review',
    roles: ['warden', 'admin'],

    async render(box) {
      const load = async () => {
        const result = await api('/api/leave');

        if (!result.ok) {
          throw new Error(result.data?.error || 'Unable to load leave requests');
        }

        const records = Array.isArray(result.data) ? result.data : [];

        box.innerHTML = `
          <span id="lrMsg" class="msg"></span>

          ${table([
            ['SRN', r => esc(r.srn)],
            ['Name', r => esc(r.student_name)],
            ['From', r => esc(r.from_date)],
            ['To', r => esc(r.to_date)],
            ['Reason', r => esc(r.reason)],
            ['Status', r => esc(r.status)],

            ['Decision', r => r.status === 'pending'
              ? `
                <button data-d="approved" data-id="${esc(r.leave_id)}">
                  Approve
                </button>

                <button
                  class="secondary"
                  data-d="rejected"
                  data-id="${esc(r.leave_id)}"
                >
                  Reject
                </button>
              `
              : 'Processed'
            ]

          ], records)}
        `;

        box.querySelectorAll('[data-d]').forEach(button => {
          button.onclick = async () => {
            try {
              button.disabled = true;

              const result = await api(
                `/api/leave/${button.dataset.id}/decision`,
                'PUT',
                { decision: button.dataset.d }
              );

              msg($('lrMsg'), result, 'Leave request updated');

              if (result.ok) {
                await load();
              }

            } catch (error) {
              showError($('lrMsg'), error);
            } finally {
              button.disabled = false;
            }
          };
        });
      };

      try {
        await load();
      } catch (error) {
        box.innerHTML = '<p class="msg err">Unable to load leave requests.</p>';
        console.error('Leave review error:', error);
      }
    }
  },

  /* =======================================================
     VISITOR MANAGEMENT
     ======================================================= */

  {
    title: 'Visitors',
    roles: ['warden', 'admin'],

    async render(box) {
      box.innerHTML = `
        <div class="grid">
          ${field('vName', 'Visitor Name')}
          ${field('vPurpose', 'Purpose')}
          ${field('vSrn', 'Student SRN (optional)')}
        </div>

        <button id="vAdd">Record Visitor</button>

        <span id="vMsg" class="msg"></span>

        <div id="vTbl"></div>
      `;

      const load = async () => {
        const result = await api('/api/visitors');

        if (!result.ok) {
          throw new Error(result.data?.error || 'Unable to load visitors');
        }

        const records = Array.isArray(result.data) ? result.data : [];

        $('vTbl').innerHTML = table([
          ['Visitor', r => esc(r.visitor_name)],
          ['Purpose', r => esc(r.purpose)],
          ['Time', r => esc(String(r.visit_time ?? '').replace('T', ' ').slice(0, 16))],
          ['Student', r => esc(r.srn || '-')]
        ], records);
      };

      $('vAdd').onclick = async () => {
        const visitorName = $('vName').value.trim();
        const purpose = $('vPurpose').value.trim();

        if (!visitorName || !purpose) {
          msg($('vMsg'), {
            ok: false,
            data: { error: 'Visitor name and purpose are required.' }
          });
          return;
        }

        try {
          $('vAdd').disabled = true;

          const result = await api('/api/visitors', 'POST', {
            visitor_name: visitorName,
            purpose,
            srn: $('vSrn').value.trim()
          });

          msg($('vMsg'), result, 'Visitor recorded successfully');

          if (result.ok) {
            $('vName').value = '';
            $('vPurpose').value = '';
            $('vSrn').value = '';
            await load();
          }

        } catch (error) {
          showError($('vMsg'), error);
        } finally {
          $('vAdd').disabled = false;
        }
      };

      try {
        await load();
      } catch (error) {
        $('vTbl').textContent = 'Unable to load visitors.';
        console.error('Visitor loading error:', error);
      }
    }
  },

  /* =======================================================
     ANNOUNCEMENTS
     ======================================================= */

  {
    title: 'Announcements',
    roles: ['student', 'warden', 'admin', 'maintenance'],

    async render(box) {
      const canPost = ['admin', 'warden'].includes(user.role);

      box.innerHTML = `
        ${canPost ? `
          <div class="grid">
            ${field('aTitle', 'Title')}
            ${field('aBody', 'Message')}

            <div>
              <label for="aAud">Audience</label>
              <select id="aAud">
                <option value="all">All</option>
                <option value="students">Students</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>

          <button id="aAdd">Publish Announcement</button>

          <span id="aMsg" class="msg"></span>
        ` : ''}

        <div id="aTbl"></div>
      `;

      const load = async () => {
        const result = await api('/api/announcements');

        if (!result.ok) {
          throw new Error(result.data?.error || 'Unable to load announcements');
        }

        const records = Array.isArray(result.data) ? result.data : [];

        $('aTbl').innerHTML = records.map(announcement => `
          <p>
            <strong>${esc(announcement.title)}</strong>

            <small>
              (${esc(announcement.audience)}, ${esc(announcement.posted_by)})
            </small>

            <br>

            ${esc(announcement.body)}
          </p>
        `).join('') || 'No announcements available.';
      };

      if (canPost) {
        $('aAdd').onclick = async () => {
          const title = $('aTitle').value.trim();
          const body = $('aBody').value.trim();

          if (!title || !body) {
            msg($('aMsg'), {
              ok: false,
              data: { error: 'Title and message are required.' }
            });
            return;
          }

          try {
            $('aAdd').disabled = true;

            const result = await api('/api/announcements', 'POST', {
              title,
              body,
              audience: $('aAud').value
            });

            msg($('aMsg'), result, 'Announcement published');

            if (result.ok) {
              $('aTitle').value = '';
              $('aBody').value = '';
              await load();
            }

          } catch (error) {
            showError($('aMsg'), error);
          } finally {
            $('aAdd').disabled = false;
          }
        };
      }

      try {
        await load();
      } catch (error) {
        $('aTbl').textContent = 'Unable to load announcements.';
        console.error('Announcement loading error:', error);
      }
    }
  },

  /* =======================================================
     ADMIN REPORTS
     ======================================================= */

  {
    title: 'Reports',
    roles: ['admin'],

    async render(box) {
      try {
        const result = await api('/api/reports/summary');

        if (!result.ok) {
          throw new Error(result.data?.error || 'Unable to load reports');
        }

        const data = result.data;

        box.innerHTML = `
          <table>
            <tr>
              <th>Occupancy</th>
              <td>
                ${esc(data.occupancy.occupied_beds)}
                of
                ${esc(data.occupancy.total_beds)}
                beds
                (${esc(data.occupancy.occupancy_percent)}%)

                ,
                ${esc(data.occupancy.available_beds)}
                available
              </td>
            </tr>

            <tr>
              <th>Fees</th>
              <td>
                Paid: ${esc(data.fees.paid)}
                |
                Partially Paid: ${esc(data.fees.partially_paid)}
                |
                Pending: ${esc(data.fees.pending)}
                |
                Billed: ${esc(data.fees.total_billed)}
                |
                Collected: ${esc(data.fees.total_collected)}
              </td>
            </tr>

            <tr>
              <th>Complaints</th>
              <td>
                Open: ${esc(data.complaints.open_count)}
                |
                Assigned: ${esc(data.complaints.assigned)}
                |
                In Progress: ${esc(data.complaints.in_progress)}
                |
                Resolved: ${esc(data.complaints.resolved)}
              </td>
            </tr>
          </table>
        `;

      } catch (error) {
        box.innerHTML = `
          <p class="msg err">
            Unable to load reports.
          </p>
        `;
        console.error('Reports loading error:', error);
      }
    }
  }

];

/* =========================================================
   PORTAL INITIALIZATION
   ========================================================= */

(async () => {
  try {
    const result = await api('/api/auth/me');

    if (!result.ok || !result.data?.user) {
      throw new Error('Unable to retrieve logged-in user');
    }

    user = result.data.user;

    $('who').textContent = `${user.name} (${user.role})`;

    $('logout').onclick = async () => {
      try {
        await api('/api/auth/logout', 'POST');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        location.href = '/login.html';
      }
    };

    const availableSections = sections.filter(section =>
      section.roles.includes(user.role)
    );

    for (const section of availableSections) {
      const element = document.createElement('section');

      element.innerHTML = `
        <h2>${esc(section.title)}</h2>
        <div class="body"></div>
      `;

      $('main').appendChild(element);

      try {
        await section.render(element.querySelector('.body'));
      } catch (error) {
        console.error(`Section loading error (${section.title}):`, error);

        element.querySelector('.body').innerHTML = `
          <p class="msg err">
            Unable to load this section.
          </p>
        `;
      }
    }

  } catch (error) {
    console.error('Portal initialization error:', error);

    if (error.message !== 'Authentication required') {
      document.body.innerHTML = `
        <main>
          <h2>Portal Loading Error</h2>
          <p>
            Unable to initialize the portal.
            Please check the server and database connection.
          </p>
        </main>
      `;
    }
  }
})();
