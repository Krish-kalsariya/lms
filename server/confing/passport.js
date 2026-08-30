import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";

/* ================= LOCAL STRATEGY ================= */
passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const cleanEmail = email ? email.trim().toLowerCase() : "";
        const user = await User.findOne({ email: cleanEmail });
        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }

        if (user.status === "deactive") {
          return done(null, false, {
            message: "Your account has been deactivated",
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/* ================= SERIALIZE ================= */
passport.serializeUser((user, done) => {
  done(null, user._id);
});

/* ================= DESERIALIZE (FIXED) ================= */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password");

    //  Invalid session / user deleted
    if (!user) {
      return done(null, false);
    }

    // Deactivated user
    if (user.status === "deactive") {
      return done(null, false);
    }

    done(null, user);
  } catch (err) {
    done(err);
  }
});