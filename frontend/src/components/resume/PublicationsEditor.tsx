import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ResumeSection, PublicationItem } from "@/types";
import { Plus, Trash2, GripVertical, BookOpen, Link } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PublicationsEditorProps {
  section: ResumeSection;
  onUpdate: (content: PublicationItem[]) => void;
}

const publicationTypes = [
  { value: "journal", label: "Journal Article" },
  { value: "conference", label: "Conference Paper" },
  { value: "book", label: "Book" },
  { value: "chapter", label: "Book Chapter" },
  { value: "thesis", label: "Thesis/Dissertation" },
  { value: "patent", label: "Patent" },
  { value: "whitepaper", label: "White Paper" },
  { value: "blog", label: "Blog Post/Article" },
  { value: "other", label: "Other" },
];

export function PublicationsEditor({ section, onUpdate }: PublicationsEditorProps) {
  const items = (section.content as PublicationItem[]) || [];
  const [editingId, setEditingId] = useState<string | null>(null);

  const addItem = () => {
    const newItem: PublicationItem = {
      id: `pub-${Date.now()}`,
      title: "",
      authors: "",
      publisher: "",
      date: "",
      type: "journal",
      url: "",
      doi: "",
      description: "",
    };
    onUpdate([...items, newItem]);
    setEditingId(newItem.id);
  };

  const updateItem = (id: string, updates: Partial<PublicationItem>) => {
    onUpdate(
      items.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeItem = (id: string) => {
    onUpdate(items.filter((item) => item.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const getTypeLabel = (type: string) => {
    return publicationTypes.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No publications added yet</p>
          <Button onClick={addItem} variant="outline" className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Add Publication
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
                      {item.title || "New Publication"}
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
                      <div>
                        <Label>Title</Label>
                        <Input
                          placeholder="Publication title"
                          value={item.title}
                          onChange={(e) =>
                            updateItem(item.id, { title: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Authors</Label>
                          <Input
                            placeholder="J. Doe, A. Smith, et al."
                            value={item.authors}
                            onChange={(e) =>
                              updateItem(item.id, { authors: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select
                            value={item.type}
                            onValueChange={(value) =>
                              updateItem(item.id, { type: value as PublicationItem["type"] })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {publicationTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Publisher / Journal</Label>
                          <Input
                            placeholder="Nature, IEEE, O'Reilly..."
                            value={item.publisher}
                            onChange={(e) =>
                              updateItem(item.id, { publisher: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>Publication Date</Label>
                          <Input
                            placeholder="March 2024"
                            value={item.date}
                            onChange={(e) =>
                              updateItem(item.id, { date: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>URL</Label>
                          <Input
                            placeholder="https://..."
                            value={item.url || ""}
                            onChange={(e) =>
                              updateItem(item.id, { url: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label>DOI</Label>
                          <Input
                            placeholder="10.1000/xyz123"
                            value={item.doi || ""}
                            onChange={(e) =>
                              updateItem(item.id, { doi: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description / Abstract</Label>
                        <Textarea
                          placeholder="Brief description or abstract..."
                          value={item.description || ""}
                          onChange={(e) =>
                            updateItem(item.id, { description: e.target.value })
                          }
                          className="min-h-[80px]"
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
                        {getTypeLabel(item.type)}
                        {item.publisher && ` • ${item.publisher}`}
                        {item.date && ` • ${item.date}`}
                      </p>
                      {item.authors && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Authors: {item.authors}
                        </p>
                      )}
                      {item.url && (
                        <p className="text-xs text-primary mt-1 flex items-center gap-1">
                          <Link className="h-3 w-3" />
                          View Publication
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
