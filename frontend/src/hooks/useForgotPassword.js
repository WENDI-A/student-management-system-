import { useState } from "react";
import authProvider from "./authProvider";

export const useForgotPassword = (onSuccess, onCancel) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  const validateEmail = (email) => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetSuccess("");
    
    if (!validateEmail(email)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {

      if(await authProvider.forgetPassword(email)){
        setResetSuccess("Password reset instructions have been sent to your email");
        setEmail("");
        if (typeof onSuccess === 'function') {
          setTimeout(() => {
            onSuccess();
          }, 3000);
        }
      }

    } catch (error) {
      setEmailError(
        error?.message || 
        "Failed to send reset instructions. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEmail("");
    setEmailError("");
    setResetSuccess("");
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  const resetForm = () => {
    setEmail("");
    setEmailError("");
    setResetSuccess("");
    setIsSubmitting(false);
  };

  return {
    email,
    emailError,
    isSubmitting,
    resetSuccess,
    handleEmailChange,
    handleResetSubmit,
    handleCancel,
    resetForm
  };
};

export default useForgotPassword;