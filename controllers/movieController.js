const mongoose = require("mongoose");
const Movie = require("../models/Movie");

const MOVIE_FIELDS = ["title", "director", "year", "description", "genre"];

// Build a movie object only from the allowed fields so that an id sent in the
// request body is always ignored
const pickMovieFields = (body) => {
  const movie = {};

  MOVIE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      movie[field] = field === "year" ? Number(body[field]) : body[field];
    }
  });

  return movie;
};

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim() !== "";

// Returns an error object when the input is invalid, otherwise null
const validateMovie = (movie, isPartial) => {
  if (!isPartial) {
    for (const field of MOVIE_FIELDS) {
      if (movie[field] === undefined) {
        return { error: `${field} is required` };
      }
    }
  }

  for (const field of ["title", "director", "description", "genre"]) {
    if (movie[field] !== undefined && !isNonEmptyString(movie[field])) {
      return { error: `${field} must be a non-empty string` };
    }
  }

  const maxYear = new Date().getFullYear() + 5;

  if (
    movie.year !== undefined &&
    (!Number.isInteger(movie.year) || movie.year < 1888 || movie.year > maxYear)
  ) {
    return { error: `year must be a whole number between 1888 and ${maxYear}` };
  }

  return null;
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// The movie id may come from the url, the query string or the request body
const resolveMovieId = (req) =>
  req.params.id ||
  req.query.id ||
  req.query.movieId ||
  req.body?.movieId ||
  req.body?.id;

const addMovie = async (req, res) => {
  try {
    const movie = pickMovieFields(req.body);

    const invalid = validateMovie(movie, false);
    if (invalid) {
      return res.status(400).json(invalid);
    }

    const saved = await Movie.create(movie);

    res.status(201).json({
      message: "Movie added successfully",
      movie: saved,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllMovies = async (req, res) => {
  try {
    const movies = await Movie.find();

    res.status(200).json({ movies });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMovieById = async (req, res) => {
  try {
    const id = resolveMovieId(req);

    if (!id) {
      return res.status(400).json({ error: "Movie id is required" });
    }

    if (!isValidId(id)) {
      return res.status(400).json({ error: "Invalid movie id" });
    }

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json({ movie });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateMovie = async (req, res) => {
  try {
    const id = resolveMovieId(req);

    if (!id) {
      return res.status(400).json({ error: "Movie id is required" });
    }

    if (!isValidId(id)) {
      return res.status(400).json({ error: "Invalid movie id" });
    }

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    const updates = pickMovieFields(req.body);

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ error: "No valid fields provided to update" });
    }

    const invalid = validateMovie(updates, true);
    if (invalid) {
      return res.status(400).json(invalid);
    }

    MOVIE_FIELDS.forEach((field) => {
      if (updates[field] !== undefined) {
        movie[field] = updates[field];
      }
    });

    await movie.save();

    res.status(200).json({
      message: "Movie updated successfully",
      movie,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const id = resolveMovieId(req);

    if (!id) {
      return res.status(400).json({ error: "Movie id is required" });
    }

    if (!isValidId(id)) {
      return res.status(400).json({ error: "Invalid movie id" });
    }

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    await movie.deleteOne();

    res.status(200).json({
      message: "Movie deleted successfully",
      movie,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addMovieComment = async (req, res) => {
  try {
    const { comment } = req.body;
    const movieId = resolveMovieId(req);

    if (!movieId) {
      return res.status(400).json({ error: "movieId is required" });
    }

    if (!isValidId(movieId)) {
      return res.status(400).json({ error: "Invalid movie id" });
    }

    if (!isNonEmptyString(comment)) {
      return res.status(400).json({ error: "comment is required" });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    movie.comments.push({
      userId: req.user.id,
      userEmail: req.user.email,
      comment: comment.trim(),
    });

    await movie.save();

    const addedComment = movie.comments[movie.comments.length - 1];

    res.status(201).json({
      message: "Comment added successfully",
      comment: addedComment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMovieComments = async (req, res) => {
  try {
    const movieId = resolveMovieId(req);

    if (!movieId) {
      return res.status(400).json({ error: "movieId is required" });
    }

    if (!isValidId(movieId)) {
      return res.status(400).json({ error: "Invalid movie id" });
    }

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res.status(200).json({
      movieId: movie._id,
      title: movie.title,
      comments: movie.comments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  addMovie,
  getAllMovies,
  getMovieById,
  updateMovie,
  deleteMovie,
  addMovieComment,
  getMovieComments,
};