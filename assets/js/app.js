import { ctgpCupData } from "./ctgpCupData.js";
import { ctgpTrackData } from "./ctgpTrackData.js";
import { ctgpCustomCupData } from "./ctgpCustomCupData.js";
import { wiiCupData } from "./wiiCupData.js";
import { wiiTrackData } from "./wiiTrackData.js";

function addCustomCupData(customCupData, cupData) {
  const customizedData = customCupData.map((cup) => {
    const enhancedCup = cupData[cup.id - 1];
    enhancedCup.customTracks = cup.customTracks;
    enhancedCup.customTitle = cup.customTitle;
    return enhancedCup;
  });
  return customizedData;
}

function addAlphabeticalCupData(ctgpData) {
  const tracks = ctgpData.tracks;
  // remove 2 hidden tracks
  const tracksLength = tracks.length;
  tracks.length = tracksLength - 2;

  tracks.sort((a, b) =>
    a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1
  );

  let startIndex = 0;
  let endIndex = 4;

  const alphabetizedData = ctgpData.cups.map((cup) => {
    const alphaCupTracks = tracks.slice(startIndex, endIndex);
    startIndex = startIndex + 4;
    endIndex = endIndex + 4;
    const trackIds = alphaCupTracks.map((track) => {
      return track.id;
    });

    return (cup.alphabeticalTracks = trackIds);
  });
  // return;
  return alphabetizedData;
}

const db = {
  ctgpData: {
    type: "ctgp",
    cups: addCustomCupData(ctgpCustomCupData, ctgpCupData),
    tracks: ctgpTrackData,
  },
  wiiData: {
    type: "wii",
    cups: wiiCupData,
    tracks: wiiTrackData,
  },
};

db.ctgpData.cups.alphabeticalTracks = addAlphabeticalCupData(db.ctgpData);

const dom = {
  ctgpCups: document.getElementById("ctgp-cups"),
  wiiCups: document.getElementById("wii-cups"),
  defaultSortButton: document.getElementById("default"),
  customSortButton: document.getElementById("custom"),
  alphabeticalSortButton: document.getElementById("alphabetical"),
};

const state = {
  trackType: "customTracks",
};

function addTracks(tracks, cupData) {
  const trackContainer = document.createElement("div");
  trackContainer.setAttribute("class", "tracks");
  // console.log("cupData: ", cupData);
  tracks.forEach((track) => {
    const trackElement = document.createElement("p");
    const currentTrack = cupData.tracks.filter((el) => {
      return el.id === track;
    });
    trackElement.innerText = currentTrack[0].title;
    trackContainer.appendChild(trackElement);
  });
  return trackContainer;
}

function createCup(currentCup, cupData) {
  const title = document.createElement("h1");
  const cup = document.createElement("div");
  cup.setAttribute("class", "cup");
  const img = document.createElement("img");
  img.setAttribute("src", currentCup.img);
  const imgContainer = document.createElement("div");
  imgContainer.setAttribute("class", "img-container");
  const customTitle = document.createElement("h2");
  const cupNumber = document.createElement("p");
  cupNumber.setAttribute("class", "cup-number");
  cupNumber.innerText = `Cup ${currentCup.id}`;

  let cupTrackType;
  if (cupData.type === "wii") {
    cupTrackType = "defaultTracks";
    title.innerText = currentCup.title;
    customTitle.innerText = "";
  } else if (cupData.type === "ctgp") {
    switch (state.trackType) {
      case "defaultTracks":
        cupTrackType = "defaultTracks";
        title.innerText = currentCup.title;
        customTitle.innerText = "";
        break;
      case "customTracks":
        cupTrackType = "customTracks";
        title.innerText = currentCup.customTitle;
        customTitle.innerText = currentCup.title;
        break;
      case "alphabeticalTracks":
        cupTrackType = "alphabeticalTracks";
        title.innerText = currentCup.title;
        customTitle.innerText = "";
        break;
    }
  }

  if (currentCup[cupTrackType].length < 1) {
    return;
  } else {
    const tracks = addTracks(currentCup[cupTrackType], cupData);

    imgContainer.appendChild(img);
    cup.appendChild(imgContainer);
    cup.appendChild(customTitle);
    cup.appendChild(title);
    cup.appendChild(tracks);
    cup.appendChild(cupNumber);
    return cup;
  }
}

function displayCups(displayElement, cupData) {
  displayElement.innerHTML = "";
  cupData.cups.forEach((currentCup) => {
    let newCup = createCup(currentCup, cupData);
    if (newCup != null) {
      displayElement.appendChild(newCup);
    }
  });
}
(function () {
  displayCups(dom.ctgpCups, db.ctgpData);
  displayCups(dom.wiiCups, db.wiiData);
})();

dom.defaultSortButton.addEventListener("click", () => {
  state.trackType = "defaultTracks";
  displayCups(dom.ctgpCups, db.ctgpData);
});
dom.customSortButton.addEventListener("click", () => {
  state.trackType = "customTracks";
  displayCups(dom.ctgpCups, db.ctgpData);
});
dom.alphabeticalSortButton.addEventListener("click", () => {
  state.trackType = "alphabeticalTracks";
  displayCups(dom.ctgpCups, db.ctgpData);
});
