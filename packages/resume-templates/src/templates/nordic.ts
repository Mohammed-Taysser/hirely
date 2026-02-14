import type { TemplateThemeConfig } from "../types";
import { createStyledTemplate } from "./styled-template";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#1E293B",
  accentColor: "#0891B2",
  fontFamily: "'Public Sans', 'Inter', sans-serif",
  fontSize: "12px",
};

export const nordicTemplate = createStyledTemplate({
  id: "nordic",
  name: "Nordic",
  description: "Scandinavian-inspired minimalist palette and spacing.",
  defaultTheme,
  summaryLabel: "Profile",
  style: {
    pageBackground: "#F8FAFC",
    sheetBackground: "#FFFFFF",
    sheetBorder: "1px solid #E2E8F0",
    sheetShadow: "0 10px 16px rgba(30, 41, 59, 0.08)",
    headerBackground: "#E2E8F0",
    headerColor: "#0F172A",
    sectionTitleColor: "#0E7490",
    itemBackground: "#F8FAFC",
    itemBorder: "1px solid #E2E8F0",
    roleColor: "#0F172A",
    companyColor: "#334155",
    dateColor: "#64748B",
  },
});

