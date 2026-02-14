import type { TemplateThemeConfig } from "../types";
import { createStyledTemplate } from "./styled-template";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#0F172A",
  accentColor: "#0284C7",
  fontFamily: "'IBM Plex Sans', 'Inter', sans-serif",
  fontSize: "11px",
};

export const blueprintTemplate = createStyledTemplate({
  id: "blueprint",
  name: "Blueprint",
  description: "Structured technical look inspired by blueprint systems.",
  defaultTheme,
  summaryLabel: "Overview",
  dateSeparator: " -> ",
  style: {
    pageBackground: "#E0F2FE",
    sheetBackground: "#F8FAFC",
    sheetBorder: "1px solid #7DD3FC",
    sheetShadow: "0 14px 28px rgba(2, 132, 199, 0.16)",
    headerBackground: "#0C4A6E",
    headerColor: "#E0F2FE",
    sectionTitleColor: "#0369A1",
    itemBackground: "#FFFFFF",
    itemBorder: "1px solid #BAE6FD",
    roleColor: "#0C4A6E",
    companyColor: "#075985",
    dateColor: "#0369A1",
  },
});

