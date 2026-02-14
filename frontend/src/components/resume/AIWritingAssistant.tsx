import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  X,
  RefreshCw,
  Zap,
} from "lucide-react";

interface WritingSuggestion {
  type: "improvement" | "warning" | "tip";
  title: string;
  description: string;
  example?: string;
}

interface AIWritingAssistantProps {
  text: string;
  sectionType: string;
  onClose: () => void;
}

const analyzeText = (text: string, sectionType: string): WritingSuggestion[] => {
  const suggestions: WritingSuggestion[] = [];
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);

  // Check for weak words
  const weakWords = ["very", "really", "just", "actually", "basically", "literally", "things", "stuff", "nice", "good"];
  const foundWeakWords = weakWords.filter(w => text.toLowerCase().includes(w));
  if (foundWeakWords.length > 0) {
    suggestions.push({
      type: "improvement",
      title: "Replace weak words",
      description: `Consider replacing weak words like "${foundWeakWords.slice(0, 3).join(", ")}" with more specific, impactful alternatives.`,
      example: `"Very good" → "Exceptional" | "Really fast" → "Rapid" | "Nice results" → "Outstanding results"`,
    });
  }

  // Check for passive voice indicators
  const passiveIndicators = ["was", "were", "been", "being", "is", "are", "am"];
  const passivePattern = new RegExp(`\\b(${passiveIndicators.join("|")})\\s+\\w+ed\\b`, "gi");
  const passiveMatches = text.match(passivePattern);
  if (passiveMatches && passiveMatches.length > 0) {
    suggestions.push({
      type: "improvement",
      title: "Use active voice",
      description: "Your text may contain passive voice. Active voice is more direct and impactful for resumes.",
      example: `"The project was completed by me" → "I completed the project"`,
    });
  }

  // Check for quantifiable results
  const hasNumbers = /\d+/.test(text);
  if (sectionType === "experience" && !hasNumbers) {
    suggestions.push({
      type: "tip",
      title: "Add quantifiable results",
      description: "Include specific numbers, percentages, or metrics to demonstrate your impact.",
      example: `"Improved sales" → "Improved sales by 35% in Q4 2023"`,
    });
  }

  // Check for action verbs at the start
  if (sectionType === "experience") {
    const startsWithAction = sentences.some(s => {
      const firstWord = s.trim().split(" ")[0]?.toLowerCase();
      const actionVerbs = ["led", "managed", "developed", "created", "implemented", "designed", "built", "launched", "drove", "achieved", "increased", "reduced", "improved", "established", "coordinated", "executed"];
      return actionVerbs.some(v => firstWord?.includes(v));
    });

    if (!startsWithAction && sentences.length > 0) {
      suggestions.push({
        type: "tip",
        title: "Start with action verbs",
        description: "Begin bullet points with strong action verbs to make your achievements more impactful.",
        example: `"Responsible for managing..." → "Managed..." | "Helped with..." → "Collaborated on..."`,
      });
    }
  }

  // Check sentence length
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 25);
  if (longSentences.length > 0) {
    suggestions.push({
      type: "warning",
      title: "Simplify long sentences",
      description: "Some sentences are too long. Break them into shorter, clearer statements for better readability.",
    });
  }

  // Check for buzzwords overuse
  const buzzwords = ["synergy", "leverage", "paradigm", "disrupt", "innovative", "cutting-edge", "best-in-class", "world-class"];
  const foundBuzzwords = buzzwords.filter(b => text.toLowerCase().includes(b));
  if (foundBuzzwords.length >= 2) {
    suggestions.push({
      type: "warning",
      title: "Reduce buzzwords",
      description: "Too many buzzwords can make your resume seem generic. Replace with specific, concrete achievements.",
    });
  }

  // Word count feedback for summary
  if (sectionType === "summary") {
    if (words.length < 30) {
      suggestions.push({
        type: "improvement",
        title: "Expand your summary",
        description: "Your summary is quite short. Aim for 50-100 words to effectively communicate your value proposition.",
      });
    } else if (words.length > 150) {
      suggestions.push({
        type: "warning",
        title: "Shorten your summary",
        description: "Your summary is too long. Keep it concise (50-100 words) to maintain recruiter attention.",
      });
    } else {
      suggestions.push({
        type: "improvement",
        title: "Good length",
        description: "Your summary length is appropriate. Make sure it highlights your unique value and key achievements.",
      });
    }
  }

  // Check for first-person pronouns (should be avoided in resumes)
  const pronounCount = (text.match(/\b(I|me|my|myself)\b/gi) || []).length;
  if (pronounCount > 2) {
    suggestions.push({
      type: "tip",
      title: "Minimize pronouns",
      description: "Reduce first-person pronouns (I, me, my) in your resume. Start directly with action verbs.",
      example: `"I managed a team" → "Managed a team of 5 engineers"`,
    });
  }

  // Positive feedback if text is well-written
  if (suggestions.filter(s => s.type !== "tip").length === 0 && text.length > 50) {
    suggestions.push({
      type: "improvement",
      title: "Looking good!",
      description: "Your writing is clear and professional. Consider adding more specific metrics or achievements if applicable.",
    });
  }

  return suggestions;
};

const calculateScore = (suggestions: WritingSuggestion[]): number => {
  let score = 100;
  suggestions.forEach(s => {
    if (s.type === "warning") score -= 15;
    if (s.type === "improvement" && !s.title.includes("Good")) score -= 5;
  });
  return Math.max(0, Math.min(100, score));
};

export function AIWritingAssistant({ text, sectionType, onClose }: AIWritingAssistantProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const suggestions = useMemo(() => {
    return analyzeText(text, sectionType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, sectionType, refreshKey]);

  const score = calculateScore(suggestions);

  const getIcon = (type: WritingSuggestion["type"]) => {
    switch (type) {
      case "improvement":
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case "tip":
        return <Lightbulb className="h-4 w-4 text-green-500" />;
    }
  };

  const getBadgeVariant = (type: WritingSuggestion["type"]) => {
    switch (type) {
      case "improvement":
        return "secondary";
      case "warning":
        return "destructive";
      case "tip":
        return "default";
    }
  };

  const getScoreColor = () => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  const getProgressColor = () => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card className="border-primary/20 bg-card/95 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Writing Assistant
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRefreshKey(k => k + 1)}
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Zap className={`h-5 w-5 ${getScoreColor()}`} />
            <span className={`text-2xl font-bold ${getScoreColor()}`}>{score}</span>
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">Writing Quality Score</p>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getProgressColor()}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Suggestions */}
        {text.length < 20 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start typing to get writing suggestions</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="rounded-lg border border-border/50 bg-background/50 p-3"
              >
                <div className="flex items-start gap-2">
                  {getIcon(suggestion.type)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{suggestion.title}</span>
                      <Badge variant={getBadgeVariant(suggestion.type)} className="text-xs px-1.5 py-0">
                        {suggestion.type === "improvement" ? "Improve" : suggestion.type === "warning" ? "Fix" : "Tip"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{suggestion.description}</p>
                    {suggestion.example && (
                      <p className="text-xs text-primary/80 bg-primary/5 rounded px-2 py-1 mt-1 font-mono">
                        {suggestion.example}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {text.length >= 20 && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <span>{text.split(/\s+/).filter(Boolean).length} words</span>
            <span>{text.split(/[.!?]+/).filter(Boolean).length} sentences</span>
            <span>{suggestions.filter(s => s.type === "tip").length} tips</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
