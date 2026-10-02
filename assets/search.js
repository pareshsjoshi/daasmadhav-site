const form = document.querySelector("[data-search-form]");
const input = document.querySelector("#search-input");
const status = document.querySelector("[data-search-status]");
const results = document.querySelector("[data-search-results]");
let index = [];

const escapeHtml = (value = "") => String(value).replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" })[char]);
const normalize = (value = "") => value.toLocaleLowerCase("mr-IN").normalize("NFC").replace(/[।॥,.;:!?"'()\[\]]/g, " ").replace(/\s+/g, " ").trim();

function render() {
  const query = normalize(input.value);
  const type = new FormData(form).get("type");
  const url = new URL(window.location.href);
  query ? url.searchParams.set("q", input.value.trim()) : url.searchParams.delete("q");
  type !== "all" ? url.searchParams.set("type", type) : url.searchParams.delete("type");
  history.replaceState(null, "", url);

  if (!query) {
    status.textContent = "शोधण्यासाठी शब्द लिहा.";
    results.innerHTML = "";
    return;
  }

  const terms = query.split(" ").filter(Boolean);
  const matches = index.filter((item) => {
    if (type !== "all" && item.type !== type) return false;
    const haystack = normalize(`${item.title} ${item.summary} ${item.keywords || ""} ${item.text}`);
    return terms.every((term) => haystack.includes(term));
  });

  status.textContent = matches.length ? `${matches.length.toLocaleString("mr-IN")} रचना सापडल्या.` : "या शब्दांसाठी कोणतीही रचना सापडली नाही.";
  results.innerHTML = matches.map((item) => `<article class="writing-card"><p class="eyebrow">${item.type === "abhanga" ? "अभंग" : "आरती"}</p><h3><a href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.summary || "")}</p><a class="text-link" href="${escapeHtml(item.url)}">पूर्ण रचना वाचा</a></article>`).join("");
}

fetch(window.ARCHIVE_SEARCH_INDEX)
  .then((response) => response.ok ? response.json() : Promise.reject(new Error("index")))
  .then((data) => {
    index = data;
    const params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";
    const type = params.get("type");
    if (["abhanga", "aarti"].includes(type)) form.elements.type.value = type;
    if (input.value) render();
  })
  .catch(() => { status.textContent = "शोध सध्या उपलब्ध नाही. कृपया पुन्हा प्रयत्न करा."; });

form?.addEventListener("submit", (event) => { event.preventDefault(); render(); });
form?.addEventListener("input", render);

form?.addEventListener("submit", () => {
  const query = input.value.trim();
  if (query && typeof window.gtag === "function") {
    window.gtag("event", "search", {
      search_term: query,
      content_type: new FormData(form).get("type")
    });
  }
});
