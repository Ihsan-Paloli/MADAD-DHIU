import { invokeEdge } from "@/lib/invoke-edge";
const FN = "uploads";
const call = (action: string) => (args: { data: any }) => invokeEdge<any>(FN, action, args.data);

export const uploadFile = call("uploadFile");
