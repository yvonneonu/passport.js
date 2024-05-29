const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || "";
import axios from "axios";
export const signOut = async () => {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    credentials: "include",
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Error during sign out");
  }

  return response; // Note that response.json() is not necessary for a redirect response
};

export const logout = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/logout`,
      {},
      {
        withCredentials: true,
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchToken = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/profile`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};
