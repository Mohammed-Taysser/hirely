import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, X, Check, Code, ExternalLink } from "lucide-react";
import { ProjectItem, ResumeSection } from "@/types";
import { RichTextEditor } from "./RichTextEditor";

interface ProjectsEditorProps {
  section: ResumeSection;
  onUpdate: (content: ProjectItem[]) => void;
}

const emptyProject: Omit<ProjectItem, "id"> = {
  name: "",
  description: "",
  technologies: [],
  link: "",
};

export function ProjectsEditor({ section, onUpdate }: ProjectsEditorProps) {
  const projects = section.content as ProjectItem[];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<ProjectItem, "id">>(emptyProject);
  const [newTech, setNewTech] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm(emptyProject);
    setNewTech("");
  };

  const startEditing = (project: ProjectItem) => {
    setEditingId(project.id);
    setIsAdding(false);
    setEditForm({
      name: project.name,
      description: project.description,
      technologies: [...project.technologies],
      link: project.link || "",
    });
    setNewTech("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm(emptyProject);
    setNewTech("");
  };

  const saveProject = () => {
    if (!editForm.name.trim()) return;

    if (isAdding) {
      const newProject: ProjectItem = {
        id: `proj-${Date.now()}`,
        ...editForm,
      };
      onUpdate([...projects, newProject]);
    } else if (editingId) {
      onUpdate(
        projects.map((proj) =>
          proj.id === editingId ? { ...proj, ...editForm } : proj
        )
      );
    }
    cancelEdit();
  };

  const deleteProject = (id: string) => {
    onUpdate(projects.filter((proj) => proj.id !== id));
  };

  const addTechnology = () => {
    if (newTech.trim() && !editForm.technologies.includes(newTech.trim())) {
      setEditForm((prev) => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()],
      }));
      setNewTech("");
    }
  };

  const removeTechnology = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }));
  };

  const renderForm = () => (
    <Card className="p-4 space-y-4 border-primary/20 bg-primary/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Project Name</Label>
          <Input
            id="name"
            placeholder="My Awesome Project"
            value={editForm.name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="link">Project Link (Optional)</Label>
          <Input
            id="link"
            placeholder="https://github.com/user/project"
            value={editForm.link}
            onChange={(e) => setEditForm((prev) => ({ ...prev, link: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <RichTextEditor
          content={editForm.description}
          onChange={(content) => setEditForm((prev) => ({ ...prev, description: content }))}
          placeholder="Brief description of the project and your role..."
        />
      </div>

      <div className="space-y-2">
        <Label>Technologies Used</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a technology..."
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTechnology())}
          />
          <Button type="button" variant="secondary" onClick={addTechnology}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {editForm.technologies.map((tech, index) => (
            <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1.5">
              {tech}
              <button
                type="button"
                onClick={() => removeTechnology(index)}
                className="ml-1 p-0.5 rounded-full hover:bg-foreground/10"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={saveProject} size="sm">
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
      {projects.map((project) =>
        editingId === project.id ? (
          <div key={project.id}>{renderForm()}</div>
        ) : (
          <Card key={project.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Code className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{project.name}</h4>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(project)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteProject(project.id)}
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
          Add Project
        </Button>
      )}
    </div>
  );
}
