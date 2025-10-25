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
  console.log(
    `[install-linux-deps] Skipping native dependency install on ${process.platform}.`
  );
  process.exit(0);
}

const missingSpecs = TARGET_DEPS.reduce((acc, { name, version }) => {
  try {
    require.resolve(name);
    return acc;
  } catch {
    acc.push(`${name}@${version}`);
    return acc;
  }
}, []);

if (missingSpecs.length === 0) {
  console.log(
    "[install-linux-deps] Native Linux dependencies already present. Skipping installation."
  );
  process.exit(0);
}

const command = `npm install ${missingSpecs.join(
  " "
)} --no-save --ignore-scripts --no-package-lock`;

console.log(
  "[install-linux-deps] Installing LightningCSS native dependencies for Linux..."
);

try {
  execSync(command, { stdio: "inherit", env: process.env });
  console.log("[install-linux-deps] LightningCSS native dependencies ready.");
} catch (error) {
  console.warn(
    `[install-linux-deps] Failed to install native dependencies: ${error.message}`
  );
  throw error;
}
