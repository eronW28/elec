import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  ensureSeedData,
  getSiteContent,
  saveSiteContent,
  listCollection,
  createItem,
  updateItem,
  removeItem,
  uploadImage,
  showToast
} from "./shared.js";

const state = {
  services: [],
  rates: [],
  gallery: []
};

function setDashboardVisible(isVisible) {
  const loginPanel = document.getElementById("loginPanel");
  const dashboardSection = document.getElementById("dashboardSection");

  if (loginPanel) loginPanel.classList.toggle("hidden", isVisible);
  if (dashboardSection) dashboardSection.classList.toggle("hidden", !isVisible);
}

function setLoginError(message = "") {
  const errorBox = document.getElementById("loginError");
  if (errorBox) errorBox.textContent = message;
}

function populateSiteForm(site = {}) {
  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value || "";
  };

  setValue("heroTitleInput", site.heroTitle);
  setValue("heroTaglineInput", site.heroTagline);
  setValue("heroButtonTextInput", site.heroButtonText);
  setValue("aboutTitleInput", site.aboutTitle);
  setValue("aboutMissionTitleInput", site.aboutMissionTitle);
  setValue("aboutBodyInput", site.aboutBody);
  setValue("aboutBodySecondInput", site.aboutBodySecond);
  setValue("contactTitleInput", site.contactTitle);
  setValue("addressInput", site.address);
  setValue("weekdayHoursInput", site.weekdayHours);
  setValue("weekendHoursInput", site.weekendHours);
  setValue("emailInput", site.email);
  setValue("facebookUrlInput", site.facebookUrl);
  setValue("instagramUrlInput", site.instagramUrl);
  setValue("heroImageInput", site.heroImage);
  setValue("logoImageInput", site.logoImage);
}

function renderCollection(listId, items, type) {
  const list = document.getElementById(listId);
  if (!list) return;

  list.innerHTML = items.map((item) => {
    if (type === "services") {
      return `
        <article class="data-card">
          <h4>${item.title || ""}</h4>
          <p>${item.description || ""}</p>
          <p><strong>Image:</strong> ${item.image || "None"}</p>
          <p><strong>Sort:</strong> ${item.sort_order ?? 1}</p>
          <div class="row-actions">
            <button class="btn btn-secondary" type="button" data-type="services" data-action="edit" data-id="${item.id}">Edit</button>
            <button class="btn btn-primary" type="button" data-type="services" data-action="delete" data-id="${item.id}">Delete</button>
          </div>
        </article>
      `;
    }

    if (type === "rates") {
      return `
        <article class="data-card">
          <h4>${item.title || ""}</h4>
          <p><strong>Front:</strong> ${item.front_image || "None"}</p>
          <p><strong>Back:</strong> ${item.back_image || "None"}</p>
          <p><strong>Sort:</strong> ${item.sort_order ?? 1}</p>
          <div class="row-actions">
            <button class="btn btn-secondary" type="button" data-type="rates" data-action="edit" data-id="${item.id}">Edit</button>
            <button class="btn btn-primary" type="button" data-type="rates" data-action="delete" data-id="${item.id}">Delete</button>
          </div>
        </article>
      `;
    }

    return `
      <article class="data-card">
        <h4>${item.alt_text || "Gallery Item"}</h4>
        <p><strong>Image:</strong> ${item.image || "None"}</p>
        <p><strong>Sort:</strong> ${item.sort_order ?? 1}</p>
        <div class="row-actions">
          <button class="btn btn-secondary" type="button" data-type="gallery" data-action="edit" data-id="${item.id}">Edit</button>
          <button class="btn btn-primary" type="button" data-type="gallery" data-action="delete" data-id="${item.id}">Delete</button>
        </div>
      </article>
    `;
  }).join("");
}

function fillServiceForm(item = {}) {
  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  };

  setValue("serviceId", item.id || "");
  setValue("serviceTitle", item.title || "");
  setValue("serviceDescription", item.description || "");
  setValue("serviceImage", item.image || "");
  setValue("serviceSortOrder", item.sort_order ?? 1);
}

function fillRateForm(item = {}) {
  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  };

  setValue("rateId", item.id || "");
  setValue("rateTitle", item.title || "");
  setValue("rateFrontImage", item.front_image || "");
  setValue("rateBackImage", item.back_image || "");
  setValue("rateSortOrder", item.sort_order ?? 1);
}

function fillGalleryForm(item = {}) {
  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  };

  setValue("galleryId", item.id || "");
  setValue("galleryImage", item.image || "");
  setValue("galleryAltText", item.alt_text || "");
  setValue("gallerySortOrder", item.sort_order ?? 1);
}

async function loadDashboardData() {
  await ensureSeedData();

  const [site, services, rates, gallery] = await Promise.all([
    getSiteContent(),
    listCollection("services"),
    listCollection("rates"),
    listCollection("gallery")
  ]);

  state.services = services;
  state.rates = rates;
  state.gallery = gallery;

  populateSiteForm(site);
  renderCollection("servicesList", services, "services");
  renderCollection("ratesList", rates, "rates");
  renderCollection("galleryList", gallery, "gallery");
}

async function handleEditOrDelete(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const { type, action, id } = button.dataset;
  const item = state[type]?.find((entry) => entry.id === id);

  if (action === "edit") {
    if (!item) return;

    if (type === "services") fillServiceForm(item);
    if (type === "rates") fillRateForm(item);
    if (type === "gallery") fillGalleryForm(item);

    showToast(`Loaded ${type.slice(0, -1)} for editing.`);
    return;
  }

  if (action === "delete") {
    if (!confirm("Delete this item?")) return;

    try {
      await removeItem(type, id);
      await loadDashboardData();
      showToast("Item deleted.");
    } catch (error) {
      console.error(error);
      showToast("Failed to delete item.");
    }
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    setDashboardVisible(false);
    return;
  }

  try {
    setLoginError("");
    setDashboardVisible(true);
    await loadDashboardData();
  } catch (error) {
    console.error(error);
    showToast("Failed to load dashboard data.");
  }
});

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("emailLogin")?.value.trim();
    const password = document.getElementById("passwordLogin")?.value;

    if (!email || !password) {
      setLoginError("Enter your email and password.");
      showToast("Enter your email and password.");
      return;
    }

    try {
      setLoginError("");
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Login successful.");
      setDashboardVisible(true);
      await loadDashboardData();
    } catch (error) {
      console.error(error);
      setLoginError(error.message || "Login failed.");
      showToast(error.message || "Login failed.");
    }
  });
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      setDashboardVisible(false);
      showToast("Logged out.");
    } catch (error) {
      console.error(error);
      showToast("Failed to log out.");
    }
  });
}

const uploadForm = document.getElementById("uploadForm");
if (uploadForm) {
  uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = document.getElementById("uploadInput")?.files?.[0];
    const folder = document.getElementById("uploadFolder")?.value || "general";

    if (!file) {
      showToast("Choose an image first.");
      return;
    }

    try {
      const url = await uploadImage(file, folder);
      const output = document.getElementById("uploadedImagePath");
      if (output) output.value = url;
      showToast("Image uploaded.");
    } catch (error) {
      console.error(error);
      showToast("Upload failed. Check Firebase Storage rules.");
    }
  });
}

const copyUploadUrl = document.getElementById("copyUploadUrl");
if (copyUploadUrl) {
  copyUploadUrl.addEventListener("click", async () => {
    const value = document.getElementById("uploadedImagePath")?.value;

    if (!value) {
      showToast("No uploaded URL to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      showToast("Copied upload URL.");
    } catch (error) {
      console.error(error);
      showToast("Failed to copy URL.");
    }
  });
}

const siteForm = document.getElementById("siteForm");
if (siteForm) {
  siteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      heroTitle: document.getElementById("heroTitleInput")?.value.trim() || "",
      heroTagline: document.getElementById("heroTaglineInput")?.value.trim() || "",
      heroButtonText: document.getElementById("heroButtonTextInput")?.value.trim() || "",
      aboutTitle: document.getElementById("aboutTitleInput")?.value.trim() || "",
      aboutMissionTitle: document.getElementById("aboutMissionTitleInput")?.value.trim() || "",
      aboutBody: document.getElementById("aboutBodyInput")?.value.trim() || "",
      aboutBodySecond: document.getElementById("aboutBodySecondInput")?.value.trim() || "",
      contactTitle: document.getElementById("contactTitleInput")?.value.trim() || "",
      address: document.getElementById("addressInput")?.value.trim() || "",
      weekdayHours: document.getElementById("weekdayHoursInput")?.value.trim() || "",
      weekendHours: document.getElementById("weekendHoursInput")?.value.trim() || "",
      email: document.getElementById("emailInput")?.value.trim() || "",
      facebookUrl: document.getElementById("facebookUrlInput")?.value.trim() || "",
      instagramUrl: document.getElementById("instagramUrlInput")?.value.trim() || "",
      heroImage: document.getElementById("heroImageInput")?.value.trim() || "",
      logoImage: document.getElementById("logoImageInput")?.value.trim() || ""
    };

    try {
      await saveSiteContent(payload);
      showToast("Website content saved.");
    } catch (error) {
      console.error(error);
      showToast("Failed to save website content.");
    }
  });
}

const serviceForm = document.getElementById("serviceForm");
if (serviceForm) {
  serviceForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.getElementById("serviceId")?.value;
    const payload = {
      title: document.getElementById("serviceTitle")?.value.trim() || "",
      description: document.getElementById("serviceDescription")?.value.trim() || "",
      image: document.getElementById("serviceImage")?.value.trim() || "",
      sort_order: Number(document.getElementById("serviceSortOrder")?.value || 1)
    };

    try {
      if (id) {
        await updateItem("services", id, payload);
      } else {
        await createItem("services", payload);
      }

      fillServiceForm();
      await loadDashboardData();
      showToast(`Service ${id ? "updated" : "created"}.`);
    } catch (error) {
      console.error(error);
      showToast("Failed to save service.");
    }
  });
}

const rateForm = document.getElementById("rateForm");
if (rateForm) {
  rateForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.getElementById("rateId")?.value;
    const payload = {
      title: document.getElementById("rateTitle")?.value.trim() || "",
      front_image: document.getElementById("rateFrontImage")?.value.trim() || "",
      back_image: document.getElementById("rateBackImage")?.value.trim() || "",
      sort_order: Number(document.getElementById("rateSortOrder")?.value || 1)
    };

    try {
      if (id) {
        await updateItem("rates", id, payload);
      } else {
        await createItem("rates", payload);
      }

      fillRateForm();
      await loadDashboardData();
      showToast(`Rate card ${id ? "updated" : "created"}.`);
    } catch (error) {
      console.error(error);
      showToast("Failed to save rate card.");
    }
  });
}

const galleryForm = document.getElementById("galleryForm");
if (galleryForm) {
  galleryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = document.getElementById("galleryId")?.value;
    const payload = {
      image: document.getElementById("galleryImage")?.value.trim() || "",
      alt_text: document.getElementById("galleryAltText")?.value.trim() || "",
      sort_order: Number(document.getElementById("gallerySortOrder")?.value || 1)
    };

    try {
      if (id) {
        await updateItem("gallery", id, payload);
      } else {
        await createItem("gallery", payload);
      }

      fillGalleryForm();
      await loadDashboardData();
      showToast(`Gallery item ${id ? "updated" : "created"}.`);
    } catch (error) {
      console.error(error);
      showToast("Failed to save gallery item.");
    }
  });
}

document.getElementById("servicesList")?.addEventListener("click", handleEditOrDelete);
document.getElementById("ratesList")?.addEventListener("click", handleEditOrDelete);
document.getElementById("galleryList")?.addEventListener("click", handleEditOrDelete);

document.getElementById("clearServiceBtn")?.addEventListener("click", () => fillServiceForm());
document.getElementById("clearRateBtn")?.addEventListener("click", () => fillRateForm());
document.getElementById("clearGalleryBtn")?.addEventListener("click", () => fillGalleryForm());
