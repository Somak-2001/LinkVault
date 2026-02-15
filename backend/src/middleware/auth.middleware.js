import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check if token exists in Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized to access this route",
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token (exclude password)
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found",
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// Optional auth - attach user if token exists, but don't block
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.id).select("-password");
            } catch (error) {
                // Token invalid, but continue anyway (optional auth)
                req.user = null;
            }
        }

        next();
    } catch (error) {
        next();
    }
};
