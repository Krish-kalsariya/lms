import Note from "../models/note.model.js";

/* ================= GET NOTES ================= */
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      user: req.user._id,
      course: req.params.courseId,
    })
      .populate("lecture", "title")
      .sort({ createdAt: -1 });

    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
    });
  }
};

/* ================= CREATE NOTE ================= */
export const createNote = async (req, res) => {
  try {
    const { lectureId, content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Note content required" });
    }

    const note = await Note.create({
      user: req.user._id,
      course: req.params.courseId,
      lecture: lectureId,
      content,
    });

    res.status(201).json({ success: true, note });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to save note",
    });
  }
};

/* ================= UPDATE NOTE ================= */
export const updateNote = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Note content required" });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.noteId, user: req.user._id },
      { content },
      { new: true } // Return the updated document
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ message: "Failed to update note" });
  }
};


// DELETE /notes/:noteId
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.noteId,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ success: true, message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};