// frontend/components/control/CaseDetail.tsx
"use client";

import {
  CaseFile,
  CaseNote,
  Detective,
  EvidenceItem,
  EvidenceType,
} from "@/lib/cases";
import { formatDateTime, statusColor } from "@/lib/control-utils";
import { useState } from "react";

interface Props {
  caseFile: CaseFile | null;
  detectives: Detective[];
  onUpdateCase: (updater: (prev: CaseFile) => CaseFile) => void;
}

const CURRENT_ADMIN_NAME = "Control Admin";
const CURRENT_ADMIN_ID = "admin-1";

export function CaseDetail({ caseFile, detectives, onUpdateCase }: Props) {
  const [newNoteText, setNewNoteText] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceTag, setEvidenceTag] = useState("");
  const [evidenceType, setEvidenceType] = useState<EvidenceType>("photo");

  if (!caseFile) {
    return (
      <div className="text-sm text-slate-400">
        Select a case from the left to view details.
      </div>
    );
  }

  const assignedDetective =
    caseFile.assignedDetectiveId &&
    detectives.find((d) => d.id === caseFile.assignedDetectiveId);

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;

    const note: CaseNote = {
      id: `note-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      authorId: CURRENT_ADMIN_ID,
      authorName: CURRENT_ADMIN_NAME,
      authorRole: "admin",
      createdAt: new Date().toISOString(),
      body: newNoteText.trim(),
    };

    onUpdateCase((c) => ({
      ...c,
      notes: [...c.notes, note],
      lastUpdatedAt: new Date().toISOString(),
    }));

    setNewNoteText("");
  };

  const handleUploadEvidence = () => {
    if (!evidenceFile || !evidenceTag.trim()) return;

    const nowIso = new Date().toISOString();
    const tempUrl = URL.createObjectURL(evidenceFile);

    const evidence: EvidenceItem = {
      id: `ev-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type: evidenceType,
      tag: evidenceTag.trim(),
      filename: evidenceFile.name,
      url: tempUrl,
      uploadedAt: nowIso,
      uploadedByName: CURRENT_ADMIN_NAME,
      uploadedByRole: "admin",
    };

    onUpdateCase((c) => ({
      ...c,
      evidence: [...c.evidence, evidence],
      lastUpdatedAt: nowIso,
    }));

    setEvidenceFile(null);
    setEvidenceTag("");
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
        <div>
          <p className="text-xs text-slate-400">
            Case {caseFile.caseNumber}
          </p>
          <h2 className="text-lg font-semibold">{caseFile.title}</h2>
          <p className="text-xs text-slate-400 mt-1">
            {caseFile.type} • {caseFile.area}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-[11px] px-2 py-1 rounded-full border ${statusColor(
              caseFile.status
            )}`}
          >
            {caseFile.status.toUpperCase()}
          </span>
          <p className="text-[11px] text-slate-400">
            Reported: {formatDateTime(caseFile.reportedAt)}
          </p>
          <p className="text-[11px] text-slate-500">
            Last update: {formatDateTime(caseFile.lastUpdatedAt)}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="grid md:grid-cols-[1.3fr,1fr] gap-4 flex-1 min-h-0">
        {/* Left: summary + timeline */}
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold mb-1">Case Summary</h3>
            <p className="text-sm text-slate-200">{caseFile.summary}</p>
            <div className="mt-2 text-xs text-slate-400 space-y-1">
              <p>
                <span className="font-medium text-slate-300">Location:</span>{" "}
                {caseFile.location}
              </p>
              <p>
                <span className="font-medium text-slate-300">Victim:</span>{" "}
                {caseFile.victim}
              </p>
              <p>
                <span className="font-medium text-slate-300">Suspects:</span>{" "}
                {caseFile.suspects.join(", ")}
              </p>
            </div>
          </div>

          <div className="flex-1 min-h-0 rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Timeline</h3>
              <p className="text-[11px] text-slate-400">
                Latest events on top
              </p>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {caseFile.timeline
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.time).getTime() - new Date(a.time).getTime()
                )
                .map((ev, idx) => (
                  <div key={ev.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-sky-400 mt-1" />
                      {idx !== caseFile.timeline.length - 1 && (
                        <div className="w-px flex-1 bg-slate-700 mt-1" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400">
                        {formatDateTime(ev.time)}
                      </p>
                      <p className="text-sm font-medium">{ev.title}</p>
                      <p className="text-xs text-slate-300">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right: assigned detective + notes + evidence */}
        <div className="flex flex-col gap-3">
          {/* Detective */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <h3 className="text-sm font-semibold mb-2">
              Assigned Detective
            </h3>
            {assignedDetective ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center text-xs font-semibold">
                  {assignedDetective.avatarInitials}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {assignedDetective.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Badge {assignedDetective.badgeId}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Not assigned yet. Use Auto Assign to allocate.
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
            <h3 className="text-sm font-semibold mb-2">Internal Notes</h3>
            <div className="max-h-40 overflow-y-auto space-y-2 mb-2 pr-1 text-xs">
              {caseFile.notes.length === 0 && (
                <p className="text-[11px] text-slate-500">
                  No notes yet. Admin and detectives can add internal comments
                  here.
                </p>
              )}
              {caseFile.notes
                .slice()
                .sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                )
                .map((note) => (
                  <div
                    key={note.id}
                    className="text-xs border border-slate-800 rounded-md p-2 bg-slate-900/70"
                  >
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-200">
                        {note.authorName}{" "}
                        <span className="text-[10px] uppercase text-slate-400">
                          ({note.authorRole})
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {formatDateTime(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-100">{note.body}</p>
                  </div>
                ))}
            </div>

            <form
              className="space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleAddNote();
              }}
            >
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add a note for detectives or admin…"
                className="w-full rounded-md bg-slate-950/60 border border-slate-700 px-2 py-1.5 text-xs min-h-[60px] focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-sky-600 hover:bg-sky-500 disabled:opacity-40"
                >
                  Add note
                </button>
              </div>
            </form>
          </div>

          {/* Evidence */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-3 flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Evidence</h3>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1 text-xs">
              {caseFile.evidence.length === 0 && (
                <p className="text-[11px] text-slate-500">
                  No evidence uploaded yet.
                </p>
              )}
              {caseFile.evidence.map((ev) => (
                <div
                  key={ev.id}
                  className="border border-slate-800 rounded-md p-2 flex justify-between gap-2"
                >
                  <div>
                    <p className="font-medium text-slate-200">
                      {ev.tag}{" "}
                      <span className="text-[10px] uppercase text-slate-400">
                        ({ev.type})
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {ev.filename}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Uploaded by {ev.uploadedByName} ({ev.uploadedByRole}) at{" "}
                      {formatDateTime(ev.uploadedAt)}
                    </p>
                  </div>
                  {ev.type === "photo" && (
                    <img
                      src={ev.url}
                      className="w-12 h-12 object-cover rounded-md border border-slate-700"
                      alt={ev.tag}
                    />
                  )}
                </div>
              ))}
            </div>

            <form
              className="pt-2 border-t border-slate-800 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleUploadEvidence();
              }}
            >
              <div className="flex flex-col gap-2 text-xs">
                <input
                  type="file"
                  onChange={(e) =>
                    setEvidenceFile(e.target.files?.[0] ?? null)
                  }
                  className="text-[11px] file:text-xs file:px-2 file:py-1 file:bg-slate-800 file:border-0 file:rounded-md file:text-slate-100"
                />
                <div className="flex gap-2">
                  <select
                    value={evidenceType}
                    onChange={(e) =>
                      setEvidenceType(e.target.value as EvidenceType)
                    }
                    className="flex-1 rounded-md bg-slate-950/60 border border-slate-700 px-2 py-1.5 text-[11px]"
                  >
                    <option value="photo">Photo / CCTV</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="document">Document / PDF</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Tag (e.g. CCTV, Witness)"
                    value={evidenceTag}
                    onChange={(e) => setEvidenceTag(e.target.value)}
                    className="flex-1 rounded-md bg-slate-950/60 border border-slate-700 px-2 py-1.5 text-[11px]"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!evidenceFile || !evidenceTag.trim()}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-sky-600 hover:bg-sky-500 disabled:opacity-40"
                >
                  Upload evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
