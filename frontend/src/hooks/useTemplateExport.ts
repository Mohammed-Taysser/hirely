import { useCallback } from "react";
import { Resume } from "@/types";
import { ResumeStyle } from "@/components/resume/StyleCustomizer";
import { 
  TemplateConfig, 
  DEFAULT_TEMPLATE_CONFIG,
  SectionRenderConfig,
} from "@/lib/templateSchema";
import { toast } from "sonner";

interface ExportPayload {
  resume: Resume;
  template: TemplateConfig;
  exportedAt: string;
  version: string;
}

interface UseTemplateExportOptions {
  style?: ResumeStyle;
  hiddenSections?: Set<string>;
}

export function useTemplateExport({ style, hiddenSections = new Set() }: UseTemplateExportOptions = {}) {
  
  const generateExportPayload = useCallback((resume: Resume): ExportPayload => {
    // Generate section configurations from resume sections
    const sectionConfigs: SectionRenderConfig[] = resume.sections.map(section => ({
      type: section.type,
      title: section.title,
      visible: !hiddenSections.has(section.id),
      order: section.order,
    }));

    // Build template configuration
    const templateConfig: TemplateConfig = {
      id: `custom-${resume.id}`,
      name: resume.title,
      description: `Template for ${resume.title}`,
      version: "1.0.0",
      tier: resume.tier,
      typography: {
        fontFamily: style?.fontFamily || DEFAULT_TEMPLATE_CONFIG.typography.fontFamily,
        fontSize: style?.fontSize || DEFAULT_TEMPLATE_CONFIG.typography.fontSize,
        lineHeight: style?.spacing === 0.5 ? 1.3 : style?.spacing === 1 ? 1.5 : style?.spacing === 1.5 ? 1.7 : DEFAULT_TEMPLATE_CONFIG.typography.lineHeight,
        headerFontFamily: DEFAULT_TEMPLATE_CONFIG.typography.headerFontFamily,
      },
      colors: {
        ...DEFAULT_TEMPLATE_CONFIG.colors,
        primary: style?.accentColor || DEFAULT_TEMPLATE_CONFIG.colors.primary,
        accent: style?.accentColor || DEFAULT_TEMPLATE_CONFIG.colors.accent,
      },
      layout: {
        headerStyle: (style?.headerStyle as TemplateConfig["layout"]["headerStyle"]) || DEFAULT_TEMPLATE_CONFIG.layout.headerStyle,
        sectionSpacing: style?.spacing || DEFAULT_TEMPLATE_CONFIG.layout.sectionSpacing,
        contentPadding: DEFAULT_TEMPLATE_CONFIG.layout.contentPadding,
        borderStyle: DEFAULT_TEMPLATE_CONFIG.layout.borderStyle,
        showIcons: DEFAULT_TEMPLATE_CONFIG.layout.showIcons,
        columnsLayout: DEFAULT_TEMPLATE_CONFIG.layout.columnsLayout,
      },
      sections: sectionConfigs,
      preview: {
        thumbnail: "",
        headerBg: style?.accentColor || DEFAULT_TEMPLATE_CONFIG.colors.primary,
        headerText: "#ffffff",
        accentBorder: style?.accentColor || DEFAULT_TEMPLATE_CONFIG.colors.accent,
        bodyBg: DEFAULT_TEMPLATE_CONFIG.colors.background,
      },
    };

    return {
      resume: {
        ...resume,
        // Filter out hidden sections for export
        sections: resume.sections.filter(s => !hiddenSections.has(s.id)),
      },
      template: templateConfig,
      exportedAt: new Date().toISOString(),
      version: "1.0.0",
    };
  }, [style, hiddenSections]);

  const exportAsJson = useCallback((resume: Resume) => {
    const payload = generateExportPayload(resume);
    const json = JSON.stringify(payload, null, 2);
    
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resume.title.replace(/\s+/g, "-").toLowerCase()}-template.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Template exported as JSON for backend PDF generation");
  }, [generateExportPayload]);

  const copyToClipboard = useCallback(async (resume: Resume) => {
    const payload = generateExportPayload(resume);
    const json = JSON.stringify(payload, null, 2);
    
    try {
      await navigator.clipboard.writeText(json);
      toast.success("Template JSON copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  }, [generateExportPayload]);

  const getPayloadForApi = useCallback((resume: Resume) => {
    return generateExportPayload(resume);
  }, [generateExportPayload]);

  return {
    exportAsJson,
    copyToClipboard,
    getPayloadForApi,
  };
}
