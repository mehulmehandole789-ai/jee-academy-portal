import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CheckCircle, Calendar, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';

export const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiClient.get('/courses');
        if (res.data.success) {
          setCourses(res.data.courses);
        }
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-teal-600 uppercase tracking-wider block">
          Academic Curriculum & Offerings
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Comprehensive IIT-JEE Preparation Programs
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Structured pedagogical paths designed to build robust fundamentals in Physics, Chemistry, and Mathematics, supplemented by bi-weekly Tuesday & Saturday timed tests.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching active courses..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course) => {
            const feeInRupees = Math.round(course.totalFee / 100).toLocaleString('en-IN');
            return (
              <div
                key={course._id}
                className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between card-hover"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-navy-100 text-navy-800">
                      Code: {course.code}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                      Target {course.targetExamYear}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-850 mb-3">{course.name}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {course.description}
                  </p>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6">
                    <span className="text-xs text-slate-500 font-medium block">Total Agreed Fee</span>
                    <span className="text-2xl font-extrabold text-teal-700">₹{feeInRupees}</span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Payable in scheduled quarterly installments
                    </span>
                  </div>

                  <div className="space-y-3 mb-8">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Syllabus & Pedagogy Highlights
                    </h3>
                    <ul className="space-y-2.5">
                      {course.syllabusHighlights && course.syllabusHighlights.length > 0 ? (
                        course.syllabusHighlights.map((point, idx) => (
                          <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-600">
                            <CheckCircle className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-slate-500">
                          Comprehensive Physics, Chemistry, and Mathematics curriculum.
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>Tuesday & Saturday Test Schedule</span>
                  </div>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center space-x-1.5"
                  >
                    <span>Apply for Course</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
