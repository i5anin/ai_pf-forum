const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

try {
  const gitDir = path.join(__dirname);
  const commitTemplatePath = path.join(__dirname, "COMMIT_TEMPLATE.md");
  const gitChangesPath = path.join(gitDir, "commit_report.md");

  // Читаем шаблон коммита
  const commitTemplate = fs.existsSync(commitTemplatePath)
      ? fs.readFileSync(commitTemplatePath, "utf-8").trim()
      : "Шаблон коммита отсутствует.";

  // Отображение всех файлов, включая неотслеживаемые
  const trackedStatus = execSync("git status --short", { encoding: "utf-8" }).trim();
  const untrackedFiles = execSync("git ls-files --others --exclude-standard", { encoding: "utf-8" }).trim();

  // Показываем diff даже для новых файлов с `--no-index`
  const unstagedDiff = execSync("git diff --no-index . . || true", { encoding: "utf-8" }).trim();
  const stagedDiff = execSync("git diff --cached", { encoding: "utf-8" }).trim();

  let output = `# Git Changes Report\n\n`;

  if (trackedStatus) {
    output += `## 📌 Изменённые файлы (Tracked & Untracked):\n\`\`\`\n${trackedStatus}\n\`\`\`\n\n`;
  }

  if (untrackedFiles) {
    output += `## 📌 Неотслеживаемые файлы:\n\`\`\`\n${untrackedFiles}\n\`\`\`\n\n`;
  }

  if (unstagedDiff) {
    output += `## 📌 Разница (Unstaged Changes):\n\`\`\`diff\n${unstagedDiff}\n\`\`\`\n\n`;
  }

  if (stagedDiff) {
    output += `## 📌 Разница (Staged Changes):\n\`\`\`diff\n${stagedDiff}\n\`\`\`\n\n`;
  }

  output += `---\n\n## 📜 Шаблон коммита\n${commitTemplate}\n`;

  fs.writeFileSync(gitChangesPath, output.trim());

  console.log(`✅  Изменения сохранены в ${gitChangesPath}. Отправь мне этот файл!`);
} catch (error) {
  console.error("❌ Ошибка при выполнении Git-команд:", error.message);
}
