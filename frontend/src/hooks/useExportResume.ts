import { useCallback } from "react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { Resume, ContactInfo, ExperienceItem, EducationItem, ProjectItem, CertificationItem } from "@/types";
import { ResumeStyle, defaultStyle } from "@/components/resume/StyleCustomizer";

interface UseExportResumeOptions {
  style?: ResumeStyle;
}

export function useExportResume(options: UseExportResumeOptions = {}) {
  const { style = defaultStyle } = options;

  const exportToDocx = useCallback(async (resume: Resume) => {
    const sortedSections = [...resume.sections].sort((a, b) => a.order - b.order);
    const children: Paragraph[] = [];

    for (const section of sortedSections) {
      switch (section.type) {
        case "contact": {
          const contact = section.content as ContactInfo;
          if (!contact?.fullName && !contact?.email) continue;
          
          children.push(
            new Paragraph({
              children: [new TextRun({ text: contact.fullName || "Your Name", bold: true, size: 48 })],
              alignment: style.headerStyle === "centered" ? AlignmentType.CENTER : AlignmentType.LEFT,
              spacing: { after: 200 },
            })
          );
          
          const contactParts = [
            contact.email,
            contact.phone,
            contact.location,
            contact.linkedin,
            contact.website,
          ].filter(Boolean);
          
          if (contactParts.length > 0) {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: contactParts.join(" | "), size: 20 })],
                alignment: style.headerStyle === "centered" ? AlignmentType.CENTER : AlignmentType.LEFT,
                spacing: { after: 400 },
                border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" } },
              })
            );
          }
          break;
        }
        case "summary": {
          const summary = section.content as string;
          if (!summary) continue;
          
          children.push(
            new Paragraph({
              text: "PROFESSIONAL SUMMARY",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: summary.replace(/<[^>]*>/g, ""), size: 22 })],
              spacing: { after: 300 },
            })
          );
          break;
        }
        case "experience": {
          const experience = section.content as ExperienceItem[];
          if (!experience?.length) continue;
          
          children.push(
            new Paragraph({
              text: "WORK EXPERIENCE",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            })
          );
          
          for (const exp of experience) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: exp.position, bold: true, size: 24 }),
                  new TextRun({ text: ` | ${exp.company}`, size: 24 }),
                ],
                spacing: { before: 200 },
              }),
              new Paragraph({
                children: [new TextRun({ text: `${exp.startDate} — ${exp.current ? "Present" : exp.endDate}`, italics: true, size: 20 })],
                spacing: { after: 100 },
              })
            );
            
            if (exp.description) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: exp.description.replace(/<[^>]*>/g, ""), size: 22 })],
                  spacing: { after: 100 },
                })
              );
            }
            
            for (const highlight of exp.highlights) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: `• ${highlight}`, size: 22 })],
                  indent: { left: 360 },
                })
              );
            }
          }
          break;
        }
        case "education": {
          const education = section.content as EducationItem[];
          if (!education?.length) continue;
          
          children.push(
            new Paragraph({
              text: "EDUCATION",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            })
          );
          
          for (const edu of education) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: `${edu.degree} in ${edu.field}`, bold: true, size: 24 }),
                ],
                spacing: { before: 200 },
              }),
              new Paragraph({
                children: [new TextRun({ text: edu.institution, size: 22 })],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `${edu.startDate} — ${edu.endDate || "Present"}`, italics: true, size: 20 }),
                  ...(edu.gpa ? [new TextRun({ text: ` | GPA: ${edu.gpa}`, size: 20 })] : []),
                ],
                spacing: { after: 100 },
              })
            );
          }
          break;
        }
        case "skills": {
          const skills = section.content as string[];
          if (!skills?.length) continue;
          
          children.push(
            new Paragraph({
              text: "SKILLS",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              children: [new TextRun({ text: skills.join(" • "), size: 22 })],
              spacing: { after: 300 },
            })
          );
          break;
        }
        case "projects": {
          const projects = section.content as ProjectItem[];
          if (!projects?.length) continue;
          
          children.push(
            new Paragraph({
              text: "PROJECTS",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            })
          );
          
          for (const proj of projects) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: proj.name, bold: true, size: 24 }),
                  ...(proj.link ? [new TextRun({ text: ` (${proj.link})`, size: 20 })] : []),
                ],
                spacing: { before: 200 },
              })
            );
            
            if (proj.description) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: proj.description.replace(/<[^>]*>/g, ""), size: 22 })],
                  spacing: { after: 100 },
                })
              );
            }
            
            if (proj.technologies.length > 0) {
              children.push(
                new Paragraph({
                  children: [new TextRun({ text: `Technologies: ${proj.technologies.join(", ")}`, italics: true, size: 20 })],
                  spacing: { after: 100 },
                })
              );
            }
          }
          break;
        }
        case "certifications": {
          const certifications = section.content as CertificationItem[];
          if (!certifications?.length) continue;
          
          children.push(
            new Paragraph({
              text: "CERTIFICATIONS",
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 400, after: 200 },
            })
          );
          
          for (const cert of certifications) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({ text: cert.name, bold: true, size: 24 }),
                  new TextRun({ text: ` | ${cert.issuer}`, size: 22 }),
                ],
                spacing: { before: 100 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Issued: ${cert.date}`, italics: true, size: 20 }),
                  ...(cert.expiryDate ? [new TextRun({ text: ` | Expires: ${cert.expiryDate}`, italics: true, size: 20 })] : []),
                ],
                spacing: { after: 100 },
              })
            );
          }
          break;
        }
      }
    }

    const doc = new Document({
      sections: [{ children }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${resume.title.replace(/\s+/g, "-").toLowerCase()}.docx`);
  }, [style]);

  const exportToHtml = useCallback((resume: Resume) => {
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
            <header style="text-align: ${style.headerStyle === "centered" ? "center" : "left"}; border-bottom: 2px solid ${style.accentColor}; padding-bottom: 20px; margin-bottom: 24px;">
              <h1 style="color: ${style.accentColor}; margin: 0 0 12px 0; font-size: 32px;">${contact.fullName || "Your Name"}</h1>
              <p style="margin: 0; color: #666;">
                ${[contact.email, contact.phone, contact.location].filter(Boolean).join(" | ")}
              </p>
              <p style="margin: 8px 0 0 0; color: #666;">
                ${[contact.linkedin, contact.website].filter(Boolean).join(" | ")}
              </p>
            </header>
          `;
        }
        case "summary": {
          const summary = section.content as string;
          if (!summary) return "";
          return `
            <section style="margin-bottom: 24px;">
              <h2 style="color: ${style.accentColor}; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Professional Summary</h2>
              <p style="color: #444; line-height: 1.6;">${summary}</p>
            </section>
          `;
        }
        case "experience": {
          const experience = section.content as ExperienceItem[];
          if (!experience?.length) return "";
          return `
            <section style="margin-bottom: 24px;">
              <h2 style="color: ${style.accentColor}; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Work Experience</h2>
              ${experience.map(exp => `
                <div style="margin-bottom: 16px; padding-left: 12px; border-left: 3px solid ${style.accentColor}40;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <div>
                      <strong style="font-size: 18px;">${exp.position}</strong>
                      <span style="color: #666;"> at ${exp.company}</span>
                    </div>
                    <span style="color: #888; font-size: 14px;">${exp.startDate} — ${exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  ${exp.description ? `<p style="color: #555; margin: 8px 0;">${exp.description}</p>` : ""}
                  ${exp.highlights.length > 0 ? `<ul style="margin: 8px 0; padding-left: 20px;">${exp.highlights.map(h => `<li style="color: #555; margin: 4px 0;">${h}</li>`).join("")}</ul>` : ""}
                </div>
              `).join("")}
            </section>
          `;
        }
        case "education": {
          const education = section.content as EducationItem[];
          if (!education?.length) return "";
          return `
            <section style="margin-bottom: 24px;">
              <h2 style="color: ${style.accentColor}; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Education</h2>
              ${education.map(edu => `
                <div style="margin-bottom: 12px; padding-left: 12px; border-left: 3px solid ${style.accentColor}40;">
                  <strong>${edu.degree} in ${edu.field}</strong>
                  <p style="color: #666; margin: 4px 0;">${edu.institution}</p>
                  <p style="color: #888; font-size: 14px; margin: 0;">${edu.startDate} — ${edu.endDate || "Present"}${edu.gpa ? ` | GPA: ${edu.gpa}` : ""}</p>
                </div>
              `).join("")}
            </section>
          `;
        }
        case "skills": {
          const skills = section.content as string[];
          if (!skills?.length) return "";
          return `
            <section style="margin-bottom: 24px;">
              <h2 style="color: ${style.accentColor}; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Skills</h2>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${skills.map(skill => `<span style="background: ${style.accentColor}15; color: ${style.accentColor}; padding: 4px 12px; border-radius: 4px; font-size: 14px;">${skill}</span>`).join("")}
              </div>
            </section>
          `;
        }
        case "projects": {
          const projects = section.content as ProjectItem[];
          if (!projects?.length) return "";
          return `
            <section style="margin-bottom: 24px;">
              <h2 style="color: ${style.accentColor}; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Projects</h2>
              ${projects.map(proj => `
                <div style="margin-bottom: 12px; padding-left: 12px; border-left: 3px solid ${style.accentColor}40;">
                  <strong>${proj.name}</strong>${proj.link ? ` <a href="${proj.link}" style="color: ${style.accentColor}; font-size: 14px;">View →</a>` : ""}
                  ${proj.description ? `<p style="color: #555; margin: 8px 0;">${proj.description}</p>` : ""}
                  ${proj.technologies.length > 0 ? `<p style="color: #888; font-size: 14px; margin: 4px 0;">Technologies: ${proj.technologies.join(", ")}</p>` : ""}
                </div>
              `).join("")}
            </section>
          `;
        }
        case "certifications": {
          const certifications = section.content as CertificationItem[];
          if (!certifications?.length) return "";
          return `
            <section style="margin-bottom: 24px;">
              <h2 style="color: ${style.accentColor}; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Certifications</h2>
              ${certifications.map(cert => `
                <div style="margin-bottom: 8px; padding-left: 12px; border-left: 3px solid ${style.accentColor}40;">
                  <strong>${cert.name}</strong> <span style="color: #666;">| ${cert.issuer}</span>
                  <p style="color: #888; font-size: 14px; margin: 4px 0;">Issued: ${cert.date}${cert.expiryDate ? ` | Expires: ${cert.expiryDate}` : ""}</p>
                </div>
              `).join("")}
            </section>
          `;
        }
        default:
          return "";
      }
    };

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${resume.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${fontFamilyMap[style.fontFamily] || fontFamilyMap.inter};
      font-size: ${style.fontSize}px;
      line-height: ${style.spacing === 0.5 ? 1.3 : style.spacing === 1 ? 1.5 : 1.7};
      color: #1a1a1a;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
  </style>
</head>
<body>
  ${sortedSections.map(generateSectionHtml).join("")}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    saveAs(blob, `${resume.title.replace(/\s+/g, "-").toLowerCase()}.html`);
  }, [style]);

  return { exportToDocx, exportToHtml };
}
