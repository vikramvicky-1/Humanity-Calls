import React, { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { Link, useLocation } from "react-router-dom";
import Button from "./Button";

const withFormAuth = (WrappedComponent) => {
  return (props) => {
    const { user } = useUser();
    const location = useLocation();

    const savePendingFormData = (data) => {
      if (!data) return;
      localStorage.setItem(`pending_form_${location.pathname}`, JSON.stringify(data));
    };

    const loadPendingFormData = () => {
      const saved = localStorage.getItem(`pending_form_${location.pathname}`);
      if (saved) {
        // Clear after loading to avoid stale data issues later
        // But maybe keep it until successfully submitted?
        // User said "make sure it is working prpperly"
        // Let's keep it until they submit or we can clear it here.
        // Actually, if we clear it here, and they refresh, it's gone.
        // Better to clear it on successful submission in the component.
        return JSON.parse(saved);
      }
      return null;
    };

    const clearPendingFormData = () => {
      localStorage.removeItem(`pending_form_${location.pathname}`);
    };

    // This effect ensures that name and email are synced from user context
    useEffect(() => {
      if (user && props.setFormData) {
        props.setFormData((prev) => {
          const updates = {};
          if (Object.prototype.hasOwnProperty.call(prev, "name")) updates.name = user.name;
          if (Object.prototype.hasOwnProperty.call(prev, "email")) updates.email = user.email;
          if (Object.prototype.hasOwnProperty.call(prev, "fullName")) updates.fullName = user.name;
          if (Object.prototype.hasOwnProperty.call(prev, "contactPerson")) updates.contactPerson = user.name;
          if (Object.prototype.hasOwnProperty.call(prev, "verifiedPersonName")) updates.verifiedPersonName = user.name;
          return { ...prev, ...updates };
        });
      }
    }, [user, props.setFormData]);

    const isFieldDisabled = (fieldName) => {
      const protectedFields = ["email"];
      return !!(user && protectedFields.includes(fieldName));
    };

    const renderSubmitButton = (originalButton, currentFormData) => {
      if (!user) {
        return (
          <Link 
            to={`/become-a-member?redirect=${encodeURIComponent(location.pathname)}`} 
            className="block w-full"
            onClick={() => savePendingFormData(currentFormData)}
          >
            <Button
              type="button"
              variant="outline"
              className="w-full py-4 text-lg border-blood text-blood hover:bg-blood hover:text-white"
            >
              Login to submit
            </Button>
          </Link>
        );
      }
      
      if (!user.isVerified) {
        return (
          <Link 
            to="/profile"
            className="block w-full"
            onClick={() => savePendingFormData(currentFormData)}
          >
            <Button
              type="button"
              variant="outline"
              className="w-full py-4 text-lg border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Verify Mail to Submit
            </Button>
          </Link>
        );
      }
      return originalButton;
    };

    return (
      <WrappedComponent
        {...props}
        user={user}
        isFieldDisabled={isFieldDisabled}
        renderSubmitButton={renderSubmitButton}
        loadPendingFormData={loadPendingFormData}
        clearPendingFormData={clearPendingFormData}
      />
    );
  };
};

export default withFormAuth;
