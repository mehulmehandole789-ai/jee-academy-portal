import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Institute Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-navy-950 font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">JEE Academy</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Premier coaching institute providing specialized IIT-JEE preparation, bi-weekly Tuesday & Saturday timed test series, and personalized mentor analytics.
            </p>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-navy-900 border border-slate-800 rounded-lg text-xs text-teal-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Demonstration Portal (Seed Data Active)</span>
            </div>
          </div>

          {/* Col 2: Academic Programs */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Academic Courses
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/courses" className="text-slate-400 hover:text-teal-400 transition">
                  Target JEE 2-Year Comprehensive (Class 11 & 12)
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-slate-400 hover:text-teal-400 transition">
                  Target JEE 1-Year Fastrack Intensive (Dropper)
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-slate-400 hover:text-teal-400 transition">
                  Tuesday & Saturday Online Test Series
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-slate-400 hover:text-teal-400 transition">
                  PCM Daily Problem Sheets & Video Masterclasses
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Portal Navigation */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Portal Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/login" className="text-slate-400 hover:text-teal-400 transition">
                  Student & Faculty Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-400 hover:text-teal-400 transition">
                  Online Student Enrollment
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-teal-400 transition">
                  Faculty & Methodology
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-teal-400 transition">
                  Admissions Office & Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Timings */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Admissions Desk
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span>Knowledge Park Campus, Sector 62, Noida, Uttar Pradesh, 201309</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+91 1800-JEE-ACADEMY (Toll Free)</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>admissions@jeeacademy.org</span>
              </li>
              <li className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Mon - Sat: 8:00 AM - 7:00 PM IST</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JEE Academy Portal. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Engineered with React, Vite, Node.js, Express & MongoDB. All dates displayed in Asia/Kolkata.
          </p>
        </div>
      </div>
    </footer>
  );
};
