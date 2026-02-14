import type { TemplateThemeConfig } from "../types";
import { createStyledTemplate } from "./styled-template";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#1F2937",
  accentColor: "#7C3AED",
  fontFamily: "'DM Sans', 'Inter', sans-serif",
  fontSize: "12px",
};

export const crativeTemplate = createStyledTemplate({
  id: "crative",
  name: "Crative",
  description: "Expressive creative layout (keeps legacy template id spelling).",
  defaultTheme,
  summaryLabel: "Creative Bio",
  style: {
    pageBackground: "linear-gradient(120deg, #EEF2FF, #FDF2F8)",
    sheetBackground: "#FFFFFF",
    sheetBorder: "1px solid #DDD6FE",
    sheetShadow: "0 16px 30px rgba(124, 58, 237, 0.15)",
    sheetRadius: "16px",
    headerBackground: "linear-gradient(120deg, #7C3AED, #EC4899)",
    headerColor: "#FFFFFF",
    sectionTitleColor: "#7C3AED",
    itemBackground: "#F5F3FF",
    itemBorder: "1px solid #DDD6FE",
    roleColor: "#5B21B6",
    companyColor: "#6D28D9",
    dateColor: "#7C3AED",
  },
});

