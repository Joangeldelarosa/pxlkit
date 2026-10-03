<script setup lang="ts">
import { PixelStatCard } from '@pxlkit/ui-kit-vue';
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <PixelStatCard label="Active" value="1,204" tone="green" trend="+3.1%" />
    <PixelStatCard label="Pending" value="48" tone="gold" trend="2 overdue" />
    <PixelStatCard label="Cancelled" value="12" tone="red" trend="-1 vs ayer" />
    <PixelStatCard label="Sessions" value="3.2k" tone="cyan" trend="+220 hoy" />
    <PixelStatCard label="Members" value="89" tone="purple" />
    <PixelStatCard label="Likes" value="412" tone="pink" />
    <PixelStatCard label="Drafts" value="7" tone="neutral" />
  </div>
</template>
