import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Shield, 
  Users, 
  Search, 
  MoreHorizontal, 
  UserPlus,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Crown,
  AlertTriangle
} from "lucide-react";
import { Tier } from "@/types";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "super_admin";
  tier: Tier;
  status: "active" | "suspended" | "pending";
  resumeCount: number;
  createdAt: Date;
  lastActive: Date;
}

const initialUsers: AdminUser[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    role: "super_admin",
    tier: "premium",
    status: "active",
    resumeCount: 5,
    createdAt: new Date("2024-01-01"),
    lastActive: new Date("2024-01-20"),
  },
  {
    id: "2",
    name: "Sarah Williams",
    email: "sarah.w@email.com",
    role: "admin",
    tier: "pro",
    status: "active",
    resumeCount: 8,
    createdAt: new Date("2024-01-05"),
    lastActive: new Date("2024-01-19"),
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike.chen@email.com",
    role: "user",
    tier: "free",
    status: "active",
    resumeCount: 2,
    createdAt: new Date("2024-01-10"),
    lastActive: new Date("2024-01-18"),
  },
  {
    id: "4",
    name: "Emily Brown",
    email: "emily.b@email.com",
    role: "user",
    tier: "pro",
    status: "suspended",
    resumeCount: 3,
    createdAt: new Date("2024-01-08"),
    lastActive: new Date("2024-01-15"),
  },
  {
    id: "5",
    name: "David Lee",
    email: "david.lee@email.com",
    role: "user",
    tier: "free",
    status: "pending",
    resumeCount: 0,
    createdAt: new Date("2024-01-19"),
    lastActive: new Date("2024-01-19"),
  },
];

function getRoleBadge(role: AdminUser["role"]) {
  switch (role) {
    case "super_admin":
      return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20"><Crown className="h-3 w-3 mr-1" />Super Admin</Badge>;
    case "admin":
      return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
    default:
      return <Badge variant="secondary">User</Badge>;
  }
}

function getStatusBadge(status: AdminUser["status"]) {
  switch (status) {
    case "active":
      return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
    case "suspended":
      return <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20"><Ban className="h-3 w-3 mr-1" />Suspended</Badge>;
    case "pending":
      return <Badge variant="secondary"><AlertTriangle className="h-3 w-3 mr-1" />Pending</Badge>;
  }
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user" as AdminUser["role"],
    tier: "free" as Tier,
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    const user: AdminUser = {
      id: Date.now().toString(),
      ...newUser,
      status: "pending",
      resumeCount: 0,
      createdAt: new Date(),
      lastActive: new Date(),
    };

    setUsers([...users, user]);
    setIsAddDialogOpen(false);
    setNewUser({ name: "", email: "", role: "user", tier: "free" });
    toast.success("User added successfully");
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    toast.success("User updated successfully");
  };

  const handleDeleteUser = () => {
    if (!deleteUserId) return;

    setUsers(users.filter(u => u.id !== deleteUserId));
    setDeleteUserId(null);
    toast.success("User deleted successfully");
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(users.map(u => {
      if (u.id === userId) {
        const newStatus = u.status === "suspended" ? "active" : "suspended";
        toast.success(`User ${newStatus === "suspended" ? "suspended" : "reactivated"}`);
        return { ...u, status: newStatus as AdminUser["status"] };
      }
      return u;
    }));
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    admins: users.filter(u => u.role !== "user").length,
    suspended: users.filter(u => u.status === "suspended").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, roles, and permissions (Super Admin only)
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with specified permissions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select 
                      value={newUser.role} 
                      onValueChange={(v) => setNewUser({ ...newUser, role: v as AdminUser["role"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <Select 
                      value={newUser.tier} 
                      onValueChange={(v) => setNewUser({ ...newUser, tier: v as Tier })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Add User</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Shield className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.admins}</p>
                  <p className="text-sm text-muted-foreground">Admins</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Ban className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.suspended}</p>
                  <p className="text-sm text-muted-foreground">Suspended</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              View and manage all registered users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resumes</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Badge variant={user.tier}>{user.tier.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{user.resumeCount}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.lastActive.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                              <Ban className="mr-2 h-4 w-4" />
                              {user.status === "suspended" ? "Reactivate" : "Suspend"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setDeleteUserId(user.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit User Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user details and permissions
              </DialogDescription>
            </DialogHeader>
            {editingUser && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select 
                      value={editingUser.role} 
                      onValueChange={(v) => setEditingUser({ ...editingUser, role: v as AdminUser["role"] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <Select 
                      value={editingUser.tier} 
                      onValueChange={(v) => setEditingUser({ ...editingUser, tier: v as Tier })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this user? This action cannot be undone.
                All their resumes and data will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
