<script>
  // Replace this with your actual completion code from Prolific
  const completionCode = "XXXXXXX"; 
  const prolificLink = `https://app.prolific.com/submissions/complete?cc=${completionCode}`;
</script>

<style>
  .container {
    text-align: center;
    align-items: center;
    width: 60%;
    margin: 5% auto;
    background-color: rgba(255, 255, 255, 0.4);
    border: 2px solid grey;
    border-radius: 8px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
    padding: 3%;
  }

  h1 {
    margin-bottom: 1rem;
  }

  .link-button {
    display: inline-block;
    margin-top: 1.5rem;
    padding: 0.75rem 1.5rem;
    background-color: #007bff;
    color: white;
    border-radius: 6px;
    text-decoration: none;
    font-weight: bold;
    transition: background-color 0.2s ease-in-out;
  }

  .link-button:hover {
    background-color: #0056b3;
  }
</style>

<div class="container">
  <h1>Thank you for your participation!</h1>
  <p>You have completed all the videos and tasks for this study.</p>
  <p><strong>Click the button below to return to Prolific and record your completion.</strong></p>

  <a class="link-button" href={prolificLink} target="_blank" rel="noopener noreferrer">
    Complete Study on Prolific
  </a>
</div>
