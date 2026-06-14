import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setAllowed(true);
      } else {
        setMessage("No valid recovery session found.");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("SESSION:", session);

    if (!session) {
      setMessage("You must use a valid recovery link.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    console.log("ERROR:", error);

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Password updated successfully!");
  };

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {message || "Checking session..."}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Reset Password</h1>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-3"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full border rounded p-3"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}