import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Download,
  Eye,
  Filter,
  Copy,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockResumes } from "@/data/mockData";
import { formatDistanceToNow } from "date-fns";
import { Tier, Resume } from "@/types";
import { toast } from "sonner";

export default function Resumes() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>(mockResumes);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<Tier | "all">("all");

  const filteredResumes = resumes.filter((resume) => {
    const matchesSearch = resume.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === "all" || resume.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const handleDuplicate = (resume: Resume) => {
    const duplicatedResume: Resume = {
      ...resume,
      id: `resume-${Date.now()}`,
      title: `${resume.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      sections: resume.sections.map(section => ({
        ...section,
        id: `${section.id}-${Date.now()}`,
      })),
    };
    setResumes(prev => [duplicatedResume, ...prev]);
    toast.success(`"${resume.title}" duplicated successfully`);
  };

  const handleDelete = (resumeId: string) => {
    setResumes(prev => prev.filter(r => r.id !== resumeId));
    toast.success("Resume deleted");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Resumes</h1>
            <p className="text-muted-foreground mt-1">
              Manage and edit your resume collection.
            </p>
          </div>
          <Button variant="hero" asChild>
            <Link to="/resumes/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Resume
            </Link>
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resumes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                {filterTier === "all" ? "All Tiers" : filterTier.charAt(0).toUpperCase() + filterTier.slice(1)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterTier("all")}>All Tiers</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterTier("free")}>Free</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterTier("pro")}>Pro</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterTier("premium")}>Premium</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Resume Grid */}
        {filteredResumes.length === 0 ? (
          <Card variant="flat" className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No resumes found</h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchQuery || filterTier !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Create your first resume to get started."}
              </p>
              {!searchQuery && filterTier === "all" && (
                <Button variant="hero" asChild>
                  <Link to="/resumes/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Resume
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map((resume, index) => (
              <Card
                key={resume.id}
                variant="interactive"
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/resumes/${resume.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(resume)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(resume.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg mt-4">{resume.title}</CardTitle>
                  <CardDescription>
                    Updated {formatDistanceToNow(resume.updatedAt)} ago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant={resume.tier}>{resume.tier}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {resume.sections.length} sections
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Resume Card */}
            <Card
              variant="flat"
              className="border-2 border-dashed hover:border-accent hover:bg-accent/5 transition-all cursor-pointer"
            >
              <Link to="/resumes/new" className="flex flex-col items-center justify-center h-full min-h-[200px] p-6">
                <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-accent/10">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-muted-foreground">Create New Resume</p>
              </Link>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
