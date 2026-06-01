document.addEventListener("DOMContentLoaded", () => {
  const layout = document.querySelector(".toc-layout");
  const button = document.querySelector(".toc-toggle-button");
  const sidebar = document.getElementById("toc-sidebar");

  if (!layout || !button || !sidebar) return;

  const setExpanded = (expanded) => {
    layout.classList.toggle("toc-collapsed", !expanded);
    layout.classList.toggle("toc-expanded", expanded);
    button.setAttribute("aria-expanded", String(expanded));
    button.classList.toggle("is-active", expanded);
  };

  button.addEventListener("click", () => {
    setExpanded(layout.classList.contains("toc-collapsed"));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setExpanded(false);
  });

  document.addEventListener("click", (event) => {
    if (layout.classList.contains("toc-collapsed")) return;
    if (button.contains(event.target) || sidebar.contains(event.target)) return;
    setExpanded(false);
  });

  setExpanded(false);
});
