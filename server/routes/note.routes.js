import express from "express";
import {
  getNotes,
  createNote,
  deleteNote,
  updateNote
} from "../controllers/note.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";


const router = express.Router();

router.get("/:courseId", isAuthenticated, getNotes);
router.post("/:courseId", isAuthenticated, createNote);
router.delete("/:noteId", isAuthenticated, deleteNote);
router.put("/:noteId", isAuthenticated, updateNote);

export default router;