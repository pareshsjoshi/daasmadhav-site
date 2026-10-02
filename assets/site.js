const menuButton = document.querySelector(".menu-button");
const primaryNav = document.querySelector("#primary-nav");

function track(eventName, parameters = {}) {
  if (typeof window.gtag === "function") window.gtag("event", eventName, parameters);
}

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(open));
  primaryNav.dataset.open = String(open);
});

document.querySelector("[data-copy-link]")?.addEventListener("click", async (event) => {
  let copied = false;
  try {
    await navigator.clipboard.writeText(window.location.href);
    event.currentTarget.textContent = "लिंक कॉपी झाली";
    copied = true;
  } catch {
    window.prompt("ही लिंक कॉपी करा:", window.location.href);
  }
  track("copy_link", {
    content_type: document.body.dataset.contentType,
    item_name: document.body.dataset.contentTitle,
    link_url: window.location.href,
    copy_confirmed: copied
  });
});

if (["abhanga", "aarti"].includes(document.body.dataset.contentType)) {
  track("view_writing", {
    content_type: document.body.dataset.contentType,
    item_name: document.body.dataset.contentTitle
  });
}
