"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Users, ArrowRight, Copy, Check, School } from "lucide-react";

export default function ClassroomPage() {
  const router = useRouter();
  const [mode, setMode]             = useState<"choose" | "teacher" | "student" | "created">("choose");
  const [teacherName, setTeacherName] = useState("");
  const [subject, setSubject]       = useState("");
  const [institution, setInstitution] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [codeError, setCodeError]   = useState("");
  const [copied, setCopied]         = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const createClassroom = useMutation(api.classroom.createClassroom);
  const codeCheck = useQuery(
    api.classroom.validateCode,
    studentCode.length === 6 ? { code: studentCode.toUpperCase() } : "skip"
  );

  const handleCreateClassroom = async () => {
    if (!teacherName.trim()) return;
    setIsCreating(true);
    try {
      const result = await createClassroom({
        teacherName: teacherName.trim(),
        subject:     subject.trim() || undefined,
        institution: institution.trim() || undefined,
      });
      setCreatedCode(result.code);
      setMode("created");
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyCode = () => {
    const link = `${window.location.origin}/join/${createdCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStudentJoin = () => {
    const code = studentCode.trim().toUpperCase();
    if (code.length !== 6) { setCodeError("Code must be 6 characters"); return; }
    if (codeCheck && !codeCheck.valid) { setCodeError("Class not found. Check the code and try again."); return; }
    router.push(`/setup?classroom=${code}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-bold mb-4">
            <School className="w-4 h-4" />
            Classroom Mode
          </div>
          <h1 className="text-3xl font-bold text-white">Hidup B40</h1>
          <p className="text-slate-400 mt-1">Financial Literacy Simulator — Class Mode</p>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── Mode Selection ── */}
          {mode === "choose" && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-4"
            >
              <button
                onClick={() => setMode("teacher")}
                className="group p-6 rounded-2xl bg-slate-800/80 border border-emerald-500/30 hover:border-emerald-500/70 hover:bg-slate-800 transition-all text-left"
              >
                <GraduationCap className="w-10 h-10 text-emerald-400 mb-3" />
                <h2 className="text-lg font-bold text-white mb-1">I&apos;m a Teacher</h2>
                <p className="text-sm text-slate-400">Create a class session and get a code to share with students</p>
                <div className="mt-4 flex items-center gap-1 text-emerald-400 text-sm font-medium">
                  Get class code <ArrowRight className="w-4 h-4" />
                </div>
              </button>

              <button
                onClick={() => setMode("student")}
                className="group p-6 rounded-2xl bg-slate-800/80 border border-cyan-500/30 hover:border-cyan-500/70 hover:bg-slate-800 transition-all text-left"
              >
                <Users className="w-10 h-10 text-cyan-400 mb-3" />
                <h2 className="text-lg font-bold text-white mb-1">I&apos;m a Student</h2>
                <p className="text-sm text-slate-400">Enter the class code your teacher gave you</p>
                <div className="mt-4 flex items-center gap-1 text-cyan-400 text-sm font-medium">
                  Enter code <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </motion.div>
          )}

          {/* ── Teacher Form ── */}
          {mode === "teacher" && (
            <motion.div
              key="teacher"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-slate-800/80 rounded-2xl border border-emerald-500/30 p-6 space-y-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Create Classroom Session</h2>
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Your Name *</label>
                <input
                  value={teacherName}
                  onChange={e => setTeacherName(e.target.value)}
                  placeholder="e.g. Cikgu Aminah"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Subject / Topic <span className="text-slate-600">(optional)</span></label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Financial Literacy Form 5"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">School / Institution <span className="text-slate-600">(optional)</span></label>
                <input
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="e.g. SMK Taman Desa"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setMode("choose")}
                  className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateClassroom}
                  disabled={!teacherName.trim() || isCreating}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isCreating ? "Creating..." : <><School className="w-4 h-4" /> Create Class</>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Student Form ── */}
          {mode === "student" && (
            <motion.div
              key="student"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="bg-slate-800/80 rounded-2xl border border-cyan-500/30 p-6 space-y-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-cyan-400" />
                <h2 className="text-xl font-bold text-white">Join Your Class</h2>
              </div>

              <p className="text-sm text-slate-400">
                Ask your teacher for the 6-character class code (e.g. <span className="text-cyan-400 font-mono font-bold">MAJU47</span>)
              </p>

              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wider mb-1.5 block">Class Code</label>
                <input
                  value={studentCode}
                  onChange={e => { setStudentCode(e.target.value.toUpperCase().slice(0, 6)); setCodeError(""); }}
                  placeholder="MAJU47"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-600 text-2xl font-mono text-center tracking-widest focus:outline-none focus:border-cyan-500 transition-colors uppercase"
                  maxLength={6}
                />
                {codeError && <p className="text-red-400 text-xs mt-1">{codeError}</p>}
                {studentCode.length === 6 && codeCheck?.valid && (
                  <p className="text-emerald-400 text-xs mt-1">
                    ✓ Class by {codeCheck.teacherName}{codeCheck.subject ? ` — ${codeCheck.subject}` : ""}
                  </p>
                )}
                {studentCode.length === 6 && codeCheck !== undefined && !codeCheck.valid && (
                  <p className="text-red-400 text-xs mt-1">✗ Code not found</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setMode("choose")}
                  className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleStudentJoin}
                  disabled={studentCode.length !== 6}
                  className="flex-1 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  Join & Play <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Created ── */}
          {mode === "created" && (
            <motion.div
              key="created"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800/80 rounded-2xl border border-emerald-500/50 p-6 text-center space-y-4"
            >
              <div className="text-4xl mb-1">🎉</div>
              <h2 className="text-xl font-bold text-white">Classroom Ready!</h2>

              {/* Big code display — optimised for projector */}
              <div className="bg-slate-900 rounded-xl p-6 border border-emerald-500/30">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Class Code</p>
                <p className="text-6xl font-mono font-bold text-emerald-400 tracking-widest">{createdCode}</p>
                <p className="text-xs text-slate-500 mt-2">Share this with students verbally or via link</p>
              </div>

              {/* Share link */}
              <div className="bg-slate-900 rounded-lg px-4 py-3 flex items-center gap-3">
                <p className="text-sm text-slate-400 font-mono truncate flex-1">
                  {typeof window !== "undefined" ? `${window.location.origin}/join/${createdCode}` : `/join/${createdCode}`}
                </p>
                <button
                  onClick={handleCopyCode}
                  className="flex-shrink-0 flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => router.push(`/classroom/${createdCode}`)}
                  className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <GraduationCap className="w-5 h-5" />
                  Open Dashboard
                </button>
                <button
                  onClick={() => { setMode("choose"); setTeacherName(""); setSubject(""); setInstitution(""); }}
                  className="py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Create Another
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        <p className="text-center text-xs text-slate-600 mt-6">
          Or play without a class at{" "}
          <button onClick={() => router.push("/setup")} className="text-slate-400 underline hover:text-slate-200">
            /setup
          </button>
        </p>
      </div>
    </main>
  );
}
