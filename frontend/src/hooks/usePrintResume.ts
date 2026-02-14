import { useCallback } from "react";
import { Resume, ContactInfo, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "@/types";
import { ResumeStyle, defaultStyle } from "@/components/resume/StyleCustomizer";

interface UsePrintResumeOptions {
  style?: ResumeStyle;
}

export function usePrintResume(options: UsePrintResumeOptions = {}) {
  const { style = defaultStyle } = options;

  const printResume = useCallback((resume: Resume) => {
    const sortedSections = [...resume.sections].sort((a, b) => a.order - b.order);

    const fontFamilyMap: Record<string, string> = {
      inter: "'Inter', sans-serif",
      georgia: "Georgia, serif",
      times: "'Times New Roman', serif",
      helvetica: "Helvetica, Arial, sans-serif",
    };

    const generateSectionHtml = (section: Resume["sections"][0]): string => {
      switch (section.type) {
        case "contact": {
          const contact = section.content as ContactInfo;
          if (!contact?.fullName && !contact?.email) return "";
          return `
            <div class="contact-section">
              <h1 style="color: ${style.accentColor}; margin: 0 0 12px 0; font-size: 28px;">${contact.fullName || "Your Name"}</h1>
              <div class="contact-info">
                ${contact.email ? `<span>📧 ${contact.email}</span>` : ""}
                ${contact.phone ? `<span>📱 ${contact.phone}</span>` : ""}
                ${contact.location ? `<span>📍 ${contact.location}</span>` : ""}
              </div>
              <div class="contact-links">
                ${contact.linkedin ? `<span>🔗 ${contact.linkedin}</span>` : ""}
                ${contact.website ? `<span>🌐 ${contact.website}</span>` : ""}
              </div>
            </div>
          `;
        }
        case "summary": {
          const summary = section.content as string;
          if (!summary) return "";
          return `
            <div class="section">
              <h2 style="color: ${style.accentColor}">Professional Summary</h2>
              <p>${summary}</p>
            </div>
          `;
        }
        case "experience": {
          const experience = section.content as ExperienceItem[];
          if (!experience?.length) return "";
          return `
            <div class="section">
              <h2 style="color: ${style.accentColor}">Work Experience</h2>
              ${experience.map(exp => `
                <div class="item">
                  <div class="item-header">
                    <div>
                      <strong>${exp.position}</strong>
                      <div class="company">${exp.company}</div>
                    </div>
                    <span class="date">${exp.startDate} — ${exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  ${exp.description ? `<div class="description">${exp.description}</div>` : ""}
                  ${exp.highlights.length > 0 ? `
                    <ul>
                      ${exp.highlights.map(h => `<li>${h}</li>`).join("")}
                    </ul>
                  ` : ""}
                </div>
              `).join("")}
            </div>
          `;
        }
        case "education": {
          const education = section.content as EducationItem[];
          if (!education?.length) return "";
          return `
            <div class="section">
              <h2 style="color: ${style.accentColor}">Education</h2>
              ${education.map(edu => `
                <div class="item">
                  <div class="item-header">
                    <div>
                      <strong>${edu.degree} in ${edu.field}</strong>
                      <div class="company">${edu.institution}</div>
                    </div>
                    <span class="date">${edu.startDate} — ${edu.endDate || "Present"}</span>
                  </div>
                  ${edu.gpa ? `<div class="gpa">GPA: ${edu.gpa}</div>` : ""}
                </div>
              `).join("")}
            </div>
          `;
        }
        case "projects": {
          const projects = section.content as ProjectItem[];
          if (!projects?.length) return "";
          return `
            <div class="section">
              <h2 style="color: ${style.accentColor}">Projects</h2>
              ${projects.map(proj => `
                <div class="item">
                  <div class="item-header">
                    <strong>${proj.name}</strong>
                    ${proj.link ? `<a href="${proj.link}" target="_blank">View →</a>` : ""}
                  </div>
                  ${proj.description ? `<div class="description">${proj.description}</div>` : ""}
                  ${proj.technologies.length > 0 ? `
                    <div class="tags">
                      ${proj.technologies.map(tech => `<span class="tag" style="background: ${style.accentColor}20; color: ${style.accentColor}">${tech}</span>`).join("")}
                    </div>
                  ` : ""}
                </div>
              `).join("")}
            </div>
          `;
        }
        case "certifications": {
          const certifications = section.content as CertificationItem[];
          if (!certifications?.length) return "";
          return `
            <div class="section">
              <h2 style="color: ${style.accentColor}">Certifications</h2>
              ${certifications.map(cert => `
                <div class="item">
                  <strong>${cert.name}</strong>
                  <div class="company">${cert.issuer}</div>
                  <div class="date-small">Issued: ${cert.date}${cert.expiryDate ? ` • Expires: ${cert.expiryDate}` : ""}${cert.credentialId ? ` • ID: ${cert.credentialId}` : ""}</div>
                </div>
              `).join("")}
            </div>
          `;
        }
        case "skills": {
          const skills = section.content as string[];
          if (!skills?.length) return "";
          return `
            <div class="section">
              <h2 style="color: ${style.accentColor}">Skills</h2>
              <div class="tags">
                ${skills.map(skill => `<span class="tag" style="background: ${style.accentColor}20; color: ${style.accentColor}">${skill}</span>`).join("")}
              </div>
            </div>
          `;
        }
        default:
          return "";
      }
    };

    const sectionsHtml = sortedSections.map(generateSectionHtml).join("");

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${resume.title} - Resume</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: ${fontFamilyMap[style.fontFamily] || fontFamilyMap.inter};
              font-size: ${style.fontSize}px;
              line-height: ${style.spacing === 0.5 ? 1.3 : style.spacing === 1 ? 1.5 : 1.7};
              color: #1a1a1a;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            
            .contact-section {
              text-align: ${style.headerStyle === "centered" ? "center" : "left"};
              border-bottom: 2px solid ${style.accentColor};
              padding-bottom: 20px;
              margin-bottom: 24px;
            }
            
            .contact-info, .contact-links {
              display: flex;
              gap: 16px;
              flex-wrap: wrap;
              justify-content: ${style.headerStyle === "centered" ? "center" : "flex-start"};
              margin-top: 8px;
              color: #666;
              font-size: 14px;
            }
            
            .section {
              margin-bottom: 24px;
            }
            
            .section h2 {
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 12px;
              padding-bottom: 4px;
              border-bottom: 1px solid #eee;
            }
            
            .item {
              margin-bottom: 16px;
              padding-left: 12px;
              border-left: 2px solid ${style.accentColor}50;
            }
            
            .item-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              gap: 16px;
            }
            
            .company {
              color: #666;
              font-size: 14px;
            }
            
            .date {
              color: #888;
              font-size: 12px;
              white-space: nowrap;
            }
            
            .date-small {
              color: #888;
              font-size: 11px;
            }
            
            .description {
              margin-top: 8px;
              color: #555;
              font-size: 14px;
            }
            
            .gpa {
              font-size: 12px;
              color: #666;
              margin-top: 4px;
            }
            
            ul {
              margin-top: 8px;
              padding-left: 20px;
            }
            
            li {
              color: #555;
              font-size: 14px;
              margin-bottom: 4px;
            }
            
            .tags {
              display: flex;
              flex-wrap: wrap;
              gap: 6px;
              margin-top: 8px;
            }
            
            .tag {
              padding: 4px 10px;
              border-radius: 4px;
              font-size: 12px;
            }
            
            a {
              color: ${style.accentColor};
              text-decoration: none;
            }
            
            @media print {
              body {
                padding: 0;
              }
              
              @page {
                margin: 0.5in;
              }
            }
          </style>
        </head>
        <body>
          ${sectionsHtml}
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      // Slight delay to ensure styles are loaded
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }, [style]);

  return { printResume };
}
