import http from 'http';
import app from './server.js';

let passed = 0;
let failed = 0;

const logTest = (name, ok, details = '') => {
  if (ok) {
    passed++;
    console.log(`  ✅ PASS: ${name}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${name} -> ${details}`);
  }
};

const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const runAllTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 CampusFlow Automated End-to-End API Test Suite');
  console.log('======================================================\n');

  // Wait 3.5s for server connection and automatic database seeding
  console.log('⏳ Waiting for database connection and data sync...');
  await new Promise((r) => setTimeout(r, 3500));

  let adminToken = '';
  let facultyToken = '';
  let studentToken = '';
  let testEventId = '';
  let testResourceId = '';

  // 1. Health check
  try {
    const res = await makeRequest('GET', '/api/health');
    logTest('API Health Check', res.status === 200 && res.data.status === 'healthy');
  } catch (e) {
    logTest('API Health Check', false, e.message);
  }

  // 2. Auth Login - Admin
  try {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@campusflow.edu',
      password: 'Admin@12345',
    });
    const ok = res.status === 200 && res.data.token && res.data.user.role === 'admin';
    if (ok) adminToken = res.data.token;
    logTest('Admin Authentication (admin@campusflow.edu)', ok, res.data?.message);
  } catch (e) {
    logTest('Admin Authentication', false, e.message);
  }

  // 3. Auth Login - Faculty
  try {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'faculty@campusflow.edu',
      password: 'Faculty@12345',
    });
    const ok = res.status === 200 && res.data.token && res.data.user.role === 'faculty';
    if (ok) facultyToken = res.data.token;
    logTest('Faculty Authentication (faculty@campusflow.edu)', ok, res.data?.message);
  } catch (e) {
    logTest('Faculty Authentication', false, e.message);
  }

  // 4. Auth Login - Student
  try {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: 'student@campusflow.edu',
      password: 'Student@12345',
    });
    const ok = res.status === 200 && res.data.token && res.data.user.role === 'student';
    if (ok) studentToken = res.data.token;
    logTest('Student Authentication (student@campusflow.edu)', ok, res.data?.message);
  } catch (e) {
    logTest('Student Authentication', false, e.message);
  }

  // 5. Test Register New Student
  try {
    const testEmail = `newstudent_${Date.now()}@campusflow.edu`;
    const res = await makeRequest('POST', '/api/auth/register', {
      name: 'Test Candidate',
      email: testEmail,
      password: 'Password@123',
      idNumber: `ID-${Date.now().toString().slice(-5)}`,
      department: 'Computer Science and Engineering',
      yearOfStudy: '1st Year',
      role: 'student',
    });
    logTest('Student Registration Validation & Creation', res.status === 201 && res.data.token);
  } catch (e) {
    logTest('Student Registration', false, e.message);
  }

  // 6. Test Admin Secret Key Security Check
  try {
    const res = await makeRequest('POST', '/api/auth/register', {
      name: 'Fake Admin',
      email: 'fakeadmin@test.com',
      password: 'Password@123',
      idNumber: 'BAD-001',
      department: 'Administration',
      role: 'admin',
      adminSecretKey: 'WRONG_SECRET',
    });
    logTest('Admin Unauthorized Registration Block (403 Forbidden)', res.status === 403);
  } catch (e) {
    logTest('Admin Unauthorized Registration Block', false, e.message);
  }

  // 7. Get Events List
  try {
    const res = await makeRequest('GET', '/api/events');
    const ok = res.status === 200 && Array.isArray(res.data.events) && res.data.events.length > 0;
    if (ok) testEventId = res.data.events[0]._id;
    logTest('Get Events Catalogue', ok);
  } catch (e) {
    logTest('Get Events Catalogue', false, e.message);
  }

  // 8. Event Registration (Student)
  try {
    const res = await makeRequest('POST', `/api/events/${testEventId}/register`, {}, studentToken);
    const ok = res.status === 200 || res.status === 201 || (res.status === 400 && res.data.message.includes('already registered'));
    logTest('Event Registration (Capacity & Duplicate Check)', ok);
  } catch (e) {
    logTest('Event Registration', false, e.message);
  }

  // 9. Get Resources
  try {
    const res = await makeRequest('GET', '/api/resources');
    const ok = res.status === 200 && Array.isArray(res.data.resources) && res.data.resources.length > 0;
    if (ok) testResourceId = res.data.resources[0]._id;
    logTest('Get Campus Resources List', ok);
  } catch (e) {
    logTest('Get Campus Resources List', false, e.message);
  }

  // 10. Create Resource Booking (Student)
  let testBookingId = '';
  try {
    const res = await makeRequest(
      'POST',
      '/api/bookings',
      {
        resource: testResourceId,
        bookingDate: '2026-12-05',
        startTime: '10:00',
        endTime: '12:00',
        purpose: 'Automated Test Lab Demonstration',
        attendeesCount: 25,
      },
      studentToken
    );
    const ok = res.status === 201 && res.data.booking;
    if (ok) testBookingId = res.data.booking._id;
    logTest('Submit Resource Booking Request', ok);
  } catch (e) {
    logTest('Submit Resource Booking Request', false, e.message);
  }

  // 11. Test CONFLICT DETECTION ENGINE on Overlapping Booking
  try {
    // Attempt to book the exact same resource, same date, overlapping time (11:00 - 13:00)
    const res = await makeRequest(
      'POST',
      '/api/bookings',
      {
        resource: testResourceId,
        bookingDate: '2026-12-05',
        startTime: '11:00',
        endTime: '13:00',
        purpose: 'Conflicting Booking Test',
        attendeesCount: 10,
      },
      facultyToken
    );
    logTest('Conflict Prevention Engine (409 Conflict on Overlap)', res.status === 409);
  } catch (e) {
    logTest('Conflict Prevention Engine', false, e.message);
  }

  // 12. Admin Review & Approve Booking
  if (testBookingId) {
    try {
      const res = await makeRequest(
        'PUT',
        `/api/bookings/${testBookingId}/status`,
        {
          status: 'approved',
          adminRemarks: 'Automated test approval verification.',
        },
        adminToken
      );
      logTest('Admin Booking Approval Workflow', res.status === 200 && res.data.booking.status === 'approved');
    } catch (e) {
      logTest('Admin Booking Approval Workflow', false, e.message);
    }
  }

  // 13. Create & Get Announcements
  try {
    const createRes = await makeRequest(
      'POST',
      '/api/announcements',
      {
        title: 'Automated Test Notice',
        content: 'This circular verifies announcement publication and notification broadcasting.',
        category: 'Academic',
        department: 'All Departments',
        priority: 'high',
      },
      facultyToken
    );

    const getRes = await makeRequest('GET', '/api/announcements');
    const ok = createRes.status === 201 && getRes.status === 200;
    logTest('Announcement Management (Publish & Fetch)', ok);
  } catch (e) {
    logTest('Announcement Management', false, e.message);
  }

  // 14. Notifications
  try {
    const res = await makeRequest('GET', '/api/notifications', null, studentToken);
    logTest('User Notification Service', res.status === 200 && Array.isArray(res.data.notifications));
  } catch (e) {
    logTest('User Notification Service', false, e.message);
  }

  // 15. Admin Aggregation & Statistics (Recharts Data)
  try {
    const res = await makeRequest('GET', '/api/stats/admin', null, adminToken);
    const ok = res.status === 200 && res.data.metrics && res.data.charts;
    logTest('Admin Dashboard Analytics Aggregation', ok);
  } catch (e) {
    logTest('Admin Dashboard Analytics Aggregation', false, e.message);
  }

  // 16. Student Dashboard Stats
  try {
    const res = await makeRequest('GET', '/api/stats/student', null, studentToken);
    logTest('Student Dashboard KPI Aggregation', res.status === 200 && res.data.metrics);
  } catch (e) {
    logTest('Student Dashboard KPI Aggregation', false, e.message);
  }

  // 17. Faculty Dashboard Stats
  try {
    const res = await makeRequest('GET', '/api/stats/faculty', null, facultyToken);
    logTest('Faculty Dashboard KPI Aggregation', res.status === 200 && res.data.metrics);
  } catch (e) {
    logTest('Faculty Dashboard KPI Aggregation', false, e.message);
  }

  console.log('\n======================================================');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  process.exit(failed > 0 ? 1 : 0);
};

runAllTests();
