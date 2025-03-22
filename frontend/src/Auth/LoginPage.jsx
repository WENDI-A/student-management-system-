import { useState } from "react";
import { User, Lock, School, Users, Mail, ArrowLeft } from "lucide-react";
import Image from "../assets/hwu_logo.png";
import { useLoginForm } from "../hooks/useLoginForm";
import { useForgotPassword } from "../hooks/useForgotPassword";

const LoginPage = () => {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Login form hook
  const {
    activeTab,
    setActiveTab,
    formData,
    errors,
    loading,
    successMessage,
    handleInputChange,
    handleSubmit,
  } = useLoginForm();
  
  // Forgot password hook
  const {
    email,
    emailError,
    isSubmitting,
    resetSuccess,
    handleEmailChange,
    handleResetSubmit,
    handleCancel,
  } = useForgotPassword(
    // Success callback - return to login after success
    () => setShowForgotPassword(false),
    // Cancel callback
    () => setShowForgotPassword(false)
  );

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setShowForgotPassword(true);
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
          <h1 className="text-xl font-semibold md:block hidden">HU Model Community School</h1>
        </div>
      </header>

      {/* Login Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {!showForgotPassword ? (
            <>
              {/* Tabs - Only Student and User */}
              <div className="flex mb-4">
                <button
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
                    activeTab === "student"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setActiveTab("student")}
                  type="button"
                >
                  <School size={18} />
                  <span>Student Login</span>
                </button>
                <button
                  className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 ${
                    activeTab === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setActiveTab("user")}
                  type="button"
                >
                  <Users size={18} />
                  <span>Staff Login</span>
                </button>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {successMessage}
                </div>
              )}

              {/* Authentication Error */}
              {errors.auth && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {errors.auth}
                </div>
              )}

              {/* Login Form */}
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-md shadow-md p-6"
              >
                {activeTab === "student" ? (
                  // Student login form
                  <div className="mb-4">
                    <label
                      htmlFor="studentId"
                      className="block text-gray-700 font-medium mb-1"
                    >
                      Student ID
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <School className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="studentId"
                        name="studentId"
                        placeholder="Enter your student ID"
                        value={formData.studentId || ""}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                                text-gray-900"
                      />
                    </div>
                    {errors.studentId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.studentId}
                      </p>
                    )}
                  </div>
                ) : (
                  // User login form (for admin, teacher, parent)
                  <div className="mb-4">
                    <label
                      htmlFor="username"
                      className="block text-gray-700 font-medium mb-1"
                    >
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        value={formData.username || ""}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                                text-gray-900"
                      />
                    </div>
                    {errors.username && (
                      <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                    )}
                  </div>
                )}

                <div className="mb-6">
                  <label
                    htmlFor="password"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password || ""}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md
                              focus:outline-none focus:ring-2 focus:ring-blue-500
                              text-gray-900"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${
                    loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } text-white font-medium py-2 px-4 rounded-md transition duration-200`}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

                <div className="mt-4 text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </form>
            </>
          ) : (
            // Forgot Password Form
            <div className="bg-white rounded-md shadow-md p-6">
              <div className="flex items-center mb-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="mr-2 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={20} />
                </button>
                <h2 className="text-xl font-semibold">Reset Password</h2>
              </div>

              {resetSuccess && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {resetSuccess}
                </div>
              )}

              <p className="text-gray-600 mb-4">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              <form onSubmit={handleResetSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-gray-700 font-medium mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={handleEmailChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md
                              focus:outline-none focus:ring-2 focus:ring-blue-500
                              text-gray-900"
                    />
                  </div>
                  {emailError && (
                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full ${
                    isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                  } text-white font-medium py-2 px-4 rounded-md transition duration-200`}
                >
                  {isSubmitting ? "Sending..." : "Send Reset Instructions"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;