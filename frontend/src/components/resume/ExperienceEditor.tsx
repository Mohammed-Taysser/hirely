import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Pencil, X, Check, Briefcase } from "lucide-react";
import { ExperienceItem, ResumeSection } from "@/types";
import { RichTextEditor } from "./RichTextEditor";

interface ExperienceEditorProps {
  section: ResumeSection;
  onUpdate: (content: ExperienceItem[]) => void;
}

const emptyExperience: Omit<ExperienceItem, "id"> = {
  company: "",
  position: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  highlights: [],
};

export function ExperienceEditor({ section, onUpdate }: ExperienceEditorProps) {
  const experiences = section.content as ExperienceItem[];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<ExperienceItem, "id">>(emptyExperience);
  const [newHighlight, setNewHighlight] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm(emptyExperience);
    setNewHighlight("");
  };

  const startEditing = (exp: ExperienceItem) => {
    setEditingId(exp.id);
    setIsAdding(false);
    setEditForm({
      company: exp.company,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.endDate || "",
      current: exp.current,
      description: exp.description,
      highlights: [...exp.highlights],
    });
    setNewHighlight("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm(emptyExperience);
    setNewHighlight("");
  };

  const saveExperience = () => {
    if (!editForm.company.trim() || !editForm.position.trim()) return;

    if (isAdding) {
      const newExp: ExperienceItem = {
        id: `exp-${Date.now()}`,
        ...editForm,
      };
      onUpdate([...experiences, newExp]);
    } else if (editingId) {
      onUpdate(
        experiences.map((exp) =>
          exp.id === editingId ? { ...exp, ...editForm } : exp
        )
      );
    }
    cancelEdit();
  };

  const deleteExperience = (id: string) => {
    onUpdate(experiences.filter((exp) => exp.id !== id));
  };

  const addHighlight = () => {
    if (newHighlight.trim()) {
      setEditForm((prev) => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()],
      }));
      setNewHighlight("");
    }
  };

  const removeHighlight = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  };

  const renderForm = () => (
    <Card className="p-4 space-y-4 border-primary/20 bg-primary/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            placeholder="Acme Corp"
            value={editForm.company}
            onChange={(e) => setEditForm((prev) => ({ ...prev, company: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            placeholder="Software Engineer"
            value={editForm.position}
            onChange={(e) => setEditForm((prev) => ({ ...prev, position: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="month"
            value={editForm.startDate}
            onChange={(e) => setEditForm((prev) => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="month"
            value={editForm.endDate}
            onChange={(e) => setEditForm((prev) => ({ ...prev, endDate: e.target.value }))}
            disabled={editForm.current}
          />
        </div>
        <div className="md:col-span-2 flex items-center space-x-2">
          <Checkbox
            id="current"
            checked={editForm.current}
            onCheckedChange={(checked) =>
              setEditForm((prev) => ({ ...prev, current: !!checked, endDate: checked ? "" : prev.endDate }))
            }
          />
          <Label htmlFor="current" className="cursor-pointer">
            I currently work here
          </Label>
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <RichTextEditor
          content={editForm.description}
          onChange={(content) => setEditForm((prev) => ({ ...prev, description: content }))}
          placeholder="Brief description of your role and responsibilities..."
        />
      </div>

      <div className="space-y-2">
        <Label>Key Highlights / Achievements</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add an achievement..."
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
          />
          <Button type="button" variant="secondary" onClick={addHighlight}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {editForm.highlights.map((highlight, index) => (
            <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1.5">
              {highlight}
              <button
                type="button"
                onClick={() => removeHighlight(index)}
                className="ml-1 p-0.5 rounded-full hover:bg-foreground/10"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={saveExperience} size="sm">
          <Check className="mr-1 h-4 w-4" />
          {isAdding ? "Add" : "Save"}
        </Button>
        <Button variant="outline" onClick={cancelEdit} size="sm">
          Cancel
        </Button>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      {experiences.map((exp) =>
        editingId === exp.id ? (
          <div key={exp.id}>{renderForm()}</div>
        ) : (
          <Card key={exp.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{exp.position}</h4>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {exp.highlights.slice(0, 3).map((h, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {h}
                        </Badge>
                      ))}
                      {exp.highlights.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{exp.highlights.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(exp)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteExperience(exp.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )
      )}

      {isAdding && renderForm()}

      {!isAdding && !editingId && (
        <Button variant="outline" className="w-full border-dashed" onClick={startAdding}>
          <Plus className="mr-2 h-4 w-4" />
          Add Experience
        </Button>
      )}
    </div>
  );
}
