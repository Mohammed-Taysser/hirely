import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Share2,
  Link as LinkIcon,
  Lock,
  Copy,
  Check,
  Globe,
  Eye,
  EyeOff,
  ExternalLink,
  Mail,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Resume } from "@/types";

// Social sharing icons as SVG components
const TwitterIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

interface ShareSettings {
  isPublic: boolean;
  hasPassword: boolean;
  password: string;
  shareLink: string;
  expiresAt: Date | null;
  allowDownload: boolean;
  showContactInfo: boolean;
}

interface ResumeSharingProps {
  resume: Resume;
}

export function ResumeSharing({ resume }: ResumeSharingProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState<ShareSettings>({
    isPublic: false,
    hasPassword: false,
    password: "",
    shareLink: "",
    expiresAt: null,
    allowDownload: true,
    showContactInfo: true,
  });

  const generateShareLink = useCallback(() => {
    // Generate a unique share ID based on resume ID and timestamp
    const shareId = btoa(`${resume.id}-${Date.now()}`).replace(/[=+/]/g, "").substring(0, 12);
    const baseUrl = window.location.origin;
    const newLink = `${baseUrl}/shared/${shareId}`;
    
    setSettings(prev => ({
      ...prev,
      shareLink: newLink,
      isPublic: true,
    }));
    
    toast.success("Share link generated!");
  }, [resume.id]);

  const copyToClipboard = useCallback(async () => {
    if (!settings.shareLink) {
      toast.error("Generate a share link first");
      return;
    }

    try {
      await navigator.clipboard.writeText(settings.shareLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  }, [settings.shareLink]);

  const handlePasswordChange = (password: string) => {
    setSettings(prev => ({
      ...prev,
      password,
      hasPassword: password.length > 0,
    }));
  };

  const handleTogglePublic = (isPublic: boolean) => {
    setSettings(prev => ({ ...prev, isPublic }));
    if (isPublic && !settings.shareLink) {
      generateShareLink();
    }
  };

  const revokeAccess = useCallback(() => {
    setSettings({
      isPublic: false,
      hasPassword: false,
      password: "",
      shareLink: "",
      expiresAt: null,
      allowDownload: true,
      showContactInfo: true,
    });
    toast.success("Share access revoked");
  }, []);

  const shareViaEmail = useCallback(() => {
    if (!settings.shareLink) {
      toast.error("Generate a share link first");
      return;
    }

    const subject = encodeURIComponent(`Check out my resume: ${resume.title}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'd like to share my resume with you.\n\nView it here: ${settings.shareLink}\n\n${settings.hasPassword ? `Password: ${settings.password}\n\n` : ""}Best regards`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }, [settings.shareLink, settings.hasPassword, settings.password, resume.title]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Resume
          </DialogTitle>
          <DialogDescription>
            Create a public link to share your resume with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Public Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-toggle" className="text-sm font-medium">
                Public Access
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow anyone with the link to view
              </p>
            </div>
            <Switch
              id="public-toggle"
              checked={settings.isPublic}
              onCheckedChange={handleTogglePublic}
            />
          </div>

          {/* Share Link */}
          {settings.isPublic && (
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Share Link</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={settings.shareLink}
                        readOnly
                        className="pl-9 pr-10 font-mono text-sm"
                        placeholder="Click generate to create link"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyToClipboard}
                      disabled={!settings.shareLink}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={generateShareLink}
                      title="Generate new link"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(settings.shareLink, "_blank")}
                    disabled={!settings.shareLink}
                    className="flex-1"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareViaEmail}
                    disabled={!settings.shareLink}
                    className="flex-1"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                </div>

                {/* Social Sharing */}
                <div className="pt-2 border-t">
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Share on social media
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const text = encodeURIComponent(`Check out my resume: ${resume.title}`);
                        const url = encodeURIComponent(settings.shareLink);
                        window.open(
                          `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
                          "_blank",
                          "width=550,height=420"
                        );
                      }}
                      disabled={!settings.shareLink}
                      className="flex-1"
                    >
                      <TwitterIcon />
                      <span className="ml-2">Twitter</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = encodeURIComponent(settings.shareLink);
                        window.open(
                          `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
                          "_blank",
                          "width=550,height=420"
                        );
                      }}
                      disabled={!settings.shareLink}
                      className="flex-1"
                    >
                      <LinkedInIcon />
                      <span className="ml-2">LinkedIn</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = encodeURIComponent(settings.shareLink);
                        window.open(
                          `https://www.facebook.com/sharer/sharer.php?u=${url}`,
                          "_blank",
                          "width=550,height=420"
                        );
                      }}
                      disabled={!settings.shareLink}
                      className="flex-1"
                    >
                      <FacebookIcon />
                      <span className="ml-2">Facebook</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Password Protection */}
          {settings.isPublic && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Password Protection
                </CardTitle>
                <CardDescription className="text-xs">
                  Add an optional password for extra security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password (optional)"
                    value={settings.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {settings.hasPassword && (
                  <p className="text-xs text-primary flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Password protection enabled
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Privacy Options */}
          {settings.isPublic && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Privacy Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-download" className="text-sm">
                    Allow PDF download
                  </Label>
                  <Switch
                    id="allow-download"
                    checked={settings.allowDownload}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, allowDownload: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-contact" className="text-sm">
                    Show contact information
                  </Label>
                  <Switch
                    id="show-contact"
                    checked={settings.showContactInfo}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, showContactInfo: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revoke Access */}
          {settings.isPublic && settings.shareLink && (
            <Button
              variant="destructive"
              onClick={revokeAccess}
              className="w-full"
            >
              Revoke Access
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
