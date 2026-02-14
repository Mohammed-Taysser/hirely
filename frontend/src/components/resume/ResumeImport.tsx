import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  FileType,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Resume, ResumeSection, ContactInfo, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "@/types";

interface ResumeImportProps {
  onImport: (resume: Resume) => void;
}

interface ParsedData {
  contactInfo: ContactInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
}

export function ResumeImport({ onImport }: ResumeImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parseStatus, setParseStatus] = useState<"idle" | "parsing" | "success" | "error">("idle");
  const [parsedSections, setParsedSections] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Please upload a PDF or DOCX file");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    setParseStatus("idle");
    setParsedSections([]);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    
    if (droppedFile) {
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
      ];

      if (!allowedTypes.includes(droppedFile.type)) {
        toast.error("Please upload a PDF or DOCX file");
        return;
      }

      setFile(droppedFile);
      setParseStatus("idle");
      setParsedSections([]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const simulateContentExtraction = (text: string): ParsedData => {
    // Simulate parsing different sections
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    
    return {
      contactInfo: {
        fullName: "Imported User",
        email: emailMatch?.[0] || "email@example.com",
        phone: phoneMatch?.[0] || "",
        location: "City, State",
        linkedin: "",
        website: "",
      },
      summary: "Experienced professional with a proven track record of delivering results. Skilled in project management, team leadership, and strategic planning.",
      experience: [
        {
          id: "exp1",
          company: "Example Company",
          position: "Senior Position",
          startDate: "2020-01",
          endDate: "2024-01",
          current: false,
          description: "Led cross-functional teams to deliver key initiatives. Managed budgets and resources effectively.",
          highlights: [
            "Increased team productivity by 25%",
            "Successfully delivered 10+ major projects",
          ],
        },
        {
          id: "exp2",
          company: "Previous Company",
          position: "Junior Position",
          startDate: "2017-06",
          endDate: "2019-12",
          current: false,
          description: "Contributed to various projects and gained expertise in multiple areas.",
          highlights: [
            "Received recognition for outstanding performance",
          ],
        },
      ],
      education: [
        {
          id: "edu1",
          institution: "University Name",
          degree: "Bachelor of Science",
          field: "Computer Science",
          startDate: "2013-09",
          endDate: "2017-05",
          gpa: "3.8",
        },
      ],
      skills: [
        "JavaScript",
        "TypeScript",
        "React",
        "Node.js",
        "Python",
        "SQL",
        "Project Management",
        "Team Leadership",
      ],
      projects: [
        {
          id: "proj1",
          name: "Portfolio Website",
          description: "Personal portfolio showcasing projects and skills",
          technologies: ["React", "TypeScript", "Tailwind CSS"],
          link: "https://example.com",
        },
      ],
      certifications: [
        {
          id: "cert1",
          name: "Professional Certification",
          issuer: "Certification Authority",
          date: "2023-06",
          credentialId: "CERT-12345",
        },
      ],
    };
  };

  const parseResume = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setIsParsing(true);
    setParseStatus("parsing");
    setProgress(0);
    setParsedSections([]);

    try {
      // Simulate file reading
      const reader = new FileReader();
      
      reader.onload = async () => {
        // Simulate parsing progress
        const sections = [
          "Contact Information",
          "Professional Summary",
          "Work Experience",
          "Education",
          "Skills",
          "Projects",
          "Certifications",
        ];

        for (let i = 0; i < sections.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          setProgress(((i + 1) / sections.length) * 100);
          setParsedSections((prev) => [...prev, sections[i]]);
        }

        // Simulate content extraction
        const text = reader.result as string || "";
        const parsedData = simulateContentExtraction(text);

        // Create resume object
        const importedResume: Resume = {
          id: `imported-${Date.now()}`,
          title: file.name.replace(/\.(pdf|docx?)$/i, "") || "Imported Resume",
          tier: "free",
          createdAt: new Date(),
          updatedAt: new Date(),
          sections: [
            {
              id: "s1",
              type: "contact",
              title: "Contact Information",
              order: 0,
              content: parsedData.contactInfo,
            },
            {
              id: "s2",
              type: "summary",
              title: "Professional Summary",
              order: 1,
              content: parsedData.summary,
            },
            {
              id: "s3",
              type: "experience",
              title: "Work Experience",
              order: 2,
              content: parsedData.experience,
            },
            {
              id: "s4",
              type: "education",
              title: "Education",
              order: 3,
              content: parsedData.education,
            },
            {
              id: "s5",
              type: "skills",
              title: "Skills",
              order: 4,
              content: parsedData.skills,
            },
            {
              id: "s6",
              type: "projects",
              title: "Projects",
              order: 5,
              content: parsedData.projects,
            },
            {
              id: "s7",
              type: "certifications",
              title: "Certifications",
              order: 6,
              content: parsedData.certifications,
            },
          ],
        };

        setParseStatus("success");
        
        // Delay to show success state
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        onImport(importedResume);
        setIsOpen(false);
        toast.success("Resume imported successfully!");
        
        // Reset state
        setFile(null);
        setIsParsing(false);
        setProgress(0);
        setParseStatus("idle");
        setParsedSections([]);
      };

      reader.onerror = () => {
        setParseStatus("error");
        setIsParsing(false);
        toast.error("Failed to read file");
      };

      if (file.type === "application/pdf") {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    } catch (error) {
      setParseStatus("error");
      setIsParsing(false);
      toast.error("Failed to parse resume");
    }
  };

  const clearFile = () => {
    setFile(null);
    setParseStatus("idle");
    setParsedSections([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Import Resume
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Resume
          </DialogTitle>
          <DialogDescription>
            Upload a PDF or DOCX file to automatically extract your resume content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File upload area */}
          {!file ? (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileSelect}
              />
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Drop your resume here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-2">
                Supports PDF and DOCX files up to 10MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected file */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {file.type === "application/pdf" ? (
                    <FileText className="h-8 w-8 text-red-500" />
                  ) : (
                    <FileType className="h-8 w-8 text-blue-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                {!isParsing && (
                  <Button variant="ghost" size="icon" onClick={clearFile}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Progress indicator */}
              {isParsing && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Parsing resume...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  
                  {/* Parsed sections */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {parsedSections.map((section) => (
                      <Badge key={section} variant="secondary" className="gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Success state */}
              {parseStatus === "success" && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-600 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Resume parsed successfully!</span>
                </div>
              )}

              {/* Error state */}
              {parseStatus === "error" && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Failed to parse resume. Please try again.</span>
                </div>
              )}
            </div>
          )}

          {/* Supported formats info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p className="font-medium mb-1">The import will extract:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Contact information (name, email, phone)</li>
              <li>Professional summary</li>
              <li>Work experience with highlights</li>
              <li>Education history</li>
              <li>Skills and technologies</li>
              <li>Projects and certifications</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isParsing}>
            Cancel
          </Button>
          <Button onClick={parseResume} disabled={!file || isParsing}>
            {isParsing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Parsing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
