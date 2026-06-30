import React, { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import { Mail, Phone, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import emailjs from "@emailjs/browser";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      return toast.error("Please fill all fields");
    }

    setLoading(true);

    const templateParams = {
      name: form.name,
      from_email: form.email,
      message: form.message,
      time: new Date().toLocaleString(),
    };

    emailjs
      .send(
        "service_tfg57bc",
        "template_n5bnmri",
        templateParams,
        "3pquW0uziVPYKvVYi",
      )
      .then(() => {
        setLoading(false);
        toast.success("Message sent successfully!");
        setForm({ name: "", email: "", message: "" });
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Failed to send message.");
        console.error(err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Contact{" "}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Us
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            We'd love to hear from you
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="glass-card p-8 space-y-6">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  val: "marikayathri875494@gmail.com",
                },
                { icon: Phone, label: "Phone", val: "+91 875494XXXX" },
                {
                  icon: MapPin,
                  label: "Address",
                  val: "Your Location, Tamil Nadu",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {item.val}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-4">
              <input
                className="input-field"
                placeholder="Your Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="email"
                className="input-field"
                placeholder="Your Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <textarea
                className="input-field h-32 resize-none"
                placeholder="Your Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
              />
              <motion.button
                disabled={loading}
                type="submit"
                className="btn-primary w-full"
                whileTap={{ scale: 0.97 }}
              >
                {loading ? "Sending..." : "Send Message"}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
