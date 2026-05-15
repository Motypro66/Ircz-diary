const TAG_LABELS = {
  hawker: "路边摊",
  kopitiam: "茶室",
  cafe: "Cafe",
  restaurant: "餐厅",
};

function applySiteBranding() {
  const cfg = window.SITE;
  if (!cfg) return;

  document.querySelectorAll("[data-site-name]").forEach((el) => {
    el.innerHTML = `${cfg.nameAccent}<span>的馋嘴日记</span>`;
  });

  const xhsBtn = document.getElementById("home-xhs-btn");
  const xhsHint = document.getElementById("home-xhs-hint");
  if (cfg.xhsProfileUrl && xhsBtn) {
    xhsBtn.href = cfg.xhsProfileUrl;
    xhsBtn.hidden = false;
    if (xhsHint) xhsHint.textContent = "在小红书关注，看完整图文与更新";
  } else if (xhsBtn) {
    xhsBtn.hidden = true;
    if (xhsHint) {
      xhsHint.textContent = `在小红书搜索「${cfg.xhsSearchName}」关注`;
    }
  }
}

async function loadHomePosts() {
  const statPosts = document.getElementById("stat-posts");
  const statRegions = document.getElementById("stat-regions");
  const recentEl = document.getElementById("recent-posts");

  try {
    const res = await fetch("data/posts.json");
    if (!res.ok) throw new Error(String(res.status));
    const posts = await res.json();
    const real = posts.filter((p) => !p.isDemo);
    const list = real.length ? real : posts;

    if (statPosts) statPosts.textContent = String(list.length);
    if (statRegions) {
      const cities = new Set(
        list.map((p) => (p.location || "").split("·")[0].split(",")[0].trim()).filter(Boolean)
      );
      statRegions.textContent = String(Math.max(cities.size, 1));
    }

    if (!recentEl) return;

    if (list.length === 0) {
      recentEl.innerHTML = `<p class="recent-empty">第一篇食记发布后，会显示在这里。</p>`;
      return;
    }

    recentEl.innerHTML = list
      .slice(0, 6)
      .map(
        (p) => `
      <a class="recent-card ${p.isDemo ? "demo" : ""}" href="map.html?id=${encodeURIComponent(p.id)}">
        <span class="post-tag tag-${p.category}">${TAG_LABELS[p.category] || p.category}</span>
        <h3>${p.title}</h3>
        <p class="recent-meta">${p.location}</p>
        <p class="recent-price">${p.price}</p>
        ${p.isDemo ? '<span class="recent-demo">测试帖</span>' : ""}
      </a>`
      )
      .join("");
  } catch {
    if (statPosts) statPosts.textContent = "—";
    if (recentEl) {
      recentEl.innerHTML = `<p class="recent-empty">暂时读不到食记数据，请稍后在地图页查看。</p>`;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applySiteBranding();
  loadHomePosts();
});
