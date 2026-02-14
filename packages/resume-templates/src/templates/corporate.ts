import type { TemplateThemeConfig } from "../types";
import { createStyledTemplate } from "./styled-template";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#111827",
  accentColor: "#2563EB",
  fontFamily: "'Source Sans 3', 'Inter', sans-serif",
  fontSize: "12px",
};

export const corporateTemplate = createStyledTemplate({
  id: "corporate",
  name: "Corporate",
  description: "Formal enterprise-ready style with clean hierarchy.",
  defaultTheme,
  summaryLabel: "Professional Profile",
  style: {
    pageBackground: "#F1F5F9",
    sheetBackground: "#FFFFFF",
    sheetBorder: "1px solid #CBD5E1",
    sheetShadow: "0 10px 18px rgba(15, 23, 42, 0.12)",
    headerBackground: "#0F172A",
    headerColor: "#F8FAFC",
    sectionTitleColor: "#1E40AF",
    itemBackground: "#F8FAFC",
    itemBorder: "1px solid #E2E8F0",
    roleColor: "#0F172A",
    companyColor: "#334155",
    dateColor: "#64748B",
  },
});

