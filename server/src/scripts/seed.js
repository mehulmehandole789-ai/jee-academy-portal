import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Course } from '../models/Course.js';
import { Batch } from '../models/Batch.js';
import { Enrollment } from '../models/Enrollment.js';
import { Test } from '../models/Test.js';
import { TestAttempt } from '../models/TestAttempt.js';
import { StudyMaterial } from '../models/StudyMaterial.js';
import { Task } from '../models/Task.js';
import { FeeAccount } from '../models/FeeAccount.js';
import { Payment } from '../models/Payment.js';
import { Announcement } from '../models/Announcement.js';
import { ContactInquiry } from '../models/ContactInquiry.js';
import { ROLES, SUBJECTS, TEST_STATUS, ATTEMPT_STATUS, MATERIAL_TYPES } from '../config/constants.js';
import { scoreAttempt } from '../controllers/testController.js';
import { calculateCompetitionRankings } from '../utils/ranking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const seedDatabase = async () => {
  console.log('[Seed] Starting JEE Academy Portal demonstration database seeding...');

  // Clear existing collections safely
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Batch.deleteMany({}),
    Enrollment.deleteMany({}),
    Test.deleteMany({}),
    TestAttempt.deleteMany({}),
    StudyMaterial.deleteMany({}),
    Task.deleteMany({}),
    FeeAccount.deleteMany({}),
    Payment.deleteMany({}),
    Announcement.deleteMany({}),
    ContactInquiry.deleteMany({}),
  ]);

  console.log('[Seed] Cleared existing data.');

  // 1. Courses
  const course2Yr = await Course.create({
    name: 'Target JEE 2-Year Comprehensive (Class 11 & 12)',
    code: 'JEE-2YR-2027',
    description: 'Flagship 2-year classroom program covering full syllabus of Physics, Chemistry, and Mathematics for JEE Main & JEE Advanced.',
    targetExamYear: 2027,
    totalFee: 15000000, // 1,50,000 INR in paise
    syllabusHighlights: [
      'Complete Class 11 & Class 12 PCM rigorous syllabus coverage',
      'Bi-weekly Tuesday & Saturday timed test series with all-India benchmarking',
      'Daily Practice Problem (DPP) sets & chapter-wise archived questions',
      'Personalized mentor guidance and rank improvement counseling',
    ],
  });

  const course1Yr = await Course.create({
    name: 'Target JEE 1-Year Fastrack & Dropper Intensive',
    code: 'JEE-1YR-2027',
    description: 'High-yield 1-year intensive program focused on rapid concept mastery, advanced problem solving, and rigorous test simulations.',
    targetExamYear: 2027,
    totalFee: 11000000, // 1,10,000 INR in paise
    syllabusHighlights: [
      'Complete high-speed PCM revision with advanced trick workshops',
      '100+ simulated online Tuesday & Saturday tests',
      'Error analysis and speed optimization masterclasses',
    ],
  });

  // 2. Teachers & Admin
  const admin = await User.create({
    name: 'Dr. Vikram Malhotra (Admin)',
    email: 'admin@jeeacademy.com',
    password: 'Admin@123',
    role: ROLES.ADMIN,
    phone: '+91 98765 43210',
  });

  const teacherPhysics = await User.create({
    name: 'Prof. Harish Verma',
    email: 'verma.physics@jeeacademy.com',
    password: 'Teacher@123',
    role: ROLES.TEACHER,
    phone: '+91 98111 22334',
  });

  const teacherMaths = await User.create({
    name: 'Prof. Rajesh Sharma',
    email: 'sharma.maths@jeeacademy.com',
    password: 'Teacher@123',
    role: ROLES.TEACHER,
    phone: '+91 98222 33445',
  });

  // 3. Batches
  const batchAlpha = await Batch.create({
    name: 'Batch Alpha - Target JEE 2027 (Morning)',
    code: 'ALPHA-2027',
    course: course2Yr._id,
    startDate: new Date('2026-04-01'),
    endDate: new Date('2027-05-30'),
    scheduleDays: ['Tuesday', 'Saturday'],
    teachers: [teacherPhysics._id, teacherMaths._id],
  });

  const batchBeta = await Batch.create({
    name: 'Batch Beta - Target JEE 2027 (Evening)',
    code: 'BETA-2027',
    course: course2Yr._id,
    startDate: new Date('2026-04-01'),
    endDate: new Date('2027-05-30'),
    scheduleDays: ['Tuesday', 'Saturday'],
    teachers: [teacherPhysics._id],
  });

  // Link assigned batches to teachers
  await User.findByIdAndUpdate(teacherPhysics._id, {
    assignedBatches: [batchAlpha._id, batchBeta._id],
  });
  await User.findByIdAndUpdate(teacherMaths._id, {
    assignedBatches: [batchAlpha._id],
  });

  // 4. Students (14 students)
  const studentData = [
    { name: 'Aarav Patel', email: 'aarav.patel@student.com', phone: '+91 99001 11001', batch: batchAlpha._id },
    { name: 'Ananya Sharma', email: 'ananya.sharma@student.com', phone: '+91 99001 11002', batch: batchAlpha._id },
    { name: 'Rohan Gupta', email: 'rohan.gupta@student.com', phone: '+91 99001 11003', batch: batchAlpha._id },
    { name: 'Ishaan Verma', email: 'ishaan.verma@student.com', phone: '+91 99001 11004', batch: batchAlpha._id },
    { name: 'Diya Iyer', email: 'diya.iyer@student.com', phone: '+91 99001 11005', batch: batchAlpha._id },
    { name: 'Aditya Reddy', email: 'aditya.reddy@student.com', phone: '+91 99001 11006', batch: batchAlpha._id },
    { name: 'Sneha Nair', email: 'sneha.nair@student.com', phone: '+91 99001 11007', batch: batchAlpha._id },
    { name: 'Kabir Mehta', email: 'kabir.mehta@student.com', phone: '+91 99001 11008', batch: batchAlpha._id },
    { name: 'Tanvi Deshmukh', email: 'tanvi.deshmukh@student.com', phone: '+91 99001 11009', batch: batchBeta._id },
    { name: 'Yash Singh', email: 'yash.singh@student.com', phone: '+91 99001 11010', batch: batchBeta._id },
    { name: 'Priya Malhotra', email: 'priya.malhotra@student.com', phone: '+91 99001 11011', batch: batchBeta._id },
    { name: 'Vihaan Joshi', email: 'vihaan.joshi@student.com', phone: '+91 99001 11012', batch: batchBeta._id },
    { name: 'Kavya Sen', email: 'kavya.sen@student.com', phone: '+91 99001 11013', batch: null }, // Pending enrollment
    { name: 'Rahul Bose', email: 'rahul.bose@student.com', phone: '+91 99001 11014', batch: null }, // Rejected enrollment
  ];

  const students = [];
  for (const item of studentData) {
    const student = await User.create({
      name: item.name,
      email: item.email,
      password: 'Student@123',
      role: ROLES.STUDENT,
      phone: item.phone,
      desiredCourse: course2Yr._id,
      activeBatch: item.batch,
    });
    students.push(student);

    // Create Enrollment application for each student
    if (item.batch) {
      await Enrollment.create({
        student: student._id,
        course: course2Yr._id,
        batch: item.batch,
        status: 'approved',
        schoolOrCollege: 'Delhi Public School, R.K. Puram',
        academicBackground: 'Class 10 CBSE: 96.4%',
        reviewedBy: admin._id,
        reviewedAt: new Date(),
      });
    }
  }

  // Pending and Rejected enrollment records
  const pendingStudent = students.find((s) => s.email === 'kavya.sen@student.com');
  await Enrollment.create({
    student: pendingStudent._id,
    course: course2Yr._id,
    status: 'pending',
    schoolOrCollege: 'National Public School, Indiranagar',
    academicBackground: 'Class 10 ICSE: 94.2%',
    guardianName: 'Dr. Sen',
    guardianPhone: '+91 99444 55555',
    notes: 'Awaiting seat confirmation in Morning Batch Alpha.',
  });

  const rejectedStudent = students.find((s) => s.email === 'rahul.bose@student.com');
  await Enrollment.create({
    student: rejectedStudent._id,
    course: course1Yr._id,
    status: 'rejected',
    schoolOrCollege: 'Modern High School',
    academicBackground: 'Class 12 State Board: 62.0%',
    rejectionReason: 'Does not meet minimum 75% marks eligibility criteria for the 1-Year Fastrack Intensive.',
    reviewedBy: admin._id,
    reviewedAt: new Date(),
  });

  // 5. Fee Accounts & Payments
  // Student 0: Aarav Patel (PAID IN FULL)
  const feeAarav = await FeeAccount.create({
    student: students[0]._id,
    course: course2Yr._id,
    batch: batchAlpha._id,
    totalAgreedFee: 15000000,
    installments: [
      { installmentNumber: 1, title: 'Term 1 Installment', dueDate: new Date(Date.now() - 30 * 86400000), amount: 7500000 },
      { installmentNumber: 2, title: 'Term 2 Installment', dueDate: new Date(Date.now() + 60 * 86400000), amount: 7500000 },
    ],
  });
  await Payment.create({
    student: students[0]._id,
    feeAccount: feeAarav._id,
    amount: 7500000,
    paymentDate: new Date(Date.now() - 35 * 86400000),
    method: 'UPI',
    reference: 'UPI/2026/0891234',
    note: 'Admission & Term 1 installment received via UPI',
    recordedBy: admin._id,
  });
  await Payment.create({
    student: students[0]._id,
    feeAccount: feeAarav._id,
    amount: 7500000,
    paymentDate: new Date(Date.now() - 5 * 86400000),
    method: 'Bank Transfer',
    reference: 'NEFT/HDFC/9900123',
    note: 'Full settlement of Term 2 installment',
    recordedBy: admin._id,
  });

  // Student 1: Ananya Sharma (PARTIAL PAYMENT)
  const feeAnanya = await FeeAccount.create({
    student: students[1]._id,
    course: course2Yr._id,
    batch: batchAlpha._id,
    totalAgreedFee: 15000000,
    installments: [
      { installmentNumber: 1, title: 'Term 1 Installment', dueDate: new Date(Date.now() - 15 * 86400000), amount: 7500000 },
      { installmentNumber: 2, title: 'Term 2 Installment', dueDate: new Date(Date.now() + 90 * 86400000), amount: 7500000 },
    ],
  });
  await Payment.create({
    student: students[1]._id,
    feeAccount: feeAnanya._id,
    amount: 7500000,
    paymentDate: new Date(Date.now() - 20 * 86400000),
    method: 'Bank Transfer',
    reference: 'IMPS/SBI/778899',
    note: 'Term 1 paid in full, Term 2 scheduled for next quarter',
    recordedBy: admin._id,
  });

  // Student 2: Rohan Gupta (OVERDUE PAYMENT)
  await FeeAccount.create({
    student: students[2]._id,
    course: course2Yr._id,
    batch: batchAlpha._id,
    totalAgreedFee: 15000000,
    installments: [
      { installmentNumber: 1, title: 'Admission & Term 1 Installment', dueDate: new Date(Date.now() - 10 * 86400000), amount: 7500000 },
      { installmentNumber: 2, title: 'Term 2 Installment', dueDate: new Date(Date.now() + 90 * 86400000), amount: 7500000 },
    ],
  });
  // No payment recorded -> overdue amount 75,000 INR

  // Student 3: Ishaan Verma
  const feeIshaan = await FeeAccount.create({
    student: students[3]._id,
    course: course2Yr._id,
    batch: batchAlpha._id,
    totalAgreedFee: 15000000,
    installments: [
      { installmentNumber: 1, title: 'Term 1 Installment', dueDate: new Date(Date.now() + 15 * 86400000), amount: 7500000 },
      { installmentNumber: 2, title: 'Term 2 Installment', dueDate: new Date(Date.now() + 120 * 86400000), amount: 7500000 },
    ],
  });
  await Payment.create({
    student: students[3]._id,
    feeAccount: feeIshaan._id,
    amount: 3000000,
    paymentDate: new Date(),
    method: 'Cash',
    reference: 'RECEIPT-2026-042',
    note: 'Initial deposit cash receipt',
    recordedBy: admin._id,
  });

  // 6. Tests & Attempts
  // Standard 10 PCM Questions
  const mockQuestions = [
    {
      questionText: 'A body of mass 2 kg is accelerated uniformly from rest to a speed of 10 m/s in 4 seconds. The instantaneous power delivered to the body at t = 2 s is:',
      subject: SUBJECTS.PHYSICS,
      options: [
        { id: 'A', text: '12.5 W' },
        { id: 'B', text: '25 W' },
        { id: 'C', text: '50 W' },
        { id: 'D', text: '100 W' },
      ],
      correctOptionId: 'B',
      explanation: 'Acceleration a = (10 - 0)/4 = 2.5 m/s². Force F = m * a = 2 * 2.5 = 5 N. Velocity at t = 2s is v = 0 + 2.5 * 2 = 5 m/s. Power P = F * v = 5 * 5 = 25 W.',
      marks: 4,
      negativeMarks: 1,
    },
    {
      questionText: 'Two particles A and B of equal masses undergo an elastic head-on collision. If initial velocity of A is 6 m/s and B is at rest, the velocity of B after collision is:',
      subject: SUBJECTS.PHYSICS,
      options: [
        { id: 'A', text: '0 m/s' },
        { id: 'B', text: '3 m/s' },
        { id: 'C', text: '6 m/s' },
        { id: 'D', text: '12 m/s' },
      ],
      correctOptionId: 'C',
      explanation: 'In a 1D elastic collision of two equal masses, velocities are exchanged. Hence particle B takes particle A’s initial velocity (6 m/s).',
      marks: 4,
      negativeMarks: 1,
    },
    {
      questionText: 'Which of the following compounds exhibits highest dipole moment?',
      subject: SUBJECTS.CHEMISTRY,
      options: [
        { id: 'A', text: 'CO2' },
        { id: 'B', text: 'CH4' },
        { id: 'C', text: 'NH3' },
        { id: 'D', text: 'BF3' },
      ],
      correctOptionId: 'C',
      explanation: 'CO2 and BF3 have symmetrical geometries resulting in zero dipole moment. CH4 is tetrahedral with μ = 0. NH3 has trigonal pyramidal geometry with a lone pair reinforcing bond dipoles, giving μ = 1.47 D.',
      marks: 4,
      negativeMarks: 1,
    },
    {
      questionText: 'The oxidation state of Chromium in CrO5 (Chromium pentoxide butterfly structure) is:',
      subject: SUBJECTS.CHEMISTRY,
      options: [
        { id: 'A', text: '+10' },
        { id: 'B', text: '+6' },
        { id: 'C', text: '+4' },
        { id: 'D', text: '+3' },
      ],
      correctOptionId: 'B',
      explanation: 'CrO5 has a butterfly structure containing two peroxo linkages (-O-O-) each carrying -1 charge and one oxo (=O) carrying -2 charge. Total Cr oxidation state is +6.',
      marks: 4,
      negativeMarks: 1,
    },
    {
      questionText: 'If the roots of the quadratic equation x² - px + q = 0 differ by 1, then which of the following relations holds true?',
      subject: SUBJECTS.MATHEMATICS,
      options: [
        { id: 'A', text: 'p² = 4q + 1' },
        { id: 'B', text: 'p² = 4q - 1' },
        { id: 'C', text: 'q² = 4p + 1' },
        { id: 'D', text: 'p² = q + 4' },
      ],
      correctOptionId: 'A',
      explanation: 'Let roots be α and β. α - β = 1. (α - β)² = (α + β)² - 4αβ = 1 => p² - 4q = 1 => p² = 4q + 1.',
      marks: 4,
      negativeMarks: 1,
    },
    {
      questionText: 'The value of lim (x -> 0) of (sin 3x) / (tan 2x) is equal to:',
      subject: SUBJECTS.MATHEMATICS,
      options: [
        { id: 'A', text: '1' },
        { id: 'B', text: '2/3' },
        { id: 'C', text: '3/2' },
        { id: 'D', text: '0' },
      ],
      correctOptionId: 'C',
      explanation: 'lim (x -> 0) [ (sin 3x)/(3x) * 3x ] / [ (tan 2x)/(2x) * 2x ] = (1 * 3x) / (1 * 2x) = 3/2.',
      marks: 4,
      negativeMarks: 1,
    },
  ];

  // Test 1: Completed Tuesday Test #1 (Batch Alpha)
  const test1 = await Test.create({
    title: 'Tuesday Test #1 - PCM Foundation Mock',
    description: 'Weekly evaluation covering Work-Power-Energy, Chemical Bonding, and Quadratic Equations.',
    batch: batchAlpha._id,
    subject: SUBJECTS.MIXED,
    startDate: new Date(Date.now() - 12 * 86400000), // 12 days ago
    durationMinutes: 60,
    instructions: 'Timed test under JEE Main pattern. Single choice MCQs: +4 for correct, -1 for incorrect.',
    questions: mockQuestions,
    status: TEST_STATUS.PUBLISHED,
    isResultsPublished: true,
    isLocked: true,
    createdBy: teacherPhysics._id,
  });

  // Seed attempts with realistic tied ranks for Test 1
  // Max score: 24 marks (6 questions * 4)
  // Let student 0 (Aarav): all 6 correct -> score 24
  // Let student 1 (Ananya): 5 correct, 1 incorrect -> score 5*4 - 1 = 19 (TIED!)
  // Let student 2 (Rohan): 5 correct, 1 incorrect -> score 19 (TIED!)
  // Let student 3 (Ishaan): 4 correct, 2 incorrect -> score 4*4 - 2 = 14 (Rank 4!)
  // Let student 4 (Diya): 3 correct, 3 unanswered -> score 12
  // Let student 5 (Aditya): 2 correct, 4 incorrect -> score 2*4 - 4 = 4
  const attemptConfigs = [
    { student: students[0], answers: [{ q: 0, o: 'B' }, { q: 1, o: 'C' }, { q: 2, o: 'C' }, { q: 3, o: 'B' }, { q: 4, o: 'A' }, { q: 5, o: 'C' }] },
    { student: students[1], answers: [{ q: 0, o: 'B' }, { q: 1, o: 'C' }, { q: 2, o: 'C' }, { q: 3, o: 'B' }, { q: 4, o: 'A' }, { q: 5, o: 'D' }] }, // 1 incorrect
    { student: students[2], answers: [{ q: 0, o: 'B' }, { q: 1, o: 'C' }, { q: 2, o: 'C' }, { q: 3, o: 'B' }, { q: 4, o: 'A' }, { q: 5, o: 'B' }] }, // 1 incorrect
    { student: students[3], answers: [{ q: 0, o: 'B' }, { q: 1, o: 'C' }, { q: 2, o: 'C' }, { q: 3, o: 'B' }, { q: 4, o: 'C' }, { q: 5, o: 'A' }] }, // 2 incorrect
    { student: students[4], answers: [{ q: 0, o: 'B' }, { q: 1, o: 'C' }, { q: 2, o: 'C' }] }, // 3 correct, 3 blank
    { student: students[5], answers: [{ q: 0, o: 'B' }, { q: 1, o: 'C' }, { q: 2, o: 'A' }, { q: 3, o: 'A' }, { q: 4, o: 'B' }, { q: 5, o: 'A' }] },
  ];

  const test1Attempts = [];
  for (const cfg of attemptConfigs) {
    const formattedAnswers = cfg.answers.map((a) => ({
      questionIndex: a.q,
      selectedOptionId: a.o,
      isMarkedForReview: false,
      answeredAt: new Date(test1.startDate.getTime() + 15 * 60000),
    }));

    let attempt = new TestAttempt({
      student: cfg.student._id,
      test: test1._id,
      batch: batchAlpha._id,
      startTime: test1.startDate,
      endTime: new Date(test1.startDate.getTime() + 50 * 60000),
      scheduledEndTime: new Date(test1.startDate.getTime() + test1.durationMinutes * 60000),
      status: ATTEMPT_STATUS.SUBMITTED,
      answers: formattedAnswers,
    });

    scoreAttempt(attempt, test1);
    await attempt.save();
    test1Attempts.push(attempt);
  }

  // Calculate and store competition rankings (tied ranks test case!)
  const ranked1 = calculateCompetitionRankings(test1Attempts);
  for (const r of ranked1) {
    await TestAttempt.findByIdAndUpdate(r._id, { batchRank: r.batchRank });
  }

  // Test 2: Completed Saturday Test #2 (Batch Alpha)
  // Student 1 (Ananya Sharma) dropped from 79.2% to 45.8% to demonstrate the declining student detection!
  const test2 = await Test.create({
    title: 'Saturday Test #2 - Advanced Problem Solving',
    description: 'JEE Advanced level conceptual test.',
    batch: batchAlpha._id,
    subject: SUBJECTS.MIXED,
    startDate: new Date(Date.now() - 5 * 86400000), // 5 days ago
    durationMinutes: 60,
    instructions: 'Single choice MCQs: +4 for correct, -1 for incorrect.',
    questions: mockQuestions,
    status: TEST_STATUS.PUBLISHED,
    isResultsPublished: true,
    isLocked: true,
    createdBy: teacherPhysics._id,
  });

  const test2Configs = [
    { student: students[0], answers: [{ q: 0, o: 'B' }, { q: 1, o: 'C' }, { q: 2, o: 'C' }, { q: 3, o: 'B' }, { q: 4, o: 'A' }, { q: 5, o: 'C' }] }, // 24 marks
    { student: students[1], answers: [{ q: 0, o: 'B' }, { q: 1, o: 'C' }, { q: 2, o: 'A' }, { q: 3, o: 'C' }, { q: 4, o: 'B' }] }, // dropped score -> triggers declining student rule!
    { student: students[2], answers: [{ q: 0, o: 'B' }, { q: 1, o: 'C' }, { q: 2, o: 'C' }, { q: 3, o: 'B' }, { q: 4, o: 'A' }] }, // 20 marks
    { student: students[3], answers: [{ q: 0, o: 'B' }, { q: 1, o: 'C' }, { q: 2, o: 'C' }, { q: 3, o: 'B' }] }, // 16 marks
  ];

  const test2Attempts = [];
  for (const cfg of test2Configs) {
    const formattedAnswers = cfg.answers.map((a) => ({
      questionIndex: a.q,
      selectedOptionId: a.o,
      isMarkedForReview: false,
      answeredAt: new Date(test2.startDate.getTime() + 20 * 60000),
    }));

    let attempt = new TestAttempt({
      student: cfg.student._id,
      test: test2._id,
      batch: batchAlpha._id,
      startTime: test2.startDate,
      endTime: new Date(test2.startDate.getTime() + 45 * 60000),
      scheduledEndTime: new Date(test2.startDate.getTime() + test2.durationMinutes * 60000),
      status: ATTEMPT_STATUS.SUBMITTED,
      answers: formattedAnswers,
    });

    scoreAttempt(attempt, test2);
    await attempt.save();
    test2Attempts.push(attempt);
  }

  const ranked2 = calculateCompetitionRankings(test2Attempts);
  for (const r of ranked2) {
    await TestAttempt.findByIdAndUpdate(r._id, { batchRank: r.batchRank });
  }

  // Test 3: LIVE TEST (Open right now for interactive testing!)
  // Scheduled to have started 15 minutes ago, duration 180 min -> still has 165 minutes remaining!
  const liveTest = await Test.create({
    title: 'Tuesday Test #3 - Weekly Diagnostic (Live)',
    description: 'Current live test module. Open for attempts right now.',
    batch: batchAlpha._id,
    subject: SUBJECTS.MIXED,
    startDate: new Date(Date.now() - 15 * 60000), // started 15 mins ago
    durationMinutes: 180,
    instructions: 'Live examination session. Autosave enabled. Answer questions and submit before countdown ends.',
    questions: mockQuestions,
    status: TEST_STATUS.PUBLISHED,
    isResultsPublished: false,
    isLocked: false,
    createdBy: teacherPhysics._id,
  });

  // Test 4: UPCOMING TEST (Scheduled for upcoming Saturday)
  const upcomingTest = await Test.create({
    title: 'Saturday Test #4 - Full Length JEE Main Simulation',
    description: 'Comprehensive test covering entire Term 1 syllabus.',
    batch: batchAlpha._id,
    subject: SUBJECTS.MIXED,
    startDate: new Date(Date.now() + 4 * 86400000), // 4 days in future
    durationMinutes: 180,
    instructions: 'Upcoming test. Will open automatically at scheduled start time.',
    questions: mockQuestions,
    status: TEST_STATUS.PUBLISHED,
    isResultsPublished: false,
    isLocked: false,
    createdBy: teacherMaths._id,
  });

  // 7. Study Materials
  await StudyMaterial.create({
    title: "Newton's Laws of Motion & Friction - Core Theory & Derivations",
    description: 'In-depth classroom notes covering constraint relations, pseudo forces, and coefficient of friction problems.',
    subject: SUBJECTS.PHYSICS,
    chapter: "Laws of Motion",
    batch: batchAlpha._id,
    type: MATERIAL_TYPES.NOTES,
    fileName: 'NLM_Comprehensive_Notes_2026.pdf',
    storedFileName: 'sample_nlm_notes.pdf',
    fileSize: 2450000,
    mimeType: 'application/pdf',
    uploadedBy: teacherPhysics._id,
  });

  await StudyMaterial.create({
    title: 'Chemical Bonding & Hybridization - Master Practice DPP',
    description: '35 graded questions with VSEPR theory, MOT configurations, and dipole moments.',
    subject: SUBJECTS.CHEMISTRY,
    chapter: 'Chemical Bonding',
    batch: batchAlpha._id,
    type: MATERIAL_TYPES.PRACTICE_SHEET,
    fileName: 'Chemical_Bonding_DPP_01.pdf',
    storedFileName: 'sample_bonding_sheet.pdf',
    fileSize: 1890000,
    mimeType: 'application/pdf',
    uploadedBy: teacherPhysics._id,
  });

  await StudyMaterial.create({
    title: 'Quadratic Equations & Complex Numbers - Level 2 Assignment',
    description: 'Challenging multi-concept problems with location of roots and transformations.',
    subject: SUBJECTS.MATHEMATICS,
    chapter: 'Quadratic Equations',
    batch: batchAlpha._id,
    type: MATERIAL_TYPES.ASSIGNMENT,
    fileName: 'Quadratic_Assignment_Level2.pdf',
    storedFileName: 'sample_maths_assignment.pdf',
    fileSize: 3120000,
    mimeType: 'application/pdf',
    uploadedBy: teacherMaths._id,
  });

  await StudyMaterial.create({
    title: 'Rotational Motion - Moment of Inertia & Pure Rolling Masterclass',
    description: 'Faculty video lecture breaking down complex rolling with slipping concepts.',
    subject: SUBJECTS.PHYSICS,
    chapter: 'Rotational Dynamics',
    batch: batchAlpha._id,
    type: MATERIAL_TYPES.VIDEO_LINK,
    externalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    uploadedBy: teacherPhysics._id,
  });

  // 8. Daily Study Planner Tasks (for Aarav Patel)
  const today = new Date();
  await Task.create({
    student: students[0]._id,
    title: "Revise Newton's Laws of Motion - HC Verma Chapter 5",
    description: 'Solve questions 15 to 35 from HCV Part 1 and make formula summary notes.',
    subject: 'Physics',
    plannedDate: today,
    startTime: '07:00',
    priority: 'high',
    status: 'completed',
    completedAt: new Date(Date.now() - 3600000),
  });

  await Task.create({
    student: students[0]._id,
    title: 'Solve 25 Previous Year Questions on Chemical Bonding',
    description: 'Focus on MOT electronic configuration and bond order calculations.',
    subject: 'Chemistry',
    plannedDate: today,
    startTime: '11:30',
    priority: 'medium',
    status: 'in_progress',
  });

  await Task.create({
    student: students[0]._id,
    title: 'Attempt Tuesday Live Diagnostic Test',
    description: 'Sit in a quiet room and review mistake log immediately after submission.',
    subject: 'General',
    plannedDate: today,
    startTime: '15:00',
    priority: 'high',
    status: 'pending',
  });

  await Task.create({
    student: students[0]._id,
    title: 'Practice Quadratic Equation Roots - MS Chouhan / Cengage',
    description: 'Review location of roots theorem.',
    subject: 'Mathematics',
    plannedDate: new Date(Date.now() - 86400000), // Overdue task!
    startTime: '18:00',
    priority: 'high',
    status: 'pending',
  });

  // 9. Announcements
  await Announcement.create({
    title: 'NTA Official: JEE Main 2027 Information Bulletin & Examination Schedule Released',
    description: 'The National Testing Agency (NTA) has released the official schedule for JEE Main 2027 Session 1 & 2. Registration portals are now live.',
    category: 'examination',
    issuingOrganization: 'NTA / JEE Main',
    officialSourceUrl: 'https://jeemain.nta.nic.in',
    publicationDate: new Date(Date.now() - 3 * 86400000),
    deadline: new Date(Date.now() + 25 * 86400000),
    targetAudience: 'all',
    isPinned: true,
    status: 'published',
    isVerified: true,
    lastVerifiedDate: new Date(),
    createdBy: admin._id,
  });

  await Announcement.create({
    title: 'IIT Kanpur: JEE Advanced 2027 Eligibility Criteria & Syllabus Revision Update',
    description: 'Joint Admission Board (JAB) has updated the eligibility criteria guidelines and question pattern for JEE Advanced.',
    category: 'examination',
    issuingOrganization: 'IIT / JEE Advanced',
    officialSourceUrl: 'https://jeeadv.ac.in',
    publicationDate: new Date(Date.now() - 7 * 86400000),
    targetAudience: 'all',
    isPinned: false,
    status: 'published',
    isVerified: true,
    lastVerifiedDate: new Date(),
    createdBy: admin._id,
  });

  await Announcement.create({
    title: 'CBSE Class 12 Board Exam 2027 Practical Dates Announced',
    description: 'Central Board of Secondary Education has issued practical examination timelines for Science stream students.',
    category: 'examination',
    issuingOrganization: 'CBSE',
    officialSourceUrl: 'https://cbse.gov.in',
    publicationDate: new Date(Date.now() - 10 * 86400000),
    deadline: new Date(Date.now() + 60 * 86400000),
    targetAudience: 'students',
    isPinned: false,
    status: 'published',
    isVerified: true,
    lastVerifiedDate: new Date(),
    createdBy: admin._id,
  });

  await Announcement.create({
    title: 'Academy Announcement: Special Sunday Doubt Clinics & Rank Improvement Workshops',
    description: 'Special 1-on-1 doubt clearing clinic every Sunday from 10:00 AM to 1:00 PM for all enrolled students with faculty.',
    category: 'academy',
    issuingOrganization: 'JEE Academy Official',
    publicationDate: new Date(Date.now() - 1 * 86400000),
    targetAudience: 'all',
    targetBatches: [batchAlpha._id, batchBeta._id],
    isPinned: true,
    status: 'published',
    isVerified: true,
    lastVerifiedDate: new Date(),
    createdBy: admin._id,
  });

  // 10. Contact Inquiries
  await ContactInquiry.create({
    name: 'Suresh Kumar',
    email: 'suresh.parent@gmail.com',
    phone: '+91 98765 11223',
    subject: 'Inquiry regarding 2-Year Classroom Program for my son in Class 11',
    message: 'Hello, I want to know about batch timings, faculty credentials, and scholarship entrance tests for the upcoming academic session.',
    status: 'new',
  });

  console.log('[Seed] Database successfully populated with realistic demo records!');
  console.log('----------------------------------------------------');
  console.log('DEMO ACCOUNTS:');
  console.log('Admin:   admin@jeeacademy.com          / Admin@123');
  console.log('Teacher: verma.physics@jeeacademy.com  / Teacher@123');
  console.log('Teacher: sharma.maths@jeeacademy.com   / Teacher@123');
  console.log('Student: aarav.patel@student.com       / Student@123 (Batch Alpha - Paid)');
  console.log('Student: ananya.sharma@student.com     / Student@123 (Batch Alpha - Partial)');
  console.log('Student: rohan.gupta@student.com       / Student@123 (Batch Alpha - Overdue)');
  console.log('Student: kavya.sen@student.com         / Student@123 (Pending Enrollment)');
  console.log('Student: rahul.bose@student.com        / Student@123 (Rejected Enrollment)');
  console.log('----------------------------------------------------');
};

// If run directly via command line
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    }
  })();
}
