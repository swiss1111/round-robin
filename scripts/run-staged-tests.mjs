import { execSync } from "node:child_process";

function getStagedFiles() {
  const out = execSync("git diff --cached --name-only", {
    encoding: "utf8",
  }).trim();
  if (!out) return [];
  return out.split(/\r?\n/).filter(Boolean);
}

function run(command) {
  execSync(command, { stdio: "inherit" });
}

const stagedFiles = getStagedFiles();
const relatedTargets = stagedFiles.filter((f) =>
  /\.(ts|tsx|js|mjs|cjs)$/.test(f),
);
const e2eTargets = stagedFiles.filter((f) => /^e2e\/.*\.spec\.ts$/.test(f));

if (relatedTargets.length > 0) {
  const args = relatedTargets.map((f) => `"${f}"`).join(" ");
  run(`npx vitest related --run ${args}`);
} else {
  console.log("No staged JS/TS files, skipping related unit tests.");
}

if (e2eTargets.length > 0) {
  const args = e2eTargets.map((f) => `"${f}"`).join(" ");
  run(`npx playwright test ${args}`);
} else {
  console.log("No staged E2E spec files, skipping staged E2E tests.");
}
