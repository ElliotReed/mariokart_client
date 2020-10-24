import { cupData, trackData } from "./data.js";

const cups = document.getElementById("cups");

function createCup(currentCup) {
  const cup = document.createElement("div");
  cup.setAttribute("class", "cup");

  const img = document.createElement("img");
  img.setAttribute("src", currentCup.img);

  const title = document.createElement("h1");
  title.innerText = currentCup.title;

  const name = document.createElement("h2");
  name.innerText = currentCup.name;

  const tracks = addTracks(currentCup.tracks);

  cup.appendChild(img);
  cup.appendChild(title);
  cup.appendChild(name);
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
    trackElement.innerText = currentTrack[0].name;
    trackContainer.appendChild(trackElement);
    console.log("track: ", track);
  });
  return trackContainer;
}

function displayCups(cupData) {
  cupData.forEach((currentCup) => {
    const newCup = createCup(currentCup);
    cups.appendChild(newCup);
  });
}

displayCups(cupData);
