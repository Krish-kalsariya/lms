import Announcement from "../models/Announcement.model.js";

/* ================= CREATE ================= */
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "All fields required" });
    }

    const announcement = await Announcement.create({
      title,
      message,
      createdBy: req.user._id,
    });

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= INSTRUCTOR ANNOUNCEMENTS ================= */
export const getInstructorAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      createdBy: req.user._id,
    }).sort({ isPinned: -1, createdAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= STUDENT FEED ================= */
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .sort({ isPinned: -1, createdAt: -1 })
      .populate("createdBy", "name role");

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE ================= */
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    await announcement.deleteOne();
    res.json({ message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ================= UPDATE ================= */
export const updateAnnouncement = async (req, res) => {
  const { title, message } = req.body;

  const announcement = await Announcement.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user._id },
    { title, message },
    { new: true }
  );

  if (!announcement) {
    return res.status(404).json({ message: "Announcement not found" });
  }

  res.json(announcement);
};

/* ================= PIN / UNPIN ================= */
export const togglePinAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!announcement) {
      return res.status(404).json({ message: "Announcement not found" });
    }

    announcement.isPinned = !announcement.isPinned;
    await announcement.save();

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: "Pin update failed" });
  }
};


export const markAnnouncementsSeen = async (req, res) => {
  try {
    req.user.lastAnnouncementSeenAt = new Date();
    await req.user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to mark as seen" });
  }
};

export const getUnreadAnnouncementStatus = async (req, res) => {
  const latest = await Announcement.findOne().sort({ createdAt: -1 });

  if (!latest) {
    return res.json({ hasUnread: false });
  }

  const lastSeen = req.user.lastAnnouncementSeenAt;

  const hasUnread =
    !lastSeen || new Date(latest.createdAt) > new Date(lastSeen);

  res.json({ hasUnread });
};



// home page pr new bage aave che seen thaya pachi pn rey che e solve karvanu che ..