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
    <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <FileEdit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-stone-900">
              Inspection Notes & Field Observations
            </h3>
            <p className="text-[11px] text-stone-500">
              Record physical measurements, contractor conversations, or facility context.
            </p>
          </div>
        </div>

        {/* Status indicator pill */}
        <div className="flex items-center gap-2.5">
          {saveStatus === "unsaved" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved Edits
            </span>
          )}

          {saveStatus === "saving" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              Saving Note...
            </span>
          )}

          {saveStatus === "saved" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Saved to Record
            </span>
          )}

          {saveStatus === "error" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
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
          placeholder="e.g. Spoke with facilities coordinator. Main door opening pressure measured at 8.5 lbs. Ramp slope will be surveyed next month; contractor quote requested for handrail installation..."
          className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-stone-50/50 transition-all text-stone-800 placeholder:text-stone-400 disabled:opacity-60 disabled:cursor-not-allowed leading-relaxed"
          aria-label="Inspection notes"
        />
      </div>

      {/* Error display if failed */}
      {errorMessage && (
        <div className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="px-2.5 py-1 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-md font-semibold text-xs shadow-2xs"
          >
            Retry Save
          </button>
        </div>
      )}

      {/* Footer / Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-100 text-xs">
        <div className="flex items-center gap-3 text-stone-500 text-[11px]">
          {lastSavedTime ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              Last saved at {lastSavedTime}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-stone-400">
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
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
