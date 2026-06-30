import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  Shield,
  Clock,
  Users,
  ChevronRight,
  Heart,
  Stethoscope,
  FlaskConical,
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

const features = [
  {
    icon: Shield,
    title: "Secure & Compliant",
    desc: "HIPAA-compliant data management with end-to-end encryption and role-based access control.",
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    desc: "Live appointment tracking, instant notifications, and real-time dashboard analytics.",
  },
  {
    icon: Users,
    title: "Multi-Role Access",
    desc: "Tailored dashboards for Admins, Doctors, Nurses, and Patients with appropriate permissions.",
  },
  {
    icon: Heart,
    title: "Patient-Centric",
    desc: "Seamless patient experience from appointment booking to prescription management.",
  },
  {
    icon: Stethoscope,
    title: "Doctor Tools",
    desc: "Comprehensive tools for doctors to manage appointments, prescriptions, and patient history.",
  },
  {
    icon: FlaskConical,
    title: "Lab Integration",
    desc: "Upload, manage, and share lab reports securely through our integrated storage system.",
  },
];

const stats = [
  { value: "10k+", label: "Patients Served" },
  { value: "500+", label: "Doctors" },
  { value: "50+", label: "Departments" },
  { value: "99.9%", label: "Uptime SLA" },
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="https://wallpapers.com/images/hd/modern-hospital-building-perspective-art-8i7mrvuldz5iti77.jpg"
            alt="Healthcare"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/85 dark:bg-gray-950/90 backdrop-blur-[1px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-6">
              <Activity className="h-4 w-4" />
              Enterprise Hospital Management System
            </span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight"
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Hospital Management{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              System
            </span>
          </motion.h1>

          <motion.p
            className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Streamline your hospital operations with our comprehensive SaaS
            platform. From patient registration to billing, all in one place.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              to="/register"
              className="btn-primary text-lg px-8 py-4 flex items-center gap-2 justify-center"
            >
              Get Started Free <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="btn-outline text-lg px-8 py-4 text-center"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4 relative z-20 -mt-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="stat-card text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.h2
              className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
              {...fadeUp}
            >
              Everything you need
            </motion.h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              A complete suite of tools for modern healthcare management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass-card p-6 hover:shadow-2xl cursor-default"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center glass-card p-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to transform your hospital?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of healthcare providers using MediCare HMS
          </p>
          <Link
            to="/register"
            className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2"
          >
            Start for Free <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
        <p>© 2026 MediCare HMS. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
