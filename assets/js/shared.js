import { db, storage } from "./firebase.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const fallbackSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#a00c13" offset="0%" />
      <stop stop-color="#1f1f1f" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
  <text x="50%" y="50%" fill="#ffffff" font-size="42" font-family="Segoe UI, Arial" text-anchor="middle">Fitness Playground</text>
</svg>
`);

export const fallbackImage = `data:image/svg+xml;charset=UTF-8,${fallbackSvg}`;

export const defaultSiteContent = {
  heroTitle: "FITNESS PLAYGROUND",
  heroTagline: "Your Journey to Fitness Starts Here",
  heroButtonText: "Join Now",
  aboutTitle: "About Us",
  aboutMissionTitle: "Our Mission",
  aboutBody: "At Fitness Playground, we help members build strength, confidence, and consistency through a welcoming training environment.",
  aboutBodySecond: "Use the admin dashboard to replace this text with your real story, location details, and branding.",
  contactTitle: "Contact Us",
  address: "Add your gym address here.",
  weekdayHours: "Mon–Fri: 6:00 AM – 10:00 PM",
  weekendHours: "Sat–Sun: 8:00 AM – 8:00 PM",
  email: "hello@fitnessplayground.com",
  facebookUrl: "https://facebook.com/",
  instagramUrl: "https://instagram.com/",
  heroImage: "",
  logoImage: ""
};

export async function ensureSeedData() {
  const siteRef = doc(db, "siteContent", "main");
  const siteSnap = await getDoc(siteRef);
  if (!siteSnap.exists()) {
    await setDoc(siteRef, defaultSiteContent);
  }

  const servicesSnap = await getDocs(collection(db, "services"));
  if (servicesSnap.empty) {
    await addDoc(collection(db, "services"), {
      title: "PERSONAL TRAINING",
      description: "Get one-on-one coaching tailored to your goals, form, and fitness level.",
      image: "",
      sort_order: 1
    });
    await addDoc(collection(db, "services"), {
      title: "GROUP WORKOUTS",
      description: "Train with energy and accountability through coach-led small group sessions.",
      image: "",
      sort_order: 2
    });
    await addDoc(collection(db, "services"), {
      title: "STRENGTH & CONDITIONING",
      description: "Build endurance, power, and mobility with structured strength programs.",
      image: "",
      sort_order: 3
    });
  }

  const ratesSnap = await getDocs(collection(db, "rates"));
  if (ratesSnap.empty) {
    await addDoc(collection(db, "rates"), {
      title: "Monthly Membership",
      front_image: "",
      back_image: "",
      sort_order: 1
    });
    await addDoc(collection(db, "rates"), {
      title: "Coaching Package",
      front_image: "",
      back_image: "",
      sort_order: 2
    });
  }
}

export async function getSiteContent() {
  const snap = await getDoc(doc(db, "siteContent", "main"));
  return snap.exists() ? { ...defaultSiteContent, ...snap.data() } : { ...defaultSiteContent };
}

export async function saveSiteContent(payload) {
  await setDoc(doc(db, "siteContent", "main"), payload, { merge: true });
}

export async function listCollection(name) {
  const q = query(collection(db, name), orderBy("sort_order", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createItem(name, payload) {
  await addDoc(collection(db, name), payload);
}

export async function updateItem(name, id, payload) {
  await updateDoc(doc(db, name, id), payload);
}

export async function removeItem(name, id) {
  await deleteDoc(doc(db, name, id));
}

export async function uploadImage(file, folder = "general") {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const fileRef = ref(storage, `${folder}/${Date.now()}-${cleanName}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

export function setImage(element, src) {
  if (!element) return;
  element.src = src || fallbackImage;
  element.classList.remove("hidden");
}

export function openModal(imageUrl) {
  document.getElementById("modalImage").src = imageUrl;
  document.getElementById("imageModal").classList.add("is-open");
}

export function closeModal() {
  document.getElementById("imageModal").classList.remove("is-open");
}

export function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 2500);
}
