<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import RatingBox from '../RatingBox.svelte';
	import CustomVideo from '../CustomVideo.svelte';
	import Loading from '../components/Loading.svelte';
	import { db, serverTime, params } from '../utils.js';

	const dispatch = createEventDispatcher();

	export let stimuliPath;      // e.g., `${experiment}/stimuli`
	export let pathway;          // e.g., `${experiment}/ratings/${params.workerId}`
	export let ratingType;       // e.g., "Extraversion"
	export let ratingDef;        // e.g., definition text for trait
	export let time;             // shared timestamp binding if needed

	let paused = true;
	let rating = 50.0;           // starting midpoint
	let allMovies = {};          // { videoName: url, ... }
	let movieOrder = [];         // randomized order
	let currIndex = 0;
	let currVid;
	let currVidSrc;
	let showUI = false;

	function handlePause() {
		paused = true;
	}
	function handlePlay() {
		paused = false;
	}

	// Shuffle helper
	function shuffle(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	// Save rating to Firestore
	async function saveRating() {
		try {
			const vidPlusRating = `${currVid}-${ratingType}`;
			const docPath = `${pathway}/${vidPlusRating}`;
			await db.doc(docPath).set({
				video: currVid,
				videoSrc: currVidSrc,
				ratingType: ratingType,
				finalRating: rating,
				timestamp: serverTime,
			});
			console.log(`Saved rating for ${currVid}`);
		} catch (err) {
			console.error('Error saving rating:', err);
		}
	}

	// Handle video end
	async function handleEnd() {
		await saveRating();

		currIndex++;
		if (currIndex < movieOrder.length) {
			currVid = movieOrder[currIndex];
			currVidSrc = allMovies[currVid];
			rating = 50.0;
		} else {
			console.log("All videos done!");
			dispatch('finished');
		}
	}

	onMount(async () => {
		try {
			const stimuliDoc = await db.doc(stimuliPath).get();
			allMovies = stimuliDoc.data();
			movieOrder = shuffle(Object.keys(allMovies));

			currVid = movieOrder[currIndex];
			currVidSrc = allMovies[currVid];
			showUI = true;

			console.log('Loaded movies in random order:', movieOrder);
		} catch (err) {
			console.error('Error loading stimuli:', err);
		}
	});
</script>

{#if showUI}
<main>
	<div class="container">
		<h1 style="text-align:center">How <strong>{ratingType}</strong> is this person?</h1>
		<p><u>Definition:</u> {@html ratingDef.replace(/\n/g, '<br>')}</p>
		<p style="text-align:center">
			Please put your fingers on the up and down arrow keys.<br>
			Click on the video to play and start entering your ratings continuously.
		</p>

		<CustomVideo
			src={currVidSrc}
			bind:time
			on:pause={handlePause}
			on:play={handlePlay}
			on:finished={handleEnd}
		/>

		<RatingBox
			pathway={`${pathway}/${currVid}-${ratingType}`}
			rating={rating}
			bind:time
			bind:paused
			ratingType={ratingType}
		/>
	</div>
</main>
{:else}
	<Loading>Loading videos...</Loading>
{/if}

<style>
	main {
		padding: 1em;
		margin: 0 auto;
		min-width: 400px !important;
		max-width: 1000px !important;
	}
	h2 {
		font-weight: normal;
	}
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
