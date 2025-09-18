import { Router } from "express";
import { authMiddleware, requireRole } from "../../../middlewares/auth/index.js";   
import reportShareController from "../controllers/report.share.controller.js";
import reportAttachmentController from "../controllers/report.attachments.controller.js";
import reportCommentsController from "../controllers/report.comments.controller.js";
import reportReactionController from "../controllers/report.reactions.controller.js";
import reportController from "../controllers/reports.controller.js";
const router = Router();


// reports analytics
router.get("/analytics",
    authMiddleware, 
    requireRole(["admin", "supervisor"]),
    reportController.getReportsAnalytics 
);

// Bulk update (archive, restore, assign, status updates)
router.patch("/bulk",
    authMiddleware,  
    requireRole(["agent", "admin"]), 
    reportController.bulkUpdateReports
);

// Bulk delete
router.delete("/bulk",
    authMiddleware,  
    requireRole(["admin"]), 
    reportController.bulkDeleteReports
);

// Export reports (agent/admin only)
router.get("/export", 
    authMiddleware,  
    requireRole(["agent", "admin"]), 
    reportController.exportReports
);

// Internal share (assign to another user)
router.post("/:id/share", 
    authMiddleware,  
    requireRole(["agent", "admin"]),  
    reportShareController.shareReportInternal
);

// External share (generate link)
router.post("/:id/share-link", 
    authMiddleware,  
    requireRole(["agent", "admin"]),  
    reportShareController.shareReportExternal
);

// Access via external link (public, no auth required)
router.get("/shared/:token", 
    reportShareController.accessSharedReport
);

// revoke
router.get("/shared/:shareId/revoke", 
    authMiddleware,  
    requireRole(["agent", "admin"]),  
    reportShareController.accessSharedReport
);

// uploadAttachment
router.post(`/reports/:id/attachments`,
    authMiddleware,  
    requireRole(["agent", "admin"]),
    reportAttachmentController.uploadAttachment 
);
// listAttachments
router.get(`/reports/:id/attachments`,
    authMiddleware,  
    requireRole(["farmer", "agent", "admin"]),
    reportAttachmentController.listAttachments
);
// listComments
router.get(`/reports/:id/comments`,
    authMiddleware,  
    requireRole(["farmer", "agent", "admin"]),
    reportCommentsController.listComments 
);
// addComment
router.post(`/reports/:id/comments`,
    authMiddleware,  
    requireRole(["farmer", "agent", "admin"]),
    reportCommentsController.addComment 
);
// updateComment
router.patch(`/reports/:reportId/comments/:commentId`,
    authMiddleware,  
    requireRole(["farmer", "agent", "admin"]),
    reportCommentsController.updateComment 
);
// deleteComment
router.delete(`/reports/:reportId/comments/:commentId`,
    authMiddleware,  
    requireRole(["farmer", "agent", "admin"]),
    reportCommentsController.deleteComment 
);
// resolveThread
router.patch(`/reports/:reportId/comments/:commentId/resolve`,
    authMiddleware,  
    requireRole(["agent", "admin"]),
    reportCommentsController.resolveThread 
);
// unresolveThread
router.patch(`/reports/:reportId/comments/:commentId/unresolve`,
    authMiddleware,  
    requireRole(["agent", "admin"]),
    reportCommentsController.unresolveThread 
);
// addReaction
router.post(`/reports/:reportId/comments/:commentId/reactions`,
    authMiddleware,  
    requireRole(["agent", "admin"]),
    reportReactionController.addReaction 
);
// removeReaction
router.delete(`/reports/:reportId/comments/:commentId/reactions/:emoji`,
    authMiddleware,  
    requireRole(["agent", "admin"]), 
    reportReactionController.removeReaction
);


export default router;