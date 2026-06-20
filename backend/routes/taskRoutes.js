const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getTasks, getStats, addTask, updateTask, removeTask } = require("../controllers/taskController");

// All task routes require authentication
router.use(authMiddleware);

router.get("/stats", getStats);   // GET /tasks/stats
router.get("/", getTasks);         // GET /tasks
router.post("/", addTask);         // POST /tasks
router.put("/:id", updateTask);    // PUT /tasks/:id
router.delete("/:id", removeTask); // DELETE /tasks/:id

module.exports = router;
