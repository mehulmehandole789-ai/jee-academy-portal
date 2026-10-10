import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  Award,
  TrendingUp,
  BookOpen,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
} from 'lucide-react';

export const HomePage = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-28 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950 text-white">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-950/80 border border-teal-800/80 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Full-Stack MERN Demonstration Portal</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Master the IIT-JEE with <span className="text-teal-400">Structured Precision</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Welcome to the official JEE Academy Portal. Timed Tuesday & Saturday test series, comprehensive PCM study materials, automatic competition rankings, and daily student planners.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-navy-950 font-bold text-base shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
              >
                <span>Apply for Enrollment</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-base border border-slate-700 transition flex items-center justify-center space-x-2"
              >
                <span>Demo Account Login</span>
              </Link>
            </div>

            {/* Timed Test Schedule Banner */}
            <div className="pt-8 flex items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-teal-400" />
                <span>Scheduled Tests Every Tuesday & Saturday</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>Asia/Kolkata (IST) Timezone Enforced</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Academic Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-2">
            Engineered for Top AIR Aspirants
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Crack JEE Main & Advanced
          </h2>
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            Our portal mirrors real National Testing Agency (NTA) computer-based test conditions while tracking your subject-level performance over time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 card-hover">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5 border border-teal-100">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-850 mb-2">Tuesday & Saturday Tests</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Strictly timed MCQs with server-controlled start/end windows, autosave, single correct options (+4/-1 marking), and auto-finalization on expiry.
            </p>
            <ul className="text-xs text-slate-500 space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Late entrants receive only remaining scheduled duration</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Questions locked once testing window begins</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 card-hover">
            <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center mb-5 border border-navy-100">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-850 mb-2">Automatic Competition Ranking</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Real competition rank calculation (1, 2, 2, 4) among batch peers. Zero tie-breaking on submission speed, with answer review unlocked upon release.
            </p>
            <ul className="text-xs text-slate-500 space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Subject-wise breakdown (Physics, Chemistry, Maths)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Teacher declining-performance early warning system</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 card-hover">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-850 mb-2">Curated PCM Materials & Planner</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Download authorized classroom notes, daily practice sheets, and video lectures. Plan daily and weekly revision tasks with real completion tracking.
            </p>
            <ul className="text-xs text-slate-500 space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Protected file downloads scoped to enrolled batches</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Overdue task visibility and completion audit</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Courses Overview */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block mb-1">
                Admissions Open for Academic Year 2026-2027
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Flagship Academic Programs
              </h2>
            </div>
            <Link
              to="/courses"
              className="mt-4 sm:mt-0 text-sm font-semibold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
            >
              <span>View Course Details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Course 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-navy-100 text-navy-800">
                    Class 11 & 12 Enrollees
                  </span>
                  <span className="text-sm font-extrabold text-teal-700">₹1,50,000 / 2 Years</span>
                </div>
                <h3 className="text-xl font-bold text-slate-850 mb-3">
                  Target JEE 2-Year Comprehensive Program (2027)
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  Complete classroom syllabus coverage of Physics, Chemistry, and Mathematics with bi-weekly Tuesday & Saturday mock tests, rank tracking, and daily problem sets.
                </p>
                <div className="space-y-2 mb-6 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Target Exam Year: 2027 (Morning & Evening batches)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Bi-weekly Tuesday & Saturday mock tests</span>
                  </div>
                </div>
              </div>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-center font-semibold text-sm transition"
              >
                Enroll in 2-Year Program
              </Link>
            </div>

            {/* Course 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
                    Dropper & Repeaters
                  </span>
                  <span className="text-sm font-extrabold text-teal-700">₹1,10,000 / 1 Year</span>
                </div>
                <h3 className="text-xl font-bold text-slate-850 mb-3">
                  Target JEE 1-Year Fastrack Intensive Program (2027)
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  High-speed revision and advanced problem-solving intensive tailored for students dedicated to boosting their percentile in JEE Main & Advanced.
                </p>
                <div className="space-y-2 mb-6 text-xs text-slate-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Target Exam Year: 2027 (Intensive fastrack sessions)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Daily test error analysis workshops</span>
                  </div>
                </div>
              </div>
              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-center font-semibold text-sm transition"
              >
                Enroll in 1-Year Fastrack
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-3xl p-8 sm:p-14 text-white text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Accelerate Your IIT-JEE Journey?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Register an account today, submit your academic application, and start accessing your batch resources as soon as approved by our academic admissions committee.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-teal-500 text-navy-950 font-bold text-sm hover:bg-teal-400 transition"
              >
                Start Student Registration
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition"
              >
                Contact Admissions Desk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
