
// ************************************************
// THIS PAGE REQUIRES EXPERIMENTER INPUT
// ************************************************

// don't change these import statements
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/performance";
import "firebase/analytics";
import { writable } from 'svelte/store';

// ************************************************
// ************************************************
// ************************************************
// ************************************************
// USER VARIABLES (FILL STUFF IN BELOW THIS LINE)
// ************************************************
// ************************************************
// ************************************************
// ************************************************

// lab variables
export const studyLocation = 'Columbia University'; // location of lab running mturk study
export const labName = 'Social Cognitive and Neural Sciences lab'; // name of lab running HIT experiment 
export const email = 'columbia.freemanlab@gmail.com'; // lab email for mturk
export const studyAim = 'understanding how people form impressions of others'; // aim of mturk study 
export const studyTasks = 'viewing videos of people telling a story about their life and rating these people continously on a personality trait throughout the videos'; // brief summary of HIT task for consent form
export const experiment = 'narrative-ratings'; // name of experiment (should match collection name in firebase)

// HIT variables
export const HITPay = '5.00'; // pay for HIT completion (format as X.XX with no dollar sign)
export const userGroup = 'Prolific Group'; // name of collection of participants for current HIT
export const estHITTime = '30'; // estimated time to complete HIT (in minutes)
export const totalHITTime = estHITTime * 2; // total time provided for HIT (in minutes)

// stimuli variables
export const ratingTypes = ['Extroverted'] // 'Conscientious', 'Extroverted', 'Agreeable', 'Neurotic']; // array of rating types   
export const ratingDefs = [
`reflects sociability, assertiveness, and positive emotionality.

<u>High Extroversion:</u> affectionate, talkative, active, fun-loving, passionate, enthusiastic and expressive in groups.

<u>Low Extroversion:</u> reserved, quiet, passive, prefers solitude or small groups, less expressive.`
];


// this configures path to proper firebase
// COPY AND PASTE YOUR FIREBASE CONFIG HERE
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRCgMCZ6-86XocHOPLHW6wBRjIOyoORaM",
  authDomain: "narrative-ratings-a2b79.firebaseapp.com",
  projectId: "narrative-ratings-a2b79",
  storageBucket: "narrative-ratings-a2b79.firebasestorage.app",
  messagingSenderId: "498681290309",
  appId: "1:498681290309:web:4e167cb9cc3c0c60a70d2c",
  measurementId: "G-6Y2W4GZNRQ"
};

// ************************************************
// ************************************************
// ************************************************
// ************************************************
// STOP. DON'T CHANGE ANYTHING BELOW THIS LINE
// ************************************************
// ************************************************
// ************************************************
// ************************************************

// dev is referenced as a store elsewhere in the code, so cannot be a simple Boolean
// eslint-disable-next-line no-undef
export const dev = DEV_MODE ? writable(true) : writable(false);

// firebase info (export for use elsewhere in app)
firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const auth = firebase.auth();
export const serverTime = firebase.firestore.Timestamp.now();

// Functions to parse the URL to get workerID, hitID, and assignmentID
const unescapeURL = (s) => decodeURIComponent(s.replace(/\+/g, '%20'));
export const getURLParams = () => {
    const params = {};
    let url = window.location.href;
    let m = window.location.href.match(/[\\?&]([^=]+)=([^&#]*)/g);
    
    if (m) {
        let i = 0;
        while (i < m.length) {
            const a = m[i].match(/.([^=]+)=(.*)/);
            params[unescapeURL(a[1])] = unescapeURL(a[2]);
            i += 1;
        }
    }
    if (!params.workerId && !params.assignmentId && !params.hitId) {
        // eslint-disable-next-line no-undef
        if (DEV_MODE) {
            console.log(
                'App running in dev mode so HIT submission will not work!\nTo test in the sandbox make sure to deploy the app.'
            );
            params.workerId = 'test-worker';
            params.assignmentId = 'test-assignment';
            params.hitId = 'test-hit';
            params.turkSubmitTo = 'test-submit';
        }
    }
    return params;
};

// Use those functions to get the window URL params and make them available throughout the app
export const params = getURLParams();


