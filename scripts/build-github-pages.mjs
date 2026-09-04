import { existsSync, renameSync } from "fs";
import { spawnSync } from "child_process";

const apiDir = "app/api";
const disabledApiDir = ".github-pages-disabled-api";

if (existsSync(disabledApiDir)) {
  renameSync(disabledApiDir, apiDir);
}

try {
  if (existsSync(apiDir)) {
    renameSync(apiDir, disabledApiDir);
  }

  const result = spawnSync("next", ["build"], {
    stdio: "inherit",
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
    },
  });

  process.exitCode = result.status ?? 1;
} finally {
  if (existsSync(disabledApiDir)) {
    renameSync(disabledApiDir, apiDir);
  }
}
