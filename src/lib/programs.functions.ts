import { invokeEdge } from "@/lib/invoke-edge";
const FN = "programs";
const call = (action: string) => (args: { data: any }) => invokeEdge<any>(FN, action, args.data);

export const createProgram = call("createProgram");
export const updateProgram = call("updateProgram");
export const deleteProgram = call("deleteProgram");
export const setProgramArchived = call("setProgramArchived");
