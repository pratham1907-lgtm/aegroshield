"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, Aperture } from "lucide-react";

export default function PredictPage() {
  const router = useRouter();
  
  const [cropType, setCropType] = useState("");
  const [stateName, setStateName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const canSubmit = !!imageSrc && !!stateName && !!districtName.trim();

  // Handle Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, or JPEG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      setImageSrc(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      mediaStreamRef.current = stream;
      setIsCameraOpen(true);
    } catch (err) {
      console.warn("Camera API error:", err);
      // Fallback
      fileInputRef.current?.click();
    }
  };

  useEffect(() => {
    if (isCameraOpen && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
    }
  }, [isCameraOpen]);

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, width, height);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      setImageSrc(canvas.toDataURL("image/jpeg", 0.85));
    }
    stopCamera();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    const selectedCrop = cropType || "Auto-detect";

    try {
      // In Next.js we would normally call an internal API route /api/diagnose
      // But the original app called window.API_BASE_URL + '/api/v1/diagnose'
      // For now we'll simulate the backend logic or call localhost:5000 directly.
      const API_BASE_URL = ""; 
      
      const response = await fetch('/api/v1/diagnose', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageSrc,
          crop: selectedCrop,
          state: stateName,
          district: districtName
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || "API Failed");
      }

      result.image = imageSrc;
      result.timestamp = new Date().toISOString();
      result.state = stateName;
      result.district = districtName;

      try {
        sessionStorage.setItem("agriDiagnosisData", JSON.stringify(result));
        sessionStorage.setItem("agriDiagnosisData.liveData", JSON.stringify(result.liveData));
      } catch (err) {
        result.image = "truncated";
        sessionStorage.setItem("agriDiagnosisData", JSON.stringify(result));
        sessionStorage.setItem("agriDiagnosisData.liveData", JSON.stringify(result.liveData));
      }

      router.push("/dashboard");

    } catch (error) {
      console.error("Diagnosis request failed:", error);
      alert("Failed to connect to the diagnosis backend server.");
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <div className="page-hero">
        <div className="container">
          <div className="page-hero-badge">🌿 AI Disease Risk Engine</div>
          <h1>AI Crop Disease Diagnosis</h1>
          <p>Upload a photo or snap a picture of an infected crop leaf to get an instant diagnostic report and treatment advisory.</p>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.4,129.58,114.6,188.4,96.5,233.15,82.8,278.4,70.5,321.39,56.44Z" fill="#E8F3EC"></path>
          </svg>
        </div>
      </div>

      <div className="predict-layout">
        <div className="form-tip container" style={{ marginTop: "32px", marginBottom: "32px" }}>
          💡 <div>Select your crop type, enter your farm location (used to correlate local weather risk factors), and snap or upload a clear, focused photo of the affected leaf.</div>
        </div>

        <form className="form-section upload-card container" style={{ marginBottom: "60px" }} onSubmit={handleSubmit}>
        <div style={{ marginBottom: "20px" }}>
          <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>Select Crop Type (Optional)</label>
          <select className="form-control" style={{ width: "100%" }} value={cropType} onChange={(e) => setCropType(e.target.value)}>
            <option value="">I'm not sure (Auto-detect Crop)</option>
            <option value="Rice">🌾 Rice (चावल)</option>
            <option value="Wheat">🌾 Wheat (गेहूँ)</option>
            <option value="Maize">🌽 Maize (मक्का)</option>
            <option value="Tomato">🍅 Tomato (टमाटर)</option>
            <option value="Potato">🥔 Potato (आलू)</option>
            <option value="Cotton">☁️ Cotton (कपास)</option>
            <option value="Sugarcane">🎋 Sugarcane (गन्ना)</option>
          </select>
        </div>

        <div className="form-grid" style={{ marginBottom: "24px" }}>
          <div className="form-group">
            <label className="form-label">State <span>*</span></label>
            <select className="form-control" required value={stateName} onChange={(e) => setStateName(e.target.value)}>
              <option value="" disabled>Select state…</option>
              <option>Andhra Pradesh</option><option>Arunachal Pradesh</option><option>Assam</option><option>Bihar</option>
              <option>Chhattisgarh</option><option>Goa</option><option>Gujarat</option><option>Haryana</option>
              <option>Himachal Pradesh</option><option>Jharkhand</option><option>Karnataka</option><option>Kerala</option>
              <option>Madhya Pradesh</option><option>Maharashtra</option><option>Manipur</option><option>Meghalaya</option>
              <option>Mizoram</option><option>Nagaland</option><option>Odisha</option><option>Punjab</option>
              <option>Rajasthan</option><option>Sikkim</option><option>Tamil Nadu</option><option>Telangana</option>
              <option>Tripura</option><option>Uttar Pradesh</option><option>Uttarakhand</option><option>West Bengal</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">District <span>*</span></label>
            <input type="text" className="form-control" placeholder="e.g. Ludhiana, Nashik, Meerut…" required value={districtName} onChange={(e) => setDistrictName(e.target.value)} />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label className="form-label" style={{ marginBottom: "8px", display: "block" }}>1. Upload Crop Image <span>*</span></label>
          
          {!isCameraOpen && !imageSrc && (
            <div 
              className={`upload-zone ${dragActive ? 'dragover' : ''}`} 
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon-wrap"><Camera size={28} /></div>
              <div className="upload-text"><strong>Drag and drop your leaf image here</strong> or browse files</div>
              <div className="upload-text" style={{ fontSize: "0.8rem", color: "var(--gray-400)", marginTop: "-4px" }}>Supports PNG, JPG, JPEG (up to 10MB)</div>
              
              <div className="upload-actions">
                <button type="button" className="btn btn-outline" onClick={(e) => { e.stopPropagation(); startCamera(); }}>
                  <Aperture size={18} /> Take a Photo
                </button>
                <button type="button" className="btn btn-primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  <ImageIcon size={18} /> Upload File
                </button>
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files && handleImageFile(e.target.files[0])} />
            </div>
          )}

          {isCameraOpen && (
            <div className="camera-panel active">
              <video ref={videoRef} className="camera-stream" autoPlay playsInline></video>
              <div className="camera-overlay-controls">
                <button type="button" className="btn btn-primary" onClick={capturePhoto}>
                  <Camera size={18} /> Capture
                </button>
                <button type="button" className="btn btn-outline" style={{ borderColor: "var(--white)", color: "var(--white)" }} onClick={stopCamera}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

          {imageSrc && (
            <div className="upload-preview-wrapper active">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="upload-preview-img" src={imageSrc} alt="Crop leaf preview" />
              <button type="button" className="remove-preview-btn" onClick={() => setImageSrc(null)}>×</button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "32px", borderTop: "1px solid var(--gray-200)", paddingTop: "24px" }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={!canSubmit || isSubmitting} style={{ opacity: (!canSubmit || isSubmitting) ? 0.6 : 1, cursor: (!canSubmit || isSubmitting) ? 'not-allowed' : 'pointer' }}>
            {isSubmitting ? <span className="lo-spinner" style={{ width: "16px", height: "16px", display: "inline-block", marginRight: "8px", borderWidth: "2px", verticalAlign: "middle", borderTopColor: "var(--primary)" }}></span> : '🔍 Analyze Crop Image →'}
          </button>
        </div>
      </form>
      </div>
    </main>
  );
}
