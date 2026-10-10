// server/src/tests/verifyWorkflows.js
// Deep workflow verification for Student, Teacher, and Admin roles

const API_BASE = 'http://localhost:5000/api';

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  setFromHeaders(headers) {
    const raw = headers.get('set-cookie');
    if (!raw) return;
    const parts = raw.split(/,(?=[^;]+=[^;]+)/);
    for (const part of parts) {
      const match = part.match(/^\s*([^=;]+)=([^;]+)/);
      if (match) {
        this.cookies.set(match[1].trim(), match[2].trim());
      }
    }
  }

  getHeader() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }

  getCsrfToken() {
    return this.cookies.get('csrf_token') || '';
  }
}

async function request(url, options = {}, jar = null) {
  const headers = { ...options.headers };
  if (jar) {
    const cookieHeader = jar.getHeader();
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    const csrf = jar.getCsrfToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (jar) jar.setFromHeaders(res.headers);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runWorkflowVerification() {
  console.log('\n======================================================');
  console.log('   JEE ACADEMY FULL END-TO-END WORKFLOW VERIFICATION   ');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // ----------------------------------------------------
  // WORKFLOW 1: STUDENT
  // ----------------------------------------------------
  console.log('>>> [1/3] VERIFYING STUDENT WORKFLOW (Aarav Patel)...');
  const studentJar = new CookieJar();

  // 1.1 Login
  const stuLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'aarav.patel@student.com', password: 'Student@123' },
  }, studentJar);
  assert(stuLogin.status === 200 && stuLogin.data.user.role === 'student', 'Student login succeeded with role "student"');

  // 1.2 Check current session profile
  const stuMe = await request('/auth/me', { method: 'GET' }, studentJar);
  assert(stuMe.status === 200 && stuMe.data.user.activeBatch?.name.includes('Batch Alpha'), 'Student session has active batch "Batch Alpha"');

  // 1.3 View available batch tests
  const stuTests = await request('/tests', { method: 'GET' }, studentJar);
  assert(stuTests.status === 200 && Array.isArray(stuTests.data.tests) && stuTests.data.tests.length > 0, `Student retrieved ${stuTests.data.tests?.length} tests for their batch`);

  // 1.4 View performance analytics & charts data
  const stuProgress = await request('/stats/student', { method: 'GET' }, studentJar);
  assert(stuProgress.status === 200 && Array.isArray(stuProgress.data.performanceTimeline), 'Student performance charts data loaded successfully');

  // 1.5 Access batch study materials
  const stuMaterials = await request('/materials', { method: 'GET' }, studentJar);
  assert(stuMaterials.status === 200 && Array.isArray(stuMaterials.data.materials), `Student accessed ${stuMaterials.data.materials?.length} batch study materials`);

  // 1.6 Study Planner: Get tasks, create a task, and toggle completion
  const stuTasks = await request('/tasks', { method: 'GET' }, studentJar);
  assert(stuTasks.status === 200 && Array.isArray(stuTasks.data.tasks), `Student fetched daily study planner (${stuTasks.data.tasks?.length} tasks)`);

  const newTask = await request('/tasks', {
    method: 'POST',
    body: {
      title: 'Workflow Verification Study Task',
      subject: 'Physics',
      plannedDate: new Date().toISOString(),
      priority: 'high',
      description: 'Automated test task',
    },
  }, studentJar);
  assert(newTask.status === 201 && newTask.data.task?._id, 'Student created a new study planner task');

  const toggleTask = await request(`/tasks/${newTask.data.task._id}`, {
    method: 'PUT',
    body: { status: 'completed' },
  }, studentJar);
  assert(toggleTask.status === 200 && toggleTask.data.task?.status === 'completed', 'Student updated study planner task status to "completed"');

  // Clean up created task
  await request(`/tasks/${newTask.data.task._id}`, { method: 'DELETE' }, studentJar);

  // 1.7 View fee status & payment history
  const stuFee = await request('/fees/my', { method: 'GET' }, studentJar);
  assert(stuFee.status === 200 && stuFee.data.status === 'paid', 'Student verified fee account balance (Status: paid, ₹0 overdue)');

  // 1.8 View announcements (Academy + Official exam notices)
  const stuNotices = await request('/announcements', { method: 'GET' }, studentJar);
  assert(stuNotices.status === 200 && Array.isArray(stuNotices.data.announcements), `Student received ${stuNotices.data.announcements?.length} official and academy notices`);

  // 1.9 Verify unapproved student enrollment gating
  const pendingJar = new CookieJar();
  const pendingLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'kavya.sen@student.com', password: 'Student@123' },
  }, pendingJar);
  assert(pendingLogin.status === 200 && pendingLogin.data.user.role === 'student', 'Pending student Kavya Sen login succeeded');

  const pendingEnrollment = await request('/enrollment/my', { method: 'GET' }, pendingJar);
  assert(pendingEnrollment.status === 200 && pendingEnrollment.data.enrollment?.status === 'pending', 'Pending student enrollment application status is "pending"');

  const pendingTests = await request('/tests', { method: 'GET' }, pendingJar);
  assert(pendingTests.status === 200 && pendingTests.data.tests?.length === 0, 'Unapproved student without batch receives 0 batch tests');

  // Attempting to start any test yields 403 Forbidden
  const testId = stuTests.data.tests[0]._id;
  const unauthorizedAttempt = await request(`/tests/${testId}/start`, { method: 'POST' }, pendingJar);
  assert(unauthorizedAttempt.status === 403, 'Unapproved student is strictly forbidden (403) from attempting batch tests');

  // ----------------------------------------------------
  // WORKFLOW 2: TEACHER
  // ----------------------------------------------------
  console.log('\n>>> [2/3] VERIFYING TEACHER WORKFLOW (Prof. Harish Verma)...');
  const teacherJar = new CookieJar();

  // 2.1 Login
  const teachLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'verma.physics@jeeacademy.com', password: 'Teacher@123' },
  }, teacherJar);
  assert(teachLogin.status === 200 && teachLogin.data.user.role === 'teacher', 'Teacher login succeeded with role "teacher"');

  // 2.2 View assigned batches
  const teachBatches = await request('/batches', { method: 'GET' }, teacherJar);
  assert(teachBatches.status === 200 && teachBatches.data.batches?.length >= 2, `Teacher accessed assigned cohorts (${teachBatches.data.batches?.length} batches)`);

  // 2.3 View student roster in assigned batch
  const alphaBatchId = teachBatches.data.batches[0]._id;
  const batchStudents = await request(`/batches/${alphaBatchId}/students`, { method: 'GET' }, teacherJar);
  assert(batchStudents.status === 200 && Array.isArray(batchStudents.data.students), `Teacher accessed student roster (${batchStudents.data.students?.length} students)`);

  // 2.4 Verify Declining Student Performance Alert
  const teachStats = await request('/stats/teacher', { method: 'GET' }, teacherJar);
  const declining = teachStats.data.decliningStudents || [];
  assert(teachStats.status === 200 && declining.length > 0 && declining.some(s => s.name === 'Ananya Sharma'), 'Teacher dashboard accurately flags Ananya Sharma for score drop >= 5.0%');

  // 2.5 View test rankings & results
  const teachTests = await request('/tests', { method: 'GET' }, teacherJar);
  assert(teachTests.status === 200 && teachTests.data.tests?.length > 0, 'Teacher retrieved batch tests for review');

  // 2.6 View batch fee overview (read-only)
  const teachFees = await request(`/fees/batch/${alphaBatchId}`, { method: 'GET' }, teacherJar);
  assert(teachFees.status === 200 && Array.isArray(teachFees.data.statuses), `Teacher accessed read-only fee overview for Batch Alpha (${teachFees.data.statuses?.length} student records)`);

  // ----------------------------------------------------
  // WORKFLOW 3: ADMIN
  // ----------------------------------------------------
  console.log('\n>>> [3/3] VERIFYING ADMIN WORKFLOW (Dr. Vikram Malhotra)...');
  const adminJar = new CookieJar();

  // 3.1 Login
  const admLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@jeeacademy.com', password: 'Admin@123' },
  }, adminJar);
  assert(admLogin.status === 200 && admLogin.data.user.role === 'admin', 'Admin login succeeded with role "admin"');

  // 3.2 Academy overview & stats
  const admOverview = await request('/stats/admin', { method: 'GET' }, adminJar);
  assert(admOverview.status === 200 && admOverview.data.overview?.totalStudents === 14, 'Admin overview confirms 14 enrolled students');
  assert(admOverview.data.overview?.totalCollectedPaise === 25500000, 'Admin overview confirms ₹2,55,000 verified fee collections');

  // 3.3 View pending enrollments
  const admEnrollments = await request('/enrollment', { method: 'GET' }, adminJar);
  assert(admEnrollments.status === 200 && admEnrollments.data.enrollments?.some(e => e.status === 'pending'), 'Admin accessed pending student enrollment applications queue');

  // 3.4 View all users (RBAC access)
  const admUsers = await request('/auth/users', { method: 'GET' }, adminJar);
  assert(admUsers.status === 200 && admUsers.data.users?.length >= 17, `Admin retrieved complete academy user directory (${admUsers.data.users?.length} accounts)`);

  // 3.5 View fee records for batch
  const admFees = await request(`/fees/batch/${alphaBatchId}`, { method: 'GET' }, adminJar);
  assert(admFees.status === 200 && Array.isArray(admFees.data.statuses), `Admin reviewed fee records for cohort (${admFees.data.statuses?.length} records)`);

  // 3.6 Check contact inquiries
  const admInquiries = await request('/contact', { method: 'GET' }, adminJar);
  assert(admInquiries.status === 200 && admInquiries.data.inquiries?.length > 0, `Admin reviewed public contact inquiries (${admInquiries.data.inquiries?.length} inquiries)`);

  console.log('\n------------------------------------------------------');
  console.log(`WORKFLOW VERIFICATION RESULTS: ${passed} / ${total} Checks Passed (100%)`);
  console.log('======================================================\n');
}

runWorkflowVerification().catch((err) => {
  console.error('\n[FATAL] Workflow verification failed:', err);
  process.exit(1);
});
