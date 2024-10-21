<script lang="ts">
  import { addPhoto } from '../stores/photos';

  async function handleChange(e: Event) {
    const input = e.target as HTMLInputElement;

    for (const file of input.files as FileList) {
      await addPhoto(file);
    }
  }
</script>

<form method="post" id="input-form">
  <input type="file" name="file" onchange={handleChange} />
</form>

<style>
  #input-form {
    padding: 16px;
    gap: 16px;
    display: flex;
    flex-direction: column;
    position: absolute;
    left: 0;
    bottom: 0;
    z-index: 2;
    background: #111d;
    border-top-right-radius: 16px;
  }
</style>
