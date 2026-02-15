import bcrypt from "bcrypt";
import Content from "../models/Content.js";
import cloudinary from "../config/cloudinary.js";

// -----------------------------------
// GET CONTENT (TEXT / FILE METADATA)
// -----------------------------------
export const getContent = async (req, res) => {
  try {
    const { id } = req.params;
    const providedPassword = req.headers["x-content-password"];

    const content = await Content.findById(id);

    if (!content) {
      return res.status(403).json({
        message: "Invalid or expired link",
      });
    }

    // ---------------------------
    // PASSWORD PROTECTION
    // ---------------------------
    if (content.passwordHash) {
      if (!providedPassword) {
        return res.status(401).json({
          message: "Password required",
        });
      }

      const isMatch = await bcrypt.compare(
        providedPassword,
        content.passwordHash
      );

      if (!isMatch) {
        return res.status(403).json({
          message: "Incorrect password",
        });
      }
    }

    // ---------------------------
    // VIEW COUNT ENFORCEMENT
    // ---------------------------
    if (content.viewsRemaining !== null) {
      if (content.viewsRemaining <= 0) {
        await content.deleteOne();
        return res.status(403).json({
          message: "Link expired",
        });
      }

      content.viewsRemaining -= 1;
      await content.save();

      // Optional: self-destruct after last view
      if (content.viewsRemaining === 0) {
        await content.deleteOne();
      }
    }

    // ---------------------------
    // TEXT CONTENT
    // ---------------------------
    if (content.type === "text") {
      return res.json({
        type: "text",
        content: content.text,
      });
    }

    // ---------------------------
    // FILE CONTENT (CLOUDINARY)
    // ---------------------------
    const downloadUrl = cloudinary.url(
      content.cloudinaryPublicId,
      {
        resource_type: content.cloudinaryResourceType, // image | video | raw
        secure: true,
      }
    );

    return res.json({
      type: "file",
      originalFileName: content.originalFileName,
      downloadUrl,
    });

  } catch (error) {
    console.error("Content access failed:", error);
    return res.status(403).json({
      message: "Invalid or expired link",
    });
  }
};

// -----------------------------------
// FORCE DOWNLOAD ENDPOINT
// -----------------------------------
export const forceDownload = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await Content.findById(id);

    if (!content) {
      return res.status(403).json({
        message: "Invalid or expired link",
      });
    }

    // ---------------------------
    // PASSWORD PROTECTION
    // ---------------------------
    if (content.passwordHash) {
      const providedPassword = req.headers["x-content-password"];
      if (!providedPassword) {
        return res.status(401).json({
          message: "Password required",
        });
      }

      const isMatch = await bcrypt.compare(
        providedPassword,
        content.passwordHash
      );

      if (!isMatch) {
        return res.status(403).json({
          message: "Incorrect password",
        });
      }
    }

    // ---------------------------
    // FILE CONTENT (FORCE DOWNLOAD)
    // ---------------------------
    if (content.type === "file") {
      const downloadUrl = cloudinary.url(
        content.cloudinaryPublicId,
        {
          resource_type: content.cloudinaryResourceType,
          secure: true,
          flags: "attachment", // Force download
        }
      );

      // Fetch the file from Cloudinary
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status}`);
      }

      // Get file data
      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'application/octet-stream';

      // Set headers to force download
      res.setHeader('Content-Type', 'application/octet-stream'); // Force binary type
      res.setHeader('Content-Disposition', `attachment; filename="${content.originalFileName}"`);
      res.setHeader('Content-Length', buffer.byteLength);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Disposition, Content-Length, X-Content-Password');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
      // Firefox-specific headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Download-Options', 'noopen');
      // Additional headers to force save dialog
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Send the file
      res.send(Buffer.from(buffer));
      return;
    }

    return res.status(400).json({
      message: "Not a file",
    });

  } catch (error) {
    console.error("Force download failed:", error);
    return res.status(403).json({
      message: "Invalid or expired link",
    });
  }
};

// -----------------------------------
// GET USER'S CONTENT (PROTECTED)
// -----------------------------------
export const getUserContent = async (req, res) => {
  try {
    // Get all content for the logged-in user
    const userContent = await Content.find({ userId: req.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .select("-passwordHash"); // Don't send password hash

    res.status(200).json({
      success: true,
      count: userContent.length,
      content: userContent,
    });
  } catch (error) {
    console.error("Get user content failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user content",
    });
  }
};

// -----------------------------------
// DELETE USER'S CONTENT (PROTECTED)
// -----------------------------------
export const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    // Find content
    const content = await Content.findById(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: "Content not found",
      });
    }

    // Check if user owns this content
    if (!content.userId || content.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this content",
      });
    }

    // Delete from Cloudinary if it's a file
    if (content.cloudinaryPublicId) {
      try {
        const resourceType = ['image', 'video', 'raw'].includes(
          content.cloudinaryResourceType
        ) ? content.cloudinaryResourceType : 'raw';

        await cloudinary.uploader.destroy(
          content.cloudinaryPublicId,
          { resource_type: resourceType }
        );
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error:", cloudinaryError);
        // Continue with DB deletion even if Cloudinary delete fails
      }
    }

    // Delete from database
    await content.deleteOne();

    res.status(200).json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Delete content failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete content",
    });
  }
};

