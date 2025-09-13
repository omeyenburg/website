import fs from "fs";
import path from "path";

const src = path.resolve("src");
const pagesDir = path.join(src, "pages");

let base = fs.readFileSync(path.join(src, "base.html"), "utf-8");
const navbar = fs.readFileSync(path.join(src, "partials/navbar.html"), "utf-8");

base = base.replace("{{navbar}}", navbar);
const labeledPlaceholders = [...base.matchAll(/\{\{(.*?):(.*?)\}\}/g)];


export function buildPage(filePath) {
  const pageId = getPageId(filePath)
  const content = fs.readFileSync(filePath, "utf-8");

  let html = base;
  html = html.replace("{{content}}", content);

  labeledPlaceholders.forEach(placeholder => {
    if (placeholder[1] === "nav-button") {
      const query = `{{${placeholder[1]}:${placeholder[2]}}}`;
      // console.log(query)
      if (placeholder[2] === pageId) {
        html = html.replace(query, 'class="nav-item-active"');
      } else {
        html = html.replace(query, "");
      }
    }
  });

  return html;
}

export function getRelativePath(filePath) {
  return path.relative(pagesDir, filePath);
}

export function getHtmlFilePaths() {
  const files = [];
  for (const entry of fs.readdirSync(pagesDir, { withFileTypes: true })) {
    const fullPath = path.join(pagesDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(fullPath);
    }
  }
  return files;
}

function getPageId(filePath) {
  const relativePath = getRelativePath(filePath);
  const segments = relativePath.split(path.sep);

  // If nested, take first segment, else take file name without extension
  if (segments.length > 1) {
    return segments[0]; // folder name
  } else {
    return path.basename(relativePath, ".html");
  }
}
