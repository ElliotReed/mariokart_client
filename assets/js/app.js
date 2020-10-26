import { cupData } from "./cupData.js";
import { trackData } from "./trackData.js";
import { customCupData } from "./customCupData.js";

const cupType = "custum";

const cups = document.getElementById("cups");

function createCup(currentCup) {
  const trackType = cupType === "default" ? "defaultTracks" : "myTracks";
  const cup = document.createElement("div");
  cup.setAttribute("class", "cup");

  const img = document.createElement("img");
  img.setAttribute("src", currentCup.img);

  const title = document.createElement("h1");
  if (cupType === "default") {
    title.innerText = currentCup.title;
  } else {
    title.innerText = currentCup.myTitle;
  }

  const myTitle = document.createElement("h2");
  if (cupType === "default") {
    myTitle.innerText = currentCup.myTitle;
  } else {
    myTitle.innerText = currentCup.title;
  }

  const tracks = addTracks(currentCup[trackType]);

  cup.appendChild(img);
  cup.appendChild(title);
  cup.appendChild(myTitle);
  cup.appendChild(tracks);
  return cup;
}

function addTracks(tracks) {
  const trackContainer = document.createElement("div");
  trackContainer.setAttribute("class", "tracks");

  tracks.forEach((track) => {
    const trackElement = document.createElement("p");
    const currentTrack = trackData.filter((el) => {
      return el.id === track;
    });
    trackElement.innerText = currentTrack[0].title;
    trackContainer.appendChild(trackElement);
  });
  return trackContainer;
}

function displayCups(cupData) {
  cupData.forEach((currentCup) => {
    const newCup = createCup(currentCup);
    cups.appendChild(newCup);
  });
}

function addCustomCupData() {
  customCupData.map((cup) => {
    const enhancedCup = cupData[cup.id - 1];
    enhancedCup.myTracks = cup.myTracks;
    enhancedCup.myTitle = cup.myTitle;
  });
}

addCustomCupData();
displayCups(cupData);
