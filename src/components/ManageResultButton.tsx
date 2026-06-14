import { useState } from "react";
import { Trophy } from "lucide-react";
import { useResultForProgram } from "@/hooks/use-results";
import { ResultForm, emptyResultValues, resultToValues } from "@/components/ResultForm";

export function ManageResultButton({ programId, programName, token }: { programId: string; programName: string; token: string }) {
  const [open, setOpen] = useState(false);
  const { data: existing, isLoading } = useResultForProgram(open ? programId : undefined, token);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="h-8 px-3 rounded-lg glass border border-border hover:border-primary text-xs inline-flex items-center gap-1"
      >
        <Trophy className="h-3 w-3" /> Result
      </button>
    );
  }

  if (isLoading) {
    return <div className="text-xs text-muted-foreground">Loading result…</div>;
  }

  return (
    <div className="mt-3 w-full">
      <ResultForm
        programId={programId}
        programName={programName}
        token={token}
        initial={existing ? resultToValues(existing) : emptyResultValues()}
        currentStatus={existing?.status ?? "draft"}
        hasExistingResult={!!existing}
        onSaved={() => setOpen(false)}
        onCancel={() => setOpen(false)}
      />
    </div>
  );
}
