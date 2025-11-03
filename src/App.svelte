<script>
    import { db, auth, serverTime, params, ratingTypes, ratingDefs, dev,
            experiment, userGroup, labName, email} from './utils.js';
    
    import { onMount } from 'svelte';
    import Intro from './pages/Intro.svelte';
    import Botcheck from './pages/Botcheck.svelte';
    import Consent from './pages/Consent.svelte';
    import Instructions1 from './pages/Instructions1.svelte';
    import Instructions2 from './pages/Instructions2.svelte';
    import Instructions3 from './pages/Instructions3.svelte';
    import Demo from './pages/Demo.svelte';
    import Task from './pages/Task.svelte';
    import Debrief from './pages/Debrief.svelte';
    import Complete from './pages/Complete.svelte';
    import Loading from './components/Loading.svelte';
    import Header from './components/Header.svelte';
    import ProlificPreview from './pages/ProlificPreview.svelte';
    import IdInput from './pages/IdInput.svelte'; // 💡 NEW: Manual ID input

    // path details
    const ratingsPath = `${experiment}/ratings`;
    const ratingsDoc = db.doc(ratingsPath);
    const subjectGroupPath = `${experiment}/subjects/${userGroup}`;
    const subjectGroupCollection = db.collection(subjectGroupPath);
    const stimuliPath = `${experiment}/stimuli`;
    const stimuliDoc = db.doc(stimuliPath);

    // declare and set other necessary variables
    let currVid;
    let currVidSrc;
    let currRating;
    let currDef;
    let subjectPath;
    let ratingDocPathway;
    let currentState;
    let consentStatus;
    let alreadyWatched = [];
    let moviesRemaining = [];
    let numOptions;
    let time = 0;
    
    console.log(dev);

    const resetTestWorker = async () => {
        if (params.workerId === 'test-worker') {
            currentState = 'consent';
            let subjectRef = subjectGroupCollection.doc(params.workerId);
            subjectRef.get().then(function(doc) {
                try {
                    let currPath = `${ratingsPath}/${params.workerId}`;
                    db.collection(currPath).get().then(function(ratingList) {
                        ratingList.forEach(function(doc) {
                            console.log('deleting: ', doc.id);
                            db.collection(currPath).doc(doc.id).delete()   
                        });      
                        subjectRef.update({
                            startTime: serverTime,
                            consentStatus: 'incomplete'
                        });
                        console.log('reset test-worker');
                    });
                } catch (error) {
                    console.error(error);
                }
            });
        } else {
            console.log(`Reset user requested but workerId is ${params.workerId}`);
        }
    };

    // *****************************************************************
    // CORE INITIALIZATION FUNCTION (Guarantees Authentication and Order)
    // *****************************************************************

    const initializeExperiment = async (participantId) => {
        try {
            // Ensure params.participantId is set for the rest of the app to use
            params.participantId = participantId;
            
            // 1. Firebase Authentication: Sign in or create the user
            const email = `${participantId}@experiment.com`;
            let userCredential;
            
            try {
                // Attempt Sign In
                userCredential = await auth.signInWithEmailAndPassword(email, participantId);
                console.log('User found...signing in with credentials');
            } catch (error) {
                if (error.code === 'auth/user-not-found') {
                    // If user not found, create the user
                    console.log('No user found...creating new credentials');
                    userCredential = await auth.createUserWithEmailAndPassword(email, participantId);
                } else {
                    console.error("Authentication Error:", error);
                    currentState = undefined; 
                    return; 
                }
            }
            
            let user = userCredential.user;

            if (!user) {
                 console.error("Critical: User object is null after authentication.");
                 currentState = undefined;
                 return;
            }

            // 2. User Document Setup (Guaranteed to run AFTER auth)
            let subjectRef = subjectGroupCollection.doc(participantId);
            subjectPath = `${subjectGroupPath}/${participantId}`;
            let doc = await subjectRef.get();

            if (!doc.exists) {
                // Initial document creation
                await subjectRef.set({
                    participantId: participantId,
                    userId: user.uid,
                    startTime: serverTime,
                    consentStatus: 'incomplete'
                });
                console.log('Created new subject document.');
            } else {
                // Returning user
                await subjectRef.update({ mostRecentTime: serverTime });
                console.log('Loading previous subject document.');
            }

            // 3. Stimuli and Rating Setup (Runs AFTER user doc exists)
            let stimuliTable = await stimuliDoc.get();
            for (var field in stimuliTable.data()) {
                moviesRemaining.push(field);
            }

            let currPath = `${ratingsPath}/${participantId}`;
            let ratingList = await db.collection(currPath).get();
            ratingList.forEach(function(doc) {
                moviesRemaining = removeItemOnce(moviesRemaining, doc.id.split("-")[0]);
            });
            numOptions = moviesRemaining.length;

            if (numOptions > 0) {
                // choose random starting video and rating type
                let movieIndex = Math.floor(Math.random()*moviesRemaining.length);
                let ratingIndex = Math.floor(Math.random()*ratingTypes.length);
                currVid = moviesRemaining[movieIndex];
                currRating = ratingTypes[ratingIndex];
                currDef = ratingDefs[ratingIndex];
                let vidPlusRating = `${currVid}-${currRating}`;
                ratingDocPathway = `${ratingsPath}/${participantId}/${vidPlusRating}`;
                currVidSrc = stimuliTable.data()[currVid];
                
                // 4. FINAL STEP: Transition state ONLY after setup is done
                updateState('consent');
            } else {
                console.log("No options left! Skipping consent.");
                updateState('complete');
            }

        } catch (error) {
            console.error("Experiment Initialization Failed:", error);
            // On failure, stay in loading or show an error screen
            currentState = undefined; 
        }
    };


    // *****************************
    // INITIAL ROUTING AND MOUNT
    // *****************************

    // Set to loading by default
    currentState = undefined;

    onMount(async () => {
        if (params.participantId) {
            // Prolific user (ID in URL): Start initialization immediately
            await initializeExperiment(params.participantId);
        } else {
            // Manual user: Prompt for ID
            currentState = 'id-input'; 
        }
    });


    // *****************************
    // handler functions
    // *****************************

    // Handler for the manual ID submission
    const handleIdSubmit = async (id) => {
        currentState = undefined; // Go to loading while we initialize
        await initializeExperiment(id);
        // initializeExperiment handles the state transition to 'consent' on success
    }

    const updateState = async (newState) => {
        currentState = newState;
        try {
            // FIX: Use .set with merge: true for robustness
            await db.doc(`${experiment}/subjects/${userGroup}/${params.participantId}`).set({ currentState }, { merge: true });
            console.log('updated user state');
        } catch (error) {
            console.error("Error updating state in DB:", error);
        }
    };

    // FIX: All consent/bot functions must use .set({ merge: true }) for robustness
    const failedBot = async () => {
        try {
            await db.doc(`${experiment}/subjects/${userGroup}/${params.participantId}`).set({ botStatus: "bot" }, { merge: true });
            console.log('user identified as bot');
        } catch (error) {
            console.error(error);
        }
    };

    const failedConsent = async () => {
        try {
            await db.doc(`${experiment}/subjects/${userGroup}/${params.participantId}`).set({ consentStatus: 'failed' }, { merge: true });
            console.log('user rejected consent');
        } catch (error) {
            console.error(error);
        }
    };

    const agreedConsent = async () => {
        try {
            await db.doc(`${experiment}/subjects/${userGroup}/${params.participantId}`).set({ consentStatus: 'signed' }, { merge: true });
            updateState('botcheck-instruct');
            console.log('user accepted consent');
        } catch (error) {
            console.error(error);
        }
    };

    function removeItemOnce(arr, value) {
        var index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
        }
        return arr;
    };
</script>

---

<style>
    .content { position: relative; }
    .header { left: 0; }
</style>

<div class="content">
    <div class="header">
        <Header on:resetTestWorker={resetTestWorker}></Header>
    </div>

    {#if !currentState}
        <Loading>Loading...</Loading>
    {:else if currentState === 'id-input'}
        <IdInput on:finished={handleIdSubmit} />
    {:else if currentState === 'prolific-preview'}
        <ProlificPreview />
    {:else if currentState === 'intro'}
        <Intro on:finished={() => updateState('consent')}></Intro>
    {:else if currentState === 'consent'}
        <Consent on:finished={() => agreedConsent()} on:returned={() => failedConsent()}></Consent>
    {:else if currentState === 'botcheck-instruct'}
        <Botcheck on:finished={() => updateState('instructions1')} on:failed={() => failedBot()}></Botcheck>
    {:else if currentState === 'botcheck-task'}
        <Botcheck on:finished={() => updateState('task')} on:failed={() => failedBot()}></Botcheck>
    {:else if currentState === 'instructions1'}
        <Instructions1 ratingType={currRating} defType={currDef} numOptions={numOptions} on:finished={() => updateState('demo')} />
    {:else if currentState === 'demo'}
        <Demo time={time} ratingType={currRating} on:back={() => updateState('instructions1')} on:finished={() => updateState('instructions2')} />
    {:else if currentState === 'instructions2'}
        <Instructions2 on:back={() => updateState('demo')} on:finished={() => updateState('instructions3')} />
    {:else if currentState === 'instructions3'}
    <Instructions3 ratingType={currRating} defType={currDef} on:back={() => updateState('instructions2')} on:finished={() => updateState('task')} />
    {:else if currentState === 'task'}
        <Task 
            stimuliPath={`${experiment}/stimuli`}
            pathway={`${experiment}/ratings/${params.participantId}`}
            ratingType={currRating}
            ratingDef={currDef}
            time={time}
            on:finished={() => updateState("debrief")}
        />
    {:else if currentState === 'debrief'}
        <Debrief
            subPath={subjectPath}
            email={email}
            labName={labName}
            numOptions={numOptions}
        />
    {:else if currentState === 'complete'}
        <Complete />
    {/if}    
</div>