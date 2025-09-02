import type { Request, Response, NextFunction } from "express";
import reportService from "../services/index.js";
import { z } from "zod";
import reportsFilterService from "../services/reportsFilter/index.js";
import reportAnalyticsService from "../services/reportsAnalytics/index.js";
import { tr } from "zod/locales";


const queryReportsSchema = z.object({
    page: z.string().transform(Number).default(1).refine((n) => n > 0, {
        message: "page must be positive",
    }),
    pageSize: z.string().transform(Number).default(10).refine((n) => n > 0, {
        message: "pageSize must be positive",
    }),
    sort: z.string().regex(/^[a-zA-Z_]+:(asc|desc)$/).optional(),
    status: z.string().optional(),
    type: z.string().optional(),
})

const createFilterSchema = z.object({
    name: z.string().min(1, "Name is required"),
    filters: z.record(z.string(), z.any()),
})

class Controller {
    // async generateReport(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const { type } = req.params;
    //         const query = ReportQuerySchema.parse(req.query);
    //         let reportData;
    //         switch (type) {
    //             case "farmer-registrations":
    //                 reportData = await reportService.getFarmerRegistrationsReport(query);
    //                 break;
    //             case "agent-activities":
    //                 reportData = await reportService.getAgentActivitiesReport(query);
    //                 break;
    //             default:
    //                 return res.status(400).json({ success: false, message: "Invalid report type" });
    //         }
    //         return res.status(200).json({ success: true, data: reportData });
    //     } catch (err) {
    //         next(err);
    //     }
    // }

    async getFarmersPerAgent(req: Request, res: Response, next: NextFunction) {
        try {
            const reportData = await reportService.getFarmersPerAgentReport(req.query);
            return res.status(200).json({ success: true, data: reportData });
        } catch (err) {
            next(err);
        }
    }

    // GET /reports?status=open&type=disease&from=2025-08-01&to=2025-08-15&page=1&pageSize=20&sort=created_at:desc
    async getReports(req: Request, res: Response, next: NextFunction) {
        let data;

        try {
            try {

                data = queryReportsSchema.parse(req.query);
            } catch (err: any) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: err.errors || err.message,
                });
            }

            const resp = await reportService.getReports(data);
            res.status(200).json(resp);
        } catch (err) {
            next(err);
        }
    }

    // GET /reports/export.csv?status=open&type=disease
    // export report in csv

    async exportReportcsv(req: Request, res: Response, next: NextFunction) {

    }

    // GET /reports/export.pdf?status=resolved&from=2025-08-01&to=2025-08-31
    async exportReportpdf(req: Request, res: Response, next: NextFunction) {

    }

    // GET /reports/export.xlsx?tags=urgent
    async exportReportxlsx(req: Request, res: Response, next: NextFunction) {

    }


    // report filters controllers begin here

    async createReportsFilterPreset(req: Request, res: Response, next: NextFunction) {
        try {
            let body
            const user = req.user; 
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });   
            }
            try {
                body = createFilterSchema.parse(req.body);
            } catch (err: any) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: err.errors || err.message,
                });
            }
            const userId = user.id;
            // Check if preset with same name exists for user
            const preset = await reportsFilterService.savePreset(userId, body.name, body.filters);
            return res.status(200).json(preset);
        } catch (err) {
          next(err);  
        }

    }

    
    async getReportsFilterPresets(req: Request, res: Response, next: NextFunction) {
        try {
            const user= req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });   
            }
            const userId = user.id;
            const presets = await reportsFilterService.listPresets(userId);
            res.json(presets);
        } catch (err) {
            next(err);    
        }
    }
    
    async deleteReportFilterPreset(req: Request, res: Response, next: NextFunction) {
        try {
            const user= req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });   
            }
            const userId = user.id;
            const presetId = req.params.id;
            const deleted = await reportsFilterService.deletePreset(userId, presetId);
            if (!deleted) {
                return res.status(404).json({ success: false, message: "Preset not found or already deleted" });
            }
            return res.status(200).json({ success: true, data: deleted });
        } catch (err) {
            next(err);    
        }
    }


    async getReportsAnalytics(req: Request, res: Response, next: NextFunction) {
        try {
            const user= req.user;
            if (!user) {
                return res.status(401).json({ success: false, message: "Unauthorized" });   
            }
            const analytics = await reportAnalyticsService.getReportAnalytics();
            res.json(analytics);
        } catch (err) {
            next(err);    
        }
    }
}

const reportController = new Controller();
export default reportController;