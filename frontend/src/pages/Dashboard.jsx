import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import api from "../services/api";
import "../styles/Dashboard.css";

export default function Dashboard() {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserContent();
    }, []);

    const fetchUserContent = async () => {
        try {
            const response = await api.get("/api/user/content");
            setContent(response.data.content);
        } catch (error) {
            showError("Failed to fetch your content");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this content?")) {
            return;
        }

        try {
            await api.delete(`/api/content/${id}`);
            showSuccess("Content deleted successfully");
            // Remove from UI
            setContent(content.filter((item) => item._id !== id));
        } catch (error) {
            showError(error.response?.data?.message || "Failed to delete content");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getContentPreview = (item) => {
        if (item.type === "text") {
            return item.text.length > 100
                ? item.text.substring(0, 100) + "..."
                : item.text;
        }
        return item.originalFileName;
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-loading">Loading your vault...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-content">
                {/* Header */}
                <div className="dashboard-header">
                    <h1 className="dashboard-title">
                        Welcome back, <span className="user-name">{user?.name}</span>! 👋
                    </h1>
                    <p className="dashboard-subtitle">
                        You have {content.length} item{content.length !== 1 ? "s" : ""} in
                        your vault
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="dashboard-actions">
                    <Link to="/" className="dashboard-btn dashboard-btn-primary">
                        ➕ Upload New Content
                    </Link>
                </div>

                {/* Content Grid */}
                {content.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📦</div>
                        <h2>Your vault is empty</h2>
                        <p>Start by uploading some content to secure it in LinkVault</p>
                        <Link to="/" className="empty-btn">
                            Upload Your First Item
                        </Link>
                    </div>
                ) : (
                    <div className="content-grid">
                        {content.map((item) => (
                            <div key={item._id} className="content-card">
                                <div className="card-header">
                                    <span className="content-type-badge">
                                        {item.type === "text" ? "📝 Text" : "📎 File"}
                                    </span>
                                    <span className="content-date">
                                        {formatDate(item.createdAt)}
                                    </span>
                                </div>

                                <div className="card-body">
                                    <p className="content-preview">{getContentPreview(item)}</p>
                                    {item.passwordHash && (
                                        <span className="password-badge">🔒 Password Protected</span>
                                    )}
                                    {item.viewsRemaining !== null && (
                                        <span className="views-badge">
                                            👁️ {item.viewsRemaining} views left
                                        </span>
                                    )}
                                </div>

                                <div className="card-footer">
                                    <button
                                        onClick={() => navigate(`/view/${item._id}`)}
                                        className="card-btn card-btn-view"
                                    >
                                        👁️ View
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="card-btn card-btn-delete"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>

                                <div className="expiry-indicator">
                                    Expires: {formatDate(item.expiresAt)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
