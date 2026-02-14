import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  MapPin,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockCompanies } from "@/data/mockData";
import { Company } from "@/types";

export default function Companies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    domain: "",
    description: "",
    industry: "",
    size: "",
    location: "",
  });

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCompany = () => {
    if (newCompany.name && newCompany.domain) {
      const company: Company = {
        id: String(companies.length + 1),
        ...newCompany,
        createdAt: new Date(),
      };
      setCompanies([...companies, company]);
      setNewCompany({ name: "", domain: "", description: "", industry: "", size: "", location: "" });
      setIsDialogOpen(false);
    }
  };

  const handleDeleteCompany = (id: string) => {
    setCompanies(companies.filter((c) => c.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Companies</h1>
            <p className="text-muted-foreground mt-1">
              Manage your target companies and job opportunities.
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
                <DialogDescription>
                  Add a company to your target list for job applications.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Company Name</Label>
                    <Input
                      id="name"
                      placeholder="Google"
                      value={newCompany.name}
                      onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="domain">Domain</Label>
                    <Input
                      id="domain"
                      placeholder="google.com"
                      value={newCompany.domain}
                      onChange={(e) => setNewCompany({ ...newCompany, domain: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="Technology"
                      value={newCompany.industry}
                      onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="size">Company Size</Label>
                    <Input
                      id="size"
                      placeholder="10,000+"
                      value={newCompany.size}
                      onChange={(e) => setNewCompany({ ...newCompany, size: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Mountain View, CA"
                      value={newCompany.location}
                      onChange={(e) => setNewCompany({ ...newCompany, location: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of the company..."
                      value={newCompany.description}
                      onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="hero" onClick={handleAddCompany}>
                  Add Company
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length === 0 ? (
          <Card variant="flat" className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No companies found</h3>
              <p className="text-muted-foreground text-center mb-6">
                {searchQuery
                  ? "Try adjusting your search criteria."
                  : "Add your first target company to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company, index) => (
              <Card
                key={company.id}
                variant="interactive"
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
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
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteCompany(company.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg mt-4">{company.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{company.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {company.domain}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {company.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {company.size} employees
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
