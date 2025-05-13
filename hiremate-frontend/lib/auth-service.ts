// lib/auth-service.ts

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: string;
}

interface LoginData {
  username: string;
  password: string;
}

const API_URL = "http://localhost:8080";

// ✅ Register a new user with detailed error handling
export async function registerUser(data: RegisterData): Promise<boolean> {
  try {
    console.log("Sending registration data:", data);

    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const contentType = response.headers.get("Content-Type");
      let errorMessage = "Registration failed";

      if (contentType && contentType.includes("application/json")) {
        const errorJson = await response.json();
        errorMessage = errorJson.message || errorMessage;
      } else {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return true;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

// ✅ Login user and store JWT + user data
export async function loginUser(data: LoginData): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Login failed:", errorText);
      throw new Error("Login failed");
    }

    const responseData = await response.json();

    localStorage.setItem("hiremate_token", responseData.token);
    localStorage.setItem("hiremate_username", responseData.username);
    localStorage.setItem("hiremate_userId", String(responseData.userId));
    localStorage.setItem("hiremate_role", responseData.role);

    return true;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

// ✅ Get JWT token from localStorage
export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("hiremate_token");
  }
  return null;
}

// ✅ Remove token and user data
export function removeToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("hiremate_token");
    localStorage.removeItem("hiremate_username");
    localStorage.removeItem("hiremate_userId");
    localStorage.removeItem("hiremate_role");
  }
}

// ✅ Generate Authorization headers with correct typing
export function getAuthHeader(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ✅ Check if token is present
export function isAuthenticated(): boolean {
  return !!getToken();
}

// ✅ Helper for making authenticated API calls
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = getAuthHeader();

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });
}
