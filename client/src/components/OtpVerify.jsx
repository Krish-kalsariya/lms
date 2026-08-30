import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";

export default function OtpVerify({
  email,
  loading,
  onVerify,
  onResend,
  onCancel,
}) {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isErrored, setIsErrored] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (!canResend) return;
    setCanResend(false);
    setTimer(60);
    onResend();
  };

  const handleChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) {
      const newOtp = [...otpValues];
      newOtp[index] = "";
      setOtpValues(newOtp);
      return;
    }

    // Take only the last digit (to handle over-typing)
    const singleDigit = cleanValue[cleanValue.length - 1];
    const newOtp = [...otpValues];
    newOtp[index] = singleDigit;
    setOtpValues(newOtp);

    // Auto-focus next input field
    if (index < 5 && singleDigit) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        // Clear previous input and focus it
        const newOtp = [...otpValues];
        newOtp[index - 1] = "";
        setOtpValues(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otpValues];
        newOtp[index] = "";
        setOtpValues(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().replace(/\D/g, "");
    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtpValues(newOtp);
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otpValues.join("");
    if (otpCode.length === 6) {
      onVerify(otpCode);
    } else {
      setIsErrored(true);
      setTimeout(() => setIsErrored(false), 500);
    }
  };

  const isComplete = otpValues.every((val) => val !== "");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-6"
    >
      {/* Brand Logo */}
      <div className="flex justify-center mb-2">
        <img
          src="/Brainera-logo.png"
          alt="Brainera Logo"
          className="h-12 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300 select-none"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/favicon-ico.png"; // ultimate fallback
          }}
        />
      </div>

      {/* Header Info */}
      <div className="text-center">
        <div className="mx-auto my-3 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10 dark:bg-violet-500/20 text-violet-500 dark:text-violet-400 relative">
          <div className="absolute inset-0 rounded-full bg-violet-500/10 animate-ping opacity-75" />
          <KeyRound className="h-8 w-8 relative z-10" />
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-(--text-main)">
          Verify Security Code
        </h3>
        <p className="mt-2 text-sm text-(--text-muted) px-2">
          We sent a 6-digit verification OTP to <br />
          <span className="font-semibold text-violet-500 dark:text-violet-400 break-all">
            {email}
          </span>
        </p>
      </div>

      {/* Code Input Boxes */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div 
          animate={isErrored ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-6 gap-2 md:gap-3 max-w-xs md:max-w-sm mx-auto py-2" 
          onPaste={handlePaste}
        >
          {otpValues.map((val, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={2}
              value={val}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-full h-14 md:h-16 text-center text-xl font-bold rounded-xl border border-(--border-main) bg-(--bg-glass) text-(--text-main) focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 focus:bg-(--bg-surface) transition-all duration-200 outline-none select-all shadow-sm"
              autoFocus={index === 0}
            />
          ))}
        </motion.div>

        {/* Verify Button */}
        <button
          type="submit"
          disabled={loading || !isComplete}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white bg-linear-to-r from-violet-600 to-cyan-500 hover:shadow-lg hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer"
        >
          {loading ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Verify OTP
            </>
          )}
        </button>

        {/* Back and Resend Buttons */}
        <div className="flex items-center justify-between text-sm pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-(--text-muted) hover:text-(--text-main) font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="flex items-center gap-1.5 text-violet-500 hover:text-violet-400 dark:text-violet-400 dark:hover:text-violet-300 font-semibold transition-colors cursor-pointer"
            >
              Resend OTP
            </button>
          ) : (
            <span className="text-(--text-muted) font-medium">
              Resend in{" "}
              <span className="text-violet-500 dark:text-violet-400 font-bold tabular-nums">
                {timer}s
              </span>
            </span>
          )}
        </div>
      </form>
    </motion.div>
  );
}
