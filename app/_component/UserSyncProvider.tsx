// askes-ai/app/_component/UserSyncProvider.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import axios from "axios";

export const UserSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // This effect runs when the user object is loaded.
    // It makes a POST request to /api/users to ensure the user exists in our DB.
    if (isLoaded && user) {
      console.log("User loaded, syncing to DB...");
      axios.post('/dashboard/api/users')
        .then(response => {
          console.log("User synced successfully:", response.data);
        })
        .catch(error => {
          console.error("Failed to sync user:", error);
        });
    }
  }, [isLoaded, user]);

  return <>{children}</>;
};
