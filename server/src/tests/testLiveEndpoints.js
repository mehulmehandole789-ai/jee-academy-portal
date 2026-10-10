import assert from 'assert';

const BASE = 'http://localhost:5000/api';

const runLiveCheck = async () => {
  console.log('Testing Live Backend Endpoints on http://localhost:5000...');

  // 1. Health
  const healthRes = await fetch(`${BASE}/health`);
  const health = await healthRes.json();
  assert.strictEqual(health.status, 'ok');
  console.log('  [PASS] /api/health returned ok');

  // 2. Public Courses
  const coursesRes = await fetch(`${BASE}/courses`);
  const coursesData = await coursesRes.json();
  assert.strictEqual(coursesData.success, true);
  assert(coursesData.courses.length >= 2);
  console.log(`  [PASS] /api/courses returned ${coursesData.courses.length} courses`);

  // 3. Contact Inquiry Form
  const contactRes = await fetch(`${BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Integration Test Parent',
      email: 'parent@test.com',
      phone: '+91 99999 88888',
      subject: 'Admission Query',
      message: 'Testing live contact form submission',
    }),
  });
  const contactData = await contactRes.json();
  assert.strictEqual(contactData.success, true);
  console.log('  [PASS] /api/contact saved inquiry to MongoDB');

  // 4. Student Login
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'aarav.patel@student.com',
      password: 'Student@123',
    }),
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginData.success, true);
  assert.strictEqual(loginData.user.role, 'student');
  const cookieHeader = loginRes.headers.get('set-cookie');
  console.log('  [PASS] /api/auth/login authenticated student Aarav Patel with cookie');

  // Helper to extract cookie token
  const tokenMatch = cookieHeader ? cookieHeader.match(/token=([^;]+)/) : null;
  const token = tokenMatch ? tokenMatch[1] : null;

  // 5. Authenticated /api/auth/me
  const meRes = await fetch(`${BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const meData = await meRes.json();
  assert.strictEqual(meData.success, true);
  assert.strictEqual(meData.user.email, 'aarav.patel@student.com');
  console.log('  [PASS] /api/auth/me confirmed active session & populated batch');

  // 6. Student Tests List
  const testsRes = await fetch(`${BASE}/tests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const testsData = await testsRes.json();
  assert.strictEqual(testsData.success, true);
  assert(testsData.tests.length >= 2);
  console.log(`  [PASS] /api/tests returned ${testsData.tests.length} batch tests`);

  // 7. Student Fees Summary
  const feesRes = await fetch(`${BASE}/fees/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const feesData = await feesRes.json();
  assert.strictEqual(feesData.success, true);
  assert.strictEqual(feesData.hasAccount, true);
  assert.strictEqual(feesData.status, 'paid');
  console.log('  [PASS] /api/fees/my returned verified fee account (settled in full)');

  // 8. Teacher Login
  const teacherLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'verma.physics@jeeacademy.com',
      password: 'Teacher@123',
    }),
  });
  const teacherData = await teacherLoginRes.json();
  assert.strictEqual(teacherData.success, true);
  assert.strictEqual(teacherData.user.role, 'teacher');
  const teacherToken = teacherLoginRes.headers.get('set-cookie')?.match(/token=([^;]+)/)?.[1];
  console.log('  [PASS] /api/auth/login authenticated faculty Prof. Verma');

  // 9. Teacher Analytics & Declining Students Alert
  const analyticsRes = await fetch(`${BASE}/stats/teacher`, {
    headers: { Authorization: `Bearer ${teacherToken}` },
  });
  const analyticsData = await analyticsRes.json();
  assert.strictEqual(analyticsData.success, true);
  assert(analyticsData.decliningCount >= 1);
  console.log(`  [PASS] /api/stats/teacher detected ${analyticsData.decliningCount} declining students with rule: "${analyticsData.comparisonRuleDescription}"`);

  // 10. Admin Login
  const adminLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@jeeacademy.com',
      password: 'Admin@123',
    }),
  });
  const adminData = await adminLoginRes.json();
  assert.strictEqual(adminData.success, true);
  assert.strictEqual(adminData.user.role, 'admin');
  const adminToken = adminLoginRes.headers.get('set-cookie')?.match(/token=([^;]+)/)?.[1];
  console.log('  [PASS] /api/auth/login authenticated Admin');

  // 11. Admin Overview
  const adminStatsRes = await fetch(`${BASE}/stats/admin`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const adminStatsData = await adminStatsRes.json();
  assert.strictEqual(adminStatsData.success, true);
  assert(adminStatsData.overview.totalStudents >= 12);
  console.log(`  [PASS] /api/stats/admin overview confirmed ${adminStatsData.overview.totalStudents} students and ₹${Math.round(adminStatsData.overview.totalCollectedPaise / 100).toLocaleString('en-IN')} in verified fee collections`);

  console.log('\nAll 11 Live Integration Endpoints Verified Successfully!');
};

runLiveCheck().catch((err) => {
  console.error('Live check failed:', err);
  process.exit(1);
});
