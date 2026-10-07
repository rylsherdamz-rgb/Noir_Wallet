/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { enableTailwind } from '@remotion/tailwind-v4';

// High-quality export defaults (no-JPEG loss on UI text, near-transparent h264,
// 320k audio). Override per-run via CLI flags, e.g. `--crf=14`.
Config.setVideoImageFormat("png");
Config.setCrf(16);
Config.setAudioBitrate("320k");
Config.setX264Preset("slow");
Config.setOverwriteOutput(true);
Config.overrideWebpackConfig(enableTailwind);
