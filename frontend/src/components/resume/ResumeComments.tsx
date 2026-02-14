import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Send,
  MoreHorizontal,
  Trash2,
  Edit2,
  Reply,
  CheckCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  sectionId?: string;
  sectionName?: string;
  createdAt: Date;
  resolved: boolean;
  replies: Reply[];
}

interface Reply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

const initialComments: Comment[] = [
  {
    id: "1",
    userId: "user1",
    userName: "Sarah Wilson",
    content: "Great summary! Consider adding more specific metrics about your achievements.",
    sectionId: "s2",
    sectionName: "Professional Summary",
    createdAt: new Date("2024-11-19T10:30:00"),
    resolved: false,
    replies: [
      {
        id: "r1",
        userId: "user2",
        userName: "John Doe",
        content: "Good point! I'll add the revenue numbers.",
        createdAt: new Date("2024-11-19T11:15:00"),
      },
    ],
  },
  {
    id: "2",
    userId: "user3",
    userName: "Mike Chen",
    content: "The skills section looks comprehensive. Maybe group them by category?",
    sectionId: "s4",
    sectionName: "Skills",
    createdAt: new Date("2024-11-18T14:20:00"),
    resolved: true,
    replies: [],
  },
  {
    id: "3",
    userId: "user1",
    userName: "Sarah Wilson",
    content: "Overall layout looks clean and professional. Well done!",
    createdAt: new Date("2024-11-17T09:00:00"),
    resolved: false,
    replies: [],
  },
];

interface ResumeCommentsProps {
  resumeId: string;
}

export function ResumeComments({ resumeId }: ResumeCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "resolved">("all");

  const filteredComments = comments.filter((comment) => {
    if (filter === "open") return !comment.resolved;
    if (filter === "resolved") return comment.resolved;
    return true;
  });

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      userId: user?.id || "current",
      userName: user?.name || "You",
      content: newComment,
      createdAt: new Date(),
      resolved: false,
      replies: [],
    };

    setComments([comment, ...comments]);
    setNewComment("");
    toast.success("Comment added");
  };

  const handleAddReply = (commentId: string) => {
    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    const reply: Reply = {
      id: Date.now().toString(),
      userId: user?.id || "current",
      userName: user?.name || "You",
      content: replyContent,
      createdAt: new Date(),
    };

    setComments(
      comments.map((c) =>
        c.id === commentId ? { ...c, replies: [...c.replies, reply] } : c
      )
    );
    setReplyingTo(null);
    setReplyContent("");
    toast.success("Reply added");
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId));
    toast.success("Comment deleted");
  };

  const handleToggleResolved = (commentId: string) => {
    setComments(
      comments.map((c) =>
        c.id === commentId ? { ...c, resolved: !c.resolved } : c
      )
    );
    toast.success("Comment status updated");
  };

  const handleEditComment = (commentId: string) => {
    if (!editContent.trim()) {
      toast.error("Please enter content");
      return;
    }

    setComments(
      comments.map((c) =>
        c.id === commentId ? { ...c, content: editContent } : c
      )
    );
    setEditingComment(null);
    setEditContent("");
    toast.success("Comment updated");
  };

  const openComments = comments.filter((c) => !c.resolved).length;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments
          {openComments > 0 && (
            <Badge variant="secondary" className="ml-1">
              {openComments}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments
          </SheetTitle>
          <SheetDescription>
            Leave feedback and collaborate with your team
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* Filter buttons */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({comments.length})
            </Button>
            <Button
              variant={filter === "open" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("open")}
            >
              Open ({comments.filter((c) => !c.resolved).length})
            </Button>
            <Button
              variant={filter === "resolved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("resolved")}
            >
              Resolved ({comments.filter((c) => c.resolved).length})
            </Button>
          </div>

          {/* New comment input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <Button onClick={handleAddComment} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
          </div>

          {/* Comments list */}
          <ScrollArea className="h-[calc(100vh-340px)]">
            <div className="space-y-4 pr-4">
              {filteredComments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-4 border rounded-lg ${
                    comment.resolved ? "bg-muted/50" : "bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback className="text-xs">
                          {comment.userName.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {comment.createdAt.toLocaleDateString()}
                          </span>
                        </div>
                        {comment.sectionName && (
                          <Badge variant="outline" className="mt-1 text-xs">
                            {comment.sectionName}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {comment.resolved ? (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Open
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleToggleResolved(comment.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {comment.resolved ? "Reopen" : "Resolve"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingComment(comment.id);
                              setEditContent(comment.content);
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {editingComment === comment.id ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingComment(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {comment.content}
                    </p>
                  )}

                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-muted space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {reply.userName.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-xs">
                                {reply.userName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {reply.createdAt.toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply input */}
                  {replyingTo === comment.id ? (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleAddReply(comment.id)}>
                          <Send className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReplyingTo(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => setReplyingTo(comment.id)}
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  )}
                </div>
              ))}

              {filteredComments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No comments yet</p>
                  <p className="text-sm">Be the first to leave feedback!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
