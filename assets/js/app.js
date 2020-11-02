import { ctgpCupData } from "./ctgpCupData.js";
import { ctgpTrackData } from "./ctgpTrackData.js";
import { ctgpCustomCupData } from "./ctgpCustomCupData.js";
import { wiiCupData } from "./wiiCupData.js";
import { wiiTrackData } from "./wiiTrackData.js";

import { config } from "./config.js";
const BASE_URL = config.BASE_URL;

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
  pickCupButton: document.getElementById("pick-cup"),
  pickedCup: document.getElementById("picked-cup"),
  toTopButton: document.getElementById("to-top"),
  logo: document.querySelector(".logo"),
  increaseEllieCupsButton: document.getElementById("increase-ellie-cups"),
  increaseElliotCupsButton: document.getElementById("increase-elliot-cups"),
  resetCurrentCupsButton: document.getElementById("reset-current-cups"),
  ellieLifetime: document.getElementById("ellie-lifetime"),
  ellieCurrent: document.getElementById("ellie-current"),
  elliotLifetime: document.getElementById("elliot-lifetime"),
  elliotCurrent: document.getElementById("elliot-current"),
  owedAmount: document.getElementById("owed-amount"),
};

const state = {
  trackType: "customTracks",
  gameData: {
    ellie: {
      lifetimeCups: 0,
      currentCups: 0,
    },
    elliot: {
      lifetimeCups: 0,
      currentCups: 0,
    },
  },
};

function toTop() {
  dom.logo.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function randomCup() {
  const numberOfCTGPCups = dom.ctgpCups.childElementCount;
  const numberOfWiiCups = 8;

  const totalCups = numberOfCTGPCups + numberOfWiiCups;

  const randomNumber = Math.floor(Math.random() * totalCups) + 1;

  const cupSet = randomNumber > numberOfCTGPCups ? "wii-" : "ctgp-";
  const cupNumber =
    randomNumber > numberOfCTGPCups
      ? randomNumber - numberOfCTGPCups
      : randomNumber;

  let dataCup = cupSet + cupNumber;
  const cupElement = document.querySelector(`[data-cup=${dataCup}]`);
  const cupText = cupElement.children[2].textContent;
  dom.pickedCup.textContent = cupText;

  setTimeout(() => {
    cupElement.scrollIntoView({ behavior: "smooth" });
  }, 600);
}

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

function getDataAttributeValue(cupData, id) {
  if (cupData.type === "wii") {
    return "wii-" + id;
  } else {
    return "ctgp-" + id;
  }
}

function setTitlesAndReturnTrackType(cupData, title, customTitle, currentCup) {
  if (cupData.type === "wii") {
    title.innerText = currentCup.title;
    customTitle.innerText = "";
    return "defaultTracks";
  } else if (cupData.type === "ctgp") {
    switch (state.trackType) {
      case "defaultTracks":
        title.innerText = currentCup.title;
        customTitle.innerText = "";
        return "defaultTracks";
        break;
      case "customTracks":
        title.innerText = currentCup.customTitle;
        customTitle.innerText = currentCup.title;
        return "customTracks";
        break;
      case "alphabeticalTracks":
        title.innerText = currentCup.title;
        customTitle.innerText = "";
        return "alphabeticalTracks";
        break;
    }
  }
}

function createCup(currentCup, cupData) {
  const cup = document.createElement("div");
  cup.setAttribute("class", "cup");
  cup.setAttribute("data-cup", getDataAttributeValue(cupData, currentCup.id));
  const imgContainer = document.createElement("div");
  imgContainer.setAttribute("class", "img-container");
  const img = document.createElement("img");
  img.setAttribute("src", `assets/img/cups/${currentCup.img}`);
  const title = document.createElement("h1");
  const customTitle = document.createElement("h2");
  const cupNumber = document.createElement("p");
  cupNumber.setAttribute("class", "cup-number");
  cupNumber.innerText = `Cup ${currentCup.id}`;

  let cupTrackType = setTitlesAndReturnTrackType(
    cupData,
    title,
    customTitle,
    currentCup
  );

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

function fetchData() {
  fetch(`${BASE_URL}/gameData`)
    .then((response) => response.json())
    .then((data) => {
      state.gameData = data;
      showRaceData();
      showOwedAmount(state.gameData);
    });
}

function saveData(gameData) {
  fetch(`${BASE_URL}/gameData`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gameData),
  })
    .then((res) => {
      console.log("response.status: ", res.status);
      showOwedAmount(state.gameData);
    })
    .catch((err) => {
      console.error("Error: ", err);
    });
}

function increaseCupCount(player) {
  state.gameData[player].lifetimeCups++;
  state.gameData[player].currentCups++;
  showOwedAmount(state.gameData);
}

function showRaceData() {
  const ellieData = state.gameData.ellie;
  const elliotData = state.gameData.elliot;
  dom.ellieLifetime.textContent = createRaceDataString(
    ellieData.lifetimeCups,
    "lifetime"
  );
  dom.ellieCurrent.textContent = createRaceDataString(
    ellieData.currentCups,
    "current"
  );
  dom.elliotLifetime.textContent = createRaceDataString(
    elliotData.lifetimeCups,
    "lifetime"
  );
  dom.elliotCurrent.textContent = createRaceDataString(
    elliotData.currentCups,
    "current"
  );

  if (ellieData.currentCups === 0 && elliotData.currentCups === 0) {
    dom.resetCurrentCupsButton.style.display = "none";
  } else {
    dom.resetCurrentCupsButton.style.display = "block";
  }
}

function createRaceDataString(dataCups, type) {
  return `${type} cups won ${dataCups}:\u00A0 ${calculateCash(dataCups)}`;
}

function calculateCash(value) {
  const cashAmount = value * 5;
  let cashString;
  if (cashAmount < 100) {
    cashString = `${cashAmount}¢`;
  } else {
    cashString = `$${(cashAmount / 100).toFixed(2)}`;
  }
  return cashString;
}

function showOwedAmount(data) {
  const ellieCurrentCups = data.ellie.currentCups;
  const elliotCurrentCups = data.elliot.currentCups;

  let textString = "";
  if (ellieCurrentCups > elliotCurrentCups) {
    textString = `Elliot owes Ellie ${calculateCash(
      ellieCurrentCups - elliotCurrentCups
    )}!`;
  } else if (elliotCurrentCups > ellieCurrentCups) {
    textString = `Ellie owes Elliot ${calculateCash(
      elliotCurrentCups - ellieCurrentCups
    )}!`;
  }
  dom.owedAmount.textContent = textString;
}

(function () {
  displayCups(dom.ctgpCups, db.ctgpData);
  displayCups(dom.wiiCups, db.wiiData);
  fetchData();
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
dom.pickCupButton.addEventListener("click", () => {
  randomCup();
});
dom.toTopButton.addEventListener("click", () => {
  toTop();
});
dom.increaseEllieCupsButton.addEventListener("click", () => {
  increaseCupCount("ellie");
  saveData(state.gameData);
  showRaceData();
});
dom.increaseElliotCupsButton.addEventListener("click", () => {
  increaseCupCount("elliot");
  saveData(state.gameData);
  showRaceData();
});
dom.resetCurrentCupsButton.addEventListener("click", () => {
  state.gameData.ellie.currentCups = 0;
  state.gameData.elliot.currentCups = 0;
  saveData(state.gameData);
  showRaceData();
});

document.body.addEventListener("scroll", () => {
  setTimeout(() => {
    if (document.body.scrollTop === 0) {
      dom.toTopButton.style.display = "none";
    } else {
      dom.toTopButton.style.display = "block";
    }
  }, 500);
});
