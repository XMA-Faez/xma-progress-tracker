"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      
      try {
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setError("Unable to verify session. Please try requesting a new reset link.");
          setCheckingSession(false);
          return;
        }

        if (!session) {
          setError("No active session found. Please request a new password reset link.");
          setCheckingSession(false);
          return;
        }

        console.log("Session found:", session.user);
        setIsValidSession(true);
        setCheckingSession(false);
      } catch (err) {
        console.error('Error checking session:', err);
        setError("An error occurred. Please try again.");
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Success! Redirect to admin
      router.push("/admin");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-8 w-full max-w-md text-center"
        >
          <h1 className="text-2xl font-bold mb-4">Invalid Reset Link</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-y-2">
            <Button onClick={() => router.push("/forgot-password")} className="btn-glass w-full">
              Request New Reset Link
            </Button>
            <Button onClick={() => router.push("/login")} variant="ghost" className="w-full">
              Back to Login
            </Button>
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
            <h1 className="text-3xl font-bold gradient-text">Update Password</h1>
            <p className="text-muted-foreground text-sm">
              Enter your new password below
            </p>
          </motion.div>
          
          <motion.form 
            onSubmit={handlePasswordUpdate} 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold tracking-wide">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input rounded-lg h-12"
                placeholder="Enter your new password"
                required
                minLength={6}
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold tracking-wide">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input rounded-lg h-12"
                placeholder="Confirm your new password"
                required
                minLength={6}
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
                  Updating Password...
                </span>
              ) : (
                "Update Password"
              )}
            </Button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}