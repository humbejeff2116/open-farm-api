import { asc, desc } from "drizzle-orm";

type SortDirection = "asc" | "desc";

export function parsePagination(query: any) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const offset = (page - 1) * pageSize;
    return { page, pageSize, offset, limit: pageSize };
}



export function getSortQuery(query: any, allowedFields: any, defaultSortField: any) {
    let { sort } = query as { sort?: string };

    if (!sort) {
        // Default sort
        sort = "createdAt:desc";
    }
    // Parse sort param safely
    const [field, sortOrder] = sort.split(":");
    const direction: SortDirection = sortOrder === "asc" ? "asc" : "desc";
    const sortField = allowedFields[field as keyof typeof allowedFields]  ?? defaultSortField;

    return direction === "asc" ? asc(sortField) : desc(sortField);
}
