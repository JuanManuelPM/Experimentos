/**
 * SequenceDirector v1 · PROMETEO WEB W002-01
 * Reusable progressive enhancement for semantic chapter-based visual essays.
 * No dependencies, no scroll hijacking, no global arrow-key handlers.
 * Usage: import { SequenceDirector } from "./sequence-engine.js";
 *        new SequenceDirector(document.querySelector("[data-story]")).mount();
 */
export class SequenceDirector {
  constructor(root, {stepSelector = "[data-sequence-step]", linkSelector = "[data-sequence-link]", onChange = null} = {}) {
    if (!root) throw new Error("SequenceDirector requires a story root");
    this.root = root;
    this.stepSelector = stepSelector;
    this.linkSelector = linkSelector;
    this.onChange = onChange;
    this.steps = [];
    this.links = [];
    this.activeId = null;
    this.raf = 0;
    this.mounted = false;
    this.userMotionOff = false;
    this.preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.onScroll = () => { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.update(); }); };
    this.onPreference = () => this.setMotion(this.userMotionOff || this.preference.matches);
    this.onHash = () => this.onScroll();
  }
  mount() {
    if (this.mounted) return this;
    this.steps = [...this.root.querySelectorAll(this.stepSelector)];
    this.links = [...document.querySelectorAll(this.linkSelector)];
    if (!this.steps.length) throw new Error("No sequence chapters found");
    this.mounted = true;
    const toggle = document.querySelector("[data-motion-toggle]");
    this.motionToggle = toggle;
    if (toggle) {
      toggle.addEventListener("click", this.onToggle = () => {
        this.userMotionOff = !this.userMotionOff;
        this.setMotion(this.userMotionOff || this.preference.matches);
      });
    }
    this.preference.addEventListener?.("change", this.onPreference);
    window.addEventListener("scroll", this.onScroll, {passive:true});
    window.addEventListener("resize", this.onScroll, {passive:true});
    window.addEventListener("hashchange", this.onHash);
    document.querySelectorAll(".photo img").forEach(img => {
      const failed = () => img.closest(".photo")?.classList.add("media-failed");
      img.addEventListener("error", failed, {once:true});
      if (img.complete && !img.naturalWidth) failed();
    });
    this.setMotion(this.preference.matches);
    this.update();
    return this;
  }
  setMotion(off) {
    document.documentElement.classList.toggle("motion-off", Boolean(off));
    if (this.motionToggle) {
      this.motionToggle.setAttribute("aria-pressed", String(Boolean(off)));
      this.motionToggle.textContent = off ? "Movimiento desactivado" : "Reducir movimiento";
    }
  }
  update() {
    const vh = Math.max(1, window.innerHeight);
    const marker = vh * 0.42;
    let chosen = this.steps[0];
    let chosenDist = Infinity;
    for (const step of this.steps) {
      const rect = step.getBoundingClientRect();
      const distance = rect.top > marker ? rect.top - marker : (rect.bottom < marker ? marker - rect.bottom : 0);
      if (distance < chosenDist) { chosen = step; chosenDist = distance; }
      const progress = Math.max(0, Math.min(1, (marker - rect.top) / Math.max(1, rect.height)));
      step.style.setProperty("--chapter-progress", progress.toFixed(4));
      // Scroll-linked photographic drift, fully disabled by user or system reduced-motion.
      const offset = document.documentElement.classList.contains("motion-off") ? 0 : Math.round((0.5 - progress) * 38);
      step.style.setProperty("--photo-offset", offset + "px");
    }
    const id = chosen.id;
    if (id !== this.activeId) {
      this.activeId = id;
      this.root.dataset.activeScene = id;
      this.steps.forEach(step => step.classList.toggle("is-current", step.id === id));
      for (const link of this.links) {
        if (link.getAttribute("href") === "#" + id) link.setAttribute("aria-current","location");
        else link.removeAttribute("aria-current");
      }
      const number = String(this.steps.indexOf(chosen) + 1).padStart(2, "0");
      const current = document.querySelector("[data-chapter-count]");
      if (current) current.textContent = number;
      if (typeof this.onChange === "function") this.onChange(chosen, this.steps.indexOf(chosen));
    }
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - vh);
    const scrollRatio = Math.max(0, Math.min(1, window.scrollY / maxScroll));
    doc.style.setProperty("--read-progress", (scrollRatio * 100).toFixed(3) + "%");
  }
  destroy() {
    if (!this.mounted) return;
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onScroll);
    window.removeEventListener("hashchange", this.onHash);
    this.preference.removeEventListener?.("change", this.onPreference);
    if (this.motionToggle && this.onToggle) this.motionToggle.removeEventListener("click", this.onToggle);
    if (this.raf) cancelAnimationFrame(this.raf);
    this.mounted = false;
  }
}
