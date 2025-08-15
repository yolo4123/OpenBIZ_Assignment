import React, { useMemo, useState } from "react";
import Progress from "./components/Progress";
import FormRenderer from "./components/FormRenderer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  step1Schema,
  step2Schema,
  Step1Data,
  Step2Data
} from "./lib/validators";
import { usePincodeAutoFill } from "./hooks/usePincode";


const stepDefs = [
  {
    id: 1,
    title: "Aadhaar & Mobile Verification",
    fields: [
      { name: "aadhaarNumber", label: "Aadhaar Number", type: "text", placeholder: "123412341234", required: true },
      { name: "entrepreneurName", label: "Name of Entrepreneur", type: "text", placeholder: "Full name", required: true },
      { name: "mobile", label: "Mobile Number (linked to Aadhaar)", type: "tel", placeholder: "9876543210", required: true },
      { name: "pincode", label: "PIN Code", type: "text", placeholder: "560001", required: true, enhancement: "autoFillCityState" },
      { name: "city", label: "City", type: "text", placeholder: "Auto-filled", required: true, readonly: true },
      { name: "state", label: "State", type: "text", placeholder: "Auto-filled", required: true, readonly: true }
    ]
  },
  {
    id: 2,
    title: "PAN Validation",
    fields: [
      { name: "panNumber", label: "PAN Number", type: "text", placeholder: "ABCDE1234F", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "you@example.com", required: true }
    ]
  }
];


export default function App() {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null); // for demo logging only
  const [otpError, setOtpError] = useState<string | null>(null);


  const form1 = useForm<Step1Data>({
    mode: "onChange",
    resolver: zodResolver(step1Schema),
    defaultValues: { city: "", state: "" }
  });
  const form2 = useForm<Step2Data>({
    mode: "onChange",
    resolver: zodResolver(step2Schema)
  });


  usePincodeAutoFill(form1);


  const stepIsValid = (currentStep === 1 ? form1 : form2).formState.isValid;
  const nextDisabled = useMemo(() => !stepIsValid, [stepIsValid]);


  // ==== UPDATED: Call backend to send OTP ====
  const sendOtp = async () => {
    const ok = await form1.trigger(["aadhaarNumber", "entrepreneurName", "mobile"]);
    if (!ok) return;


    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form1.getValues())
      });
      const data = await res.json();
      console.log("OTP API Response:", res.status, data);


      if (res.ok && data.success) {
        setOtpSent(true);
        setGeneratedOtp(data.otp || null); // backend returns otp in demo mode
        setOtpError(null);
        console.info("Backend OTP (demo):", data.otp);
      } else {
        setOtpError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
      setOtpError("Error sending OTP");
    }
  };


  // ==== UPDATED: Call backend to verify OTP ====
  const verifyOtpAndContinue = async (enteredOtp: string) => {
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: form1.getValues().mobile,
          otp: enteredOtp
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpError(null);
        return true;
      } else {
        setOtpError(data.message || "OTP verification failed");
        return false;
      }
    } catch (err) {
      console.error(err);
      setOtpError("Error verifying OTP");
      return false;
    }
  };


  const handleNext = async (enteredOtp?: string) => {
    if (currentStep === 1) {
      if (!otpSent) {
        setOtpError("Please generate and enter OTP to continue");
        return;
      }
      const otpOk = await verifyOtpAndContinue(enteredOtp || "");
      if (!otpOk) return;
      const ok = await form1.trigger();
      if (!ok) return;
      setCurrentStep(2);
    } else {
      const ok = await form2.trigger();
      if (!ok) return;

      const payload = { ...form1.getValues(), ...form2.getValues() };

      try {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          alert("✅ Submitted and saved successfully!");
        } else {
          alert("❌ Submission failed: " + (data.message || "Unknown error"));
        }
      } catch (error) {
        alert("❌ Network error during submission");
        console.error(error);
      }
    }
  };

  // Optional: Submit form on Enter key press in step 2
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentStep === 2) {
      e.preventDefault();
      handleNext();
    }
  };

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand">Udyam Registration</div>
      </div>
      <main className="center">
        <div className="card">
          <div className="card-header">
            <h2>{currentStep === 1 ? "Step 1: Aadhaar & OTP" : "Step 2: PAN Validation"}</h2>
            <div className="subtitle">A clean, responsive UI inspired by the Udyam portal</div>
          </div>
          <div className="card-body">
            <div className="progress-row">
              <Progress current={currentStep} />
            </div>


            {currentStep === 1 ? (
              <>
                <FormRenderer form={form1} fields={stepDefs[0].fields as any} />
                <div className="otp-row">
                  {!otpSent ? (
                    <button className="btn primary" onClick={sendOtp}>
                      Generate OTP
                    </button>
                  ) : (
                    <>
                      <div className="otp-note">OTP sent to mobile (via backend demo)</div>
                      <label className="label">Enter OTP</label>
                      <input
                        className="input"
                        type="text"
                        id="otpField"
                        placeholder="6-digit OTP"
                      />
                      {otpError && <div className="error">{otpError}</div>}
                      <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                        <button
                          className="btn secondary"
                          onClick={() => {
                            setOtpSent(false);
                            setGeneratedOtp(null);
                          }}
                        >
                          Regenerate
                        </button>
                        <button
                          className="btn primary"
                          onClick={() => {
                            const val = (document.getElementById("otpField") as HTMLInputElement)
                              .value;
                            handleNext(val);
                          }}
                        >
                          Continue
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <FormRenderer 
                  form={form2} 
                  fields={stepDefs[1].fields as any}
                  // Pass the Enter key handler to inputs in step 2
                  inputProps={{ onKeyDown: handleKeyDown }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="btn secondary" onClick={() => setCurrentStep(1)}>
                    Back
                  </button>
                  <button className="btn primary" onClick={() => handleNext()}>
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="card-footer">
            <small>Frontend connected to backend OTP API.</small>
          </div>
        </div>
      </main>
    </div>
  );
}
