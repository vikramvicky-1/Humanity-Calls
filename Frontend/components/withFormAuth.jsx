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
