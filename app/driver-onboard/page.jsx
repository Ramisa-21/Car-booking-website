"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Utility function for retrieving the authentication token
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        // Using the confirmed key "authToken"
        return localStorage.getItem("authToken"); 
    }
    return null;
};

// Utility function for basic client-side validation
const validateForm = (form) => {
  const errors = {};
  if (!form.licenseNo || form.licenseNo.length < 5) {
    errors.licenseNo = "License number must be at least 5 characters long.";
  }
  if (!form.vehicleModel) {
    errors.vehicleModel = "Vehicle model is required.";
  }
  // Basic regex for plate (can be adjusted for specific country formats)
  if (!form.vehiclePlate || !/^[A-Z0-9\s-]{5,}$/i.test(form.vehiclePlate)) {
    errors.vehiclePlate = "A valid vehicle plate number is required.";
  }
  return errors;
};

export default function DriverOnboarding() {
  const router = useRouter();

  const [form, setForm] = useState({
    licenseNo: "",
    vehicleModel: "",
    vehiclePlate: "",
  });

  const [errors, setErrors] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null); 

  const handleChange = (e) => {
    setSubmissionError(null); 
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);

    // 1. Client-Side Validation
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; 
    }
    setErrors({}); 

    // 2. Token Check (401 Fix)
    const token = getAuthToken();
    if (!token) {
        setSubmissionError("Authentication token not found. Please log in again.");
        setLoading(false);
        // Redirecting to login page since the token is missing
        router.push('/login'); 
        return; 
    }
    
    setLoading(true);

    try {
      const res = await fetch("/api/driver/onboard", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            // CRITICAL FIX: Sending the required Authorization header
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // Successful Onboarding -> Redirect to Driver Dashboard
        router.push("/driver/dashboard");
      } else if (res.status === 401) {
          // Token expired or invalid
          setSubmissionError("Session expired or unauthorized. Redirecting to login.");
          router.push('/login'); 
      } else {
        // Handle other server-side errors (400, 500, etc.)
        setSubmissionError(
          data.message || "Failed to complete onboarding. Please check your details."
        );
      }
    } catch (error) {
      console.error("Submission Error:", error);
      setSubmissionError(
        "A network error occurred. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6"
      >
        <h1 className="text-3xl font-extrabold text-center text-gray-800">
          Driver Onboarding
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Please provide your essential vehicle and licensing details.
        </p>

        {/* Global Submission Error Display */}
        {submissionError && (
          <div
            className="p-3 bg-red-100 border border-red-400 text-red-700 rounded"
            role="alert"
          >
            {submissionError}
          </div>
        )}

        {/* License */}
        <div>
          <label htmlFor="licenseNo" className="block text-sm font-semibold text-gray-700">
            License Number
          </label>
          <input
            id="licenseNo"
            type="text"
            name="licenseNo"
            required
            value={form.licenseNo}
            onChange={handleChange}
            className={`w-full mt-1 p-3 border ${
              errors.licenseNo ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
            placeholder="e.g., 1234567890"
            aria-invalid={!!errors.licenseNo}
          />
          {errors.licenseNo && (
            <p className="text-sm text-red-500 mt-1">{errors.licenseNo}</p>
          )}
        </div>

        {/* Vehicle Model */}
        <div>
          <label htmlFor="vehicleModel" className="block text-sm font-semibold text-gray-700">
            Vehicle Model
          </label>
          <input
            id="vehicleModel"
            type="text"
            name="vehicleModel"
            required
            value={form.vehicleModel}
            onChange={handleChange}
            className={`w-full mt-1 p-3 border ${
              errors.vehicleModel ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
            placeholder="e.g., Toyota Axio, Honda Grace"
            aria-invalid={!!errors.vehicleModel}
          />
          {errors.vehicleModel && (
            <p className="text-sm text-red-500 mt-1">{errors.vehicleModel}</p>
          )}
        </div>

        {/* Vehicle Plate */}
        <div>
          <label htmlFor="vehiclePlate" className="block text-sm font-semibold text-gray-700">
            Vehicle Plate Number
          </label>
          <input
            id="vehiclePlate"
            type="text"
            name="vehiclePlate"
            required
            value={form.vehiclePlate}
            onChange={handleChange}
            className={`w-full mt-1 p-3 border ${
              errors.vehiclePlate ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150`}
            placeholder="e.g., Dhaka Metro GA-123456"
            aria-invalid={!!errors.vehiclePlate}
          />
          {errors.vehiclePlate && (
            <p className="text-sm text-red-500 mt-1">{errors.vehiclePlate}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-bold transition duration-300 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md"
          }`}
        >
          {loading ? "Processing Details..." : "Complete Onboarding"}
        </button>
      </form>
    </div>
  );
}
