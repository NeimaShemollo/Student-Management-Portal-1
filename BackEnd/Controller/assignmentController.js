import Assignment from "../Model/assignmentModel.js";

// 1. Submit Assignment Task
export const submitAssignment = async (req, res) => {
  try {
    const { courseId, title, repoUrl, notes } = req.body;
    const newSub = await Assignment.create({
      studentId: req.user.id,
      courseId,
      title,
      repoUrl,
      notes
    });
    return res.status(201).json({ data: newSub });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 2. Fetch Personal Assignment History Logs
export const getMyAssignments = async (req, res) => {
  try {
    const subs = await Assignment.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ data: subs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
