<script lang="ts">
  import { packageStore } from '$lib/stores/packages.svelte';
  import { formatDate, formatAbsoluteDate } from '$lib/utils/format';

  let packageCount = $derived(packageStore.totalCount || packageStore.packages.length);
  let lastIndexed = $derived(packageStore.generatedAt ? formatDate(packageStore.generatedAt) : null);
  let absoluteIndexed = $derived(packageStore.generatedAt ? formatAbsoluteDate(packageStore.generatedAt) : '');
  let shortSha = $derived(packageStore.commitSha ? packageStore.commitSha.slice(0, 7) : null);
</script>

<footer class="mt-auto border-t border-line text-sm text-muted">
  <div class="mx-auto max-w-5xl space-y-2 px-4 py-6 sm:px-6">
    <p>
      Not affiliated with the aerynOS project. Official sites:
      <a class="link" href="https://aerynos.com">aerynos.com</a>,
      <a class="link" href="https://aerynos.dev">aerynos.dev</a>,
      <a class="link" href="https://dash.aerynos.dev">Summit</a>,
      <a class="link" href="https://github.com/aerynOS/recipes">recipes</a>.
    </p>
    <p>
      {#if lastIndexed}
        {packageCount} recipes, indexed <span title={absoluteIndexed}>{lastIndexed.toLowerCase()}</span>{#if shortSha}
          from <a class="link font-mono" href="https://github.com/aerynOS/recipes/commit/{packageStore.commitSha}">{shortSha}</a>{/if}.
      {/if}
      Source on <a class="link" href="https://github.com/WynnCr/aerynos-package-explorer">GitHub</a>.
    </p>
  </div>
</footer>
