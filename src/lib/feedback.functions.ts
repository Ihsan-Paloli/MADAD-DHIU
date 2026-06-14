import { invokeEdge } from "@/lib/invoke-edge";
const FN = "feedback";
const call = (action: string) => (args: { data: any }) => invokeEdge<any>(FN, action, args.data);

export const submitFeedback = call("submitFeedback");
export const listFeedback = call("listFeedback");
export const markFeedbackReviewed = call("markFeedbackReviewed");
export const deleteFeedback = call("deleteFeedback");
