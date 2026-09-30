/**
 * GitHub API synchronization utility
 * Allows saving uploaded images and salon data directly to the GitHub repository
 * so that all users visiting the GitHub Pages site see updates in real-time.
 */

export interface GitHubConfig {
  repo: string; // e.g. "e.salehi8082/salon-raaze-malake" or "owner/repo"
  token: string; // Personal Access Token (classic or fine-grained with 'repo' scope)
  branch: string; // usually "main" or "master"
}

const GITHUB_CONFIG_KEY = "queen_salon_github_config";

export function getGitHubConfig(): GitHubConfig {
  try {
    const saved = localStorage.getItem(GITHUB_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        repo: parsed.repo || "",
        token: parsed.token || "",
        branch: parsed.branch || "main"
      };
    }
  } catch (err) {
    console.error("Error reading GitHub config:", err);
  }
  return { repo: "", token: "", branch: "main" };
}

export function saveGitHubConfig(config: GitHubConfig): void {
  try {
    localStorage.setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error("Error saving GitHub config:", err);
  }
}

/**
 * Helper to encode UTF-8 strings to Base64 safely in browser
 */
function utf8ToBase64(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (_, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

/**
 * Get SHA of an existing file on GitHub repository
 */
async function getFileSha(
  repo: string,
  filePath: string,
  token: string,
  branch: string
): Promise<string | undefined> {
  try {
    const cleanRepo = repo.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").trim();
    const url = `https://api.github.com/repos/${cleanRepo}/contents/${filePath}?ref=${branch}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        Accept: "application/vnd.github.v3+json"
      }
    });

    if (res.ok) {
      const json = await res.json();
      return json.sha;
    }
  } catch {
    // File probably doesn't exist yet
  }
  return undefined;
}

/**
 * Commit a file directly to the GitHub repository via GitHub REST API
 */
export async function commitFileToGitHub(
  filePath: string,
  base64Content: string,
  commitMessage: string
): Promise<{ success: boolean; error?: string; rawUrl?: string }> {
  const config = getGitHubConfig();
  if (!config.repo || !config.token) {
    return {
      success: false,
      error: "اطلاعات ریپازیتوری یا توکن دسترسی گیت‌هاب تنظیم نشده است."
    };
  }

  const cleanRepo = config.repo.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").trim();
  const cleanPath = filePath.replace(/^\/+/, "");
  const branch = config.branch || "main";

  try {
    // 1. Check if file already exists to get its SHA for update
    const sha = await getFileSha(cleanRepo, cleanPath, config.token, branch);

    // Strip data prefix if present (e.g., "data:image/jpeg;base64,...")
    const pureBase64 = base64Content.includes(",")
      ? base64Content.split(",")[1]
      : base64Content;

    const url = `https://api.github.com/repos/${cleanRepo}/contents/${cleanPath}`;
    const body: Record<string, unknown> = {
      message: commitMessage,
      content: pureBase64,
      branch: branch
    };

    if (sha) {
      body.sha = sha;
    }

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${config.token.trim()}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errorJson.message || `خطای گیت‌هاب با کد وضعیت ${res.status}`
      };
    }

    const rawUrl = `https://raw.githubusercontent.com/${cleanRepo}/${branch}/${cleanPath}`;
    return {
      success: true,
      rawUrl
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: "خطا در برقراری ارتباط با گیت‌هاب: " + errorMsg
    };
  }
}

/**
 * Commit updated salon data to data/app-data.json and docs/app-data.json on GitHub
 */
export async function pushAppDataToGitHub(
  data: unknown,
  customMessage = "feat: update salon info, services and gallery from admin panel"
): Promise<{ success: boolean; message: string }> {
  const config = getGitHubConfig();
  if (!config.repo || !config.token) {
    return {
      success: false,
      message: "تنظیمات گیت‌هاب (ریپازیتوری و توکن) تکمیل نشده است."
    };
  }

  try {
    const jsonString = JSON.stringify(data, null, 2);
    const base64Data = utf8ToBase64(jsonString);

    // 1. Commit to data/app-data.json
    const resData = await commitFileToGitHub("data/app-data.json", base64Data, customMessage);
    if (!resData.success) {
      return {
        success: false,
        message: resData.error || "خطا در ثبت داده‌ها در گیت‌هاب"
      };
    }

    // 2. Also commit to docs/app-data.json so GitHub Pages serves it immediately
    try {
      await commitFileToGitHub("docs/app-data.json", base64Data, customMessage);
    } catch {
      // Non-critical if docs folder doesn't exist
    }

    // 3. Also commit to public/data/app-data.json if needed
    try {
      await commitFileToGitHub("public/app-data.json", base64Data, customMessage);
    } catch {
      // Non-critical
    }

    return {
      success: true,
      message: "کلیه تغییرات با موفقیت مستقیماً در ریپازیتوری گیت‌هاب ثبت و برای تمامی کاربران منتشر شد!"
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: "خطا در همگام‌سازی با گیت‌هاب: " + errorMsg
    };
  }
}

/**
 * Fetch authoritative public data from GitHub Raw Content
 * This allows all users around the world to always see the latest data without needing a Node server!
 */
export async function fetchRemoteGitHubData(
  repo: string,
  branch = "main"
): Promise<unknown | null> {
  if (!repo) return null;
  const cleanRepo = repo.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").trim();
  if (!cleanRepo || !cleanRepo.includes("/")) return null;

  const timestamp = Date.now();
  const candidates = [
    `./app-data.json?t=${timestamp}`,
    `./data/app-data.json?t=${timestamp}`,
    `https://raw.githubusercontent.com/${cleanRepo}/${branch}/data/app-data.json?t=${timestamp}`,
    `https://raw.githubusercontent.com/${cleanRepo}/${branch}/docs/app-data.json?t=${timestamp}`
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json && (json.salonInfo || json.gallery || json.services || json.topics)) {
          return json;
        }
      }
    } catch {
      // Continue to next candidate
    }
  }

  return null;
}
