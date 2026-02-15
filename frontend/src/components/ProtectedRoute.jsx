import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
            >
                <div
                    style={{
                        color: "white",
                        fontSize: "24px",
                        fontWeight: "600",
                    }}
                >
                    Loading...
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
