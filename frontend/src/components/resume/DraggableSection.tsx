import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GripVertical, ChevronDown, ChevronUp, MoreVertical, Trash2, EyeOff, Eye } from "lucide-react";
import { ResumeSection } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DraggableSectionProps {
  section: ResumeSection;
  icon: React.ElementType;
  label: string;
  isExpanded: boolean;
  isHidden?: boolean;
  onToggle: () => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
  children: React.ReactNode;
}

export function DraggableSection({
  section,
  icon: Icon,
  label,
  isExpanded,
  isHidden = false,
  onToggle,
  onDelete,
  onToggleVisibility,
  children,
}: DraggableSectionProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    setShowDeleteDialog(false);
    onDelete?.();
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        variant="default"
        className={cn(
          "overflow-hidden transition-all",
          isDragging && "opacity-50 shadow-xl z-50 ring-2 ring-primary",
          isHidden && "opacity-60"
        )}
      >
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              {...attributes}
              {...listeners}
              className="touch-none cursor-grab active:cursor-grabbing p-1 -m-1 rounded hover:bg-secondary/50 transition-colors"
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className={cn(
              "h-10 w-10 rounded-lg bg-secondary flex items-center justify-center",
              isHidden && "bg-secondary/50"
            )}>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("font-medium", isHidden && "text-muted-foreground")}>
                {label}
              </span>
              {isHidden && (
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                  Hidden
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onToggleVisibility && (
                  <DropdownMenuItem onClick={onToggleVisibility}>
                    {isHidden ? (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Show Section
                      </>
                    ) : (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Hide Section
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Section
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              aria-label={isExpanded ? "Collapse section" : "Expand section"}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>
        {isExpanded && !isHidden && (
          <CardContent className="border-t border-border pt-6">
            {children}
          </CardContent>
        )}
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the {label.toLowerCase()} section and all its content from your resume. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
