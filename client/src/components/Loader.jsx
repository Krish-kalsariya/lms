// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-(--bg-main)/90 backdrop-blur-md">

      {/* Glow background (NO warning – arbitrary gradient allowed) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.25),transparent_65%)] pointer-events-none" />

      {/* Learning Card / Book */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0.85 }}
        animate={{ scale: [0.95, 1.08, 0.95], opacity: 1 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="mb-10 relative"
      >
        <div className="relative h-16 w-28 rounded-xl bg-linear-to-r from-violet-600 to-cyan-500 shadow-[0_0_40px_rgba(124,58,237,0.6)]">
          {/* Book spine */}
          <div className="absolute left-2 top-2 h-[80%] w-1 rounded bg-white/40" />
        </div>
      </motion.div>

      {/* Progress Bar */}
      <div className="h-1.5 w-64 overflow-hidden rounded-full bg-white/10 backdrop-blur">
        <motion.div
          className="h-full w-1/3 rounded-full bg-linear-to-r from-violet-500 to-cyan-400 shadow-[0_0_20px_rgba(124,58,237,0.8)]"
          initial={{ x: "-120%" }}
          animate={{ x: "320%" }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Status Text */}
      <motion.p
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-6 text-sm font-medium tracking-wide text-(--text-muted)"
      >
        Preparing your learning space…
      </motion.p>
    </div>
  );
}
