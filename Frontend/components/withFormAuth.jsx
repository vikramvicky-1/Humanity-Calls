import React, { useEffect } from "react";
import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import Button from "./Button";

const withFormAuth = (WrappedComponent) => {
  return (props) => {
    const { user } = useUser();

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

    const renderSubmitButton = (originalButton) => {
      if (!user) {
        return (
          <Link to="/become-a-member" className="block w-full">
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
      />
    );
  };
};

export default withFormAuth;
