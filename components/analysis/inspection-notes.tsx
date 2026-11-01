"use client";

import React, { useState, useEffect, useRef } from "react";
import { NoteSaveStatus } from "@/types/analysis";
import {
  FileEdit,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  HelpCircle,
} from "lucide-react";

interface InspectionNotesProps {
  inspectionId: string;
  initialNotes?: string;
  onSaveNotes: (notes: string) => Promise<boolean>;
  readOnly?: boolean;
}

export function InspectionNotes({
  inspectionId,
  initialNotes = "",
  onSaveNotes,
  readOnly = false,
}: InspectionNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [lastSavedNotes, setLastSavedNotes] = useState(initialNotes);
  const [saveStatus, setSaveStatus] = useState<NoteSaveStatus>("saved");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync with initialNotes when inspectionId changes or initialNotes updates
  useEffect(() => {
    setNotes(initialNotes);
    setLastSavedNotes(initialNotes);
    setSaveStatus("saved");
    setErrorMessage(null);
  }, [inspectionId, initialNotes]);

  // Track unsaved state when user types
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    if (val !== lastSavedNotes) {
      setSaveStatus("unsaved");
      setErrorMessage(null);
    } else {
      setSaveStatus("saved");
    }
  };

  // Prevent accidental loss when navigating away with unsaved edits
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (notes !== lastSavedNotes) {
        e.preventDefault();
        e.returnValue = "You have unsaved inspection notes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [notes, lastSavedNotes]);

  // Execute explicit Save Note action
  const handleSave = async () => {
    if (readOnly || saveStatus === "saving") return;

    // Avoid unnecessary writes if unchanged
    if (notes === lastSavedNotes) {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("saving");
    setErrorMessage(null);

    try {
      const success = await onSaveNotes(notes);
      if (success) {
        setLastSavedNotes(notes);
        setSaveStatus("saved");
        setLastSavedTime(
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
      } else {
        setSaveStatus("error");
        setErrorMessage("Could not save note to local inspection record. Please retry.");
      }
    } catch (err) {
      setSaveStatus("error");
      const msg = err instanceof Error ? err.message : "Failed to persist inspection note.";
      setErrorMessage(msg);
    }
  };

  // Keyboard shortcut Ctrl+Enter or Cmd+Enter to save
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  const isDirty = notes !== lastSavedNotes;

  return (
    <div className="bg-[#1e1a33] rounded-2xl border border-[#c3b8e3]/15 shadow-xl p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#141221] text-[#eca541] border border-[#c3b8e3]/20 flex items-center justify-center shrink-0">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#fdf9f4]">
              Inspection Notes & Field Observations
            </h3>
            <p className="text-[11px] text-[#a9a1c6]">
              Record physical measurements, contractor conversations, or facility context.
            </p>
          </div>
        </div>

        {/* Status indicator pill */}
        <div className="flex items-center gap-2.5">
          {saveStatus === "unsaved" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#eca541]/10 text-[#eca541] border border-[#eca541]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#eca541] animate-pulse" />
              Unsaved Edits
            </span>
          )}

          {saveStatus === "saving" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#c3b8e3]/10 text-[#c3b8e3] border border-[#c3b8e3]/30">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c3b8e3]" />
              Saving Note...
            </span>
          )}

          {saveStatus === "saved" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#6ee7b7]/10 text-[#6ee7b7] border border-[#6ee7b7]/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#6ee7b7]" />
              Saved to Record
            </span>
          )}

          {saveStatus === "error" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#e85d63]/10 text-[#e85d63] border border-[#e85d63]/30">
              <AlertCircle className="w-3.5 h-3.5 text-[#e85d63]" />
              Save Failed
            </span>
          )}
        </div>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={readOnly}
          rows={4}
          placeholder="e.g. Spoke with facilities coordinator. Main entrance door opening pressure measured at 8.5 lbs. Ramp slope survey scheduled next week; contractor quote requested for continuous handrail..."
          className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-[#c3b8e3]/20 focus:outline-none focus:border-[#e85d63] bg-[#141221] text-[#fdf9f4] placeholder-[#a9a1c6]/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed leading-relaxed"
          aria-label="Inspection notes"
        />
      </div>

      {/* Error display if failed */}
      {errorMessage && (
        <div className="flex items-center justify-between p-3 bg-[#e85d63]/10 border border-[#e85d63]/30 rounded-xl text-xs text-[#e85d63]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#e85d63] shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="px-2.5 py-1 bg-[#141221] hover:bg-[#1e1a33] text-[#e85d63] border border-[#e85d63]/40 rounded-md font-semibold text-xs transition-colors"
          >
            Retry Save
          </button>
        </div>
      )}

      {/* Footer / Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#c3b8e3]/10 text-xs">
        <div className="flex items-center gap-3 text-[#a9a1c6] text-[11px] font-mono">
          {lastSavedTime ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#a9a1c6]" />
              Last saved at {lastSavedTime}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#a9a1c6]">
              <HelpCircle className="w-3.5 h-3.5" />
              Press Ctrl+Enter to save quickly
            </span>
          )}
          <span>•</span>
          <span>{notes.length} characters</span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={readOnly || saveStatus === "saving" || (!isDirty && saveStatus === "saved")}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#141221] bg-[#e85d63] hover:bg-[#d64b51] active:scale-[0.98] rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {saveStatus === "saving" ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Note</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
