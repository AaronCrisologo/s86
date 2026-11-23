const express = require("express");
const router = express.Router();
const {
  addMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
  addMovieComment,
  getMovieComments,
} = require("../controllers/movieController");
const { auth, adminAuth } = require("../auth");

// Admin only
router.post("/addMovie", auth, adminAuth, addMovie);
router.patch("/updateMovie/:id", auth, adminAuth, updateMovie);
router.put("/updateMovie/:id", auth, adminAuth, updateMovie);
router.put("/updateMovie", auth, adminAuth, updateMovie);
router.delete("/deleteMovie/:id", auth, adminAuth, deleteMovie);
router.delete("/deleteMovie", auth, adminAuth, deleteMovie);

// All users
router.get("/getMovies", getAllMovies);
router.get("/getMovie/:id", getMovieById);
router.get("/getMovie", getMovieById);
router.post("/addComment/:id", auth, addMovieComment);
router.get("/getComments", getMovieComments);
router.get("/getComments/:id", getMovieComments);

module.exports = router;