import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resumeTemplates, ResumeTemplate } from "@/data/resumeTemplates";
import { TemplatePreviewCard } from "@/components/templates/TemplatePreviewCard";
import { useFavoriteTemplates } from "@/hooks/useFavoriteTemplates";
import {
  Search,
  FileText,
  LayoutGrid,
  List,
  Sparkles,
  Heart,
} from "lucide-react";
import { toast } from "sonner";

const tierOrder: Record<string, number> = {
  free: 0,
  pro: 1,
  premium: 2,
};

// Categorize templates
const categories = {
  all: "All Templates",
  favorites: "Favorites",
  professional: "Professional",
  creative: "Creative",
  academic: "Academic",
  minimal: "Minimal",
};

const templateCategories: Record<string, string[]> = {
  professional: ["tech-professional", "business-executive", "complete-professional"],
  creative: ["creative-designer", "modern-coral", "rose-elegant"],
  academic: ["academic", "researcher"],
  minimal: ["blank", "minimalist", "nordic-frost", "midnight-dark"],
};

export default function Templates() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { favorites, isFavorite, toggleFavorite } = useFavoriteTemplates();
  const currentTier = "free"; // This would come from user context

  const canAccessTemplate = (templateTier: string) => {
    return tierOrder[templateTier] <= tierOrder[currentTier];
  };

  const getTemplateCategory = (templateId: string): string => {
    for (const [category, ids] of Object.entries(templateCategories)) {
      if (ids.includes(templateId)) return category;
    }
    return "professional";
  };

  const filteredTemplates = resumeTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === "all" || template.tier === tierFilter;
    const matchesCategory =
      categoryFilter === "all" ||
      categoryFilter === "favorites" ? isFavorite(template.id) :
      getTemplateCategory(template.id) === categoryFilter;
    
    // Special handling for favorites tab
    if (categoryFilter === "favorites") {
      return matchesSearch && matchesTier && isFavorite(template.id);
    }
    
    return matchesSearch && matchesTier && matchesCategory;
  });

  const handleSelectTemplate = (template: ResumeTemplate) => {
    if (!canAccessTemplate(template.tier)) {
      toast.error(`Upgrade to ${template.tier.toUpperCase()} to use this template`);
      return;
    }
    navigate("/resumes/new", { state: { templateId: template.id } });
  };

  // Group templates by tier for featured section
  const featuredTemplates = resumeTemplates.filter(
    (t) => t.tier === "free" && ["tech-professional", "minimalist"].includes(t.id)
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Resume Templates</h1>
            <p className="text-muted-foreground mt-2">
              Choose from professionally designed templates to create your perfect resume
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              {resumeTemplates.length} Templates
            </Badge>
          </div>
        </div>

        {/* Featured Templates */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Featured Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredTemplates.map((template) => (
              <TemplatePreviewCard
                key={template.id}
                template={template}
                isLocked={!canAccessTemplate(template.tier)}
                onSelect={handleSelectTemplate}
                isFavorite={isFavorite(template.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
          <TabsList>
            {Object.entries(categories).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1">
                {key === "favorites" && <Heart className="h-3.5 w-3.5" />}
                {label}
                {key === "favorites" && favorites.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {favorites.length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={categoryFilter} className="mt-6">
            {/* Templates Grid */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredTemplates.map((template) => (
                <TemplatePreviewCard
                  key={template.id}
                  template={template}
                  isLocked={!canAccessTemplate(template.tier)}
                  onSelect={handleSelectTemplate}
                  isFavorite={isFavorite(template.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No templates found</h3>
                <p className="text-muted-foreground mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-xl">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {resumeTemplates.filter((t) => t.tier === "free").length}
            </p>
            <p className="text-sm text-muted-foreground">Free Templates</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {resumeTemplates.filter((t) => t.tier === "pro").length}
            </p>
            <p className="text-sm text-muted-foreground">Pro Templates</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {resumeTemplates.filter((t) => t.tier === "premium").length}
            </p>
            <p className="text-sm text-muted-foreground">Premium Templates</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
