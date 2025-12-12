"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, KeyRound, Lock } from "lucide-react";
import { toast } from "sonner";

export default function ResetPassword() {
  const [step, setStep] = useState<"email" | "verify">("email");
  const [errors, setErrors] = React.useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirm: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //  password rule checker
  React.useEffect(() => {
    const newErrors: string[] = [];
    if (!/[a-z]/.test(form.password)) newErrors.push("At least one lowercase");
    if (!/[A-Z]/.test(form.password)) newErrors.push("At least one uppercase");
    if (!/[0-9]/.test(form.password)) newErrors.push("At least one number");
    if (form.password.length < 8) newErrors.push("Minimum 8 characters");
    setErrors(newErrors);
  }, [form.password]);

  const handleSendEmail = async () => {
    if (!form.email.trim()) return toast.warning("Email Required");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, type: "reset" }),
      });

      const result = await res.json();

      if (!res.ok) return toast.error(result.message || "Failed to send OTP");

      toast.success("OTP sent successfully! Check your email.");
      setStep("verify");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (form.password !== form.confirm)
      return toast.error("Passwords do not match");
    const { email, otp, password } = form;

    if (!otp || !email || !password) return;

    if (errors.length > 0) return toast.error(errors[0]);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/resetPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });

      const result = await res.json();
      if (!res.ok)
        return toast.error(result.message || "Failed to reset Password");

      if (result.success) {
        window.location.href = `${process.env.NEXT_PUBLIC_URL}/auth/login`;
      }
    } catch (err) {
      console.error("Error while reset password:", err);
      toast.error("Failed to reset Password . Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center  backdrop-blur-sm z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 20 }}
        className="w-[90%] max-w-md p-8 rounded-2xl shadow-2xl border border-(--border) bg-(--background) text-(--foreground) flex flex-col items-center"
      >
        <AnimatePresence mode="wait">
          {step === "email" ? (
            <motion.div
              key="email-step"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center"
            >
              <Mail className="w-16 h-16 text-blue-600 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Enter your registered email and we’ll send an OTP to reset your
                password.
              </p>

              <input
                type="email"
                disabled={loading}
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--muted) focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />

              <button
                disabled={loading}
                onClick={handleSendEmail}
                className="w-full mt-6 py-3 rounded-xl bg-linear-to-r from-blue-500 to-violet-500 text-white font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                {loading ? "Sending" : "Send OTP"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="verify-step"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
              className="w-full flex flex-col items-center"
            >
              <KeyRound className="w-16 h-16 text-violet-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Verify & Reset</h2>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Enter the OTP we sent to your email and set your new password.
              </p>

              <div className="w-full space-y-3">
                <input
                  disabled={loading}
                  type="text"
                  name="otp"
                  value={form.otp}
                  onChange={handleChange}
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 rounded-xl border border-(--border) bg-(--muted) focus:ring-2 focus:ring-orange-500 transition-all"
                />
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-blue-500 w-5 h-5" />
                  <input
                    disabled={loading}
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="New Password"
                    className="w-full pl-10 py-3 rounded-xl border border-(--border) bg-(--muted) focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-blue-500 w-5 h-5" />
                  <input
                    disabled={loading}
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="w-full pl-10 py-3 rounded-xl border border-(--border) bg-(--muted) focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full mt-6 py-3 rounded-xl bg-linear-to-r from-blue-500 to-violet-500 text-white font-semibold hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                {loading ? "Reseting" : "Reset Password"}
              </button>

              <button
                onClick={() => setStep("email")}
                className="mt-3 text-sm text-blue-500 hover:underline"
              >
                Go Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
