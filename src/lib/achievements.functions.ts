// Client wrappers for the `achievements` Edge Function.
// All privileged work runs server-side; the service role key never leaves Supabase.
import { invokeEdge } from "@/lib/invoke-edge";

const FN = "achievements";
const call = (action: string) => (args: { data: any }) => invokeEdge<any>(FN, action, args.data);

export const createAchievement = call("createAchievement");
export const updateAchievement = call("updateAchievement");
export const deleteAchievement = call("deleteAchievement");
export const setAchievementArchived = call("setAchievementArchived");
export const listAllAchievements = call("listAllAchievements");
