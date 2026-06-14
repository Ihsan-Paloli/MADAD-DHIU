import { invokeEdge } from "@/lib/invoke-edge";
const FN = "auditing";
const call = (action: string) => (args: { data: any }) => invokeEdge<any>(FN, action, args.data);

export const createReport = call("createReport");
export const updateReport = call("updateReport");
export const deleteReport = call("deleteReport");
export const upsertWingStats = call("upsertWingStats");
