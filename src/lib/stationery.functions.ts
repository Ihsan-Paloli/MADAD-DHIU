import { invokeEdge } from "@/lib/invoke-edge";
const FN = "stationery";
const call = (action: string) => (args: { data: any }) => invokeEdge<any>(FN, action, args.data);

export const createStationery = call("createStationery");
export const updateStationery = call("updateStationery");
export const deleteStationery = call("deleteStationery");
