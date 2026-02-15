import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import "../styles/Auth.css";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showSuccess, showError } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            showError("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            showSuccess("Login successful!");
            navigate("/dashboard");
        } catch (error) {
            showError(error.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* Header */}
                <div className="auth-header">
                    <h1 className="auth-logo">
                        <span className="lock-icon">🔒</span>
                        <span className="vault-text">LinkVault</span>
                    </h1>
                    <h2 className="auth-title">Welcome Back</h2>
                    <p className="auth-subtitle">Log in to access your secure vault</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            disabled={loading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <p>
                        Don't have an account?{" "}
                        <Link to="/register" className="auth-link">
                            Sign up
                        </Link>
                    </p>
                    <p>
                        <Link to="/" className="auth-link">
                            Continue as guest
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
