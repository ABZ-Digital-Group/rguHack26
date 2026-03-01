import express from "express";

import api_router from "./api/router.js";
import { db } from "./database.js";
import calculateUserStats from "./utils/userStats.js";
import { calculateScoreFromCO2 } from './utils/calculateScore.js';

const router = express.Router();

router.use("/api", api_router);

router.get("/", (req, res) => {
  if (req.user) {
    return res.redirect("/dashboard");
  } else {
    return res.render("pages/splash.ejs");
  }
});

router.get("/login", (req, res) => {
  return res.render("pages/login.ejs");
});

router.get("/register", (req, res) => {
  return res.render("pages/register.ejs");
});

router.get("/dashboard", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    const stats = await calculateUserStats(req.user._id);
    return res.render("pages/dashboard.ejs", {
      user: req.user,
      stats: stats,
    });
  } catch (error) {
    console.error("Error fetching stats for dashboard:", error);
    return res.render("pages/dashboard.ejs", {
      user: req.user,
      stats: null,
    });
  }
});

router.get("/logout", (req, res) => {
  return res.render("pages/logout.ejs");
});

router.get("/leaderboard", async (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  try {
    // fetch all completed journeys for the user and sum their scores
    const journeys = await db.collection("journeys")
      .find({ userId: req.user._id, status: "completed" })
      .toArray();

    const score = journeys.reduce((total, j) => {
      return total + calculateScoreFromCO2(j);
    }, 0);

    // attach to user object or pass separately
    return res.render("pages/leaderboard.ejs", {
      user: req.user,
      score,
    });
  } catch (err) {
    console.error('Error building leaderboard data', err);
    return res.render("pages/leaderboard.ejs", {
      user: req.user,
      score: 0,
    });
  }
});

router.get("/route", (req, res) => {
  if (!req.user) {
    return res.redirect("/login");
  }

  db.collection("journeys")
    .findOne({ userId: req.user._id, status: "in-progress" })
    .then((activeJourney) => {
      if (activeJourney) {
        return res.render("pages/activeJourney.ejs", {
          user: req.user,
        });
      } else {
        return res.render("pages/planRoute.ejs", {
          user: req.user,
        });
      }
    })
    .catch((err) => {
      console.error("Error fetching active journey", err);
      return res.status(500).send("Internal server error");
    });
});

router.get('/achievements', (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    return res.render('pages/achievements.ejs', {
        user: req.user
    });
});

router.use(express.static("public"));

export default router;
