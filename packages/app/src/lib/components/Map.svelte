<script lang="ts">
  import { createMap } from '../../stores/map.ts';

  function mapAction(container: HTMLDivElement) {
    const map = createMap(container);

    return {
      destroy: () => {
        map.remove();
      },
    };
  }
</script>

<div class="map" use:mapAction></div>

<style>
  .map {
    height: 100vh;
    z-index: 1;
  }
</style>
