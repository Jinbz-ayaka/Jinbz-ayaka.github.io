const form = document.querySelector(".search-form");
const input = document.querySelector("#search-input");
const status = document.querySelector(".search-status");
const results = document.querySelector(".search-results");

const escapeHtml = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");

const searchableText = (post) => [
  post.title,
  post.description,
  ...(post.categories ?? []),
  ...(post.tags ?? []),
].join(" ").toLocaleLowerCase("zh-CN");

const render = (posts, keyword = "") => {
  const normalized = keyword.trim().toLocaleLowerCase("zh-CN");
  const matches = normalized ? posts.filter((post) => searchableText(post).includes(normalized)) : posts;
  status.textContent = normalized ? `找到 ${matches.length} 篇文章` : `共 ${matches.length} 篇文章`;
  results.innerHTML = matches.map((post) => `
    <article class="post-card search-card">
      <div>
        ${(post.categories ?? []).slice(0, 1).map((category) => `<a class="category" href="/categories/${encodeURIComponent(category)}/">${escapeHtml(category)}</a>`).join("")}
        <h2><a href="${post.permalink}">${escapeHtml(post.title)}</a></h2>
        <p>${escapeHtml(post.description)}</p>
        <time>${escapeHtml(post.date ?? "")}</time>
      </div>
    </article>`).join("");
};

fetch("/search/index.json")
  .then((response) => response.json())
  .then((posts) => {
    render(posts, new URLSearchParams(window.location.search).get("keyword") ?? "");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const keyword = input.value.trim();
      const url = new URL(window.location.href);
      keyword ? url.searchParams.set("keyword", keyword) : url.searchParams.delete("keyword");
      window.history.replaceState({}, "", url);
      render(posts, keyword);
    });
  })
  .catch(() => {
    status.textContent = "搜索索引加载失败";
  });
