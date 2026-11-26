import test from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { execFileSync, spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { cloneWithSubdirAsync, installedSubdirRevision } from "./plugin-subdir.js"

test("CLI reuses unknown revisions offline and replaces concrete mismatches", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "quartz-repeat-install-test-"))
  const repo = path.join(root, "repo")
  const unavailableRepo = path.join(root, "offline-repo")
  const workspace = path.join(root, "workspace")
  fs.mkdirSync(repo)
  fs.mkdirSync(workspace)
  const git = (...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim()
  const install = (expectedStatus = 0) => {
    const result = spawnSync(
      process.execPath,
      [fileURLToPath(new URL("../bootstrap-cli.mjs", import.meta.url)), "plugin", "install"],
      { cwd: workspace, encoding: "utf8" },
    )
    assert.equal(result.status, expectedStatus, result.stdout + result.stderr)
    return result.stdout + result.stderr
  }
  try {
    git("init")
    git("config", "user.name", "Test")
    git("config", "user.email", "test@example.com")
    fs.mkdirSync(path.join(repo, "plugin", "dist"), { recursive: true })
    fs.writeFileSync(path.join(repo, "plugin", "package.json"), JSON.stringify({ name: "fixture" }))
    const source = path.join(repo, "plugin", "dist", "index.js")
    fs.writeFileSync(source, "original theme")
    git("add", ".")
    git("commit", "-m", "original")
    const originalCommit = git("rev-parse", "HEAD")
    fs.writeFileSync(source, "new theme")
    git("add", ".")
    git("commit", "-m", "new")
    const headCommit = git("rev-parse", "HEAD")

    fs.writeFileSync(path.join(workspace, "package.json"), JSON.stringify({ version: "5.0.0" }))
    fs.writeFileSync(path.join(workspace, "quartz.config.yaml"), "plugins: []\n")
    const lockPath = path.join(workspace, "quartz.lock.json")
    const lock = {
      version: "1.0.0",
      plugins: { fixture: { resolved: repo, commit: "unknown", subdir: "plugin" } },
    }
    const originalLock = JSON.stringify(lock)
    fs.writeFileSync(lockPath, originalLock)
    install()
    const pluginDir = path.join(workspace, ".quartz", "plugins", "fixture")
    assert.equal(installedSubdirRevision(pluginDir), headCommit)
    const keepFile = path.join(pluginDir, "keep.txt")
    fs.writeFileSync(keepFile, "preserve cached installation")
    fs.renameSync(repo, unavailableRepo)
    const assertReused = () => {
      assert.doesNotMatch(install(), /cloning|Building plugins|built|installing dependencies/)
      assert.equal(fs.readFileSync(keepFile, "utf8"), "preserve cached installation")
      assert.equal(fs.readFileSync(path.join(pluginDir, "dist", "index.js"), "utf8"), "new theme")
      assert.equal(fs.readFileSync(lockPath, "utf8"), originalLock)
    }
    assertReused()
    assert.equal(installedSubdirRevision(pluginDir), headCommit)
    fs.unlinkSync(path.join(pluginDir, ".quartz-revision"))
    assertReused()
    assert.equal(installedSubdirRevision(pluginDir), undefined)

    lock.plugins.fixture.commit = originalCommit
    const pinnedLock = JSON.stringify(lock)
    fs.writeFileSync(lockPath, pinnedLock)
    for (const marker of [undefined, headCommit]) {
      if (marker) fs.writeFileSync(path.join(pluginDir, ".quartz-revision"), marker)
      assert.match(install(1), /Plugin installation failed/)
      assert.equal(installedSubdirRevision(pluginDir), marker)
      assert.equal(fs.readFileSync(keepFile, "utf8"), "preserve cached installation")
      assert.equal(fs.readFileSync(path.join(pluginDir, "dist", "index.js"), "utf8"), "new theme")
      assert.equal(fs.readFileSync(lockPath, "utf8"), pinnedLock)
      assert.deepEqual(fs.readdirSync(path.dirname(pluginDir)), ["fixture", "index.ts"])
    }

    fs.renameSync(unavailableRepo, repo)
    fs.writeFileSync(path.join(pluginDir, ".quartz-revision"), headCommit)
    lock.plugins.fixture.commit = originalCommit
    fs.writeFileSync(lockPath, JSON.stringify(lock))
    install()
    assert.equal(installedSubdirRevision(pluginDir), originalCommit)
    assert.equal(
      fs.readFileSync(path.join(pluginDir, "dist", "index.js"), "utf8"),
      "original theme",
    )
    assert.equal(fs.existsSync(keepFile), false)
    assert.deepEqual(fs.readdirSync(path.dirname(pluginDir)), ["fixture", "index.ts"])
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test("normal and clean installation fail when a locked plugin is unavailable", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "quartz-install-failure-"))
  try {
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ version: "5.0.0" }))
    fs.writeFileSync(path.join(root, "quartz.config.yaml"), "plugins: []\n")
    fs.writeFileSync(
      path.join(root, "quartz.lock.json"),
      JSON.stringify({
        version: "1.0.0",
        plugins: { missing: { commit: "local", resolved: path.join(root, "absent") } },
      }),
    )
    for (const flags of [[], ["--clean"]]) {
      const result = spawnSync(
        process.execPath,
        [
          fileURLToPath(new URL("../bootstrap-cli.mjs", import.meta.url)),
          "plugin",
          "install",
          ...flags,
        ],
        { cwd: root, encoding: "utf8" },
      )
      assert.notEqual(result.status, 0)
      assert.match(result.stdout + result.stderr, /Plugin installation failed/)
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test("restore a locked subfolder even after upstream removes it", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "quartz-subdir-test-"))
  const repo = path.join(root, "repo")
  fs.mkdirSync(repo)
  const git = (...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim()
  try {
    git("init")
    git("config", "user.name", "Test")
    git("config", "user.email", "test@example.com")
    fs.mkdirSync(path.join(repo, "plugin"))
    fs.writeFileSync(path.join(repo, "plugin", "marker"), "original theme")
    git("add", ".")
    git("commit", "-m", "theme")
    const commit = git("rev-parse", "HEAD")
    git("rm", "-r", "plugin")
    git("commit", "-m", "remove theme")
    const pluginDir = path.join(root, "installed")
    assert.equal(installedSubdirRevision(pluginDir), undefined)
    assert.equal(
      await cloneWithSubdirAsync({ url: repo, commit, subdir: "plugin", pluginDir }),
      commit,
    )
    assert.equal(fs.readFileSync(path.join(pluginDir, "marker"), "utf8"), "original theme")
    assert.equal(installedSubdirRevision(pluginDir), commit)
    assert.notEqual(installedSubdirRevision(pluginDir), git("rev-parse", "HEAD"))
    await assert.rejects(
      cloneWithSubdirAsync({ url: repo, subdir: "plugin", pluginDir: path.join(root, "missing") }),
      /Subdirectory/,
    )
    await assert.rejects(
      cloneWithSubdirAsync({
        url: repo,
        commit: "0".repeat(40),
        subdir: "plugin",
        pluginDir: path.join(root, "invalid"),
      }),
    )
    git("tag", "working-theme", commit)
    assert.equal(
      await cloneWithSubdirAsync({
        url: repo,
        ref: "working-theme",
        subdir: "plugin",
        pluginDir: path.join(root, "tagged"),
      }),
      commit,
    )
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

test("unknown revisions fall back to the configured ref or remote HEAD", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "quartz-unknown-revision-test-"))
  const repo = path.join(root, "repo")
  fs.mkdirSync(repo)
  const git = (...args) => execFileSync("git", args, { cwd: repo, encoding: "utf8" }).trim()
  try {
    git("init")
    git("config", "user.name", "Test")
    git("config", "user.email", "test@example.com")
    fs.mkdirSync(path.join(repo, "plugin"))
    fs.writeFileSync(path.join(repo, "plugin", "marker"), "tagged theme")
    git("add", ".")
    git("commit", "-m", "tagged theme")
    const taggedCommit = git("rev-parse", "HEAD")
    git("tag", "working-theme")
    fs.writeFileSync(path.join(repo, "plugin", "marker"), "latest theme")
    git("add", ".")
    git("commit", "-m", "latest theme")
    const headCommit = git("rev-parse", "HEAD")

    for (const [name, ref, expectedCommit, expectedContent] of [
      ["tagged", "working-theme", taggedCommit, "tagged theme"],
      ["head", undefined, headCommit, "latest theme"],
    ]) {
      const pluginDir = path.join(root, name)
      assert.equal(
        await cloneWithSubdirAsync({
          url: repo,
          commit: "unknown",
          ref,
          subdir: "plugin",
          pluginDir,
        }),
        expectedCommit,
      )
      assert.equal(installedSubdirRevision(pluginDir), expectedCommit)
      assert.equal(fs.readFileSync(path.join(pluginDir, "marker"), "utf8"), expectedContent)
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})
