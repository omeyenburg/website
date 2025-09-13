import fs from "fs";
import path from "path";
import { minify as htmlMinify } from "html-minifier";
import CleanCSS from "clean-css";
import { minify as terserMinify } from "terser";

// Paths
const src = path.resolve("src");
const dist = path.resolve("dist");
const distCss = path.join(dist, "css");
// const distJs = path.join(dist, "js");

const baseTemplate = fs.readFileSync(path.join(src, "base.html"), "utf-8");
const navbarHTML = fs.readFileSync(path.join(src, "partials/navbar.html"), "utf-8");

// Ensure folders exist
[dist, distCss, /*distJs*/].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Minify CSS
const cssDir = path.join(src, "css");
for (const file of fs.readdirSync(cssDir)) {
  if (!file.endsWith(".css")) continue;
  const css = fs.readFileSync(path.join(cssDir, file), "utf-8");
  const minified = new CleanCSS().minify(css).styles;
  fs.writeFileSync(path.join(dist, "css", file), minified, "utf-8");
}

// Minify JS
// const jsDir = path.join(src, "js");
// for (const file of fs.readdirSync(jsDir)) {
//   if (!file.endsWith(".js")) continue;
//   const js = fs.readFileSync(path.join(jsDir, file), "utf-8");
//   const minified = await terserMinify(js).code;
//   fs.writeFileSync(path.join(dist, "js", file), minified, "utf-8");
// }

// Combine base + navbar + page content
const pagesDir = path.join(src, "pages");
for (const file of fs.readdirSync(pagesDir)) {
  if (!file.endsWith(".html")) continue;
  const content = fs.readFileSync(path.join(pagesDir, file), "utf-8");
  let pageHTML = baseTemplate.replace("{{navbar}}", navbarHTML);
  pageHTML = pageHTML.replace("{{content}}", content);
  pageHTML = htmlMinify(pageHTML, {
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
    minifyCSS: true
  });
  fs.writeFileSync(path.join(dist, file), pageHTML, "utf-8");
}

console.log("Build complete!");
