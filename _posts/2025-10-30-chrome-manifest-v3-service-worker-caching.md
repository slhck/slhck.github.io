---
layout: post
title: "Chrome Manifest V3 Service Workers Cache Aggressively – Even When You Don't Want Them To"
date: 2025-10-30
categories: software
---

If you're developing a Chrome extension using Manifest V3 and loading it with `--load-extension`, you might run into a frustrating issue: **your service worker code gets cached and refuses to update**, even when you've changed the code and bumped the version number.

A Stack Overflow user [asked a question about this](https://stackoverflow.com/questions/68876486/manifest-v3-background-service-worker-seems-to-go-stale-how-to-verify-this-is-t) many years ago but never received a proper answer.

## The Problem

Manifest V3 introduced service workers as the replacement for persistent background pages. While this is generally a good architectural change in terms of resource requirements, Chrome's caching behavior for service workers is *extremely* aggressive. Even when you update your extension code, bump the version in `manifest.json`, and restart the browser, the old service worker code may still be running!

This happens because Chrome caches the compiled service worker script separately from the extension files themselves. The cache can persist across browser restarts and extension reloads.

## How to Verify You Have Stale Cache

If you suspect your service worker is cached, check the Chrome profile directory:

```bash
# On Linux/macOS
ls -lh ~/.config/chromium/Default/Service\ Worker/ScriptCache/
# or for Chrome
ls -lh ~/Library/Application\ Support/Google/Chrome/Default/Service\ Worker/ScriptCache/

# Check the timestamps - if they're older than your last build, you have stale cache
```

You can also look in the `Preferences` file in your profile directory – this is a JSON file that you first need to pipe through `jq` to get a proper format:

```bash
cat Default/Preferences | jq .extensions.settings.YOUR_EXTENSION_ID.service_worker_registration_info
```

Replace `YOUR_EXTENSION_ID` with your actual extension ID (you can find this on the `chrome://extensions` page when Developer mode is enabled).
This prints:

```json
{
  "version": "1.28.1"  // This might be older than your actual extension version!
}
```

## The Solution

The most reliable way to force Chrome to reload your service worker is to manually reload the extension from the Extensions page:

1. Navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Find your extension in the list
4. Click the **Reload** button (circular arrow icon)

This forces Chrome to re-register the service worker and clear the cached script.

If you're running Chrome headlessly or in an automated environment, you will need to programmatically reload the extension using Selenium/WebDriver.

Alternatively, you can use a completely new profile directory for testing, which ensures no cached service worker scripts are present. But this will not work if you need persistent data across sessions.

Note: You might be tempted to just delete the `Service Worker/ScriptCache` directory to force a clean slate. **Don't do this.** This directory contains cached scripts for Chrome's built-in components as well, and deleting it can break Chrome's internal functionality. Only the extension reload method described above is safe.
