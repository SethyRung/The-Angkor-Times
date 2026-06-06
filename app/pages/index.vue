<script setup lang="ts">
import type { NewsItem, TileVariant } from "#shared/types/news";

useSeoMeta({
  title: "The Angkor Times — Latest News",
  description: "Your trusted source for the latest news and stories.",
});

const tileVariants: TileVariant[] = ["mint", "ultraviolet", "yellow", "pink", "orange", "white"];

const featuredStory: NewsItem = {
  id: "feat-1",
  title: "Cambodia's Tech Sector Sees Record Growth in 2026 Investment",
  description:
    "A new wave of international funding is positioning Phnom Penh as Southeast Asia's next major technology hub, with startups raising over $200M in Q1 alone.",
  content: "",
  featured_image: "",
  category: { id: "cat-1", name: "Technology" },
  author: { id: "auth-1", first_name: "Sok", last_name: "Chan" },
  tags: [],
  status: "Published",
  date_published: dayjs().subtract(2, "hour").toISOString(),
  date_created: "",
  date_updated: "",
};

const topStories: NewsItem[] = [
  {
    id: "story-1",
    title: "Angkor Wat Hosts International Cultural Heritage Summit",
    description:
      "Delegates from 40 countries gather to discuss preservation strategies for UNESCO World Heritage sites across Southeast Asia.",
    content: "",
    featured_image: "",
    category: { id: "cat-2", name: "Culture" },
    author: { id: "auth-2", first_name: "Dara" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(5, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
  {
    id: "story-2",
    title: "New Economic Policies Announced for Rural Development",
    description:
      "The government unveils a comprehensive $500M plan to modernize agriculture and expand infrastructure across provincial regions.",
    content: "",
    featured_image: "",
    category: { id: "cat-3", name: "Business" },
    author: { id: "auth-3", first_name: "Ratanak" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(8, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
  {
    id: "story-3",
    title: "National Football Team Qualifies for Asian Cup",
    description:
      "Historic victory secures Cambodia's first-ever appearance at the AFC Asian Cup, sparking celebrations across the country.",
    content: "",
    featured_image: "",
    category: { id: "cat-4", name: "Sports" },
    author: { id: "auth-4", first_name: "Bora" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(12, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
  {
    id: "story-4",
    title: "Breakthrough in Solar Energy Research at Local University",
    description:
      "Researchers develop a new perovskite solar cell with 28% efficiency, paving the way for affordable renewable energy adoption.",
    content: "",
    featured_image: "",
    category: { id: "cat-5", name: "Science" },
    author: { id: "auth-5", first_name: "Lina" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(18, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
  {
    id: "story-5",
    title: "Phnom Penh Launches Smart City Initiative",
    description:
      "AI-powered traffic management, digital public services, and free citywide WiFi rollout announced in the capital's new master plan.",
    content: "",
    featured_image: "",
    category: { id: "cat-1", name: "Technology" },
    author: { id: "auth-6", first_name: "Piseth" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(24, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
  {
    id: "story-6",
    title: "Local Film Wins Top Prize at Cannes Film Festival",
    description:
      "Cambodian director's debut feature takes home the Caméra d'Or, marking a milestone for the nation's growing film industry.",
    content: "",
    featured_image: "",
    category: { id: "cat-2", name: "Culture" },
    author: { id: "auth-7", first_name: "Kanya" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(30, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
];

const streamStories: NewsItem[] = [
  {
    id: "stream-1",
    title: "Stock Market Hits All-Time High as Foreign Investment Surges",
    description:
      "The CSX Index climbs 3.2% on strong quarterly earnings and new IPO announcements.",
    content: "",
    featured_image: "",
    category: { id: "cat-3", name: "Business" },
    author: { id: "auth-8", first_name: "Vibol" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(3, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
  {
    id: "stream-2",
    title: "Parliament Passes New Environmental Protection Law",
    description:
      "Comprehensive legislation targets plastic waste reduction and mandates corporate carbon reporting by 2028.",
    content: "",
    featured_image: "",
    category: { id: "cat-6", name: "Politics" },
    author: { id: "auth-9", first_name: "Chanthou" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(6, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
  {
    id: "stream-3",
    title: "Cambodian Athlete Wins Gold at Southeast Asian Games",
    description: "Swimmer breaks 15-year regional record in the 200m butterfly final.",
    content: "",
    featured_image: "",
    category: { id: "cat-4", name: "Sports" },
    author: { id: "auth-10", first_name: "Nary" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(10, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
  {
    id: "stream-4",
    title: "New High-Speed Rail Link Connects Phnom Penh to Siem Reap",
    description:
      "The 4-hour service reduces travel time by half and is expected to boost tourism revenue by 40% annually.",
    content: "",
    featured_image: "",
    category: { id: "cat-1", name: "Technology" },
    author: { id: "auth-11", first_name: "Sopheak" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(16, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
  {
    id: "stream-5",
    title: "Monsoon Season Brings Record Rainfall to Coastal Regions",
    description:
      "Weather bureau reports 30% above-average precipitation, prompting flood preparedness alerts in four provinces.",
    content: "",
    featured_image: "",
    category: { id: "cat-5", name: "Science" },
    author: { id: "auth-12", first_name: "Makara" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(22, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
  {
    id: "stream-6",
    title: "Traditional Khmer Cuisine Added to UNESCO Heritage List",
    description:
      "The UN cultural body recognizes Cambodia's culinary traditions, including fish amok and num banh chok.",
    content: "",
    featured_image: "",
    category: { id: "cat-2", name: "Culture" },
    author: { id: "auth-13", first_name: "Sreyleak" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(28, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
  {
    id: "stream-7",
    title: "Central Bank Lowers Interest Rates to Spur Economic Growth",
    description: "0.5% rate cut aims to stimulate lending and accelerate post-pandemic recovery.",
    content: "",
    featured_image: "",
    category: { id: "cat-3", name: "Business" },
    author: { id: "auth-14", first_name: "Visal" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(36, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
  {
    id: "stream-8",
    title: "Local Startup Develops AI-Powered Khmer Language Translation Tool",
    description:
      "The open-source model achieves 95% accuracy and is expected to help bridge language barriers in education and government.",
    content: "",
    featured_image: "",
    category: { id: "cat-1", name: "Technology" },
    author: { id: "auth-15", first_name: "Sreng" },
    tags: [],
    status: "Published",
    date_published: dayjs().subtract(48, "hour").toISOString(),
    date_created: "",
    date_updated: "",
  },
];
</script>

<template>
  <div>
    <UContainer class="py-8 md:py-12">
      <FeatureHero :story="featuredStory" />
    </UContainer>

    <UContainer class="py-8 md:py-12 border-t border-white/10">
      <div class="flex items-center gap-4 mb-8">
        <span class="font-mono text-xs uppercase tracking-widest text-mint-500"> Latest </span>
        <span class="h-px flex-1 bg-white/10" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StoryTile
          v-for="(story, idx) in topStories"
          :key="story.id"
          :story="story"
          :variant="tileVariants[idx % tileVariants.length]"
        />
      </div>
    </UContainer>

    <UContainer class="py-8 md:py-12 border-t border-white/10">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 md:gap-12">
        <div>
          <div class="flex items-center gap-4 mb-8">
            <span class="font-mono text-xs uppercase tracking-widest text-mint-500">
              StoryStream
            </span>
            <span class="h-px flex-1 bg-white/10" />
          </div>

          <div class="hidden sm:block ml-24">
            <StoryStream :stories="streamStories" />
          </div>
          <div class="sm:hidden">
            <StoryStream :stories="streamStories" />
          </div>
        </div>

        <aside class="hidden lg:flex flex-col gap-6">
          <div class="rounded-[20px] bg-ultraviolet-500 p-6 flex flex-col gap-3 min-h-[200px]">
            <span class="font-mono text-xs uppercase tracking-widest text-white/70">
              Newsletter
            </span>
            <h3 class="font-display text-2xl text-white leading-tight">
              Get the stories that matter, delivered.
            </h3>
            <p class="text-sm text-white/80">
              Sign up for our daily digest — every story, every morning.
            </p>
            <UButton
              label="Subscribe"
              color="neutral"
              variant="solid"
              class="font-mono uppercase tracking-widest text-xs mt-2 self-start"
            />
          </div>

          <div class="rounded-[20px] bg-mint-500 p-6 flex flex-col gap-3 min-h-[200px]">
            <span class="font-mono text-xs uppercase tracking-widest text-black/70">
              Most Read
            </span>
            <ol class="flex flex-col gap-3 mt-1">
              <li
                v-for="(story, idx) in topStories.slice(0, 4)"
                :key="story.id"
                class="flex gap-3 items-start group cursor-pointer"
              >
                <span class="font-display text-2xl text-black/40 leading-none mt-0.5 w-6 shrink-0">
                  {{ String(idx + 1).padStart(2, "0") }}
                </span>
                <NuxtLink
                  :to="`/news/${story.id}`"
                  class="text-sm font-bold text-black leading-snug group-hover:text-[#3860be] transition-colors"
                >
                  {{ story.title }}
                </NuxtLink>
              </li>
            </ol>
          </div>
        </aside>
      </div>
    </UContainer>
  </div>
</template>
