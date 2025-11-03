// utils.js

// ************************************************
// PROLIFIC URL PARAMETERS (with test defaults)
// ************************************************
export const params = {
    PROLIFIC_PID: new URLSearchParams(window.location.search).get('PROLIFIC_PID') || 'test-prolific',
    STUDY_ID: new URLSearchParams(window.location.search).get('STUDY_ID') || 'test-study',
    SESSION_ID: new URLSearchParams(window.location.search).get('SESSION_ID') || 'test-session'
};

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
export const studyLocation = 'Columbia University';
export const labName = 'Social Cognitive and Neural Sciences lab';
export const email = 'columbia.freemanlab@gmail.com';
export const studyAim = 'understanding how people form impressions of others';
export const studyTasks = 'viewing videos of people telling a story about their life and rating these people continuously on a personality trait throughout the videos';
export const experiment = 'narrative-ratings';

// participant variables
export const userGroup = 'Prolific Group';
export const estHITTime = '30';
export const totalHITTime = estHITTime * 2;

// stimuli variables
export const ratingTypes = ['Extroverted'] // 'Conscientious', 'Extroverted', 'Agreeable', 'Neurotic']; // array of rating types   
export const ratingDefs = [
`reflects sociability, assertiveness, and positive emotionality.

<u>High Extroversion:</u> affectionate, talkative, active, fun-loving, passionate, enthusiastic and expressive in groups.

<u>Low Extroversion:</u> reserved, quiet, passive, prefers solitude or small groups, less expressive.`
];

// Firebase config
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

// dev store
export const dev = DEV_MODE ? writable(true) : writable(false);

// Firebase exports
firebase.initializeApp(firebaseConfig);
export const db = firebase.firestore();
export const auth = firebase.auth();
export const serverTime = firebase.firestore.Timestamp.now();

// Helper to parse any URL params (fallback)
const unescapeURL = (s) => decodeURIComponent(s.replace(/\+/g, '%20'));
export const getURLParams = () => {
    const parsedParams = {};
    const matches = window.location.href.match(/[\\?&]([^=]+)=([^&#]*)/g);
    if (matches) {
        matches.forEach(m => {
            const a = m.match(/.([^=]+)=(.*)/);
            parsedParams[unescapeURL(a[1])] = unescapeURL(a[2]);
        });
    }
    return parsedParams;
};
