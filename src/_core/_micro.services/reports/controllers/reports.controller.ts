import type { Request, Response, NextFunction } from "express";
import { ReportService } from "../services/index.js";
import { z } from "zod";
import { tr } from "zod/locales";
import { Parser as CsvParser } from "json2csv";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { container } from "tsyringe";
import reportsFilterService from "../services/reportsFilter.service.js";
import reportAnalyticsService from "../services/reportsAnalytics.service.js";

// Resolve the singleton instance of ReportService
const reportService = container.resolve(ReportService);


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


    async createReport(req: Request, res: Response, next: NextFunction) {
        const  user  = req.user;
        try {

            if (!user) return res.status(403).json('Un authorized');

            const report = await reportService.create({
                title: req.body.title,
                description: req.body.description,
                createdBy: user.id, // assume `req.user` from auth middleware
            });
            return res.status(201).json(report);
        } catch (err) {
            next(err);
            // console.error(err);
            // return res.status(500).json({ error: "Failed to create report" });
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

            const resp = await reportService.listReports(data);
            res.status(200).json(resp);
        } catch (err) {
            next(err);
        }
    }

    async getReport(req: Request, res: Response) {
        try {
            const report = await reportService.getById(req.params.id);
            if (!report) return res.status(404).json({ error: "Report not found" });
            return res.json(report);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch report" });
        }
    }

    updateReport = async (req: Request, res: Response) => {
        let data;
                
        try {
            const schema = z.object({
                // TODO... implement update schema
            });

            data = schema.parse(req.body);
        } catch (err: any) {
            return res.status(400).json({
                error: "Validation failed",
                details: err.errors || err.message,
            });
        }

        try {
            const report = await reportService.update(req.params.id, req.body);
            return res.json(report);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to update report" });
        }
    }

    async softDeleteReport(req: Request, res: Response, next: NextFunction) {
        try {
            const report = await reportService.softDelete(req.params.id);
            return res.json(report);
        } catch (err) {
            next(err);
            // console.error(err);
            // return res.status(500).json({ error: "Failed to delete report" });
        }
    }

    restoreReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const report = await reportService.restore(req.params.id);
            return res.json(report);
        } catch (err) {
            next(err);
            // console.error(err);
            // return res.status(500).json({ error: "Failed to restore report" });
        }
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

    async bulkUpdateReports(req: Request, res: Response, next: NextFunction) {
        const { reportIds, action, payload } = req.body;

        if (!Array.isArray(reportIds) || reportIds.length === 0) {
            return res.status(400).json({ error: "reportIds must be a non-empty array" });
        }

        try {
            const result = await reportService.bulkUpdateReports(req.body);
            return res.json({ success: true, count: result.length, reports: result });

        } catch (err) {
            // console.error(err);
            next(err);
            // return res.status(500).json({ error: "Bulk update failed" });
        }
    }

    async bulkDeleteReports(req: Request, res: Response, next: NextFunction) {
        const { reportIds } = req.body;

        if (!Array.isArray(reportIds) || reportIds.length === 0) {
            return res.status(400).json({ error: "reportIds must be a non-empty array" });
        }

        try {
            const result = reportService.bulkDeleteReports(req.body);

            return res.json({ success: true, deletedCount: result, failed: [] });
        } catch (err) {
            // console.error(err);
            next(err);
            // return res.status(500).json({ error: "Bulk delete failed" });
        }
    }


    // GET /reports/export.csv?status=open&type=disease
    // export report in csv
    // GET /reports/export.pdf?status=resolved&from=2025-08-01&to=2025-08-31
    // GET /reports/export.xlsx?tags=urgent
    exportReports = async (req: Request, res: Response, next: NextFunction) => {
        const { format = "csv", status, assignedTo } = req.query;

        try {
            const reports = await reportService.getExportReports({
                status: status as string, 
                assignedTo: assignedTo as string
            });

            if (!reports || reports.length === 0) {
                return res.status(404).json({ error: "No data to export" });
            }

            switch (format) {
                case "csv": {
                    const parser = new CsvParser({ 
                        fields: ["id", "title", "status", "createdAt"] 
                    });
                    const csv = parser.parse(reports);
                    res.header("Content-Type", "text/csv");
                    res.attachment("reports.csv");
                    return res.send(csv);
                }

                case "xlsx": {
                    const workbook = new ExcelJS.Workbook();
                    const sheet = workbook.addWorksheet("Reports");
                    // sheet.columns = Object.keys(reports[0] || {}).map((key) => ({ header: key, key }));
                    // reports.forEach((row) => sheet.addRow(row));

                    sheet.columns = [
                        { header: "ID", key: "id", width: 36 },
                        { header: "Title", key: "title", width: 30 },
                        { header: "Status", key: "status", width: 15 },
                        { header: "Created At", key: "createdAt", width: 20 },
                    ];
                    reports.forEach((report) =>
                        sheet.addRow({
                            id: report.id,
                            title: report.title,
                            status: report.status,
                            createdAt: report.createdAt,
                        })
                    );
                    
                    
                    res.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    res.attachment("reports.xlsx");
                    await workbook.xlsx.write(res);
                    return res.end();
                }

                case "pdf": {
                    res.header("Content-Type", "application/pdf");
                    res.attachment("reports.pdf");

                    const doc = new PDFDocument();
                    doc.pipe(res);
                    doc.fontSize(16).text("Reports Export", { underline: true });
                    doc.moveDown();

                    // reports.forEach((row) => {
                    //     doc.text(JSON.stringify(row), { paragraphGap: 10 });
                    // });

                    reports.forEach((r) => {
                        doc.fontSize(12).text(`ID: ${r.id}`);
                        doc.text(`Title: ${r.title}`);
                        doc.text(`Status: ${r.status}`);
                        doc.text(`Created At: ${r.createdAt}`);
                        doc.moveDown();
                    });
                    doc.end();
                    return;
                }

                default:
                    return res.status(400).json({ error: "Invalid export format" });
            }
        } catch (err) {
            next(err);
            // console.error(err);
            // return res.status(500).json({ error: "Export failed" });
        }
    }
}

const reportController = new Controller();
export default reportController;