import aboutHtml from "../../modals/about.html?raw";
import workHtml from "../../modals/work.html?raw";
import projectsHtml from "../../modals/projects.html?raw";
import clientsHtml from "../../modals/clients.html?raw";
import toolsHtml from "../../modals/tools.html?raw";
import contactHtml from "../../modals/contact.html?raw";

const modalContainer = document.getElementById("modal-container");
const modalBody = document.getElementById("modal-body");
const modalClose = document.getElementById("modal-close");

/* ------------------------------------------------------------------
   Each modal's markup lives in its own .html file under src/modals/.
   To add a new modal: create src/modals/key.html, import it above,
   add it to this map, and add a button in index.html with a matching
   data-modal="key".
   ------------------------------------------------------------------ */
const content = {
  about: aboutHtml,
  work: workHtml,
  projects: projectsHtml,
  clients: clientsHtml,
  tools: toolsHtml,
  contact: contactHtml,
};

let lastFocused = null;

function openModal(key) {
  const html = content[key];
  if (!html) return;

  modalBody.innerHTML = html;

  const heading = modalBody.querySelector("h1");
  if (heading) heading.id = "modal-title";

  lastFocused = document.activeElement;
  modalContainer.classList.add("show");
  modalClose.focus();
}

function closeModal() {
  modalContainer.classList.remove("show");
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll("[data-modal]").forEach((btn) => {
  btn.addEventListener("click", () => openModal(btn.dataset.modal));
});

modalClose.addEventListener("click", closeModal);

modalContainer.addEventListener("click", (e) => {
  if (e.target === modalContainer) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalContainer.classList.contains("show")) {
    closeModal();
  }
});
