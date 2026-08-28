export const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: "Session expired , please login again",
    });
  }

  // BLOCK DEACTIVATED USER
  if (req.user?.status === "deactive") {
    req.logout(() => {}); // destroy session
    return res.status(403).json({
      success: false,
      message: "Account deactivated. Contact admin.",
    });
  }

  next();
};

export const isInstructor = (req, res, next) => {
  if (req.user?.role === "instructor") {
    return next();
  }

  return res.status(403).json({ message: "Access denied" });
};