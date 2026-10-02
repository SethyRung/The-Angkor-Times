<script setup lang="ts">
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { tv } from "tailwind-variants";

import type { DbCategory } from "#shared/types";
import { now } from "#shared/utils/date";

const props = defineProps<{
  categories: DbCategory[];
}>();

const footer = tv({
  slots: {
    columnHeading: "relative flex items-center gap-2 pb-2",
    columnTitle: "font-sans text-xs font-semibold tracking-widest text-highlighted uppercase",
    linkRow:
      "group flex items-center justify-between text-toned transition-colors duration-150 hover:text-primary",
    linkArrow:
      "size-3.5 text-dimmed transition-transform duration-150 group-hover:translate-x-1 group-focus-visible:translate-x-1",
    collapse:
      "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
    stamp:
      "inline-block font-sans text-xs font-semibold text-primary uppercase transition-[letter-spacing,opacity] duration-500 ease-out motion-reduce:transition-none",
  },
  variants: {
    open: {
      true: { collapse: "grid-rows-[1fr]" },
      false: { collapse: "grid-rows-[0fr]" },
    },
    delayed: {
      true: { collapse: "delay-150 motion-reduce:delay-0" },
    },
    stamped: {
      true: { stamp: "tracking-wider opacity-100" },
      false: { stamp: "tracking-normal opacity-0" },
    },
  },
  defaultVariants: {
    open: false,
    delayed: false,
    stamped: false,
  },
});

const { columnHeading, columnTitle, linkRow, linkArrow } = footer();

const copyright = now().year();
const prefersReducedMotion = usePreferredReducedMotion();
const isMounted = useMounted();
const columnsRef = useTemplateRef("columns");
const clockReadout = useTemplateRef("clockReadout");

const clockHours = ref(now().format("HH:mm"));
const clockSeconds = ref(now().format("ss"));
const liveClock = ref(false);

const email = ref("");
const subscribed = ref(false);
const stamped = ref(false);
const liveMessage = ref("");

const socials = [
  { label: "GitHub", to: "https://github.com/SethyRung/The-Angkor-Times" },
  { label: "X / Twitter", to: "https://x.com" },
  { label: "Wire Feed", to: "/api/news" },
];

const editorialLinks = [
  { label: "Masthead & Staff", to: "#" },
  { label: "Editorial Standards", to: "#" },
  { label: "Corrections Policy", to: "#" },
  { label: "Newsroom Desk", to: "/admin" },
  { label: "Archive Index", to: "/category" },
];

const deskLinks = computed(() => [
  { label: "Front Page", to: "/" },
  ...props.categories.map((c) => ({ label: c.name, to: `/category/${c.slug}` })),
]);

type ClockCell = {
  cell: HTMLElement;
  face: HTMLElement;
  glyph: string;
  roll: boolean;
};

let clockTimer: number | undefined;
let stampTimer: number | undefined;
let rulesTrigger: ScrollTrigger | undefined;
let rulesGeneration = 0;
let clockGeneration = 0;
let clockOn = false;
let clockCells: ClockCell[] = [];

function readClock() {
  const time = now();
  clockHours.value = time.format("HH:mm");
  clockSeconds.value = time.format("ss");
}

function liveStamp() {
  return `${clockHours.value}:${clockSeconds.value} GMT+7`;
}

function killClockTweens() {
  const root = clockReadout.value;
  if (!root) return;
  gsap.killTweensOf(root.querySelectorAll(".clock-face"));
}

function makeCell(glyph: string, roll: boolean): ClockCell {
  const cell = document.createElement("span");
  if (!roll) {
    cell.className = "clock-mark";
    cell.textContent = glyph;
    return { cell, face: cell, glyph, roll };
  }
  cell.className = "clock-cell";
  const face = document.createElement("span");
  face.className = "clock-face";
  face.textContent = glyph;
  cell.appendChild(face);
  return { cell, face, glyph, roll };
}

function buildReadout(stamp: string) {
  const root = clockReadout.value;
  if (!root) return;
  killClockTweens();
  root.replaceChildren();
  const head = stamp.slice(0, 8);
  clockCells = [...head].map((glyph) => {
    const slot = makeCell(glyph, /\d/.test(glyph));
    root.appendChild(slot.cell);
    return slot;
  });
  const suffix = document.createElement("span");
  suffix.className = "clock-mark";
  suffix.textContent = stamp.slice(8);
  root.appendChild(suffix);
}

function rollDigit(slot: ClockCell, next: string) {
  gsap.killTweensOf(slot.cell.querySelectorAll(".clock-face"));
  [...slot.cell.querySelectorAll(".clock-face")].slice(0, -1).forEach((el) => el.remove());
  gsap.set(slot.face, { y: 0, force3D: false });

  const distance = Math.round(slot.cell.getBoundingClientRect().height) || 12;
  const incoming = document.createElement("span");
  incoming.className = "clock-face";
  incoming.textContent = next;
  slot.cell.appendChild(incoming);

  const outgoing = slot.face;
  slot.face = incoming;
  slot.glyph = next;
  const strip = { y: 0 };

  const settle = () => {
    if (slot.face !== incoming) return;
    if (outgoing.isConnected) outgoing.remove();
    gsap.set(incoming, { clearProps: "all" });
  };

  gsap.set(strip, { y: 0 });
  gsap.to(strip, {
    y: -distance,
    duration: 0.28,
    ease: "power2.inOut",
    onUpdate: () => {
      const y = Math.round(strip.y);
      gsap.set(outgoing, { y, force3D: false });
      gsap.set(incoming, { y: y + distance, force3D: false });
    },
    onComplete: settle,
  });
  window.setTimeout(settle, 320);
}

function syncReadout(stamp: string, animate: boolean) {
  const head = stamp.slice(0, 8);
  if (!clockReadout.value || clockCells.length !== head.length) {
    buildReadout(stamp);
    return;
  }
  for (let i = 0; i < head.length; i++) {
    const next = head[i] ?? "";
    const slot = clockCells[i];
    if (!slot || slot.glyph === next) continue;
    if (!animate || !slot.roll) {
      slot.glyph = next;
      slot.face.textContent = next;
      continue;
    }
    rollDigit(slot, next);
  }
}

function stopClock() {
  clockOn = false;
  clockGeneration += 1;
  if (import.meta.client) {
    window.clearTimeout(clockTimer);
    clockTimer = undefined;
    killClockTweens();
  }
  clockCells = [];
  liveClock.value = false;
}

function scheduleTick() {
  if (!clockOn) return;
  const delay = 1000 - (Date.now() % 1000);
  clockTimer = window.setTimeout(() => {
    if (!clockOn) return;
    readClock();
    syncReadout(liveStamp(), true);
    scheduleTick();
  }, delay);
}

async function startClock() {
  stopClock();
  const generation = ++clockGeneration;
  clockOn = true;
  readClock();
  liveClock.value = true;
  await nextTick();
  if (generation !== clockGeneration) return;
  syncReadout(liveStamp(), false);
  scheduleTick();
}

function ruleEls() {
  return columnsRef.value?.querySelectorAll<HTMLElement>("[data-rule]") ?? [];
}

function killRulesTrigger() {
  rulesTrigger?.kill();
  rulesTrigger = undefined;
  const rules = ruleEls();
  if (rules.length) gsap.killTweensOf(rules);
}

function stopRules() {
  rulesGeneration += 1;
  killRulesTrigger();
}

function showRules() {
  const rules = ruleEls();
  if (!rules.length) return;
  gsap.set(rules, { clearProps: "transform" });
}

async function armRules() {
  const generation = ++rulesGeneration;
  killRulesTrigger();
  await nextTick();
  if (generation !== rulesGeneration) return;

  const root = columnsRef.value;
  const rules = ruleEls();
  if (!root || !rules.length) return;

  gsap.registerPlugin(ScrollTrigger);
  gsap.set(rules, { scaleX: 0, transformOrigin: "left center" });

  rulesTrigger = ScrollTrigger.create({
    trigger: root,
    start: "top 85%",
    once: true,
    onEnter: () => {
      gsap.to(rules, {
        scaleX: 1,
        duration: 0.4,
        stagger: 0.06,
        ease: "power2.out",
        overwrite: "auto",
      });
    },
  });
}

function handleSubscribe() {
  if (!email.value || !email.value.includes("@")) return;
  subscribed.value = true;
  liveMessage.value =
    "Subscribed to The Morning Wire. First dispatch will arrive tomorrow at 06:00 GMT+7.";
  if (prefersReducedMotion.value === "reduce") {
    stamped.value = true;
    return;
  }
  stampTimer = window.setTimeout(() => {
    stamped.value = true;
  }, 180);
}

watch([isMounted, prefersReducedMotion], ([mounted, motion]) => {
  if (!mounted) return;
  if (motion === "reduce") {
    stopClock();
    stopRules();
    showRules();
    return;
  }
  void startClock();
  void armRules();
});

const removePageFinish = useNuxtApp().hook("page:finish", () => {
  if (rulesTrigger) ScrollTrigger.refresh();
});

onUnmounted(() => {
  removePageFinish();
  window.clearTimeout(stampTimer);
  stopClock();
  stopRules();
});
</script>

<template>
  <footer class="divide-y divide-default bg-default">
    <div class="bg-elevated/30 py-8 lg:py-10">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div class="space-y-2">
            <span class="font-sans text-xs font-semibold tracking-widest text-primary uppercase">
              The Daily Dispatch
            </span>
            <h3
              class="font-display text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl"
            >
              Independent journalism, delivered at dawn<span class="text-primary">.</span>
            </h3>
            <p class="max-w-xl font-serif text-sm leading-relaxed text-toned sm:text-base">
              Every morning at 06:00 GMT+7, the Phnom Penh desk compiles curated investigations,
              economic analysis, and cultural dispatches. No clickbait, strictly broadsheet craft.
            </p>
          </div>

          <div class="rounded-sm border border-default bg-default p-4 sm:p-5">
            <p class="sr-only">{{ liveMessage }}</p>

            <div :class="footer({ open: !subscribed }).collapse()">
              <form
                class="min-h-0 overflow-hidden"
                :inert="subscribed"
                @submit.prevent="handleSubscribe"
              >
                <div class="flex flex-col gap-2 sm:flex-row">
                  <UInput
                    v-model="email"
                    type="email"
                    placeholder="your.email@example.com"
                    required
                    class="flex-1 rounded-sm font-mono text-xs"
                  />

                  <UButton
                    type="submit"
                    color="primary"
                    variant="solid"
                    label="Subscribe"
                    class="shrink-0 rounded-sm px-4 font-sans text-xs font-semibold tracking-wider uppercase"
                  />
                </div>
              </form>
            </div>

            <div
              :class="footer({ open: subscribed, delayed: true }).collapse()"
              :inert="!subscribed"
            >
              <div class="min-h-0 overflow-hidden">
                <div class="space-y-1 py-2 text-center">
                  <span :class="footer({ stamped }).stamp()">
                    &check; Subscribed to The Morning Wire
                  </span>
                  <p
                    class="font-mono text-xs text-muted transition-opacity delay-100 duration-500 motion-reduce:transition-none"
                    :class="stamped ? 'opacity-100' : 'opacity-0'"
                  >
                    First dispatch will arrive tomorrow at 06:00 GMT+7.
                  </p>
                </div>
              </div>
            </div>

            <p class="mt-2 font-mono text-xs text-muted">
              Free edition &middot; Unsubscribe at any time &middot; Zero telemetry trackers
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div ref="columns" class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        <div class="space-y-4">
          <NuxtLink to="/" class="inline-block">
            <span
              class="font-display text-2xl font-semibold tracking-tight text-highlighted uppercase"
            >
              THE ANGKOR TIMES
            </span>
          </NuxtLink>
          <p class="font-serif text-sm leading-relaxed text-toned">
            A contemporary digital broadsheet published daily in Phnom Penh, Kingdom of Cambodia.
            Rooted in multi-column broadsheet tradition, deep investigative inquiry, and typographic
            rigor.
          </p>
        </div>

        <div class="space-y-4">
          <div :class="columnHeading()">
            <span class="size-1.5 shrink-0 rounded-full bg-primary" />
            <h4 :class="columnTitle()">Editorial Desks</h4>
            <span data-rule class="desk-rule" />
          </div>
          <ul class="space-y-2 font-serif text-sm">
            <li v-for="link in deskLinks" :key="link.label">
              <NuxtLink :to="link.to" :class="linkRow()">
                <span>{{ link.label }}</span>
                <UIcon name="i-lucide-arrow-right" :class="linkArrow()" />
              </NuxtLink>
            </li>
            <li>
              <NuxtLink
                to="/category"
                class="group flex items-center justify-between border-t border-dashed border-default pt-2 font-sans text-xs tracking-wider text-muted uppercase transition-colors duration-150 hover:text-highlighted"
              >
                <span>Browse All Desks</span>
                <UIcon name="i-lucide-arrow-right" :class="linkArrow()" />
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="space-y-4">
          <div :class="columnHeading()">
            <span class="size-1.5 shrink-0 rounded-full bg-primary" />
            <h4 :class="columnTitle()">Standards &amp; Desk</h4>
            <span data-rule class="desk-rule" />
          </div>
          <ul class="space-y-2 font-serif text-sm">
            <li v-for="link in editorialLinks" :key="link.label">
              <NuxtLink :to="link.to" :class="linkRow()">
                <span>{{ link.label }}</span>
                <UIcon name="i-lucide-arrow-right" :class="linkArrow()" />
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="space-y-4">
          <div :class="columnHeading()">
            <span
              class="wire-dot size-1.5 shrink-0 rounded-full bg-primary motion-safe:animate-pulse"
            />
            <h4 :class="columnTitle()">Wire &amp; Network</h4>
            <span data-rule class="desk-rule" />
          </div>
          <div class="space-y-3 font-mono text-xs">
            <div class="flex flex-col gap-2">
              <a
                v-for="s in socials"
                :key="s.label"
                :href="s.to"
                target="_blank"
                rel="noopener"
                class="group flex items-center gap-2 text-toned transition-colors duration-150 hover:text-primary focus-visible:text-primary"
              >
                <span class="inline-grid text-primary">
                  <span
                    class="col-start-1 row-start-1 group-hover:invisible group-focus-visible:invisible"
                    >[+]</span
                  >
                  <span
                    class="invisible col-start-1 row-start-1 group-hover:visible group-focus-visible:visible"
                    >[&rarr;]</span
                  >
                </span>
                <span>{{ s.label }}</span>
              </a>
            </div>

            <div
              class="space-y-1.5 border-t border-dashed border-default pt-3 text-xs text-muted uppercase"
            >
              <div class="flex items-center justify-between">
                <span>Clock:</span>
                <span class="text-highlighted tabular-nums">
                  <span v-if="liveClock" ref="clockReadout" class="clock-readout" />
                  <template v-else>{{ clockHours }} GMT+7</template>
                  <span v-if="liveClock" class="sr-only">{{ clockHours }} GMT+7</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-dashed border-default"></div>

      <div
        class="flex flex-col items-start justify-between gap-4 font-mono text-xs text-muted md:flex-row md:items-center"
      >
        <div>&copy; {{ copyright }} The Angkor Times Publishing Company. All Rights Reserved.</div>
        <div class="text-xs tracking-wider text-dimmed uppercase">
          Typeset in Monomakh &amp; EB Garamond &middot; Broadsheet Edition
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.desk-rule {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  height: 1px;
  background: var(--ui-border);
  pointer-events: none;
}

.wire-dot {
  animation-duration: 2.4s;
}

.clock-readout {
  display: inline-flex;
  align-items: center;
  line-height: 1.2;
  white-space: pre;
}

.clock-readout :deep(.clock-cell) {
  position: relative;
  display: inline-block;
  width: 1ch;
  height: 1.2em;
  overflow: hidden;
}

.clock-readout :deep(.clock-mark) {
  line-height: 1.2;
}

.clock-readout :deep(.clock-face) {
  position: absolute;
  inset-inline: 0;
  top: 0;
  height: 1.2em;
  line-height: 1.2;
  text-align: center;
}

@media (prefers-reduced-motion: no-preference) {
  .desk-rule {
    transform: scaleX(0);
    transform-origin: left center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .wire-dot {
    animation: none;
  }
}
</style>
