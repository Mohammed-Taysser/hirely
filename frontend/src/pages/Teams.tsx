import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Mail,
  Crown,
  MoreHorizontal,
  Trash2,
  Shield,
  FileText,
  Share2,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatar?: string;
  joinedAt: Date;
  status: 'active' | 'pending';
}

interface SharedResume {
  id: string;
  title: string;
  sharedBy: string;
  sharedAt: Date;
  permissions: 'view' | 'comment' | 'edit';
}

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  sentAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}

const initialMembers: TeamMember[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "owner",
    joinedAt: new Date("2024-01-15"),
    status: "active",
  },
  {
    id: "2",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "admin",
    joinedAt: new Date("2024-02-20"),
    status: "active",
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike@example.com",
    role: "member",
    joinedAt: new Date("2024-03-10"),
    status: "active",
  },
  {
    id: "4",
    name: "Emily Brown",
    email: "emily@example.com",
    role: "viewer",
    joinedAt: new Date("2024-04-05"),
    status: "pending",
  },
];

const initialSharedResumes: SharedResume[] = [
  {
    id: "1",
    title: "Senior Developer Resume",
    sharedBy: "Sarah Wilson",
    sharedAt: new Date("2024-11-20"),
    permissions: "edit",
  },
  {
    id: "2",
    title: "Product Manager CV",
    sharedBy: "Mike Chen",
    sharedAt: new Date("2024-11-18"),
    permissions: "comment",
  },
  {
    id: "3",
    title: "UX Designer Portfolio",
    sharedBy: "John Doe",
    sharedAt: new Date("2024-11-15"),
    permissions: "view",
  },
];

const initialInvitations: Invitation[] = [
  {
    id: "1",
    email: "newuser@example.com",
    role: "member",
    sentAt: new Date("2024-11-19"),
    status: "pending",
  },
];

const roleColors: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  owner: "default",
  admin: "secondary",
  member: "outline",
  viewer: "outline",
};

export default function Teams() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [sharedResumes, setSharedResumes] = useState<SharedResume[]>(initialSharedResumes);
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [shareEmails, setShareEmails] = useState("");
  const [sharePermission, setSharePermission] = useState<"view" | "comment" | "edit">("view");

  const isPremium = user?.tier === "premium";

  const handleInviteMember = () => {
    if (!inviteEmail) {
      toast.error("Please enter an email address");
      return;
    }

    const newInvitation: Invitation = {
      id: Date.now().toString(),
      email: inviteEmail,
      role: inviteRole,
      sentAt: new Date(),
      status: "pending",
    };

    setInvitations([...invitations, newInvitation]);
    setInviteEmail("");
    setInviteDialogOpen(false);
    toast.success(`Invitation sent to ${inviteEmail}`);
  };

  const handleRemoveMember = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (member?.role === "owner") {
      toast.error("Cannot remove the team owner");
      return;
    }
    setMembers(members.filter((m) => m.id !== memberId));
    toast.success("Member removed from team");
  };

  const handleCancelInvitation = (invitationId: string) => {
    setInvitations(invitations.filter((i) => i.id !== invitationId));
    toast.success("Invitation cancelled");
  };

  const handleShareResume = () => {
    if (!shareEmails) {
      toast.error("Please enter email addresses");
      return;
    }

    toast.success(`Resume shared with ${shareEmails.split(",").length} team member(s)`);
    setShareEmails("");
    setShareDialogOpen(false);
  };

  const handleUpdateMemberRole = (memberId: string, newRole: TeamMember["role"]) => {
    setMembers(
      members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
    toast.success("Member role updated");
  };

  if (!isPremium) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-center max-w-md">
            <Crown className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
            <p className="text-muted-foreground mb-6">
              Team collaboration is available exclusively for Premium users. Upgrade your plan to invite team members, share resumes, and collaborate on projects.
            </p>
            <Button size="lg">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Team</h1>
            <p className="text-muted-foreground mt-1">
              Collaborate with your team on resumes and cover letters
            </p>
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team. They'll receive an email with instructions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={inviteRole} onValueChange={(v: "admin" | "member" | "viewer") => setInviteRole(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin - Full access</SelectItem>
                      <SelectItem value="member">Member - Can edit and comment</SelectItem>
                      <SelectItem value="viewer">Viewer - Can only view</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteMember}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold">{members.filter(m => m.status === "active").length}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Shared Resumes</p>
                  <p className="text-2xl font-bold">{sharedResumes.length}</p>
                </div>
                <Share2 className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Invitations</p>
                  <p className="text-2xl font-bold">{invitations.filter(i => i.status === "pending").length}</p>
                </div>
                <Mail className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="members" className="space-y-4">
          <TabsList>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="shared">Shared Resumes</TabsTrigger>
            <TabsTrigger value="invitations">Pending Invitations</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage your team members and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {member.name.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.name}</p>
                            {member.role === "owner" && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                            {member.status === "pending" && (
                              <Badge variant="outline" className="text-xs">Pending</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={roleColors[member.role]}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                        {member.role !== "owner" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, "admin")}>
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, "member")}>
                                <Users className="h-4 w-4 mr-2" />
                                Make Member
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateMemberRole(member.id, "viewer")}>
                                <FileText className="h-4 w-4 mr-2" />
                                Make Viewer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRemoveMember(member.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shared" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Shared Resumes</CardTitle>
                  <CardDescription>
                    Resumes shared with your team
                  </CardDescription>
                </div>
                <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Resume
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share Resume</DialogTitle>
                      <DialogDescription>
                        Share a resume with team members
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Select Resume</Label>
                        <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a resume" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Senior Developer Resume</SelectItem>
                            <SelectItem value="2">Product Manager CV</SelectItem>
                            <SelectItem value="3">UX Designer Portfolio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Share With (emails, comma-separated)</Label>
                        <Input
                          placeholder="email1@example.com, email2@example.com"
                          value={shareEmails}
                          onChange={(e) => setShareEmails(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Permissions</Label>
                        <Select value={sharePermission} onValueChange={(v: "view" | "comment" | "edit") => setSharePermission(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">View Only</SelectItem>
                            <SelectItem value="comment">Can Comment</SelectItem>
                            <SelectItem value="edit">Can Edit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleShareResume}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sharedResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{resume.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Shared by {resume.sharedBy} • {resume.sharedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {resume.permissions === "view" && "View Only"}
                        {resume.permissions === "comment" && "Can Comment"}
                        {resume.permissions === "edit" && "Can Edit"}
                      </Badge>
                    </div>
                  ))}
                  {sharedResumes.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No resumes shared yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="invitations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Manage outstanding team invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{invitation.email}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Sent {invitation.sentAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={roleColors[invitation.role]}>
                          {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                        </Badge>
                        {invitation.status === "pending" && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                        {invitation.status === "accepted" && (
                          <Badge variant="default" className="gap-1 bg-green-500">
                            <CheckCircle className="h-3 w-3" />
                            Accepted
                          </Badge>
                        )}
                        {invitation.status === "declined" && (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Declined
                          </Badge>
                        )}
                        {invitation.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelInvitation(invitation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {invitations.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No pending invitations</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
