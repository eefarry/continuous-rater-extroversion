<script>
    import { createEventDispatcher } from 'svelte';
    // Access the 'labName' variable to personalize the text
    import { labName } from '../utils.js'; 

    const dispatch = createEventDispatcher();
    let participantId = '';
    let errorMessage = '';

    function submitId() {
        // Basic validation: Check if the ID field is empty
        if (participantId.trim() === '') {
            errorMessage = "Please enter your participant ID to continue.";
            return;
        }

        // Dispatch the 'finished' event, passing the ID back to App.svelte
        // The .trim() ensures no leading/trailing spaces are included.
        dispatch('finished', participantId.trim());
    }
</script>

<div class="page-container">
    <h2>Welcome to the {labName} Experiment! 👋</h2>
    <p>
        Before starting, please enter your **unique Participant ID** below. 
        This is the ID assigned to you by Prolific or your study coordinator.
    </p>

    <div class="input-group">
        <label for="participant-id">Participant ID:</label>
        <input 
            id="participant-id" 
            type="text" 
            bind:value={participantId} 
            placeholder="Enter ID here (e.g., ABC1234)"
            on:keydown={(e) => {if (e.key === 'Enter') submitId()}}
        />
    </div>

    {#if errorMessage}
        <p class="error-message">🛑 {errorMessage}</p>
    {/if}

    <button on:click={submitId} disabled={participantId.trim() === ''}>
        Start Experiment
    </button>

    <p class="note">
        **Note:** If you are a Prolific participant, this ID is automatically provided in the URL. If you see this page, it means you've accessed the link directly or are a non-Prolific participant.
    </p>
</div>

<style>
    .page-container {
        max-width: 600px;
        margin: 40px auto;
        padding: 20px;
        text-align: center;
        border: 1px solid #ccc;
        border-radius: 8px;
        background: #f9f9f9;
    }

    h2 {
        color: #333;
        margin-bottom: 20px;
    }

    p {
        margin-bottom: 20px;
        line-height: 1.6;
    }

    .input-group {
        margin-bottom: 15px;
    }

    label {
        display: block;
        font-weight: bold;
        margin-bottom: 5px;
    }

    input[type="text"] {
        width: 80%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box;
    }

    button {
        background-color: #007bff;
        color: white;
        padding: 12px 25px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1.1em;
        margin-top: 10px;
        transition: background-color 0.3s;
    }

    button:hover:not(:disabled) {
        background-color: #0056b3;
    }

    button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
    
    .error-message {
        color: red;
        font-weight: bold;
        margin-top: 10px;
    }

    .note {
        font-size: 0.8em;
        color: #666;
        margin-top: 30px;
        border-top: 1px solid #eee;
        padding-top: 15px;
    }
</style>