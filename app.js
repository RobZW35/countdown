/** 8 首热门单曲 × 身体部位热区 */
const SONGS = [
  {
    id: "head",
    part: "头部",
    title: "爱如火",
    lyric: "心在跳是爱情如烈火，你在笑疯狂的人是我",
    x: 50,
    y: 11,
    bvid: "BV1JM411M7qj",
    neteaseId: "1999552137",
  },
  {
    id: "face",
    part: "面颊",
    title: "恨如冰",
    lyric: "恨如冰，我的爱恨如冰",
    x: 50,
    y: 17,
    bvid: "BV1vu411g7Pm",
    neteaseId: "2083147955",
  },
  {
    id: "chest",
    part: "胸口",
    title: "谁能给我爱",
    lyric: "谁能给我爱，谁能给我关怀",
    x: 50,
    y: 26,
    bvid: "BV1sbreYjEuh",
    neteaseId: "2663794686",
  },
  {
    id: "belly",
    part: "腰腹",
    title: "坚强笨女人",
    lyric: "我是个坚强的笨女人，我是个可爱的女人",
    x: 50,
    y: 36,
    neteaseId: "2629646821",
  },
  {
    id: "left-hand",
    part: "左手",
    title: "情如疯",
    lyric: "情如疯，爱如火在胸中",
    x: 34,
    y: 28,
    neteaseId: "2747130581",
  },
  {
    id: "right-hand",
    part: "右手",
    title: "空荡的酒杯",
    lyric: "这空荡的酒杯，这微醺的滋味",
    x: 66,
    y: 28,
    neteaseId: "2694491382",
  },
  {
    id: "left-leg",
    part: "左腿",
    title: "翠霞吊孝",
    lyric: "翠霞吊孝，万人迷与娜娜的魔性旋律",
    x: 44,
    y: 72,
    neteaseId: "2092489060",
  },
  {
    id: "right-leg",
    part: "右腿",
    title: "贝如塔",
    lyric: "贝如塔那么好听，全球发行",
    x: 56,
    y: 72,
    bvid: "BV1Br421J7ts",
    neteaseId: "2108021263",
  },
];

const hotspotsEl = document.getElementById("hotspots");
const trackListEl = document.getElementById("track-list");
const playerFrame = document.getElementById("player-frame");
const playerPlaceholder = document.getElementById("player-placeholder");
const npPart = document.getElementById("np-part");
const npTitle = document.getElementById("np-title");
const npLyric = document.getElementById("np-lyric");

let activeId = null;

function playerUrl(song) {
  if (song.bvid) {
    return `https://player.bilibili.com/player.html?bvid=${song.bvid}&autoplay=1&high_quality=1`;
  }
  if (song.neteaseId) {
    return `https://music.163.com/outchain/player?type=2&id=${song.neteaseId}&auto=1&height=86`;
  }
  return "";
}

function isBilibili(song) {
  return Boolean(song.bvid);
}

function playSong(song) {
  activeId = song.id;

  npPart.textContent = song.part;
  npTitle.textContent = `《${song.title}》`;
  npLyric.textContent = song.lyric;

  const url = playerUrl(song);
  const bilibili = isBilibili(song);

  playerFrame.classList.toggle("is-visible", bilibili);
  playerPlaceholder.classList.add("is-hidden");

  if (url) {
    playerFrame.src = "about:blank";
    requestAnimationFrame(() => {
      playerFrame.src = url;
    });
  }

  document.querySelectorAll(".hotspot").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.id === song.id);
  });

  document.querySelectorAll(".track-item").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.id === song.id);
  });
}

function buildHotspots() {
  SONGS.forEach((song) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hotspot";
    btn.dataset.id = song.id;
    btn.style.left = `${song.x}%`;
    btn.style.top = `${song.y}%`;
    btn.setAttribute("aria-label", `${song.part}：${song.title}`);

    const label = document.createElement("span");
    label.className = "hotspot-label";
    label.textContent = `${song.part} · ${song.title}`;
    btn.appendChild(label);

    btn.addEventListener("click", () => playSong(song));
    hotspotsEl.appendChild(btn);
  });
}

function buildTrackList() {
  SONGS.forEach((song, index) => {
    const li = document.createElement("li");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "track-item";
    btn.dataset.id = song.id;
    btn.innerHTML = `
      <span class="track-num">${String(index + 1).padStart(2, "0")}</span>
      <span class="track-meta">
        <span class="track-part">${song.part}</span>
        <span class="track-title">${song.title}</span>
      </span>
      <span class="track-play" aria-hidden="true">▶</span>
    `;

    btn.addEventListener("click", () => playSong(song));
    li.appendChild(btn);
    trackListEl.appendChild(li);
  });
}

buildHotspots();
buildTrackList();
