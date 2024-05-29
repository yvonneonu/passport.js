"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as apiClient from "../services/api-client";

// types.ts

export interface UserData {
  id: string;
  email: string;
  username: string;
  thumbnail: string;
  // Add other fields as needed
}

const dashboard = () => {
  const navigate = useRouter();
  const [user, setUser] = useState<UserData | null>(null); // Use UserData type here

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await apiClient.fetchToken();
        console.log(response);

        if (response.status === 200) {
          setUser(response.data.user);
          navigate.push("/dashboard");
        }
      } catch (error) {
        navigate.push("/");
      }
    };

    fetchToken();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      console.log("Logging out...");

      const response = await apiClient.logout();
      // const response = await apiClient.signOut();
      console.log("Logout response:", response); // Log the response for debugging

      if (response.status === 200) {
        navigate.push(`/`);
      }
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  console.log(user?.email);

  return (
    <>
      {user !== null && (
        <div>
          <h1>Welcome to your dashboard, {user.username}!</h1>
          <p>Email: {user.email}</p>
          <img
            src={user.thumbnail}
            width={100}
            height={100}
            className="rounded-full"
          />
          <button onClick={handleLogout}> Click here to Logout</button>
        </div>
      )}
    </>
  );
};

export default dashboard;
