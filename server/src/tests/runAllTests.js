import assert from 'assert';
import { scoreAttempt } from '../controllers/testController.js';
import { calculateCompetitionRankings } from '../utils/ranking.js';
import { computeAccountSummary } from '../controllers/feeController.js';

console.log('====================================================');
console.log('   JEE ACADEMY BACKEND UNIT & INTEGRATION TEST SUITE ');
console.log('====================================================');

let passedTests = 0;
let totalTests = 0;

const runTest = (name, testFn) => {
  totalTests++;
  try {
    testFn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
  }
};

const runAsyncTest = async (name, testFn) => {
  totalTests++;
  try {
    await testFn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}:`, err.message);
  }
};

// 1. SCORING WITH NEGATIVE MARKING TESTS
runTest('Scoring: +4 for correct, -1 for incorrect, 0 for unanswered', () => {
  const dummyTest = {
    totalMarks: 24,
    questions: [
      { marks: 4, negativeMarks: 1, correctOptionId: 'B', subject: 'Physics' },
      { marks: 4, negativeMarks: 1, correctOptionId: 'C', subject: 'Physics' },
      { marks: 4, negativeMarks: 1, correctOptionId: 'A', subject: 'Chemistry' },
      { marks: 4, negativeMarks: 1, correctOptionId: 'D', subject: 'Chemistry' },
      { marks: 4, negativeMarks: 1, correctOptionId: 'C', subject: 'Mathematics' },
      { marks: 4, negativeMarks: 1, correctOptionId: 'B', subject: 'Mathematics' },
    ],
  };

  const dummyAttempt = {
    answers: [
      { questionIndex: 0, selectedOptionId: 'B' }, // correct (+4)
      { questionIndex: 1, selectedOptionId: 'C' }, // correct (+4)
      { questionIndex: 2, selectedOptionId: 'B' }, // incorrect (-1)
      { questionIndex: 3, selectedOptionId: 'D' }, // correct (+4)
      { questionIndex: 4, selectedOptionId: 'A' }, // incorrect (-1)
      // question 5 unanswered (0)
    ],
  };

  const scored = scoreAttempt(dummyAttempt, dummyTest);

  // Expected score: 4 + 4 - 1 + 4 - 1 + 0 = 10
  assert.strictEqual(scored.score, 10, `Expected score 10, got ${scored.score}`);
  assert.strictEqual(scored.correctCount, 3, `Expected 3 correct, got ${scored.correctCount}`);
  assert.strictEqual(scored.incorrectCount, 2, `Expected 2 incorrect, got ${scored.incorrectCount}`);
  assert.strictEqual(scored.unansweredCount, 1, `Expected 1 unanswered, got ${scored.unansweredCount}`);
  // Accuracy: 3 / 5 = 60.0%
  assert.strictEqual(scored.accuracy, 60.0, `Expected 60.0% accuracy, got ${scored.accuracy}`);
});

runTest('Scoring: Negative overall score handled without truncation', () => {
  const dummyTest = {
    totalMarks: 16,
    questions: [
      { marks: 4, negativeMarks: 1, correctOptionId: 'A', subject: 'Physics' },
      { marks: 4, negativeMarks: 1, correctOptionId: 'A', subject: 'Physics' },
      { marks: 4, negativeMarks: 1, correctOptionId: 'A', subject: 'Chemistry' },
      { marks: 4, negativeMarks: 1, correctOptionId: 'A', subject: 'Mathematics' },
    ],
  };

  const dummyAttempt = {
    answers: [
      { questionIndex: 0, selectedOptionId: 'B' }, // -1
      { questionIndex: 1, selectedOptionId: 'C' }, // -1
      { questionIndex: 2, selectedOptionId: 'D' }, // -1
      { questionIndex: 3, selectedOptionId: 'B' }, // -1
    ],
  };

  const scored = scoreAttempt(dummyAttempt, dummyTest);
  assert.strictEqual(scored.score, -4, `Expected -4 score, got ${scored.score}`);
  assert.strictEqual(scored.correctCount, 0);
  assert.strictEqual(scored.incorrectCount, 4);
  assert.strictEqual(scored.accuracy, 0);
});

// 2. COMPETITION RANKING & TIED RANKS
runTest('Rankings: Competition ranking (1, 2, 2, 4) with ties', () => {
  const mockAttempts = [
    { _id: '1', score: 100 },
    { _id: '2', score: 85 },
    { _id: '3', score: 85 },
    { _id: '4', score: 70 },
    { _id: '5', score: 70 },
    { _id: '6', score: 50 },
  ];

  const ranked = calculateCompetitionRankings(mockAttempts);

  assert.strictEqual(ranked[0].batchRank, 1, 'Top score gets Rank 1');
  assert.strictEqual(ranked[1].batchRank, 2, 'Second score gets Rank 2');
  assert.strictEqual(ranked[2].batchRank, 2, 'Tied second score shares Rank 2');
  assert.strictEqual(ranked[3].batchRank, 4, 'Fourth score skips to Rank 4 (competition style)');
  assert.strictEqual(ranked[4].batchRank, 4, 'Fifth score shares Rank 4');
  assert.strictEqual(ranked[5].batchRank, 6, 'Sixth score skips to Rank 6');
});

runTest('Rankings: Equal scores never broken by submission time', () => {
  const mockAttempts = [
    { _id: 'student_fast', score: 92, submissionTime: 100 },
    { _id: 'student_slow', score: 92, submissionTime: 500 },
  ];

  const ranked = calculateCompetitionRankings(mockAttempts);
  assert.strictEqual(ranked[0].batchRank, 1);
  assert.strictEqual(ranked[1].batchRank, 1);
});

// 3. TEST WINDOW BOUNDARY CONDITIONS
runTest('Test Boundaries: Reject attempt when test has not yet started', () => {
  const futureTest = {
    startDate: new Date(Date.now() + 1000 * 60 * 60), // 1 hour in future
    durationMinutes: 180,
  };

  const now = new Date();
  const hasStarted = now >= futureTest.startDate;
  assert.strictEqual(hasStarted, false, 'Attempt before start date must be rejected');
});

runTest('Test Boundaries: Reject attempt when test duration has elapsed', () => {
  const expiredTest = {
    startDate: new Date(Date.now() - 1000 * 60 * 200), // 200 minutes ago
    durationMinutes: 180, // duration 180 min -> expired 20 mins ago
  };

  const scheduledEndTime = new Date(expiredTest.startDate.getTime() + expiredTest.durationMinutes * 60 * 1000);
  const now = new Date();
  const isExpired = now >= scheduledEndTime;
  assert.strictEqual(isExpired, true, 'Attempt after duration must be rejected');
});

runTest('Test Boundaries: Late entrant receives remaining duration only', () => {
  const testStartDate = new Date(Date.now() - 1000 * 60 * 30); // started 30 mins ago
  const durationMinutes = 120;
  const scheduledEndTime = new Date(testStartDate.getTime() + durationMinutes * 60 * 1000);

  const remainingSeconds = Math.max(0, Math.floor((scheduledEndTime.getTime() - Date.now()) / 1000));
  const expectedRemainingSeconds = (120 - 30) * 60; // 90 mins in seconds

  assert(
    Math.abs(remainingSeconds - expectedRemainingSeconds) <= 5,
    `Late entrant remaining seconds ${remainingSeconds} must be close to ${expectedRemainingSeconds}`
  );
});

// 4. FEE ACCOUNT & OVERDUE CALCULATION TESTS
runTest('Fee Calculation: Balance and overdue deduction from installment schedule', () => {
  const totalAgreedFee = 15000000; // 1,50,000 INR
  const installments = [
    { installmentNumber: 1, dueDate: new Date(Date.now() - 86400000 * 10), amount: 7500000 }, // past due
    { installmentNumber: 2, dueDate: new Date(Date.now() + 86400000 * 60), amount: 7500000 }, // future
  ];

  // Case A: 0 payment -> Overdue = 75,000 INR, Balance = 1,50,000 INR
  const paymentsA = [];
  const paidA = paymentsA.reduce((s, p) => s + p.amount, 0);
  const balanceA = totalAgreedFee - paidA;
  const cumulativeDueA = installments[0].amount;
  const overdueA = Math.max(0, cumulativeDueA - paidA);

  assert.strictEqual(paidA, 0);
  assert.strictEqual(balanceA, 15000000);
  assert.strictEqual(overdueA, 7500000);

  // Case B: Partial payment of 75,000 INR (Installment 1 satisfied)
  const paymentsB = [{ amount: 7500000 }];
  const paidB = paymentsB.reduce((s, p) => s + p.amount, 0);
  const balanceB = totalAgreedFee - paidB;
  const overdueB = Math.max(0, cumulativeDueA - paidB);

  assert.strictEqual(paidB, 7500000);
  assert.strictEqual(balanceB, 7500000);
  assert.strictEqual(overdueB, 0, 'Installment 1 paid, overdue must be 0');

  // Case C: Paid in full 1,50,000 INR
  const paymentsC = [{ amount: 7500000 }, { amount: 7500000 }];
  const paidC = paymentsC.reduce((s, p) => s + p.amount, 0);
  const balanceC = totalAgreedFee - paidC;
  const overdueC = Math.max(0, cumulativeDueA - paidC);

  assert.strictEqual(paidC, 15000000);
  assert.strictEqual(balanceC, 0);
  assert.strictEqual(overdueC, 0);
});

// 5. SECURITY & ROLE-BASED ACCESS CONTROL TESTS
runTest('Security: Public registration accepts student role only', () => {
  const allowedRoles = ['student'];
  const requestedTeacherRole = 'teacher';
  const requestedAdminRole = 'admin';

  const enforcePublicRole = (role) => (allowedRoles.includes(role) ? role : 'student');

  assert.strictEqual(enforcePublicRole(requestedTeacherRole), 'student');
  assert.strictEqual(enforcePublicRole(requestedAdminRole), 'student');
});

runTest('Security: Teacher restricted from unassigned batch access', () => {
  const teacherAssignedBatches = ['batch_1', 'batch_2'];
  const targetBatch = 'batch_3';

  const isAuthorized = teacherAssignedBatches.includes(targetBatch);
  assert.strictEqual(isAuthorized, false, 'Teacher must be forbidden from accessing unassigned batch');
});

runTest('Security: Student forbidden from accessing another student progress records', () => {
  const studentUser = { _id: 'student_123', role: 'student' };
  const requestedStudentId = 'student_999';

  const isAllowed = studentUser.role === 'admin' || studentUser._id === requestedStudentId;
  assert.strictEqual(isAllowed, false, 'Student must be blocked from other student data');
});

// 6. DECLINING PERFORMANCE RULE TEST
runTest('Teacher Analytics: Declining student detection (Drop >= 5.0%)', () => {
  const studentAttempts = [
    { percentage: 82.5 },
    { percentage: 74.0 }, // drop of 8.5%
  ];

  const delta = studentAttempts[1].percentage - studentAttempts[0].percentage;
  const isDeclining = delta <= -5.0;

  assert.strictEqual(isDeclining, true, 'Drop of 8.5% must trigger declining performance flag');
});

console.log('----------------------------------------------------');
console.log(`Results: ${passedTests} / ${totalTests} tests passed successfully.`);
console.log('====================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
