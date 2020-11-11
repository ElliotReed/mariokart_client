import { ctgpCupData } from "./ctgpCupData.js";
import { ctgpTrackData } from "./ctgpTrackData.js";
import { ctgpCustomCupData } from "./ctgpCustomCupData.js";
import { wiiCupData } from "./wiiCupData.js";
import { wiiTrackData } from "./wiiTrackData.js";
import { randomIntegerFromInterval } from "./utils/randomIntegerFromInterval.js";

import { config } from "../../config/config.js";
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
  toTopButton: document.getElementById("to-top"),
  resetCurrentCupsButton: document.getElementById("reset-current-cups"),
  pickedCup: document.getElementById("picked-cup"),
  ellieLifetime: document.getElementById("ellie-lifetime"),
  ellieCurrent: document.getElementById("ellie-current"),
  elliotLifetime: document.getElementById("elliot-lifetime"),
  elliotCurrent: document.getElementById("elliot-current"),
  owedAmount: document.getElementById("owed-amount"),
  scorecard: document.getElementById("scorecard"),
  scoreboard: document.getElementById("scoreboard"),
  ellieRacer: document.getElementById("ellie-racer"),
  elliotRacer: document.getElementById("elliot-racer"),
  loader: document.getElementById("loader"),
};

const state = {
  trackType: "customTracks",
  gameData: {
    ellie: {
      cups: {
        lifetime: 0,
        current: 0,
      },
    },
    elliot: {
      cups: {
        lifetime: 0,
        current: 0,
      },
    },
  },
  characters: [],
  vehicles: [],
};

function gotoWii() {
  dom.wiiCups.scrollIntoView({ behavior: "smooth" });
}

function toTop() {
  dom.scoreboard.scrollIntoView({ behavior: "smooth" });
}

function toggleLoader(boolean) {
  if (boolean) {
    dom.loader.style.display = "flex";
  } else {
    dom.loader.style.display = "none";
  }
}

function getSimilarRacer(characters, otherRacer, proximity) {
  if (proximity === undefined) {
    proximity = 0;
  }

  const similarRacers = characters.filter((character) => {
    if (proximity === 0) {
      return (
        character.bonus.total === otherRacer.bonus.total &&
        character.id != otherRacer.id
      );
    } else {
      return (
        character.bonus.total + proximity === otherRacer.bonus.total ||
        (character.bonus.total - proximity === otherRacer.bonus.total &&
          character.id != otherRacer.id)
      );
    }
  });

  if (similarRacers.length < 1) {
    proximity++;
    return getSimilarRacer(characters, otherRacer, proximity);
  } else {
    const index = randomIntegerFromInterval(0, similarRacers.length - 1);
    const similarRacer = similarRacers[index];
    return similarRacer;
  }
}

function getRacer(otherRacer) {
  const racer = {};
  let id = randomIntegerFromInterval(1, state.characters.length);
  // eliminate one of mii outfit b
  if (id === 25) {
    if (otherRacer != undefined) {
      return getRacer(otherRacer);
    } else {
      return getRacer();
    }
  }

  if (otherRacer != undefined) {
    const similarRacer = getSimilarRacer(state.characters, otherRacer);
    id = similarRacer.id;
    // eliminate one of mii outfit b
    if (id === 25) {
      return getRacer(otherRacer);
    }
  }

  const result = state.characters.filter((character) => {
    return character.id === id;
  })[0];

  racer.id = result.id;
  racer.name = result.name;
  racer.img = result.img;
  racer.bonus = {};
  racer.bonus.total = result.bonus.total;
  racer.class = result.class;

  if (racer.id === 26) {
    racer.name = "Mii Outfit B";
    racer.img = "Mii_Outfit_B.png";
    if (otherRacer != undefined) {
      racer.class = "heavy";
    } else {
      racer.class = "small";
    }
  }

  if (racer.id === 27) {
    racer.name = "Mii Outfit A";
    racer.img = "Mii_Outfit_A.png";
    if (otherRacer != undefined) {
      racer.class = "heavy";
    } else {
      racer.class = "small";
    }
  }

  return racer;
}

function getSimilarVehicle(vehicles, otherVehicle, proximity) {
  if (proximity === undefined) {
    proximity = 1;
  }

  const similarVehicles = vehicles.filter((vehicle) => {
    if (vehicle.stats.total + proximity === otherVehicle.stats.total) {
      return vehicle;
    }
    if (vehicle.stats.total - proximity === otherVehicle.stats.total) {
      return vehicle;
    }
  });

  if (similarVehicles.length < 1) {
    proximity++;
    return getSimilarVehicle(vehicles, otherVehicle, proximity);
  } else {
    const index = randomIntegerFromInterval(0, similarVehicles.length - 1);
    const similarVehicle = similarVehicles[index];
    return similarVehicle;
  }
}

function getVehicle(racer, otherVehicle) {
  const vehicle = {};
  let id = randomIntegerFromInterval(1, 12);

  const vehiclesByClass = state.vehicles.filter((vehicle) => {
    return vehicle.class === racer.class;
  });

  if (otherVehicle != undefined) {
    const similarVehicle = getSimilarVehicle(vehiclesByClass, otherVehicle);
    id = similarVehicle.id;
  }

  const result = vehiclesByClass.filter((vehicle) => {
    return (
      vehicle.id === id || vehicle.id === id + 12 || vehicle.id === id + 24
    );
  })[0];

  vehicle.id = result.id;
  vehicle.class = result.class;
  vehicle.name = result.name;
  vehicle.img = result.img;
  vehicle.stats = {};
  vehicle.stats.total = result.stats.total;
  return vehicle;
}

function pickRacers() {
  const ellieRacer = getRacer();
  const elliotRacer = getRacer(ellieRacer);
  const ellieVehicle = getVehicle(ellieRacer);
  const elliotVehicle = getVehicle(elliotRacer, ellieVehicle);

  displayRacer(ellieRacer, ellieVehicle, "ellie");
  displayRacer(elliotRacer, elliotVehicle, "elliot");
}

function displayRacer(racer, vehicle, player) {
  const racerContainer = document.createElement("div");
  racerContainer.setAttribute("class", "racer-container");

  const h3 = document.createElement("h3");
  h3.textContent = player;

  const centerTextContainer = document.createElement("div");
  centerTextContainer.setAttribute("class", "center-text");
  const centerText = document.createElement("p");
  centerText.textContent = "driving the";

  const characterContainer = document.createElement("div");
  characterContainer.setAttribute("class", "racer-card");
  const characterName = document.createElement("p");
  characterName.textContent = racer.name;
  const characterImage = document.createElement("img");
  characterImage.setAttribute("src", `/assets/img/characters/${racer.img}`);

  const vehicleContainer = document.createElement("div");
  vehicleContainer.setAttribute("class", "racer-card");
  const vehicleName = document.createElement("p");
  vehicleName.textContent = vehicle.name;
  const vehicleImage = document.createElement("img");
  vehicleImage.setAttribute("src", `/assets/img/vehicles/${vehicle.img}`);

  let playerNode;
  if (player === "ellie") {
    playerNode = dom.ellieRacer;
  }
  if (player === "elliot") {
    playerNode = dom.elliotRacer;
  }

  playerNode.innerHTML = "";
  playerNode.appendChild(h3);

  characterContainer.appendChild(characterImage);
  characterContainer.appendChild(characterName);
  racerContainer.appendChild(characterContainer);

  centerTextContainer.appendChild(centerText);
  racerContainer.appendChild(centerTextContainer);

  vehicleContainer.appendChild(vehicleImage);
  vehicleContainer.appendChild(vehicleName);
  racerContainer.appendChild(vehicleContainer);
  playerNode.appendChild(racerContainer);
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

function increaseCupCount(player) {
  state.gameData[player].cups.lifetime++;
  state.gameData[player].cups.current++;
  showOwedAmount(state.gameData);
}

function showRaceData(gameData) {
  const ellieData = gameData.ellie;
  const elliotData = gameData.elliot;
  dom.ellieLifetime.textContent = createRaceDataString(
    ellieData.cups.lifetime,
    "lifetime"
  );
  dom.ellieCurrent.textContent = createRaceDataString(
    ellieData.cups.current,
    "current"
  );
  dom.elliotLifetime.textContent = createRaceDataString(
    elliotData.cups.lifetime,
    "lifetime"
  );
  dom.elliotCurrent.textContent = createRaceDataString(
    elliotData.cups.current,
    "current"
  );

  if (ellieData.cups.current === 0 && elliotData.cups.current === 0) {
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
  const ellieCurrentCups = data.ellie.cups.current;
  const elliotCurrentCups = data.elliot.cups.current;

  let textString = "";
  if (ellieCurrentCups > elliotCurrentCups) {
    textString = `Elliot owes Ellie ${calculateCash(
      ellieCurrentCups - elliotCurrentCups
    )}!`;
  } else if (elliotCurrentCups > ellieCurrentCups) {
    textString = `Ellie owes Elliot ${calculateCash(
      elliotCurrentCups - ellieCurrentCups
    )}!`;
  } else if (ellieCurrentCups === elliotCurrentCups && elliotCurrentCups != 0) {
    textString = `Even Steven`;
  }
  dom.owedAmount.textContent = textString;
}

function fetchCharacterData() {
  fetch(`${BASE_URL}/characterData`)
    .then((res) => res.json())
    .then((data) => {
      state.characters = data;
    });
}

// ========== http requests ==========
function fetchVehicleData() {
  fetch(`${BASE_URL}/vehicleData`)
    .then((res) => res.json())
    .then((data) => {
      state.vehicles = data;
    });
}

function fetchSupportingData() {
  fetch(`${BASE_URL}/supportingData`)
    .then((response) => response.json())
    .then((data) => {
      db.wiiData.cups = data.wiiCupData;
      db.wiiData.tracks = data.wiiTrackData;
    });
}
function fetchGameData() {
  toggleLoader(true);
  fetch(`${BASE_URL}/gameData`)
    .then((response) => response.json())
    .then((data) => {
      state.gameData = data;
      showRaceData(data);
      showOwedAmount(state.gameData);
      toggleLoader(false);
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

(function () {
  displayCups(dom.ctgpCups, db.ctgpData);
  displayCups(dom.wiiCups, db.wiiData);
  fetchGameData();
  fetchCharacterData();
  fetchVehicleData();
})();

const handleClick = function (event) {
  const targetElement = event.target;
  if (!targetElement.id) return;
  switch (targetElement.id) {
    case "goto_wii":
      gotoWii();
      break;
    case "custom":
      state.trackType = "customTracks";
      displayCups(dom.ctgpCups, db.ctgpData);
      break;
    case "to-top":
      toTop();
      break;
    case "pick-racers":
      pickRacers();
      break;
    case "reset-current-cups":
      state.gameData.ellie.cups.current = 0;
      state.gameData.elliot.cups.current = 0;
      saveData(state.gameData);
      showRaceData(state.gameData);
      break;
    case "increase-elliot-cups":
      increaseCupCount("elliot");
      saveData(state.gameData);
      showRaceData(state.gameData);
      break;
    case "increase-ellie-cups":
      increaseCupCount("ellie");
      saveData(state.gameData);
      showRaceData(state.gameData);
      break;

    case "pick-cup":
      randomCup();
      break;
    case "default":
      state.trackType = "defaultTracks";
      displayCups(dom.ctgpCups, db.ctgpData);
      break;
    case "alphabetical":
      state.trackType = "alphabeticalTracks";
      displayCups(dom.ctgpCups, db.ctgpData);
      break;
    default:
      console.log("clicked default");
  }
};

document.documentElement.addEventListener("click", handleClick);
document.body.addEventListener("scroll", () => {
  setTimeout(() => {
    if (document.body.scrollTop === 0) {
      dom.toTopButton.style.display = "none";
    } else {
      dom.toTopButton.style.display = "block";
    }
  }, 400);
});
