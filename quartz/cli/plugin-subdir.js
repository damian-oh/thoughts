import fs from "fs"
import path from "path"
import os from "os"
import { execFile } from "child_process"
import { promisify } from "util"

const run = promisify(execFile)

export async function cloneWithSubdirAsync({ url, ref, commit, subdir, pluginDir }) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "quartz-plugin-"))
  const git = (args) => run("git", args, { cwd: tmpDir })
  try {
    await git(["init"])
    await git(["remote", "add", "origin", url])
    const pinnedCommit = commit === "unknown" ? undefined : commit
    await git(["fetch", "--depth", "1", "origin", pinnedCommit || ref || "HEAD"])
    await git(["checkout", "--detach", "FETCH_HEAD"])
    const { stdout } = await git(["rev-parse", "HEAD"])
    const revision = stdout.trim()
    const source = path.join(tmpDir, subdir)
    if (!fs.existsSync(source)) {
      throw new Error(`Subdirectory "${subdir}" not found at ${revision} in ${url}`)
    }
    fs.cpSync(source, pluginDir, { recursive: true })
    fs.writeFileSync(path.join(pluginDir, ".quartz-revision"), revision + "\n")
    return revision
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  }
}

export function installedSubdirRevision(pluginDir) {
  try {
    return fs.readFileSync(path.join(pluginDir, ".quartz-revision"), "utf8").trim()
  } catch {
    return undefined
  }
}
