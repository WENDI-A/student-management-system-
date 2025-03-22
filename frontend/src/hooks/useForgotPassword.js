import { useState } from "react";

/**
 * Custom hook to handle the forgot password functionality
 * @param {Function} onSuccess - Callback function to execute on successful password reset request
 * @param {Function} onCancel - Callback function to execute when user cancels the password reset
 * @returns {Object} - States and handlers for the forgot password form
 */
export const useForgotPassword = (onSuccess, onCancel) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");

  /**
   * Handles email input changes
   * @param {Event} e - The input change event
   */
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  /**
   * Validates the email format
   * @param {string} email - The email to validate
   * @returns {boolean} - Whether the email is valid
   */
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

  /**
   * Handles the password reset request submission
   * @param {Event} e - The form submission event
   */
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    // Reset previous messages
    setResetSuccess("");
    
    // Validate email
    if (!validateEmail(email)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, you would call your API here
      // Example: await api.sendPasswordResetEmail(email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set success message
      setResetSuccess("Password reset instructions have been sent to your email");
      
      // Clear form
      setEmail("");
      
      // Call success callback if provided
      if (typeof onSuccess === 'function') {
        // Delay to show success message before redirecting
        setTimeout(() => {
          onSuccess();
        }, 3000);
      }
    } catch (error) {
      // Handle error
      setEmailError(
        error?.message || 
        "Failed to send reset instructions. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles cancellation of the password reset process
   */
  const handleCancel = () => {
    // Clear form and errors
    setEmail("");
    setEmailError("");
    setResetSuccess("");
    
    // Call cancel callback if provided
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };

  /**
   * Resets the form state
   */
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