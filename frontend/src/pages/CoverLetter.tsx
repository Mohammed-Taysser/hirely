import { useState } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Download, 
  RefreshCw,
  Briefcase,
  Building2,
  User,
  Wand2,
  CheckCircle,
} from "lucide-react";
import { mockResumes } from "@/data/mockData";
import { Resume, ContactInfo, ExperienceItem } from "@/types";
import { toast } from "sonner";

const coverLetterTones = [
  { value: "professional", label: "Professional" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "confident", label: "Confident" },
  { value: "conversational", label: "Conversational" },
];

function generateCoverLetter(
  resume: Resume,
  companyName: string,
  jobTitle: string,
  jobDescription: string,
  tone: string
): string {
  const contact = resume.sections.find(s => s.type === 'contact')?.content as ContactInfo | undefined;
  const summary = resume.sections.find(s => s.type === 'summary')?.content as string | undefined;
  const experience = resume.sections.find(s => s.type === 'experience')?.content as ExperienceItem[] | undefined;
  const skills = resume.sections.find(s => s.type === 'skills')?.content as string[] | undefined;

  const name = contact?.fullName || "Your Name";
  const latestRole = experience?.[0];
  const topSkills = skills?.slice(0, 5).join(", ") || "relevant skills";

  // Extract keywords from job description for deeper matching
  const jdKeywords = jobDescription
    .toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 4);

  const matchingSkills = skills?.filter(skill => 
    jdKeywords.some(kw => skill.toLowerCase().includes(kw))
  ) || [];

  // Also check experience descriptions for keyword overlap
  const relevantHighlights: string[] = [];
  experience?.forEach(exp => {
    exp.highlights.forEach(h => {
      if (jdKeywords.some(kw => h.toLowerCase().includes(kw))) {
        relevantHighlights.push(h);
      }
    });
  });

  const toneStyles: Record<string, { greeting: string; closing: string; style: string }> = {
    professional: {
      greeting: "Dear Hiring Manager,",
      closing: "Sincerely,",
      style: "I am writing to express my interest in"
    },
    enthusiastic: {
      greeting: "Dear Hiring Team,",
      closing: "With enthusiasm,",
      style: "I am thrilled to apply for"
    },
    confident: {
      greeting: "Dear Hiring Manager,",
      closing: "Best regards,",
      style: "I am confident that my experience makes me an ideal candidate for"
    },
    conversational: {
      greeting: "Hello,",
      closing: "Looking forward to connecting,",
      style: "I'm excited to throw my hat in the ring for"
    }
  };

  const toneStyle = toneStyles[tone] || toneStyles.professional;

  const experienceParagraph = latestRole
    ? `In my current role as ${latestRole.position} at ${latestRole.company}, I have ${latestRole.highlights?.[0]?.toLowerCase() || 'developed expertise in delivering high-quality work'}. ${latestRole.highlights?.[1] ? `Additionally, I have ${latestRole.highlights[1].toLowerCase()}.` : ''}${relevantHighlights.length > 0 ? ` Notably, I ${relevantHighlights[0].toLowerCase()}, which directly aligns with the requirements of this role.` : ''}`
    : 'Throughout my career, I have consistently delivered results and contributed to team success.';

  const skillsParagraph = matchingSkills.length > 0 
    ? `I noticed your job description emphasizes skills that align directly with my expertise, particularly in ${matchingSkills.join(", ")}. This makes me especially excited about the opportunity to contribute to ${companyName}.`
    : `My proficiency in ${topSkills} positions me well to make immediate contributions to your team.`;

  const letter = `${toneStyle.greeting}

${toneStyle.style} the ${jobTitle} position at ${companyName}. ${summary ? summary.slice(0, 200) : `With my background and passion for building great products, I believe I would be a valuable addition to your team.`}

${experienceParagraph}

${skillsParagraph}

I am particularly drawn to ${companyName} because of its reputation for innovation and commitment to excellence. I would welcome the opportunity to discuss how my background, skills, and enthusiasm can contribute to your team's continued success.

Thank you for considering my application. I look forward to the possibility of discussing this exciting opportunity with you.

${toneStyle.closing}
${name}
${contact?.email || ''}
${contact?.phone || ''}`;

  return letter;
}

export default function CoverLetter() {
  const location = useLocation();
  const passedResume = location.state?.resume as Resume | undefined;
  const passedJobDescription = location.state?.jobDescription as string | undefined;

  const [selectedResumeId, setSelectedResumeId] = useState<string>(passedResume?.id || "");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState(passedJobDescription || "");
  const [tone, setTone] = useState("professional");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Use passed resume if available, otherwise look in mock data
  const selectedResume = passedResume?.id === selectedResumeId
    ? passedResume
    : mockResumes.find(r => r.id === selectedResumeId);

  const handleGenerate = () => {
    if (!selectedResume) {
      toast.error("Please select a resume first");
      return;
    }
    if (!companyName.trim()) {
      toast.error("Please enter the company name");
      return;
    }
    if (!jobTitle.trim()) {
      toast.error("Please enter the job title");
      return;
    }

    setIsGenerating(true);
    
    // Simulate generation delay for UX
    setTimeout(() => {
      const letter = generateCoverLetter(
        selectedResume,
        companyName,
        jobTitle,
        jobDescription,
        tone
      );
      setGeneratedLetter(letter);
      setIsGenerating(false);
      toast.success("Cover letter generated!");
    }, 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${companyName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">Cover Letter Generator</h1>
            <p className="text-muted-foreground mt-1">
              Create tailored cover letters based on your resume and job details
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Template-Based
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Source Resume
                </CardTitle>
                <CardDescription>
                  Select the resume to use for generating your cover letter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {passedResume && (
                      <SelectItem key={passedResume.id} value={passedResume.id}>
                        <div className="flex items-center gap-2">
                          <Wand2 className="h-4 w-4 text-primary" />
                          {passedResume.title} (Current)
                        </div>
                      </SelectItem>
                    )}
                    {mockResumes.filter(r => r.id !== passedResume?.id).map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {resume.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Job Details
                </CardTitle>
                <CardDescription>
                  Enter information about the position you're applying for
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">
                      <Building2 className="inline h-4 w-4 mr-1" />
                      Company Name
                    </Label>
                    <Input
                      id="company"
                      placeholder="e.g., Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">
                      <User className="inline h-4 w-4 mr-1" />
                      Job Title
                    </Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Senior Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description (Optional)</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the job description here to better tailor your cover letter..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Adding the job description helps match your skills to the requirements
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {coverLetterTones.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  className="w-full"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <Card className="flex flex-col">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Generated Cover Letter</CardTitle>
                <CardDescription>
                  Review and edit your personalized cover letter
                </CardDescription>
              </div>
              {generatedLetter && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              {generatedLetter ? (
                <Tabs defaultValue="preview" className="h-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview" className="h-[calc(100%-48px)]">
                    <ScrollArea className="h-full rounded-lg border bg-muted/30 p-6">
                      <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                        {generatedLetter}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="edit" className="h-[calc(100%-48px)]">
                    <Textarea
                      value={generatedLetter}
                      onChange={(e) => setGeneratedLetter(e.target.value)}
                      className="h-full min-h-[400px] font-serif text-sm"
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border border-dashed bg-muted/30">
                  <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Your cover letter will appear here
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Fill in the details and click "Generate"
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
