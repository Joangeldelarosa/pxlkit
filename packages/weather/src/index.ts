import type { IconPack } from '@pxlkit/core';

export {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  Rain,
  Snow,
  Thunder,
  Wind,
  Thermometer,
  Droplet,
  Tornado,
  Fog,
  Rainbow,
  Sunrise,
  Sunset,
  Umbrella,
  Snowflake,
  Hail,
  Compass,
  WeatherIcons,
} from './icons';

// New static icons
export { ClearNight } from './icons/clear-night';
export { CloudyNight } from './icons/cloudy-night';
export { RainNight } from './icons/rain-night';
export { SnowNight } from './icons/snow-night';
export { HotTemp } from './icons/hot-temp';
export { ColdTemp } from './icons/cold-temp';
export { Eclipse } from './icons/eclipse';
export { CrescentMoon } from './icons/crescent-moon';
export { FullMoon } from './icons/full-moon';
export { StarryNight } from './icons/starry-night';
export { Drizzle } from './icons/drizzle';

// Animated icons
export { SpinningTornado } from './icons/spinning-tornado';
export { DriftingFog } from './icons/drifting-fog';
export { FallingSnow } from './icons/falling-snow';
export { LightningStrike } from './icons/lightning-strike';
export { PulsingSun } from './icons/pulsing-sun';
export { WindGust } from './icons/wind-gust';

import {
  Sun,
  Moon,
  Cloud,
  CloudSun,
  Rain,
  Snow,
  Thunder,
  Wind,
  Thermometer,
  Droplet,
  Tornado,
  Fog,
  Rainbow,
  Sunrise,
  Sunset,
  Umbrella,
  Snowflake,
  Hail,
  Compass,
} from './icons';

import { ClearNight } from './icons/clear-night';
import { CloudyNight } from './icons/cloudy-night';
import { RainNight } from './icons/rain-night';
import { SnowNight } from './icons/snow-night';
import { HotTemp } from './icons/hot-temp';
import { ColdTemp } from './icons/cold-temp';
import { Eclipse } from './icons/eclipse';
import { CrescentMoon } from './icons/crescent-moon';
import { FullMoon } from './icons/full-moon';
import { StarryNight } from './icons/starry-night';
import { Drizzle } from './icons/drizzle';
import { SpinningTornado } from './icons/spinning-tornado';
import { DriftingFog } from './icons/drifting-fog';
import { FallingSnow } from './icons/falling-snow';
import { LightningStrike } from './icons/lightning-strike';
import { PulsingSun } from './icons/pulsing-sun';
import { WindGust } from './icons/wind-gust';

export const WeatherPack: IconPack = {
  id: 'weather',
  name: 'Weather',
  description: 'Icons for weather conditions, seasons, and natural phenomena',
  icons: [
    Sun,
    Moon,
    Cloud,
    CloudSun,
    Rain,
    Snow,
    Thunder,
    Wind,
    Thermometer,
    Droplet,
    Tornado, Fog, Rainbow, Sunrise, Sunset, Umbrella, Snowflake, Hail, Compass,
    // New static
    ClearNight, CloudyNight, RainNight, SnowNight, HotTemp, ColdTemp,
    Eclipse, CrescentMoon, FullMoon, StarryNight, Drizzle,
    // New animated
    SpinningTornado, DriftingFog, FallingSnow, LightningStrike, PulsingSun, WindGust,
  ],
  version: '0.1.0',
  author: 'pxlkit',
};
