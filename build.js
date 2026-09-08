const fs = require("fs");
const path = require("path");

const root = __dirname;
const templatePath = path.join(root, "src", "template.html");
const partialsDir = path.join(root, "src", "partials");
const outputPath = path.join(root, "index.html");

const template = fs.readFileSync(templatePath, "utf8");

const output = template.replace(/<!--@include (\w+)-->/g, (match, name) => {
  const partialPath = path.join(partialsDir, `${name}.html`);
  if (!fs.existsSync(partialPath)) {
    throw new Error(`Partial não encontrado: ${partialPath}`);
  }
  return fs.readFileSync(partialPath, "utf8").replace(/\n$/, "");
});

fs.writeFileSync(outputPath, output, "utf8");
console.log(`index.html gerado a partir de src/partials (${output.length} caracteres).`);
