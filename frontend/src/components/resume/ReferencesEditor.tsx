import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, ChevronDown, ChevronUp, Users } from "lucide-react";
import { ResumeSection, ReferenceItem } from "@/types";

interface ReferencesEditorProps {
  section: ResumeSection;
  onUpdate: (content: ReferenceItem[]) => void;
}

export function ReferencesEditor({ section, onUpdate }: ReferencesEditorProps) {
  const references = (section.content as ReferenceItem[]) || [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addReference = () => {
    const newReference: ReferenceItem = {
      id: `ref-${Date.now()}`,
      name: "",
      title: "",
      company: "",
      relationship: "",
      email: "",
      phone: "",
      linkedin: "",
    };
    onUpdate([...references, newReference]);
    setExpandedId(newReference.id);
  };

  const updateReference = (id: string, field: keyof ReferenceItem, value: string) => {
    onUpdate(
      references.map((ref) =>
        ref.id === id ? { ...ref, [field]: value } : ref
      )
    );
  };

  const removeReference = (id: string) => {
    onUpdate(references.filter((ref) => ref.id !== id));
  };

  return (
    <div className="space-y-4">
      {references.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="mb-4">No references added yet</p>
          <Button onClick={addReference} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Reference
          </Button>
        </div>
      ) : (
        <>
          {references.map((ref) => (
            <Card key={ref.id} variant="default" className="overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => setExpandedId(expandedId === ref.id ? null : ref.id)}
              >
                <div className="flex-1">
                  <h4 className="font-medium">
                    {ref.name || "Untitled Reference"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {ref.title && ref.company
                      ? `${ref.title} at ${ref.company}`
                      : ref.relationship || "Add details"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeReference(ref.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {expandedId === ref.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {expandedId === ref.id && (
                <CardContent className="border-t border-border pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`name-${ref.id}`}>Full Name</Label>
                      <Input
                        id={`name-${ref.id}`}
                        value={ref.name}
                        onChange={(e) => updateReference(ref.id, "name", e.target.value)}
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`relationship-${ref.id}`}>Relationship</Label>
                      <Input
                        id={`relationship-${ref.id}`}
                        value={ref.relationship}
                        onChange={(e) => updateReference(ref.id, "relationship", e.target.value)}
                        placeholder="Former Manager, Colleague, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`title-${ref.id}`}>Job Title</Label>
                      <Input
                        id={`title-${ref.id}`}
                        value={ref.title}
                        onChange={(e) => updateReference(ref.id, "title", e.target.value)}
                        placeholder="Senior Director"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`company-${ref.id}`}>Company</Label>
                      <Input
                        id={`company-${ref.id}`}
                        value={ref.company}
                        onChange={(e) => updateReference(ref.id, "company", e.target.value)}
                        placeholder="Acme Corp"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`email-${ref.id}`}>Email</Label>
                      <Input
                        id={`email-${ref.id}`}
                        type="email"
                        value={ref.email || ""}
                        onChange={(e) => updateReference(ref.id, "email", e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`phone-${ref.id}`}>Phone</Label>
                      <Input
                        id={`phone-${ref.id}`}
                        value={ref.phone || ""}
                        onChange={(e) => updateReference(ref.id, "phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`linkedin-${ref.id}`}>LinkedIn</Label>
                      <Input
                        id={`linkedin-${ref.id}`}
                        value={ref.linkedin || ""}
                        onChange={(e) => updateReference(ref.id, "linkedin", e.target.value)}
                        placeholder="linkedin.com/in/johnsmith"
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          <Button onClick={addReference} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Reference
          </Button>
        </>
      )}
    </div>
  );
}
