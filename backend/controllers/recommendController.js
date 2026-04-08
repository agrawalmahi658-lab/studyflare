const { spawn } = require("child_process");
const path = require("path");

exports.getRecommendations = (req, res) => {
  const query = req.body.query;

  // Absolute path to Python file (VERY IMPORTANT)
  const scriptPath = path.join(__dirname, "..", "ml", "recommender.py");

  // Use python (or python3 if needed)
  const pythonProcess = spawn("python", [scriptPath, query]);

  let result = "";
  let errorData = "";

  pythonProcess.stdout.on("data", (data) => {
    result += data.toString();
  });

  pythonProcess.stderr.on("data", (data) => {
    errorData += data.toString();
  });

  pythonProcess.on("close", (code) => {
    if (code !== 0) {
      console.error("Python Error:", errorData);
      return res.status(500).json({
        error: "Python script failed",
        details: errorData,
      });
    }

    try {
      const parsed = JSON.parse(result);
      res.json({ recommendations: parsed });
    } catch (err) {
      res.status(500).json({
        error: "JSON parse error",
        raw: result,
      });
    }
  });
};