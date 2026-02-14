import type { TemplateThemeConfig } from "../types";
import { createStyledTemplate } from "./styled-template";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#111827",
  accentColor: "#1D4ED8",
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: "12px",
};

export const businessTemplate = createStyledTemplate({
  id: "business",
  name: "Business",
  description: "Balanced corporate resume style for professional applications.",
  defaultTheme,
  summaryLabel: "Executive Summary",
  style: {
    pageBackground: "#EFF6FF",
    sheetBackground: "#FFFFFF",
    sheetBorder: "1px solid #BFDBFE",
    sheetShadow: "0 12px 24px rgba(29, 78, 216, 0.12)",
    headerBackground: "#1E3A8A",
    headerColor: "#FFFFFF",
    sectionTitleColor: "#1D4ED8",
    itemBackground: "#F8FAFC",
    itemBorder: "1px solid #E2E8F0",
    roleColor: "#0F172A",
    companyColor: "#334155",
    dateColor: "#64748B",
  },
});

