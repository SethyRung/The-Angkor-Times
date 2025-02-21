<template>
  <div class="max-w-[1280px] mx-auto p-4">
    <div class="grid computer:grid-cols-[75%_1fr] gap-4">
      <div class="flex flex-col-reverse computer:flex-row gap-4">
        <div class="computer:max-w-[240px] h-full my-4 space-y-3">
          <h2 class="font-bold underline font-red-hat-display">Recent News</h2>
          <div class="flex flex-col items-center gap-3">
            <NuxtLink
              class="space-y-2 hover:text-neutral-600 hover:cursor-pointer"
            >
              <h3 class="font-bold text-lg">
                Rewriting History, Trump Blames Ukraine for War and Calls
                Zelensky ‘Dictator’
              </h3>
              <p class="text-sm line-clamp-3 break-all">
                President Trump made an array of false claims as he tried to
                cast President Volodymyr Zelensky as a villain who conned the
                U.S. into helping Ukraine.
              </p>
              <p class="text-sm text-neutral-600">5 min</p>
            </NuxtLink>
            <div class="w-[80%] border border-[var(--ui-border)]"></div>
            <NuxtLink
              class="space-y-2 hover:text-neutral-600 hover:cursor-pointer"
            >
              <h3 class="font-bold text-lg">
                Musk Team Cuts 9/11 Survivors’ Fund, and Republicans Join
                Democrats in Rebuke
              </h3>
              <p class="text-sm line-clamp-3 break-all">
                After 20 percent of the World Trade Center Health Program staff
                was terminated last week, Democratic lawmakers were outraged.
                Republicans have now joined them.
              </p>
              <p class="text-sm">8 min</p>
            </NuxtLink>
            <div class="w-[80%] border border-[var(--ui-border)]"></div>
            <NuxtLink
              class="space-y-2 hover:text-neutral-600 hover:cursor-pointer"
            >
              <h3 class="font-bold text-lg">
                Musk Team Cuts 9/11 Survivors’ Fund, and Republicans Join
                Democrats in Rebuke
              </h3>
              <p class="text-sm line-clamp-3 break-all">
                After 20 percent of the World Trade Center Health Program staff
                was terminated last week, Democratic lawmakers were outraged.
                Republicans have now joined them.
              </p>
              <p class="text-sm">8 min</p>
            </NuxtLink>
          </div>
        </div>
        <div
          class="computer:p-2 computer:border-x-1 border-neutral-300 space-y-4"
        >
          <NewsCard
            image="https://static01.nyt.com/images/2025/02/13/multimedia/15trump-news-russia-ukraine-01/15trump-news-russia-ukraine-01-threeByTwoSmallAt2X.jpg?format=pjpg&quality=75&auto=webp&disable=upscale"
            title="Trump Aides and Russian Officials to Meet Next Week on Ukraine War"
            description="The talks would be the first between American and Russian delegations since the start of Russia’s full-scale invasion of Ukraine in February 2022."
            public-date="2025-10-01"
          />
          <NewsCard
            orientation="horizontal"
            image="https://static01.nyt.com/images/2025/02/13/multimedia/15trump-news-russia-ukraine-01/15trump-news-russia-ukraine-01-threeByTwoSmallAt2X.jpg?format=pjpg&quality=75&auto=webp&disable=upscale"
            title="Trump Aides and Russian Officials to Meet Next Week on Ukraine War"
            description="The talks would be the first between American and Russian delegations since the start of Russia’s full-scale invasion of Ukraine in February 2022."
            public-date="2025-10-01"
            :ui="{ root: 'hidden computer:flex' }"
          />
        </div>
      </div>
      <div class="computer:py-2 space-y-4">
        <NewsCard
          image="https://static01.nyt.com/images/2025/02/14/multimedia/00WestBank-Displacement-08-wmjt/00WestBank-Displacement-08-wmjt-threeByTwoSmallAt2X.jpg?format=pjpg&quality=75&auto=webp&disable=upscale"
          title="Palestinian Displacement in West Bank Is Highest Since 1967, Experts Say"
          description="The Israeli military launched a wide-scale operation last month against militants in the West Bank. Now, roughly 40,000 Palestinians have fled their homes."
          :ui="{
            title: 'text-sm',
            description: 'line-clamp-3 break-all',
          }"
        />
        <div class="w-[80%] mx-auto border border-[var(--ui-border)]"></div>
        <NewsCard
          image="https://static01.nyt.com/images/2025/02/17/multimedia/17pope-health-zcqw/17pope-health-zcqw-threeByTwoSmallAt2X.jpg?format=pjpg&quality=75&auto=webp&disable=upscale"
          title="Pope to Stay in Hospital to Address ‘Complex’ Clinical Issue, Vatican Says"
          description="Pope Francis was admitted on Friday with a respiratory infection. Today’s announcement had no further details but raised fresh concerns about his health."
          :ui="{
            title: 'text-sm',
            description: 'line-clamp-3 break-all',
          }"
        />
      </div>
    </div>
    <div class="my-10 space-y-4">
      <h2 class="text-lg font-bold underline font-red-hat-display">Sport</h2>
      <div class="grid grid-cols-[repeat(auto-fit,_minmax(280px,_1fr))] gap-4">
        <NewsCard
          image="https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/35e7/live/fbc72030-ee20-11ef-b60b-b99009067101.jpg.webp"
          title="Ireland's Jack Conan admits the side's back row will be under a 'huge amount of pressure' to fill the void left by Caelan Doris' injury against Wales in the Six Nations on Saturday (14:15 GMT)."
          description="Simon Easterby's side have won their opening two games of the championship against England and Scotland, but will be forced into changes for this weekend's trip to Cardiff with captain Doris and Ronan Kelleher both ruled out."
          :ui="{
            title: 'text-sm',
            description: 'line-clamp-3 break-all',
          }"
        />
        <NewsCard
          image="https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/35e7/live/fbc72030-ee20-11ef-b60b-b99009067101.jpg.webp"
          title="Ireland's Jack Conan admits the side's back row will be under a 'huge amount of pressure' to fill the void left by Caelan Doris' injury against Wales in the Six Nations on Saturday (14:15 GMT)."
          description="Simon Easterby's side have won their opening two games of the championship against England and Scotland, but will be forced into changes for this weekend's trip to Cardiff with captain Doris and Ronan Kelleher both ruled out."
          :ui="{
            title: 'text-sm',
            description: 'line-clamp-3 break-all',
          }"
        />
        <NewsCard
          image="https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/35e7/live/fbc72030-ee20-11ef-b60b-b99009067101.jpg.webp"
          title="Ireland's Jack Conan admits the side's back row will be under a 'huge amount of pressure' to fill the void left by Caelan Doris' injury against Wales in the Six Nations on Saturday (14:15 GMT)."
          description="Simon Easterby's side have won their opening two games of the championship against England and Scotland, but will be forced into changes for this weekend's trip to Cardiff with captain Doris and Ronan Kelleher both ruled out."
          :ui="{
            title: 'text-sm',
            description: 'line-clamp-3 break-all',
          }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup></script>
