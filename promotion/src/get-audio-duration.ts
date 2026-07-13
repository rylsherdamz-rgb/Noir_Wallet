import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { staticFile } from "remotion";

export const getAudioDuration = async (src: string) => {
  return getAudioDurationInSeconds(staticFile(src));
};
