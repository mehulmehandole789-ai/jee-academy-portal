import React from 'react';
import {
  GraduationCap,
  Target,
  BookOpen,
  Award,
  Users,
  Compass,
  CheckCircle,
  Building,
} from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
          About JEE Academy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Systematic Academic Coaching for Serious Aspirants
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Founded to bring structure, discipline, and scientific test analytics to IIT-JEE preparation. Our pedagogical framework blends rigorous conceptual classroom lectures with objective bi-weekly computer-based evaluations.
        </p>
      </div>

      {/* Core Methodology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-850">Diagnostic Test Series</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every Tuesday and Saturday, students take full-length or module tests under exact NTA exam boundaries. Strict timekeeping enforces speed and mental endurance.
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-850">Subject Performance Tracking</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our system breaks scores down into Physics, Chemistry, and Mathematics metrics, surfacing declining trends early so faculty can step in with targeted remediation.
          </p>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-850">Daily Study Planner</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Students structure their daily revision schedules directly inside the portal, flagging overdue tasks and tracking progress toward upcoming test milestones.
          </p>
        </div>
      </div>

      {/* Faculty Profiles */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900">Senior Academic Faculty</h2>
          <p className="text-xs text-slate-500 mt-1">
            Subject specialists dedicated to mentoring students throughout their 2-year and 1-year journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Faculty 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-teal-400 font-bold flex items-center justify-center text-lg shrink-0">
              HV
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-850">Prof. Harish Verma</h3>
              <p className="text-xs font-semibold text-teal-700">Senior Faculty - Physics</p>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                Specialist in Mechanics, Electrodynamics, and Advanced Problem Solving for JEE Advanced. Demonstrates physical intuition and mathematical rigor.
              </p>
            </div>
          </div>

          {/* Faculty 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-teal-400 font-bold flex items-center justify-center text-lg shrink-0">
              RS
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-850">Prof. Rajesh Sharma</h3>
              <p className="text-xs font-semibold text-teal-700">Senior Faculty - Mathematics</p>
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                Expert in Calculus, Coordinate Geometry, and Algebra. Emphasizes pattern recognition, graphical solutions, and speed optimization techniques.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Facilities & Integrity Notice */}
      <div className="bg-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-2">
        <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <Building className="w-4 h-4 text-teal-600" />
          <span>Campus Facilities & Transparency Policy</span>
        </h4>
        <p>
          Our academy campus features a dedicated computer-based testing laboratory, air-conditioned lecture halls with audio-visual equipment, and a curated library of Indian and international STEM reference books.
        </p>
        <p className="text-slate-500 italic">
          *Note: This portal is a demonstration application. Faculty and campus details represent illustrative demonstration records. No unverified statistical claims or fabricated testimonials are used.
        </p>
      </div>
    </div>
  );
};
