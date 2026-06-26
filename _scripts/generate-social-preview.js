const path = require("path");
const os = require("os");
const fs = require("fs");
const { execFileSync } = require("child_process");
const { pathToFileURL } = require("url");

let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  const globalNodeModules = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
  ({ chromium } = require(path.join(globalNodeModules, "playwright")));
}

const repoRoot = path.resolve(__dirname, "..");
const rootUrl = pathToFileURL(repoRoot).href;
const portraitPath = path.join(os.tmpdir(), "slhck-social-preview-portrait.png");

execFileSync("magick", [
  path.join(repoRoot, "assets/images/Werner.avif"),
  "-resize",
  "420x502^",
  "-gravity",
  "center",
  "-extent",
  "420x502",
  portraitPath,
]);

const portraitDataUrl = `data:image/png;base64,${fs.readFileSync(portraitPath, "base64")}`;

const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @font-face {
      font-family: "Andada Pro";
      src: url("${rootUrl}/assets/webfonts/andada-pro-v24-latin-700.woff2") format("woff2");
      font-weight: 700;
    }

    @font-face {
      font-family: "Lato";
      src: url("${rootUrl}/assets/webfonts/lato-v23-latin-regular.woff2") format("woff2");
      font-weight: 400;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      width: 1200px;
      height: 630px;
      background: #0f172a;
      color: #e2e8f0;
      font-family: "Lato", Arial, sans-serif;
    }

    .card {
      position: relative;
      width: 1200px;
      height: 630px;
      overflow: hidden;
      background:
        radial-gradient(circle at 82% 20%, rgba(96, 165, 250, 0.24), transparent 34%),
        linear-gradient(135deg, #0f172a 0%, #111827 48%, #1e293b 100%);
    }

    .bar {
      position: absolute;
      inset: 0 auto 0 0;
      width: 32px;
      background: linear-gradient(180deg, #60a5fa 0%, #93c5fd 100%);
    }

    .content {
      position: absolute;
      left: 92px;
      top: 80px;
      width: 655px;
    }

    .kicker {
      margin: 0 0 44px;
      color: #93c5fd;
      font-size: 34px;
      line-height: 1.1;
    }

    .name {
      margin: 0 0 34px;
      color: #e2e8f0;
      font-family: "Andada Pro", Georgia, serif;
      font-size: 78px;
      font-weight: 700;
      letter-spacing: 0;
      line-height: 0.98;
    }

    .desc {
      margin: 0;
      color: #cbd5e0;
      font-size: 34px;
      line-height: 1.28;
    }

    .domain {
      position: absolute;
      left: 92px;
      bottom: 78px;
      margin: 0;
      color: #a0aec0;
      font-size: 31px;
    }

    .accent {
      position: absolute;
      left: 92px;
      bottom: 134px;
      width: 250px;
      height: 10px;
      background: #60a5fa;
    }

    .portrait-wrap {
      position: absolute;
      top: 64px;
      right: 86px;
      width: 420px;
      height: 502px;
      overflow: hidden;
      background: #1e293b;
      border: 1px solid #334155;
      box-shadow: 0 22px 70px rgba(0, 0, 0, 0.3);
    }

    .portrait {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 40%;
      filter: saturate(0.95) contrast(1.03);
    }
  </style>
</head>
<body>
  <main class="card">
    <div class="bar"></div>
    <section class="content">
      <p class="kicker">slhck.info</p>
      <h1 class="name">Werner<br>Robitza</h1>
      <p class="desc">Video quality, software, research, and notes.</p>
    </section>
    <div class="accent"></div>
    <p class="domain">Personal website and blog</p>
    <div class="portrait-wrap">
      <img class="portrait" src="${portraitDataUrl}" alt="">
    </div>
  </main>
</body>
</html>`;

(async () => {
  const browser = await chromium.launch({ executablePath: "/Users/werner/.bin/chrome" });
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  await page.setContent(html, { waitUntil: "load" });
  await page.screenshot({
    path: path.join(repoRoot, "assets/images/social-preview.png"),
    type: "png",
  });
  await browser.close();
})();
