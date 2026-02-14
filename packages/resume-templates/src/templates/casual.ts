import type { TemplateThemeConfig } from "../types";
import { createStyledTemplate } from "./styled-template";

const defaultTheme: TemplateThemeConfig = {
  primaryColor: "#1F2937",
  accentColor: "#0F766E",
  fontFamily: "'Nunito Sans', 'Inter', sans-serif",
  fontSize: "12px",
};

export const casualTemplate = createStyledTemplate({
  id: "casual",
  name: "Casual",
  description: "Friendly modern layout with soft colors and relaxed styling.",
  defaultTheme,
  summaryLabel: "About",
  style: {
    pageBackground: "#ECFEFF",
    sheetBackground: "#FFFFFF",
    sheetBorder: "1px solid #A5F3FC",
    sheetShadow: "0 12px 22px rgba(15, 118, 110, 0.12)",
    sheetRadius: "16px",
    headerBackground: "#14B8A6",
    headerColor: "#F0FDFA",
    sectionTitleColor: "#0F766E",
    itemBackground: "#F0FDFA",
    itemBorder: "1px solid #99F6E4",
    roleColor: "#134E4A",
    companyColor: "#0F766E",
    dateColor: "#115E59",
  },
});

