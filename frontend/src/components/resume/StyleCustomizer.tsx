import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette, Type, X } from "lucide-react";

export interface ResumeStyle {
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  spacing: number;
  headerStyle: "centered" | "left" | "compact";
}

const defaultStyle: ResumeStyle = {
  accentColor: "#6366f1",
  fontFamily: "inter",
  fontSize: 14,
  spacing: 1,
  headerStyle: "centered",
};

const accentColors = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#0ea5e9", label: "Sky" },
  { value: "#10b981", label: "Emerald" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#ef4444", label: "Red" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Pink" },
  { value: "#1f2937", label: "Dark" },
];

const fontFamilies = [
  { value: "inter", label: "Inter" },
  { value: "georgia", label: "Georgia" },
  { value: "times", label: "Times" },
  { value: "helvetica", label: "Helvetica" },
];

interface StyleCustomizerProps {
  style: ResumeStyle;
  onChange: (style: ResumeStyle) => void;
  onClose: () => void;
}

export function StyleCustomizer({ style, onChange, onClose }: StyleCustomizerProps) {
  const updateStyle = (key: keyof ResumeStyle, value: ResumeStyle[keyof ResumeStyle]) => {
    onChange({ ...style, [key]: value });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5" />
            Customize Style
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Accent Color */}
        <div className="space-y-3">
          <Label>Accent Color</Label>
          <div className="flex flex-wrap gap-2">
            {accentColors.map((color) => (
              <button
                key={color.value}
                onClick={() => updateStyle("accentColor", color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  style.accentColor === color.value
                    ? "border-foreground scale-110"
                    : "border-transparent hover:scale-105"
                }`}
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            Font Family
          </Label>
          <RadioGroup
            value={style.fontFamily}
            onValueChange={(value) => updateStyle("fontFamily", value)}
            className="grid grid-cols-2 gap-2"
          >
            {fontFamilies.map((font) => (
              <div key={font.value} className="flex items-center space-x-2">
                <RadioGroupItem value={font.value} id={font.value} />
                <Label
                  htmlFor={font.value}
                  className="cursor-pointer"
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Font Size</Label>
            <span className="text-sm text-muted-foreground">{style.fontSize}px</span>
          </div>
          <Slider
            value={[style.fontSize]}
            onValueChange={(value) => updateStyle("fontSize", value[0])}
            min={12}
            max={18}
            step={1}
          />
        </div>

        {/* Spacing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Spacing</Label>
            <span className="text-sm text-muted-foreground">
              {style.spacing === 0.5 ? "Compact" : style.spacing === 1 ? "Normal" : "Relaxed"}
            </span>
          </div>
          <Slider
            value={[style.spacing]}
            onValueChange={(value) => updateStyle("spacing", value[0])}
            min={0.5}
            max={1.5}
            step={0.5}
          />
        </div>

        {/* Header Style */}
        <div className="space-y-3">
          <Label>Header Layout</Label>
          <RadioGroup
            value={style.headerStyle}
            onValueChange={(value) => updateStyle("headerStyle", value as ResumeStyle["headerStyle"])}
            className="grid grid-cols-3 gap-2"
          >
            {[
              { value: "centered", label: "Centered" },
              { value: "left", label: "Left" },
              { value: "compact", label: "Compact" },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onChange(defaultStyle)}
        >
          Reset to Default
        </Button>
      </CardContent>
    </Card>
  );
}

export { defaultStyle };
