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
	let enteredProlificID = '';
    let alreadyWatched = [];
    let moviesRemaining = [];
    let numOptions;
    let time = 0;
    let initExperiment = false;
    
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

    // *****************************
	// main function
    // *****************************

	// always allow experiment access
	initExperiment = true;

	onMount(async () => {
        if (initExperiment) {
            auth.onAuthStateChanged(async (user) => {
                // determine workerId: Prolific PID if entered, otherwise generate anon ID
                if (enteredProlificID) {
                    params.workerId = enteredProlificID;
                }
                const workerId = params.workerId || `anon-${Date.now()}`;
                const password = String(workerId);

                if (!user) {
                    try {
                        await auth.signInWithEmailAndPassword(
                            `${workerId}@experiment.com`,
                            password
                        );
                        console.log('user found...signing in with credentials');
                    } catch (error) {
                        if (error.code === 'auth/user-not-found') {
                            console.log('no user found...creating new credentials');
                            await auth.createUserWithEmailAndPassword(
                                `${workerId}@experiment.com`,
                                password
                            );
                        } else {
                            console.error(error);
                        }
                    }
                } else {
                    console.log('user authenticated...');
                }

                // setup subject document
                let currUser = auth.currentUser;
                let subjectRef = subjectGroupCollection.doc(workerId);
                subjectPath = `${subjectGroupPath}/${workerId}`;
                subjectRef.get().then(function(doc) {
                    if (!doc.exists) {
                        subjectRef.set({
                            participantId: workerId,
                            userId: currUser.uid,
                            startTime: serverTime,
                            consentStatus: 'incomplete'
                        });
                    } else {
                        subjectRef.update({ mostRecentTime: serverTime });
                    }

                    // prepare stimuli
                    stimuliDoc.get().then(function(stimuliTable) {
                        for (var field in stimuliTable.data()) {
                            moviesRemaining.push(field);
                        }

                        let currPath = `${ratingsPath}/${workerId}`;
                        db.collection(currPath).get().then(function(ratingList) {
                            ratingList.forEach(function(doc) {
                                moviesRemaining = removeItemOnce(moviesRemaining, doc.id.split("-")[0]);
                            });
                            numOptions = moviesRemaining.length;

                            if (numOptions > 0) {
                                let movieIndex = Math.floor(Math.random()*moviesRemaining.length);
                                let ratingIndex = Math.floor(Math.random()*ratingTypes.length);
                                currVid = moviesRemaining[movieIndex];
                                currRating = ratingTypes[ratingIndex];
                                currDef = ratingDefs[ratingIndex];
                                let vidPlusRating = `${currVid}-${currRating}`;
                                ratingDocPathway = `${ratingsPath}/${workerId}/${vidPlusRating}`;
                                currVidSrc = stimuliTable.data()[currVid];
                                updateState('consent');
                            } else {
                                updateState('complete');
                            }
                        });
                    });
                });
            });
        }
    });

	// *****************************
	// handler functions
	// *****************************

  	const updateState = async (newState) => {
		currentState = newState;
		try {
			await db.doc(`${experiment}/subjects/${userGroup}/${params.workerId}`).update({ currentState });
			console.log('updated user state');
		} catch (error) {
			console.error(error);
		}
	};

	const failedBot = async () => {
		try {
			await db.doc(`${experiment}/subjects/${userGroup}/${params.workerId}`).update({ botStatus: "bot" });
			console.log('user identified as bot');
		} catch (error) {
			console.error(error);
		}
	};

	const failedConsent = async () => {
		try {
			await db.doc(`${experiment}/subjects/${userGroup}/${params.workerId}`).update({ consentStatus: 'failed' });
			console.log('user rejected consent');
		} catch (error) {
			console.error(error);
		}
	};

	const agreedConsent = async () => {
		try {
			await db.doc(`${experiment}/subjects/${userGroup}/${params.workerId}`).update({ consentStatus: 'signed' });
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
    {:else if currentState === 'intro'}
        <Intro on:finished={() => updateState('consent')}></Intro>
    {:else if currentState === 'consent'}
        <Consent on:finished={() => agreedConsent()} on:returned={() => failedConsent()} enteredProlificID={enteredProlificID}></Consent>
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
            pathway={`${experiment}/ratings/${params.workerId}`}
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
