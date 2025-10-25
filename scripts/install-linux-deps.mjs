import { execSync } from "node:child_process";

const TARGET_DEPS = [
  {
    name: "lightningcss-linux-x64-gnu",
    version: "1.30.2",
  },
  {
    name: "@tailwindcss/oxide-linux-x64-gnu",
    version: "4.1.16",
  },
];

if (process.platform !== "linux") {
  process.exit(0);
}

for (const { name, version } of TARGET_DEPS) {
  try {
    require.resolve(name);
    continue;
  } catch {
    // dependency missing, install it
  }

  const spec = `${name}@${version}`;
  try {
    execSync(`npm install ${spec} --no-save --ignore-scripts`, {
      stdio: "inherit",
    });
  } catch (error) {
    console.warn(
      `[install-linux-deps] Failed to install ${spec}: ${error.message}`
    );
    throw error;
  }
}
