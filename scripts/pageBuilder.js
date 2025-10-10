import fs from "fs";
import path from "path";
import { minifyCSS } from "./minify.js";

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
  html = addPageResources(html, pageId);
  html = html.replace("{{content}}", content);

  labeledPlaceholders.forEach(placeholder => {
    if (placeholder[1] === "nav-button") {
      const query = `{{${placeholder[1]}:${placeholder[2]}}}`;
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

  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        files.push(fullPath);
      }
    }
  }

  walk(pagesDir);
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

function addPageResources(html, pageId) {
  const jsFilePath = path.join(src, "js", pageId + ".js");
  const cssFilePath = path.join(src, "css", pageId + ".css");
  const cssEmbeddedFilePath = path.join(src, "css-embedded", pageId + ".css");

  if (fs.existsSync(jsFilePath)) {
    html = html.replace("{{page-js}}", `<script src="js/${pageId}.js" defer></script>`);
  } else {
    html = html.replace("{{page-js}}", "");
  }

  if (fs.existsSync(cssFilePath)) {
    html = html.replace("{{page-css}}", `<link rel="stylesheet" href="css/${pageId}.css">`);
  } else {
    html = html.replace("{{page-css}}", "");
  }

  if (fs.existsSync(cssEmbeddedFilePath)) {
    const css = minifyCSS(fs.readFileSync(cssEmbeddedFilePath, "utf-8"));
    html = html.replace("{{page-css-embedded}}", `<style>${css}</style>`);
  } else {
    html = html.replace("{{page-css-embedded}}", "");
  }

  return html;
}
