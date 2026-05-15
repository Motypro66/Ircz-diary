const TAG_LABELS = {
  hawker: "路边摊",
  kopitiam: "茶室",
  cafe: "Cafe",
  restaurant: "餐厅",
};

let POSTS = [];
let map = null;
let markers = [];
let activeFilter = "all";
let activeId = null;

async function loadPosts() {
  try {
    const res = await fetch("data/posts.json");
    if (!res.ok) throw new Error("posts.json not found");
    POSTS = await res.json();
  } catch (e) {
    console.warn("Could not load posts.json:", e);
    POSTS = [];
  }
}

function getFiltered() {
  if (activeFilter === "all") return POSTS;
  return POSTS.filter((p) => p.category === activeFilter);
}

function initMap() {
  map = L.map("map", {
    center: [4.2, 109.0],
    zoom: 6,
    zoomControl: true,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 19,
  }).addTo(map);

  renderAll();

  if (POSTS.length > 0) {
    const bounds = L.latLngBounds(POSTS.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.15));
  }
}

function renderAll() {
  renderList();
  renderMarkers();
  updateStat();
}

function renderList() {
  const list = document.getElementById("post-list");
  if (!list) return;

  const posts = getFiltered();

  if (posts.length === 0) {
    list.innerHTML = `
      <div class="panel-empty">
        <div class="emoji">🍜</div>
        <p><strong>地图还是空的</strong></p>
        <p style="margin-top:0.5rem">发第一篇小红书笔记后，这里会出现标点。</p>
      </div>`;
    return;
  }

  list.innerHTML = posts
    .map(
      (p, i) => `
    <article class="post-item ${activeId === p.id ? "active" : ""} ${p.isDemo ? "demo" : ""}"
             data-id="${p.id}" role="button" tabindex="0">
      <span class="post-tag tag-${p.category}">${TAG_LABELS[p.category] || p.category}</span>
      <h3>${p.title}</h3>
      <div class="post-meta">${p.location}</div>
      <div class="post-price">${p.price}</div>
    </article>`
    )
    .join("");

  list.querySelectorAll(".post-item").forEach((el) => {
    el.addEventListener("click", () => selectPost(el.dataset.id));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectPost(el.dataset.id);
      }
    });
  });
}

function renderMarkers() {
  markers.forEach((m) => map.removeLayer(m));
  markers = [];

  const posts = getFiltered();

  posts.forEach((p, i) => {
    const icon = L.divIcon({
      html: `<div class="pin-wrap ${activeId === p.id ? "active" : ""} ${p.isDemo ? "demo-pin" : ""}">
               <span class="pin-num">${i + 1}</span>
             </div>`,
      className: "",
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -28],
    });

    const marker = L.marker([p.lat, p.lng], { icon })
      .addTo(map)
      .bindPopup(
        `<div class="popup-box">
          <span class="post-tag tag-${p.category}">${TAG_LABELS[p.category] || ""}</span>
          <h3>${p.title}</h3>
          <p>${p.location}</p>
          <p class="price">${p.price}</p>
          <button type="button" onclick="window.selectPost('${p.id}')">查看食记 →</button>
        </div>`
      );

    marker.on("click", () => selectPost(p.id));
    markers.push(marker);
  });
}

function selectPost(id) {
  activeId = id;
  const post = POSTS.find((p) => p.id === id);
  if (!post || !map) return;

  renderList();
  renderMarkers();

  map.flyTo([post.lat, post.lng], 15, { duration: 0.8 });

  const idx = getFiltered().findIndex((p) => p.id === id);
  if (idx >= 0 && markers[idx]) markers[idx].openPopup();

  showDetail(post);

  if (window.innerWidth < 900) {
    document.getElementById("post-panel")?.classList.remove("open");
  }
}

function showDetail(post) {
  const sheet = document.getElementById("detail-sheet");
  if (!sheet) return;

  document.getElementById("detail-title").textContent = post.title;
  document.getElementById("detail-loc").textContent = post.location;
  document.getElementById("detail-price").textContent = post.price;
  document.getElementById("detail-body").textContent =
    post.body || post.excerpt || "";

  const tipEl = document.getElementById("detail-tip");
  if (post.introvertTip) {
    tipEl.hidden = false;
    tipEl.querySelector(".tip-text").textContent = post.introvertTip;
  } else {
    tipEl.hidden = true;
  }

  const link = document.getElementById("detail-xhs");
  if (post.xhsLink) {
    link.href = post.xhsLink;
    link.hidden = false;
  } else {
    link.hidden = true;
  }

  sheet.classList.add("open");
}

function closeDetail() {
  document.getElementById("detail-sheet")?.classList.remove("open");
  activeId = null;
  renderList();
  renderMarkers();
}

function filterPosts(cat, btn) {
  activeFilter = cat;
  activeId = null;
  closeDetail();

  document.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
  btn?.classList.add("active");

  renderAll();

  const posts = getFiltered();
  if (posts.length > 0) {
    const bounds = L.latLngBounds(posts.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.12));
  }
}

function updateStat() {
  const el = document.getElementById("map-stat");
  if (el) {
    const n = getFiltered().length;
    const demo = getFiltered().some((p) => p.isDemo);
    el.textContent = demo && n === 1 ? "示范标点 ×1（待替换）" : `${n} 个足迹`;
  }
}

function togglePanel() {
  document.getElementById("post-panel")?.classList.toggle("open");
}

function setupUI() {
  document.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => filterPosts(btn.dataset.filter, btn));
  });

  document.getElementById("btn-list")?.addEventListener("click", togglePanel);
  document.getElementById("sheet-close")?.addEventListener("click", closeDetail);

  if (window.innerWidth >= 900) {
    document.getElementById("post-panel")?.classList.remove("collapsed");
  }
}

window.selectPost = selectPost;
window.filterPosts = filterPosts;

document.addEventListener("DOMContentLoaded", async () => {
  await loadPosts();
  if (document.getElementById("map")) {
    initMap();
    setupUI();
  }
});
