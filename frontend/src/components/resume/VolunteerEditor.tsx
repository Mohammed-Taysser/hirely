import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ResumeSection, VolunteerItem } from "@/types";
import { Plus, Trash2, GripVertical, Heart } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";

interface VolunteerEditorProps {
  section: ResumeSection;
  onUpdate: (content: VolunteerItem[]) => void;
}

export function VolunteerEditor({ section, onUpdate }: VolunteerEditorProps) {
  const items = (section.content as VolunteerItem[]) || [];
  const [editingId, setEditingId] = useState<string | null>(null);

  const addItem = () => {
    const newItem: VolunteerItem = {
      id: `vol-${Date.now()}`,
      organization: "",
      role: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      cause: "",
    };
    onUpdate([...items, newItem]);
    setEditingId(newItem.id);
  };

  const updateItem = (id: string, updates: Partial<VolunteerItem>) => {
    onUpdate(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    onUpdate(items.filter((item) => item.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No volunteer experience added yet</p>
          <Button onClick={addItem} variant="outline" className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Volunteer Experience
          </Button>
        </div>
      ) : (
        <>
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-2 text-muted-foreground cursor-grab">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {item.role || item.organization || "New Volunteer Experience"}
                    </h4>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {editingId === item.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Organization</Label>
                          <Input
                            placeholder="Red Cross"
                            value={item.organization}
                            onChange={(e) =>
                              updateItem(item.id, { organization: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Role</Label>
                          <Input
                            placeholder="Community Organizer"
                            value={item.role}
                            onChange={(e) =>
                              updateItem(item.id, { role: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            placeholder="Jan 2022"
                            value={item.startDate}
                            onChange={(e) =>
                              updateItem(item.id, { startDate: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            placeholder="Present"
                            value={item.endDate || ""}
                            onChange={(e) =>
                              updateItem(item.id, { endDate: e.target.value })
                            }
                            disabled={item.current}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label>Cause/Category</Label>
                          <Input
                            placeholder="Community Development, Environment, Education..."
                            value={item.cause || ""}
                            onChange={(e) =>
                              updateItem(item.id, { cause: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`current-${item.id}`}
                          checked={item.current}
                          onCheckedChange={(checked) =>
                            updateItem(item.id, {
                              current: checked as boolean,
                              endDate: checked ? "" : item.endDate,
                            })
                          }
                        />
                        <Label htmlFor={`current-${item.id}`}>
                          I currently volunteer here
                        </Label>
                      </div>
                      <div>
                        <Label>Description</Label>
                        <RichTextEditor
                          content={item.description}
                          onChange={(html) =>
                            updateItem(item.id, { description: html })
                          }
                          placeholder="Describe your volunteer work and impact..."
                        />
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingId(null)}
                      >
                        Done
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer hover:bg-muted/50 rounded p-2 -m-2"
                      onClick={() => setEditingId(item.id)}
                    >
                      <p className="text-sm text-muted-foreground">
                        {item.organization && `${item.organization} • `}
                        {item.startDate && `${item.startDate} - `}
                        {item.current ? "Present" : item.endDate}
                      </p>
                      {item.cause && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Cause: {item.cause}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Click to edit
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          <Button onClick={addItem} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Another
          </Button>
        </>
      )}
    </div>
  );
}
