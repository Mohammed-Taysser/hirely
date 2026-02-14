import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Pencil, Check, GraduationCap } from "lucide-react";
import { EducationItem, ResumeSection } from "@/types";

interface EducationEditorProps {
  section: ResumeSection;
  onUpdate: (content: EducationItem[]) => void;
}

const emptyEducation: Omit<EducationItem, "id"> = {
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
  gpa: "",
};

export function EducationEditor({ section, onUpdate }: EducationEditorProps) {
  const education = section.content as EducationItem[];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<EducationItem, "id">>(emptyEducation);
  const [isAdding, setIsAdding] = useState(false);

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm(emptyEducation);
  };

  const startEditing = (edu: EducationItem) => {
    setEditingId(edu.id);
    setIsAdding(false);
    setEditForm({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate,
      endDate: edu.endDate || "",
      gpa: edu.gpa || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm(emptyEducation);
  };

  const saveEducation = () => {
    if (!editForm.institution.trim() || !editForm.degree.trim()) return;

    if (isAdding) {
      const newEdu: EducationItem = {
        id: `edu-${Date.now()}`,
        ...editForm,
      };
      onUpdate([...education, newEdu]);
    } else if (editingId) {
      onUpdate(
        education.map((edu) =>
          edu.id === editingId ? { ...edu, ...editForm } : edu
        )
      );
    }
    cancelEdit();
  };

  const deleteEducation = (id: string) => {
    onUpdate(education.filter((edu) => edu.id !== id));
  };

  const renderForm = () => (
    <Card className="p-4 space-y-4 border-primary/20 bg-primary/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="institution">Institution</Label>
          <Input
            id="institution"
            placeholder="Stanford University"
            value={editForm.institution}
            onChange={(e) => setEditForm((prev) => ({ ...prev, institution: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="degree">Degree</Label>
          <Input
            id="degree"
            placeholder="Bachelor of Science"
            value={editForm.degree}
            onChange={(e) => setEditForm((prev) => ({ ...prev, degree: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="field">Field of Study</Label>
          <Input
            id="field"
            placeholder="Computer Science"
            value={editForm.field}
            onChange={(e) => setEditForm((prev) => ({ ...prev, field: e.target.value }))}
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
          />
        </div>
        <div>
          <Label htmlFor="gpa">GPA (Optional)</Label>
          <Input
            id="gpa"
            placeholder="3.8 / 4.0"
            value={editForm.gpa}
            onChange={(e) => setEditForm((prev) => ({ ...prev, gpa: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={saveEducation} size="sm">
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
      {education.map((edu) =>
        editingId === edu.id ? (
          <div key={edu.id}>{renderForm()}</div>
        ) : (
          <Card key={edu.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {edu.degree} in {edu.field}
                  </h4>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {edu.startDate} — {edu.endDate || "Present"}
                    {edu.gpa && <span className="ml-2">• GPA: {edu.gpa}</span>}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(edu)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteEducation(edu.id)}
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
          Add Education
        </Button>
      )}
    </div>
  );
}
