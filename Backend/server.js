const express = require("express");
const expressServer = express();
const authRouter = require("./routes/authRoute");
const httpServer = require("http").createServer(expressServer);
const { Server } = require("socket.io");
const shortuuid = require("short-uuid");
const fs = require("fs");
const path = require("path");
const markdownpdf = require("markdown-pdf");
const multer = require("multer");
const uploadLocation = multer();
const cors = require("cors");
const FormData = require("form-data");
const stream = require("stream");
const { threadId } = require("worker_threads");

expressServer.use(express.json());
expressServer.use(cors());

const cacheFolder = path.join(__dirname, "cache");

socketServer = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  },
});
fastAPIBase = "https://mini-cdss-fastapi.onrender.com";

var scOBJ;

socketServer.on("connection", (socket) => {
  scOBJ = socket;
  socket.on("startReq", async (data) => await startNonRagGraph(data, socket));

  socket.on("startRagReq", async (data) => await startRagGraph(data, socket));

  socket.on("reportGenReq", async (id) => {
    socket.emit("reportGenRes", await getFinalReport(id, socket));
  });

  socket.on("ragMedicalInsightReq", async (id) => {
    socket.emit("ragMedicalInsightRes", await getMedicalInsight(id));
  });

  socket.on("ragQuestion", async (details) => {
    await askRAGModel(details, socket);
  });

  socket.on("photoQuestionFirstReq", async (details) => {
    await askPhotoFirstModel(details, socket);
  });
  socket.on("photoQuestionFollowingReq", async (details) => {
    await askPhotoFollowingModel(details, socket);
  });

  socket.on("updatePrelimReport", async (details) => {
    await updatePrelim(details, socket);
  });
});

expressServer.get("/", (req, res) => {
  res.send("Hola");
});

expressServer.post("/getIdForUploadingAndWorking", (_, res) =>
  res.json({ id: shortuuid.generate() })
);

expressServer.post("/startImageWebAfterUpload", (req, res) => {
  scOBJ.emit("imageUploadedStartWeb", req.body.thread_id);
  res.send("ok");
});

expressServer.post("/download-pdf", (req, res) => {
  const id = req.body.id;
  const markdownFile = path.join(cacheFolder, id + ".md"); // Your Markdown file
  const pdfFile = path.join(cacheFolder, id + "_report.pdf");

  // Convert Markdown to PDF
  fs.createReadStream(markdownFile)
    .pipe(markdownpdf())
    .pipe(fs.createWriteStream(pdfFile))
    .on("finish", () => {
      // Send the PDF file as a response
      res.download(pdfFile, "report.pdf", (err) => {
        if (err) {
          console.error("Error sending file:", err);
          res.status(500).send("Error generating PDF");
        }
        // Optional: Delete file after sending
        fs.unlinkSync(pdfFile);
      });
    })
    .on("error", (err) => {
      console.error("Conversion error:", err);
      res.status(500).send("Error converting Markdown to PDF");
    });
});

expressServer.use("/auth", authRouter);

httpServer.listen(10000, () => {
  console.log("SERVER LISTENING AT 10000");
});

async function updatePrelim(details, socket) {
  const prelimInterruptResponse = await fetch(
    fastAPIBase + "/prelimInterruptTrigger",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: details[1],
        human_feedback: details[0],
      }),
    }
  );

  if (!prelimInterruptResponse.ok) {
    console.error("No response body received.");
    return;
  }

  const reader = prelimInterruptResponse.body.getReader();
  const decoder = new TextDecoder();
  var report = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true }).trim();
    console.log(chunk)
    if (chunk) {
      report += chunk;
    }
  }
  socket.emit("prelimUpdateRes", 
    await getPrelimDiagnosis(reportuuid),
  );
}

async function startRagGraph(details, socket) {
  try {
    const response = await fetch(fastAPIBase + "/graphstart/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: details[2],
        text: details[0],
        diagnosis_count: "3",
        medical_report: details[1],
      }),
    });

    if (!response.body) {
      console.error("No response body received.");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true }).trim();
    }

    socket.emit("prelimReportRes", [
      details[2],
      await getPrelimDiagnosis(details[2]),
    ]);
  } catch (error) {
    console.error("Streaming error:", error);
  }
}

// No Medical Report
async function startNonRagGraph(details, socket) {
  reportuuid = details[1] ? details[1] : shortuuid.generate();
  try {
    const response = await fetch(fastAPIBase + "/graphstart/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: reportuuid,
        text: details[0],
        diagnosis_count: "3",
        medical_report: "",
      }),
    });

    if (!response.body) {
      console.error("No response body received.");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true }).trim();
    }

    socket.emit("prelimReportRes", [
      reportuuid,
      await getPrelimDiagnosis(reportuuid),
    ]);
  } catch (error) {
    console.error("Streaming error:", error);
  }
}

async function getPrelimDiagnosis(id) {
  const nerResponse = await fetch(fastAPIBase + "/nerReport", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: id,
    }),
  });

  if (!nerResponse.ok) {
    console.error("No response body received.");
    return;
  }

  var reader = nerResponse.body.getReader();
  var decoder = new TextDecoder();

  var report = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true }).trim();
    report += chunk;
  }

  report += "\n\n";

  const prelimResponse = await fetch(fastAPIBase + "/prelimReport", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: id,
    }),
  });

  if (!prelimResponse.ok) {
    console.error("No response body received.");
    return;
  }

  reader = prelimResponse.body.getReader();
  decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true }).trim();

    if (chunk) {
      report += chunk;
    }
  }

  fs.writeFile(path.join(cacheFolder, id + ".md"), report, "utf8", () => {});
  return report;
}

// expressServer.post(
//   "/extractMedicalInfo",
//   uploadLocation.array("files"),
//   async (req, res) => {
//     // res.send("OK");
//     // scOBJ.emit("RAGExtractedMedical", await extractMedicalFeatures(req.files));
//   }
// );

async function getMedicalInsight(id) {
  const medicalInsightReport = await fetch(
    fastAPIBase + "/medicalInsightReport",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: id,
      }),
    }
  );

  if (!medicalInsightReport.body) {
    console.error("No response body received.");
    return;
  }

  const reader = medicalInsightReport.body.getReader();
  const decoder = new TextDecoder();

  var report = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true }).trim();
    if (chunk) {
      report += chunk;
    }
  }

  return report;
}

async function getFinalReport(id, socket) {
  const prelimInterruptResponse = await fetch(
    fastAPIBase + "/prelimInterruptTrigger",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        thread_id: id,
        human_feedback: "",
      }),
    }
  );

  if (!prelimInterruptResponse.ok) {
    console.error("No response body received.");
    return;
  }

  var report = fs.readFileSync(path.join(cacheFolder, id + ".md"));

  const bestpracReponse = await fetch(fastAPIBase + "/bestpracReport", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: id,
    }),
  });

  if (!bestpracReponse.ok) {
    console.error("No response body received.");
    return;
  }

  reader = bestpracReponse.body.getReader();
  decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true }).trim();

    if (chunk) {
      report += chunk;
    }
  }

  socket.emit("finalReportRes", report);
  fs.writeFile(path.join(cacheFolder, id + ".md"), report, "utf8", () => {});
  return report;
}

async function extractMedicalFeatures(files) {
  reportuuid = shortuuid.generate();
  var fileOBJ = new FormData();
  files.forEach((file) => {
    fileOBJ.append("files", file); // Append multiple files
  });

  fileOBJ.append("thread_id", reportuuid);
  console.log([fileOBJ]);
  var response = await fetch(fastAPIBase + "/extractMedicalDetails", {
    method: "POST",
    body: fileOBJ,
  });
  console.log(response.status);
  return response;
}

async function askRAGModel(details, socket) {
  const askRAGQuestion = await fetch(fastAPIBase + "/ragSearch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: details[0],
      thread_id: details[1],
      gemini: "",
    }),
  });

  if (!askRAGQuestion.body) {
    console.error("No response body received.");
    return;
  }

  const ragAnswerResponse = await fetch(fastAPIBase + "/ragAnswer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: details[1],
    }),
  });

  const reader = ragAnswerResponse.body.getReader();
  const decoder = new TextDecoder();

  var report = "";

  if (!ragAnswerResponse.body) {
    console.error("No response body received.");
    return;
  }
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true }).trim();

    if (chunk) {
      report += chunk;
    }
  }
  socket.emit("ragAnswer", report);
}

async function askPhotoFirstModel(details, socket) {
  const askPhotoQuestion = await fetch(fastAPIBase + "/input-query/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: details[1],
      query: details[0],
    }),
  });

  if (!askPhotoQuestion.body) {
    console.error("No response body received.");
    return;
  }

  const photoAnswerResponse = await fetch(fastAPIBase + "/vision-answer/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: details[1],
    }),
  });

  console.log(photoAnswerResponse.status, photoAnswerResponse.body);

  const reader = photoAnswerResponse.body.getReader();
  const decoder = new TextDecoder();

  var report = "";

  if (!photoAnswerResponse.body) {
    console.error("No response body received.");
    return;
  }
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true }).trim();

    if (chunk) {
      report += chunk;
    }
  }
  socket.emit("photoQuestionRes", report);
}

async function askPhotoFollowingModel(details, socket) {
  const askPhotoQuestion = await fetch(fastAPIBase + "/vision-feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: details[1],
      query: details[0],
    }),
  });

  if (!askPhotoQuestion.body) {
    console.error("No response body received.");
    return;
  }

  const photoAnswerResponse = await fetch(fastAPIBase + "/vision-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      thread_id: details[1],
    }),
  });

  const reader = photoAnswerResponse.body.getReader();
  const decoder = new TextDecoder();

  var report = "";

  if (!photoAnswerResponse.body) {
    console.error("No response body received.");
    return;
  }
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true }).trim();

    if (chunk) {
      report += chunk;
    }
  }
  socket.emit("photoQuestionRes", report);
}
