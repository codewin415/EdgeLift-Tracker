import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");
const ignore = new Set(["dist", ".git", ".gitignore"]);

function copyDir(source, target) {
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }
  for (const entry of readdirSync(source)) {
    if (ignore.has(entry)) {
      continue;
    }
    const sourcePath = join(source, entry);
    const targetPath = join(target, entry);
    const stats = statSync(sourcePath);
    if (stats.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else {
      cpSync(sourcePath, targetPath);
    }
  }
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
copyDir(root, dist);

const supabaseUrl = process.env.EDGELIFT_SUPABASE_URL || "";
const supabaseAnonKey = process.env.EDGELIFT_SUPABASE_ANON_KEY || "";
const config = `window.EDGELIFT_SUPABASE_URL = ${JSON.stringify(supabaseUrl)};\nwindow.EDGELIFT_SUPABASE_ANON_KEY = ${JSON.stringify(supabaseAnonKey)};\n`;
writeFileSync(join(dist, "supabase-config.js"), config, "utf8");

const manifestPath = join(dist, "app.webmanifest");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
manifest.start_url = "/index.html";
manifest.scope = "/";
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
