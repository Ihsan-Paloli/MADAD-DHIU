import { invokeEdge } from "@/lib/invoke-edge";
const FN = "gallery";
const call = (action: string) => (args: { data: any }) => invokeEdge<any>(FN, action, args.data);

export const createGalleryPhoto = call("createGalleryPhoto");
export const deleteGalleryPhoto = call("deleteGalleryPhoto");
