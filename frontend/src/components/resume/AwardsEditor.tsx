import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { ResumeSection, AwardItem } from "@/types";

interface AwardsEditorProps {
  section: ResumeSection;
  onUpdate: (content: AwardItem[]) => void;
}

export function AwardsEditor({ section, onUpdate }: AwardsEditorProps) {
  const awards = (section.content as AwardItem[]) || [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addAward = () => {
    const newAward: AwardItem = {
      id: `award-${Date.now()}`,
      title: "",
      issuer: "",
      date: "",
      description: "",
      url: "",
    };
    onUpdate([...awards, newAward]);
    setExpandedId(newAward.id);
  };

  const updateAward = (id: string, field: keyof AwardItem, value: string) => {
    onUpdate(
      awards.map((award) =>
        award.id === id ? { ...award, [field]: value } : award
      )
    );
  };

  const removeAward = (id: string) => {
    onUpdate(awards.filter((award) => award.id !== id));
  };

  return (
    <div className="space-y-4">
      {awards.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="mb-4">No awards or honors added yet</p>
          <Button onClick={addAward} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Award
          </Button>
        </div>
      ) : (
        <>
          {awards.map((award) => (
            <Card key={award.id} variant="default" className="overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => setExpandedId(expandedId === award.id ? null : award.id)}
              >
                <div className="flex-1">
                  <h4 className="font-medium">
                    {award.title || "Untitled Award"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {award.issuer
                      ? `${award.issuer}${award.date ? ` • ${award.date}` : ""}`
                      : "Add details"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAward(award.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {expandedId === award.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {expandedId === award.id && (
                <CardContent className="border-t border-border pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor={`title-${award.id}`}>Award Title</Label>
                      <Input
                        id={`title-${award.id}`}
                        value={award.title}
                        onChange={(e) => updateAward(award.id, "title", e.target.value)}
                        placeholder="Employee of the Year"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`issuer-${award.id}`}>Issuing Organization</Label>
                      <Input
                        id={`issuer-${award.id}`}
                        value={award.issuer}
                        onChange={(e) => updateAward(award.id, "issuer", e.target.value)}
                        placeholder="Company Name, Association, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor={`date-${award.id}`}>Date Received</Label>
                      <Input
                        id={`date-${award.id}`}
                        value={award.date}
                        onChange={(e) => updateAward(award.id, "date", e.target.value)}
                        placeholder="January 2024"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`url-${award.id}`}>URL (Optional)</Label>
                    <Input
                      id={`url-${award.id}`}
                      value={award.url || ""}
                      onChange={(e) => updateAward(award.id, "url", e.target.value)}
                      placeholder="https://example.com/award"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`description-${award.id}`}>Description (Optional)</Label>
                    <Textarea
                      id={`description-${award.id}`}
                      value={award.description || ""}
                      onChange={(e) => updateAward(award.id, "description", e.target.value)}
                      placeholder="Brief description of the award and its significance..."
                      className="min-h-[80px]"
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}

          <Button onClick={addAward} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Award
          </Button>
        </>
      )}
    </div>
  );
}
