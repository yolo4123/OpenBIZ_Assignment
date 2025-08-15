import express from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// CSV writer import
import { createObjectCsvWriter } from 'csv-writer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// In-memory stores
const otpStore = {};        // { mobile: "123456" }
const submissions = [];     // array of submitted forms

// ✅ Send OTP
app.post("/api/send-otp", (req, res) => {
  const { aadhaarNumber, entrepreneurName, mobile } = req.body;

  if (!/^[0-9]{12}$/.test(aadhaarNumber))
    return res.status(400).json({ success: false, message: "Invalid Aadhaar" });
  if (!entrepreneurName || entrepreneurName.length < 3)
    return res.status(400).json({ success: false, message: "Invalid name" });
  if (!/^[6-9][0-9]{9}$/.test(mobile))
    return res.status(400).json({ success: false, message: "Invalid mobile" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[mobile] = otp;

  console.log(`Generated OTP for ${mobile}: ${otp}`);

  res.json({ success: true, message: "OTP sent successfully (demo)", otp });
});

// ✅ Verify OTP
app.post("/api/verify-otp", (req, res) => {
  const { mobile, otp } = req.body;

  if (!otpStore[mobile])
    return res.status(400).json({ success: false, message: "No OTP generated" });

  if (otpStore[mobile] !== otp)
    return res.status(400).json({ success: false, message: "Incorrect OTP" });

  delete otpStore[mobile];

  res.json({ success: true, message: "OTP verified successfully" });
});

// ✅ Submit form (with CSV saving)
app.post("/api/submit", async (req, res) => {
  const {
    aadhaarNumber,
    entrepreneurName,
    mobile,
    pincode,
    city,
    state,
    panNumber,
    email
  } = req.body;

  if (!/^[0-9]{12}$/.test(aadhaarNumber))
    return res.status(400).json({ success: false, message: "Invalid Aadhaar" });
  if (!entrepreneurName || entrepreneurName.length < 3)
    return res.status(400).json({ success: false, message: "Invalid name" });
  if (!/^[6-9][0-9]{9}$/.test(mobile))
    return res.status(400).json({ success: false, message: "Invalid mobile" });
  if (!/^[1-9][0-9]{5}$/.test(pincode))
    return res.status(400).json({ success: false, message: "Invalid PIN" });
  if (!city || !state)
    return res.status(400).json({ success: false, message: "City/State required" });
  if (!/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/.test(panNumber))
    return res.status(400).json({ success: false, message: "Invalid PAN" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ success: false, message: "Invalid email" });

  submissions.push(req.body);
  console.log("Form submissions:", submissions);

  const csvPath = path.join(__dirname, 'submissions.csv');
  const isFileExists = fs.existsSync(csvPath);

  const csvWriter = createObjectCsvWriter({
    path: csvPath,
    header: [
      { id: 'aadhaarNumber', title: 'Aadhaar Number' },
      { id: 'entrepreneurName', title: 'Name of Entrepreneur' },
      { id: 'mobile', title: 'Mobile' },
      { id: 'pincode', title: 'PIN Code' },
      { id: 'city', title: 'City' },
      { id: 'state', title: 'State' },
      { id: 'panNumber', title: 'PAN' },
      { id: 'email', title: 'Email' }
    ],
    append: isFileExists
  });

  try {
    await csvWriter.writeRecords([req.body]);
    res.json({ success: true, message: "Form submitted and saved to CSV!" });
  } catch (err) {
    console.error("Error saving to CSV:", err);
    res.status(500).json({ success: false, message: "Error saving to CSV." });
  }
});

// Serve frontend build in production
const frontendPath = path.join(
  '/Users/ridayasmeen/Desktop/udyam/frontend',
  'dist'
);

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = process.env.PORT || 5200;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
