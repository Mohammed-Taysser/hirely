import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResumeVersion } from "@/hooks/useResumeHistory";
import { History, RotateCcw, Undo2, Redo2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VersionHistoryProps {
  versions: ResumeVersion[];
  currentVersionIndex: number;
  onRestore: (versionId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClose: () => void;
}

export function VersionHistory({
  versions,
  currentVersionIndex,
  onRestore,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClose,
}: VersionHistoryProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-8"
            >
              <Undo2 className="h-4 w-4 mr-1" />
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-8"
            >
              <Redo2 className="h-4 w-4 mr-1" />
              Redo
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {[...versions].reverse().map((version, reversedIndex) => {
              const actualIndex = versions.length - 1 - reversedIndex;
              const isCurrent = actualIndex === currentVersionIndex;
              
              return (
                <div
                  key={version.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    isCurrent
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {version.label || `Version ${actualIndex + 1}`}
                        </span>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(version.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                    {!isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRestore(version.id)}
                        className="h-8"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
