import CleanCSS from "clean-css";
import { minify as htmlMinify } from "html-minifier-terser";
import { minify as terserMinify } from "terser";

export function minifyCSS(css) {
  return new CleanCSS({ level: 2 }).minify(css).styles;
}

export async function minifyJS(js) {
  return (await terserMinify(js)).code;
}

export function minifyHTML(html) {
  return htmlMinify(html, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyJS: true,
    minifyCSS: true,
    sortAttributes: true,
    sortClassName: true
  });
}
