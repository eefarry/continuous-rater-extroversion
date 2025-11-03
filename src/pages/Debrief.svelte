<script>
    import { db, serverTime } from '../utils.js';

    // Props from parent
    export let subPath;
    export let email;
    export let labName;
    export let numOptions;
    let emailAddress = "mailto:" + email;

    // Get Prolific info from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const prolificPID = urlParams.get("PROLIFIC_PID");
    const studyID = urlParams.get("STUDY_ID");
    const sessionID = urlParams.get("SESSION_ID");

    // Demographics form fields
    let age = '';
    let sex = '';
    let ethnicity = '';
    let race = [];
    let nativeLang = '';
    let birth = '';
    let feedback = '';

    const raceOptions = [
        'Asian / Asian-American',
        'Black / African-American',
        'Native-American / Alaskan-Native',
        'Pacific-Islander / Native-Hawaiian',
        'White / Caucasian',
        'Other / Unknown'
    ];

    // Prolific completion URL (replace with your real code!)
    const prolificCompletionURL = "https://app.prolific.com/submissions/complete?cc=XXXXXXX";

    const submitSurvey = async () => {
        try {
            // Save demographic + Prolific info
            await db.doc(subPath).update({
                age,
                sex,
                ethnicity,
                race,
                nativeLang,
                birth,
                feedback,
                HIT_complete: serverTime,
                prolificPID,
                studyID,
                sessionID
            });

            // Redirect to Prolific completion page
            window.location.href = prolificCompletionURL;

        } catch (error) {
            console.error("Error submitting survey:", error);
            alert("Error submitting data. Please contact the researcher.");
        }
    };
</script>

<style>
    .container {
        margin: 0 auto !important; 
        max-width: 800px;
        text-align: center;
    }

    .age-input { width: 3rem; }
    .lang-input { width: 20rem; }
    .textarea-feedback { min-width: 80%; max-width: 80%; }

    .form-box {
        padding: 2%;
        background-color: rgba(255, 255, 255, 0.6);
        border-left: 2px solid #aaa;
        border-radius: 2px;
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);   
        text-align: left;
    }

    .label { font-weight: bold; }
    a { font-weight: bold; }
    .help { font-style: italic; }
    .button { background-color: lightblue; }
</style>


<div class="container">
    <div class="form-box">
        <h1>Thank You For Participating!</h1>
        <em>All questions are optional</em>

        <label class="label"><br><u>Age</u>
            <div class="options">
                <input class="input age-input" type="text" bind:value={age}/>
            </div><br>
        </label>

        <label class="label"><u>Gender</u>
            <div class="options">
                <label><input type="radio" bind:group={sex} value="male" /> Male</label>
                <label><input type="radio" bind:group={sex} value="female" /> Female</label>
                <label><input type="radio" bind:group={sex} value="other" /> Other</label>
                <br>
            </div>
        </label>

        <label class="label"><u>Ethnicity</u>
            <div class="options">
                <label><input type="radio" bind:group={ethnicity} value="hispanic" /> Hispanic</label>
                <label><input type="radio" bind:group={ethnicity} value="not_hispanic" /> Not Hispanic</label>
                <br>
            </div>
        </label>

        <label class="label"><u>Race</u>
            <div class="options">
                <select multiple bind:value={race}>
                    {#each raceOptions as raceOption}
                        <option value={raceOption}>{raceOption}</option>
                    {/each}
                </select>
            </div>
        </label>
        <p class="help">Cmd/Ctrl+Click to select multiple</p>

        <label class="label"><u>Native Language</u>
            <div class="options">
                <input class="input lang-input" type="text" bind:value={nativeLang} />
            </div><br>
        </label>

        <label class="label"><u>Birth Location</u>
            <div class="options">
                <input class="input lang-input" type="text" bind:value={birth} placeholder="City, State, Country" />
            </div><br>
        </label>

        <label class="label"><u>Feedback</u>
            <div class="options">
                <textarea class="textarea textarea-feedback" bind:value={feedback} placeholder="Thoughts or suggestions about this study" />
            </div>
        </label>

        <p>
            You can email <a href={emailAddress}>{labName}</a> with questions or concerns. <br>
            Thank you for participating! <br>
        </p>

        <button class="button is-success is-large" on:click={submitSurvey}>Submit and Finish</button>         
    </div> 
</div>
