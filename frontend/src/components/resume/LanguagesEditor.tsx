import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, Check, Languages as LanguagesIcon } from "lucide-react";
import { LanguageItem, ResumeSection } from "@/types";
import { Badge } from "@/components/ui/badge";

interface LanguagesEditorProps {
  section: ResumeSection;
  onUpdate: (content: LanguageItem[]) => void;
}

const proficiencyLevels = [
  { value: "native", label: "Native", color: "bg-green-500" },
  { value: "fluent", label: "Fluent", color: "bg-blue-500" },
  { value: "advanced", label: "Advanced", color: "bg-primary" },
  { value: "intermediate", label: "Intermediate", color: "bg-amber-500" },
  { value: "basic", label: "Basic", color: "bg-muted-foreground" },
];

const emptyLanguage: Omit<LanguageItem, "id"> = {
  language: "",
  proficiency: "intermediate",
};

export function LanguagesEditor({ section, onUpdate }: LanguagesEditorProps) {
  const languages = section.content as LanguageItem[];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<LanguageItem, "id">>(emptyLanguage);
  const [isAdding, setIsAdding] = useState(false);

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm(emptyLanguage);
  };

  const startEditing = (lang: LanguageItem) => {
    setEditingId(lang.id);
    setIsAdding(false);
    setEditForm({
      language: lang.language,
      proficiency: lang.proficiency,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm(emptyLanguage);
  };

  const saveLanguage = () => {
    if (!editForm.language.trim()) return;

    if (isAdding) {
      const newLang: LanguageItem = {
        id: `lang-${Date.now()}`,
        ...editForm,
      };
      onUpdate([...languages, newLang]);
    } else if (editingId) {
      onUpdate(
        languages.map((lang) =>
          lang.id === editingId ? { ...lang, ...editForm } : lang
        )
      );
    }
    cancelEdit();
  };

  const deleteLanguage = (id: string) => {
    onUpdate(languages.filter((lang) => lang.id !== id));
  };

  const getProficiencyInfo = (level: string) => {
    return proficiencyLevels.find((p) => p.value === level) || proficiencyLevels[3];
  };

  const renderForm = () => (
    <Card className="p-4 space-y-4 border-primary/20 bg-primary/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            placeholder="English, Spanish, Mandarin..."
            value={editForm.language}
            onChange={(e) => setEditForm((prev) => ({ ...prev, language: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="proficiency">Proficiency Level</Label>
          <Select
            value={editForm.proficiency}
            onValueChange={(value) => setEditForm((prev) => ({ ...prev, proficiency: value as LanguageItem["proficiency"] }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {proficiencyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${level.color}`} />
                    {level.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={saveLanguage} size="sm">
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
      {languages.map((lang) =>
        editingId === lang.id ? (
          <div key={lang.id}>{renderForm()}</div>
        ) : (
          <Card key={lang.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <LanguagesIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{lang.language}</h4>
                  <Badge 
                    variant="secondary" 
                    className={`mt-1 ${getProficiencyInfo(lang.proficiency).color} text-white`}
                  >
                    {getProficiencyInfo(lang.proficiency).label}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startEditing(lang)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteLanguage(lang.id)}
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
          Add Language
        </Button>
      )}
    </div>
  );
}
