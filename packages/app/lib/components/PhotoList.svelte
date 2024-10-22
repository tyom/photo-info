<script lang="ts">
  import Dropzone from 'svelte-file-dropzone';
  import { addPhoto, photos } from '$stores/photos';
  import { flyTo } from '$stores/map';
  import { Button } from '$lib/components/ui/button';

  let isSidebarOpen = $state(false);

  async function handleFilesSelect(e: CustomEvent<FileList>) {
    const { acceptedFiles } = e.detail;

    for (const file of acceptedFiles) {
      await addPhoto(file);
    }
  }
</script>

{#if !isSidebarOpen}
  <div class="add-photos">
    <Button onclick={() => (isSidebarOpen = true)}>Add Photos</Button>
  </div>
{/if}

{#if isSidebarOpen}
  <div class="photo-list">
    <header>
      <h2>Photos</h2>
      <button onclick={() => (isSidebarOpen = false)}>Close</button>
    </header>
    <ul>
      {#each $photos as photo}
        <li>
          <button onclick={() => photo.gpsPosition && flyTo(photo.gpsPosition)}>
            <img
              src={URL.createObjectURL(photo.file)}
              alt=""
              class="image-preview"
            />
            <span class="location">
              {#if photo.gpsPosition}
                📍
              {:else}
                no location data
              {/if}
            </span>
          </button>
        </li>
      {/each}
    </ul>
    <Dropzone on:drop={handleFilesSelect} />
  </div>
{/if}

<style>
  .add-photos {
    position: absolute;
    padding: 12px;
    z-index: 2;
    top: 0;
    right: 0;
  }

  button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: pointer;
    transition: border-color 0.25s;
  }

  button:hover {
    border-color: #646cff;
  }

  .photo-list {
    padding: 12px;
    position: absolute;
    z-index: 2;
    right: 0;
    top: 0;
    bottom: 0;
    width: 15vw;
    min-width: 120px;
    display: flex;
    padding-bottom: 110px;
    flex-direction: column;
    gap: 8px;
    background: #111d;
  }

  .photo-list header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .photo-list h2 {
    margin: 0;
    font-size: 1.2rem;
  }

  ul {
    gap: 8px;
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: auto;
  }

  img {
    width: 100%;
  }

  .photo-list button {
    appearance: none;
    border: none;
    padding: 0;
    display: flex;
    position: relative;
  }

  .photo-list :global(.dropzone) {
    position: absolute;
    inset: 0;
    padding-top: 30px;
    z-index: -1;
    background: transparent;
    display: flex;
    justify-content: end;
  }

  .location {
    position: absolute;
    bottom: 0;
    left: 0;
    background: #0009;
    padding: 4px 8px;
    border-top-right-radius: 8px;
  }
</style>
