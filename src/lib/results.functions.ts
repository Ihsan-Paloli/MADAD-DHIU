import { invokeEdge } from "@/lib/invoke-edge";
const FN = "results";
const call = (action: string) => (args: { data: any }) => invokeEdge<any>(FN, action, args.data);

export const upsertResult = call("upsertResult");
export const setResultStatus = call("setResultStatus");
export const deleteResult = call("deleteResult");
export const getResultForProgram = call("getResultForProgram");
