import { bundle } from "@remotion/bundler";
import { selectComposition } from "@remotion/renderer";

const serveUrl = await bundle({
  entryPoint: "/home/richie/Projects/Noir_Wallet/promotion/src/index.ts",
  webpackOverride: (c) => c,
});
const comp = await selectComposition({ serveUrl, id: "NoirDemo", inputProps: {} });
console.log("durationInFrames", comp.durationInFrames);
console.log("seconds", comp.durationInFrames / 30);
const p = comp.props;
console.log("sceneDurationsInFrames", JSON.stringify(p.sceneDurationsInFrames));
let acc = 0;
p.sceneDurationsInFrames.forEach((d, i) => { console.log(i, acc, d); acc += d; });
process.exit(0);
