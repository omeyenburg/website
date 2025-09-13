import fs from "fs";
import path from "path";
import { minify as htmlMinify } from "html-minifier";
import CleanCSS from "clean-css";
import { minify as terserMinify } from "terser";
import { buildPage, getHtmlFilePaths, getRelativePath } from "./pageBuilder.js";

const fastBuild = (process.argv[2] === "fast");

// Paths
const src = path.resolve("src");
const dist = path.resolve("dist");
const distCss = path.join(dist, "css");
const distJs = path.join(dist, "js");

// Remove old build files
if (fs.existsSync(dist)) {
  fs.readdirSync(dist).forEach(file => {
    const curPath = path.join(dist, file);
    fs.rmSync(curPath, { recursive: true, force: true });
  });
}

// Create folders
[dist, distCss, distJs].forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
});

// Minify CSS
const cssDir = path.join(src, "css");
if (fs.existsSync(cssDir)) {
  for (const file of fs.readdirSync(cssDir)) {
    if (!file.endsWith(".css")) continue;
    let css = fs.readFileSync(path.join(cssDir, file), "utf-8");

    if (!fastBuild) {
      css = new CleanCSS().minify(css).styles;
    }

    fs.writeFileSync(path.join(dist, "css", file), css, "utf-8");
  }
}

// Minify JS
const jsDir = path.join(src, "js");
if (fs.existsSync(jsDir)) {
  for (const file of fs.readdirSync(jsDir)) {
    if (!file.endsWith(".js")) continue;
    let js = fs.readFileSync(path.join(jsDir, file), "utf-8");

    if (!fastBuild) {
      js = await terserMinify(js).code;
    }

    fs.writeFileSync(path.join(dist, "js", file), js, "utf-8");
  }
}

// Build minified html
const htmlFiles = getHtmlFilePaths();
for (const filePath of htmlFiles) {
  let html = buildPage(filePath);

  if (!fastBuild) {
    html = htmlMinify(html, {
      collapseWhitespace: true,
      removeComments: true,
      minifyJS: true,
      minifyCSS: true
    });
  }

  // Preserve relative paths for nested files
  const relativePath = getRelativePath(filePath);
  const outPath = path.join(dist, relativePath);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html, "utf-8");
}

console.log("Build complete!");
