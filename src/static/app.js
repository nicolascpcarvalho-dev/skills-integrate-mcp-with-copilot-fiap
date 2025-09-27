
document.addEventListener("DOMContentLoaded", () => {
  // ...existing code...
  // Ideias CRUD
  const ideasList = document.getElementById("ideas-list");
  const ideaForm = document.getElementById("idea-form");
  const ideaTitle = document.getElementById("idea-title");
  const ideaDescription = document.getElementById("idea-description");
  const ideaMessage = document.getElementById("idea-message");

  async function fetchIdeas() {
    try {
      const response = await fetch("/ideas");
      const ideas = await response.json();
      renderIdeas(ideas);
    } catch (error) {
      ideasList.innerHTML = "<p>Falha ao carregar ideias.</p>";
    }
  }

  function renderIdeas(ideas) {
    if (!ideas.length) {
      ideasList.innerHTML = "<p>Nenhuma ideia cadastrada.</p>";
      return;
    }
    ideasList.innerHTML = "";
    ideas.forEach((idea) => {
      const div = document.createElement("div");
      div.className = "idea-card";
      div.innerHTML = `
        <h4>${idea.title}</h4>
        <p>${idea.description}</p>
        <button class="edit-idea-btn" data-id="${idea.id}">Editar</button>
        <button class="delete-idea-btn" data-id="${idea.id}">Excluir</button>
      `;
      ideasList.appendChild(div);
    });
    document.querySelectorAll(".delete-idea-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = btn.getAttribute("data-id");
        await deleteIdea(id);
      });
    });
    document.querySelectorAll(".edit-idea-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = btn.getAttribute("data-id");
        const ideas = await (await fetch("/ideas")).json();
        const idea = ideas.find((i) => i.id == id);
        if (idea) {
          ideaTitle.value = idea.title;
          ideaDescription.value = idea.description;
          ideaForm.setAttribute("data-edit-id", id);
        }
      });
    });
  }

  async function addOrUpdateIdea(e) {
    e.preventDefault();
    const title = ideaTitle.value.trim();
    const description = ideaDescription.value.trim();
    if (!title || !description) return;
    const editId = ideaForm.getAttribute("data-edit-id");
    let response, result;
    if (editId) {
      response = await fetch(`/ideas/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      result = await response.json();
      ideaMessage.textContent = response.ok ? "Ideia atualizada!" : result.detail || "Erro ao atualizar.";
      ideaForm.removeAttribute("data-edit-id");
    } else {
      response = await fetch("/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      result = await response.json();
      ideaMessage.textContent = response.ok ? "Ideia salva!" : result.detail || "Erro ao salvar.";
    }
    ideaMessage.className = response.ok ? "success" : "error";
    ideaMessage.classList.remove("hidden");
    ideaForm.reset();
    fetchIdeas();
    setTimeout(() => ideaMessage.classList.add("hidden"), 4000);
  }

  async function deleteIdea(id) {
    const response = await fetch(`/ideas/${id}`, { method: "DELETE" });
    const result = await response.json();
    ideaMessage.textContent = response.ok ? "Ideia excluída!" : result.detail || "Erro ao excluir.";
    ideaMessage.className = response.ok ? "success" : "error";
    ideaMessage.classList.remove("hidden");
    fetchIdeas();
    setTimeout(() => ideaMessage.classList.add("hidden"), 4000);
  }

  ideaForm.addEventListener("submit", addOrUpdateIdea);
  fetchIdeas();

  // ...existing code...
});
