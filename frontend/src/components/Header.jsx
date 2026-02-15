import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import "../styles/Header.css";

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { showSuccess } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        showSuccess("Logged out successfully");
        navigate("/");
    };

    return (
        <header className="app-header">
            <div className="header-content">
                {/* Logo */}
                <Link to="/" className="header-logo">
                    <span className="header-lock">🔒</span>
                    <span className="header-title">LinkVault</span>
                </Link>

                {/* Navigation */}
                <nav className="header-nav">
                    {isAuthenticated ? (
                        <>
                            <Link to="/" className="nav-link">
                                Home
                            </Link>
                            <Link to="/dashboard" className="nav-link">
                                Dashboard
                            </Link>
                            <div className="user-menu">
                                <span className="user-greeting">
                                    Hi, {user?.name?.split(" ")[0]}
                                </span>
                                <button onClick={handleLogout} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link
                                to={`/login${location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/' ? `?redirect=${encodeURIComponent(location.pathname)}` : ''}`}
                                className="nav-link"
                            >
                                Login
                            </Link>
                            <Link
                                to={`/register${location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !== '/' ? `?redirect=${encodeURIComponent(location.pathname)}` : ''}`}
                                className="nav-btn"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
