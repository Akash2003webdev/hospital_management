import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity, Shield, Clock, Users, ChevronRight,
  Heart, Stethoscope, FlaskConical,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
};

const features = [
  { icon: Shield, title: "Secure & Compliant", desc: "HIPAA-compliant data management with end-to-end encryption and role-based access control.", color: "from-violet-500 to-indigo-600" },
  { icon: Clock, title: "Real-time Updates", desc: "Live appointment tracking, instant notifications, and real-time dashboard analytics.", color: "from-sky-500 to-blue-600" },
  { icon: Users, title: "Multi-Role Access", desc: "Tailored dashboards for Admins, Doctors, Nurses, and Patients with appropriate permissions.", color: "from-emerald-500 to-teal-600" },
  { icon: Heart, title: "Patient-Centric", desc: "Seamless patient experience from appointment booking to prescription management.", color: "from-rose-500 to-pink-600" },
  { icon: Stethoscope, title: "Doctor Tools", desc: "Comprehensive tools for doctors to manage appointments, prescriptions, and patient history.", color: "from-amber-500 to-orange-600" },
  { icon: FlaskConical, title: "Lab Integration", desc: "Upload, manage, and share lab reports securely through our integrated storage system.", color: "from-cyan-500 to-sky-600" },
];

const stats = [
  { value: "10k+", label: "Patients Served" },
  { value: "500+", label: "Doctors" },
  { value: "50+", label: "Departments" },
  { value: "99.9%", label: "Uptime SLA" },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden px-4 py-20">

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/hospital_Mangement.png"
            alt="Healthcare"
            className="w-full h-full object-cover object-center"
          />
          {/* Light mode: soft white overlay — keeps image visible but text readable */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/50 to-white/80 dark:from-slate-950/70 dark:via-slate-950/60 dark:to-slate-950/90" /> */}
          {/* Subtle blue tint to match image palette */}
          <div className="absolute inset-0 bg-sky-50/30 dark:bg-sky-950/20" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">

          {/* Badge */}
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-sky-900/30 backdrop-blur-sm border border-sky-200/80 dark:border-sky-700/50 text-sky-700 dark:text-sky-300 rounded-full text-[11px] font-bold uppercase tracking-[0.15em] mb-8 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              Enterprise Hospital Management System
            </span>
          </motion.div>

          {/* Main heading — dark slate on light bg, matches image's clinical blue tone */}
          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-5xl md:text-[68px] font-extrabold leading-[1.06] tracking-[-0.02em] mb-5"
          >
            {/* Line 1 — deep navy, reads clearly over light image */}
            <span className="block text-slate-800 dark:text-white">
              Hospital Management
            </span>
            {/* Line 2 — gradient matching image's blue palette */}
            <span className="block bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-500 bg-clip-text text-transparent mt-1">
              System
            </span>
          </motion.h1>

          {/* Subtitle — medium weight, muted, not competing */}
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="text-[17px] font-medium text-slate-600/90 dark:text-slate-300 mb-10 max-w-lg mx-auto leading-relaxed tracking-[-0.01em]"
          >
            Streamline your hospital operations with our comprehensive SaaS
            platform. From patient registration to billing, all in one place.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              to="/register"
              className="btn-primary text-[15px] font-bold px-8 py-3.5 inline-flex items-center gap-2 justify-center shadow-xl shadow-sky-500/25"
            >
              Get Started Free <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="btn-outline text-[15px] font-semibold px-8 py-3.5 text-center bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 relative z-20 -mt-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass-card text-center py-6 px-4"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -3 }}
            >
              <div className="text-3xl font-extrabold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1.5 uppercase tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.p className="text-xs font-bold uppercase tracking-widest text-sky-500 mb-3" {...fadeUp}>
              Everything you need
            </motion.p>
            <motion.h2
              className="text-4xl font-bold text-slate-900 dark:text-white mb-4"
              {...fadeUp}
            >
              Built for modern healthcare
            </motion.h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-base">
              A complete suite of tools for modern healthcare management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass-card p-6 cursor-default"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <div className={`w-11 h-11 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                  style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                  {f.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 p-12 text-center">
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-3">
                Ready to transform your hospital?
              </h2>
              <p className="text-white/60 mb-8 text-base">
                Join thousands of healthcare providers using MediCare HMS
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-xl"
              >
                Start for Free <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-800 text-sm">
        <p>© 2026 MediCare HMS. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
