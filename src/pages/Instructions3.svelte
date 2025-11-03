<!-- src/pages/Instructions3.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  export let ratingType;
  export let defType;
  const dispatch = createEventDispatcher();

  let currentPage = 0;

  const instructions = [
    `For every video you will be rating how <strong>${ratingType}</strong> each person seems <u>throughout the entire video</u>.
     For example, you might think someone seems very ${ratingType} at some points in the video, but less at other points.
     Please change your rating to reflect how ${ratingType} they seem <u>at each moment in time</u>.<br><br>`,
    `<h2 style="text-align:center"><strong>${ratingType}</strong></h2>
     <p><u>Definition:</u> ${defType ? defType.replace(/\n/g, '<br>') : ''}</p>
     <br>There are no right or wrong answers — please use your best judgment.`
  ];

  function forward() {
    // only go to 'task' when the final "Next"/"Start Task" button is clicked
    if (currentPage + 1 === instructions.length) {
      dispatch('finished');
    } else {
      currentPage += 1;
    }
  }

  function backward() {
    currentPage = Math.max(currentPage - 1, 0);
  }
</script>


<style>
  .container { margin: 0 auto !important; max-width: 800px; text-align: center; }
  .text-box { text-align: left; padding: 2%; background-color: rgba(255,255,255,0.4);
              border: 2px solid grey; border-radius: 2px; box-shadow: 2px 2px 8px rgba(0,0,0,0.1); }
  .controls { display:flex; justify-content:space-between; margin-top:1rem; }
  button { background-color: lightblue; padding:0.5em 1em; border:none; border-radius:4px; cursor:pointer; }
</style>

<div class="container">
  <h1>Instructions</h1>
  <div class="text-box">
    <div class="content">
      {@html instructions[currentPage]}
    </div>
  </div>

  <div class="controls">
    {#if currentPage > 0}
      <button on:click={backward}>Back</button>
    {/if}

    <button on:click={forward}>
      {#if currentPage === instructions.length - 1}
        Start Task
      {:else}
        Next
      {/if}
    </button>
  </div>
</div>
