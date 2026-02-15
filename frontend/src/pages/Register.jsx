import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import "../styles/Auth.css";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();
    const { showSuccess, showError } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name || !email || !password || !confirmPassword) {
            showError("Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            showError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            showError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password);
            showSuccess("Registration successful!");
            navigate("/dashboard");
        } catch (error) {
            showError(error.response?.data?.message || "Registration failed");
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
                    <h2 className="auth-title">Create Account</h2>
                    <p className="auth-subtitle">Join LinkVault to secure your content</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            disabled={loading}
                            required
                        />
                    </div>

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
                            placeholder="At least 6 characters"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <p>
                        Already have an account?{" "}
                        <Link to="/login" className="auth-link">
                            Log in
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
