"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2 } from "lucide-react";

/**
 * /join/[code] — Student shortcut link shared by teacher.
 * Validates the code then redirects to /setup?classroom=CODE.
 * If the code is invalid, redirects to /classroom for manual entry.
 */
export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const code   = (params.code as string).toUpperCase();

  const result = useQuery(api.classroom.validateCode, { code });

  useEffect(() => {
    if (result === undefined) return; // still loading
    if (result.valid) {
      router.replace(`/setup?classroom=${code}`);
    } else {
      // Invalid code — send to classroom entry with an error hint
      router.replace(`/classroom?invalid=${code}`);
    }
  }, [result, code, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      <p className="text-slate-400 text-sm">
        Joining class <span className="text-cyan-400 font-mono font-bold">{code}</span>…
      </p>
    </div>
  );
}
