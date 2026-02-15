import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const initAuth = async () => {
            const savedToken = localStorage.getItem("token");
            if (savedToken) {
                try {
                    // Verify token and get user
                    const response = await api.get("/api/auth/me", {
                        headers: { Authorization: `Bearer ${savedToken}` },
                    });
                    setUser(response.data.user);
                    setToken(savedToken);
                } catch (error) {
                    // Token invalid, clear it
                    localStorage.removeItem("token");
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    // Register function
    const register = async (name, email, password) => {
        const response = await api.post("/api/auth/register", {
            name,
            email,
            password,
        });

        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(newUser);

        return response.data;
    };

    // Login function
    const login = async (email, password) => {
        const response = await api.post("/api/auth/login", {
            email,
            password,
        });

        const { token: newToken, user: newUser } = response.data;
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(newUser);

        return response.data;
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
