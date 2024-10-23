<script lang="ts">
  import { ModeWatcher } from 'mode-watcher';
  import { Map, PhotoList, SelectedPhoto } from '$lib/components';
  import './app.css';
</script>

<main>
  <Map />
  <PhotoList />
  <SelectedPhoto />
  <ModeWatcher />
</main>
