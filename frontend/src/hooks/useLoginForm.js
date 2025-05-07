import { useState } from "react";
import authProvider from "./authProvider";
import { useNavigate } from "react-router-dom";

/**
 * Handles the login form state and submission.
 */
export const useLoginForm = () => {
  const [activeTab, setActiveTab] = useState("student");
  const [formData, setFormData] = useState({
    studentId: "",
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
    if (errors.auth) {
      setErrors((prev) => ({
        ...prev,
        auth: null,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrors({});

    const newErrors = {};
    if (activeTab === "student") {
      if (!formData.studentId) {
        newErrors.studentId = "Student ID is required";
      } else {
        // Validate student ID format (can be customized based on your requirements)
        const studentIdRegex = /^\d+\/\d+$/;
        if (!studentIdRegex.test(formData.studentId)) {
          newErrors.studentId = "Invalid student ID format. Expected format: numbers/numbers";
        }
      }
    } else {
      if (!formData.username) {
        newErrors.username = "Email is required";
      } else {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.username)) {
          newErrors.username = "Please enter a valid email address";
        }
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const loginData = {
        userType: activeTab,
        password: formData.password,
        username:
          activeTab === "student" ? formData.studentId : formData.username,
      };

      const response = await authProvider.login(loginData);

      if (response && response.message) {
        setSuccessMessage(response.message);
        navigate("/");
      }
    } catch (error) {
      const errorMessage =
        error && error.message
          ? error.message
          : "Authentication failed. Please check your credentials.";
      setErrors({
        auth: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    errors,
    loading,
    successMessage,
    handleInputChange,
    handleSubmit,
  };
};
