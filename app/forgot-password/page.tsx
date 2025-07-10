"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setSuccess(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 relative" data-admin-page>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass-card rounded-xl p-8 w-full max-w-md backdrop-blur-lg relative z-10 text-center"
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="text-muted-foreground">
              We've sent a password reset link to <span className="font-semibold">{email}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Click the link in the email to reset your password.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <Button className="btn-glass w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative" data-admin-page>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-card rounded-xl p-8 w-full max-w-md backdrop-blur-lg relative z-10"
      >
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center space-y-2"
          >
            <h1 className="text-3xl font-bold gradient-text">Reset Password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </motion.div>
          
          <motion.form 
            onSubmit={handleResetPassword} 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold tracking-wide">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input rounded-lg h-12"
                required
              />
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-lg p-4 border-destructive/50 bg-destructive/10"
              >
                <p className="text-sm text-destructive font-medium">{error}</p>
              </motion.div>
            )}
            
            <Button 
              type="submit" 
              className="btn-glass w-full h-12 rounded-lg text-base font-semibold" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </motion.form>

          <div className="text-center">
            <Link 
              href="/login" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Remember your password? <span className="font-semibold">Sign in</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}