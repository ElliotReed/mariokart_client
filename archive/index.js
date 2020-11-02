import { ctgpCupData } from "../data/ctgp/ctgpCupData";
import { ctgpTrackData } from "../data/ctgp/ctgpTrackData";
import { ctgpCustomCupData } from "../data/ctgp/ctgpCustomCupData";

function addCustomCupData(ctgpCustomCupData, ctgpCupData) {
  const customizedData = ctgpCustomCupData.map((cup) => {
    const enhancedCup = ctgpCupData[cup.id - 1];
    enhancedCup.customTracks = cup.customTracks;
    enhancedCup.customTitle = cup.customTitle;
  });
  return customizedData;
}

export const ctgpData = {
  cups: addCustomCupData(ctgpCustomCupData, ctgpCupData),
  tracks: ctgpTrackData,
};
