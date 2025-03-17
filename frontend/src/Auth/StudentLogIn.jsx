"use client";

import { useState } from "react";
import { User, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Image from "../assets/hwu_logo.png";

export default function SchoolLogin() {
  const [activeTab, setActiveTab] = useState("student");
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    if (idNumber === "1234" && password === "1234") {
      navigate("/student-dashboard");
    }
    console.log("Logging in with:", {
      idNumber,
      password,
      userType: activeTab,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-500 text-white p-4 flex items-center">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-white p-1 flex items-center justify-center mr-3">
            <img
              src={Image}
              alt="School Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
          </div>
          <h1 className="text-xl font-semibold">HU Model Community School</h1>
        </div>
      </header>

      {/* Login Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex mb-4">
            <button
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
                activeTab === "staff"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveTab("staff")}
            >
              <User size={18} />
              <span>Staff Login</span>
            </button>
            <button
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
                activeTab === "student"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setActiveTab("student")}
            >
              <User size={18} />
              <span>Student Login</span>
            </button>
          </div>

          {/* Login Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-md shadow-md p-6"
          >
            <div className="mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="idNumber"
                  placeholder="ID Number"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Login
            </button>
            <div className="mt-4 text-right">
              <a href="#" className="text-sm text-blue-500 hover:underline">
                forgot password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
