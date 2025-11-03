<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
</script>

<style>
  .preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 80vh;
    text-align: center;
    padding: 2rem;
  }

  h1 {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    max-width: 600px;
  }

  .info {
    background: #f7f7f7;
    padding: 1.2rem;
    border-radius: 12px;
    max-width: 600px;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  button {
    background-color: #2e7d32;
    color: white;
    font-size: 1rem;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
  }

  button:hover {
    background-color: #1b5e20;
  }
</style>

<div class="preview">
  <h1>Welcome to the Study</h1>

  <div class="info">
    <p>
      You are viewing this page because you opened the study outside of Prolific
      or before officially starting it.
    </p>
    <p>
      To begin, please return to your <strong>Prolific</strong> dashboard and click
      “Start Study.” This ensures your participation is properly recorded.
    </p>
  </div>

  <button on:click={() => dispatch('refresh')}>
    Refresh Page
  </button>
</div>


