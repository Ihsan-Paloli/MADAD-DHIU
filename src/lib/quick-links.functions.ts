import { invokeEdge } from "@/lib/invoke-edge";
const FN = "quick-links";
const call = (action: string) => (args: { data: any }) => invokeEdge<any>(FN, action, args.data);

export const createQuickLink = call("createQuickLink");
export const updateQuickLink = call("updateQuickLink");
export const deleteQuickLink = call("deleteQuickLink");
export const toggleQuickLink = call("toggleQuickLink");
export const listAllQuickLinks = call("listAllQuickLinks");
