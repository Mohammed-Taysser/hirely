import { useState, useCallback } from "react";
import { Resume } from "@/types";

export interface ResumeVersion {
  id: string;
  resume: Resume;
  timestamp: Date;
  label?: string;
}

const MAX_HISTORY = 20;

export function useResumeHistory(initialResume: Resume) {
  const [versions, setVersions] = useState<ResumeVersion[]>([
    {
      id: crypto.randomUUID(),
      resume: initialResume,
      timestamp: new Date(),
      label: "Initial version",
    },
  ]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);

  const saveVersion = useCallback((resume: Resume, label?: string) => {
    setVersions((prev) => {
      const newVersion: ResumeVersion = {
        id: crypto.randomUUID(),
        resume: JSON.parse(JSON.stringify(resume)),
        timestamp: new Date(),
        label,
      };
      
      // Remove future versions if we branched from an earlier point
      const newVersions = [...prev.slice(0, currentVersionIndex + 1), newVersion];
      
      // Keep only the last MAX_HISTORY versions
      if (newVersions.length > MAX_HISTORY) {
        return newVersions.slice(-MAX_HISTORY);
      }
      
      return newVersions;
    });
    setCurrentVersionIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [currentVersionIndex]);

  const restoreVersion = useCallback((versionId: string): Resume | null => {
    const index = versions.findIndex((v) => v.id === versionId);
    if (index !== -1) {
      setCurrentVersionIndex(index);
      return JSON.parse(JSON.stringify(versions[index].resume));
    }
    return null;
  }, [versions]);

  const canUndo = currentVersionIndex > 0;
  const canRedo = currentVersionIndex < versions.length - 1;

  const undo = useCallback((): Resume | null => {
    if (canUndo) {
      const newIndex = currentVersionIndex - 1;
      setCurrentVersionIndex(newIndex);
      return JSON.parse(JSON.stringify(versions[newIndex].resume));
    }
    return null;
  }, [canUndo, currentVersionIndex, versions]);

  const redo = useCallback((): Resume | null => {
    if (canRedo) {
      const newIndex = currentVersionIndex + 1;
      setCurrentVersionIndex(newIndex);
      return JSON.parse(JSON.stringify(versions[newIndex].resume));
    }
    return null;
  }, [canRedo, currentVersionIndex, versions]);

  return {
    versions,
    currentVersionIndex,
    currentVersion: versions[currentVersionIndex],
    saveVersion,
    restoreVersion,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
