import type { TemplateThemeConfig } from "../types";
import { createStyledTemplate } from "./styled-template";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#1F2937",
  accentColor: "#DB2777",
  fontFamily: "'Nunito', 'Inter', sans-serif",
  fontSize: "12px",
};

export const artisticTemplate = createStyledTemplate({
  id: "artistic",
  name: "Artistic",
  description: "Creative profile style with vibrant visual accents.",
  defaultTheme,
  summaryLabel: "Creative Summary",
  style: {
    pageBackground: "linear-gradient(120deg, #FFF1F2, #FDF4FF)",
    sheetBackground: "#FFFFFF",
    sheetBorder: "1px solid #FBCFE8",
    sheetShadow: "0 18px 35px rgba(219, 39, 119, 0.12)",
    sheetRadius: "14px",
    headerBackground: "linear-gradient(120deg, #DB2777, #9333EA)",
    headerColor: "#FFFFFF",
    sectionTitleColor: "#BE185D",
    itemBackground: "#FFF7ED",
    itemBorder: "1px solid #FED7AA",
    roleColor: "#7C2D12",
    companyColor: "#9A3412",
    dateColor: "#9A3412",
  },
});

