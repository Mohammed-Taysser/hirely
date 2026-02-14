import type { TemplateThemeConfig } from "../types";
import { createStyledTemplate } from "./styled-template";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#0F172A",
  accentColor: "#0EA5E9",
  fontFamily: "'Lato', 'Inter', sans-serif",
  fontSize: "12px",
};

export const professionalTemplate = createStyledTemplate({
  id: "professional",
  name: "Professional",
  description: "Reliable professional layout optimized for readability.",
  defaultTheme,
  summaryLabel: "Summary",
  style: {
    pageBackground: "#F8FAFC",
    sheetBackground: "#FFFFFF",
    sheetBorder: "1px solid #CBD5E1",
    sheetShadow: "0 10px 20px rgba(14, 116, 144, 0.12)",
    headerBackground: "#0369A1",
    headerColor: "#F0F9FF",
    sectionTitleColor: "#0369A1",
    itemBackground: "#F0F9FF",
    itemBorder: "1px solid #BAE6FD",
    roleColor: "#0C4A6E",
    companyColor: "#075985",
    dateColor: "#0369A1",
  },
});

