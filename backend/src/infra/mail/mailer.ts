import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT || 587);
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

if (!host || !user || !pass) {
  throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS are required");
}

export const mailer = nodemailer.createTransport({
  host,
  port,
  auth: { user, pass },
});
