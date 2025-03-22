import { useState } from "react";
import authProvider from "./authProvider";
import { useNavigate } from "react-router-dom";

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

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
    
    // Clear auth error when user types in any field
    if (errors.auth) {
      setErrors((prev) => ({
        ...prev,
        auth: null,
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage("");
    setErrors({});
    
    const newErrors = {};

    // Validate based on active tab
    if (activeTab === "student") {
      if (!formData.studentId) {
        newErrors.studentId = "Student ID is required";
      }
    } else {
      if (!formData.username) {
        newErrors.username = "Username is required";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      // Prepare login data based on active tab
      const loginData = {
        userType: activeTab,
        password: formData.password,
        username:
          activeTab === "student" ? formData.studentId : formData.username,
      };

      const response = await authProvider.login(loginData);
      
      // Handle success message
      if (response && response.message) {
        setSuccessMessage(response.message);
      }
      
      // Handle redirection
      if (response && response.redirectTo) {
        // Short delay to show success message before redirect
        setTimeout(() => {
          navigate(response.redirectTo);
        }, 1000);
      }
    } catch (error) {
      // Extract error message from the error object
      const errorMessage = error && error.message 
        ? error.message 
        : "Authentication failed. Please check your credentials.";
      
      setErrors({
        auth: errorMessage
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
