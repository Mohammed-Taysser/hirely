import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Pencil, Check, BookOpen, ExternalLink } from "lucide-react";
import { CourseItem, ResumeSection } from "@/types";

interface CoursesEditorProps {
  section: ResumeSection;
  onUpdate: (content: CourseItem[]) => void;
}

const emptyCourse: Omit<CourseItem, "id"> = {
  name: "",
  provider: "",
  completionDate: "",
  credentialUrl: "",
  skills: [],
};

export function CoursesEditor({ section, onUpdate }: CoursesEditorProps) {
  const courses = section.content as CourseItem[];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<CourseItem, "id">>(emptyCourse);
  const [isAdding, setIsAdding] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm(emptyCourse);
    setSkillInput("");
  };

  const startEditing = (course: CourseItem) => {
    setEditingId(course.id);
    setIsAdding(false);
    setEditForm({
      name: course.name,
      provider: course.provider,
      completionDate: course.completionDate,
      credentialUrl: course.credentialUrl || "",
      skills: course.skills || [],
    });
    setSkillInput("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm(emptyCourse);
    setSkillInput("");
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setEditForm((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      skills: prev.skills?.filter((_, i) => i !== index) || [],
    }));
  };

  const saveCourse = () => {
    if (!editForm.name.trim() || !editForm.provider.trim()) return;

    if (isAdding) {
      const newCourse: CourseItem = {
        id: `course-${Date.now()}`,
        ...editForm,
      };
      onUpdate([...courses, newCourse]);
    } else if (editingId) {
      onUpdate(
        courses.map((course) =>
          course.id === editingId ? { ...course, ...editForm } : course
        )
      );
    }
    cancelEdit();
  };

  const deleteCourse = (id: string) => {
    onUpdate(courses.filter((course) => course.id !== id));
  };

  const renderForm = () => (
    <Card className="p-4 space-y-4 border-primary/20 bg-primary/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="name">Course Name</Label>
          <Input
            id="name"
            placeholder="React - The Complete Guide"
            value={editForm.name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="provider">Provider / Platform</Label>
          <Input
            id="provider"
            placeholder="Udemy, Coursera, LinkedIn Learning"
            value={editForm.provider}
            onChange={(e) => setEditForm((prev) => ({ ...prev, provider: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="completionDate">Completion Date</Label>
          <Input
            id="completionDate"
            type="month"
            value={editForm.completionDate}
            onChange={(e) => setEditForm((prev) => ({ ...prev, completionDate: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="credentialUrl">Credential URL (Optional)</Label>
          <Input
            id="credentialUrl"
            placeholder="https://..."
            value={editForm.credentialUrl}
            onChange={(e) => setEditForm((prev) => ({ ...prev, credentialUrl: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2">
          <Label>Skills Learned (Optional)</Label>
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add a skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            />
            <Button type="button" variant="secondary" onClick={addSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {editForm.skills && editForm.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {editForm.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-secondary text-secondary-foreground text-sm rounded-md flex items-center gap-1"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="ml-1 p-0.5 rounded-full hover:bg-foreground/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={saveCourse} size="sm">
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
      {courses.map((course) =>
        editingId === course.id ? (
          <div key={course.id}>{renderForm()}</div>
        ) : (
          <Card key={course.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{course.name}</h4>
                    {course.credentialUrl && (
                      <a
                        href={course.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{course.provider}</p>
                  {course.completionDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Completed: {course.completionDate}
                    </p>
                  )}
                  {course.skills && course.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {course.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(course)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteCourse(course.id)}
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
          Add Course
        </Button>
      )}
    </div>
  );
}
