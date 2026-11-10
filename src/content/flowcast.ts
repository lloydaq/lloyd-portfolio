import type { Screenshot } from './site';

// Everything on this page was checked against the FlowCast repository at commit
// adf1299 (github.com/lloydaq/flowcast, tagged v1.0.0): its code, tests, docs and
// the committed metrics in models/metrics/. Error figures are rounded from those
// JSON files. File paths are relative to that repository. Do not add a figure
// that is not in the code, its docs or its metrics.

export const flowCast = {
  name: 'FlowCast',
  tagline: 'Traffic speed forecasting for Los Angeles highways',
  release: 'v1.0.0',
  demo: 'https://lloydaq.github.io/flowcast/',
  summary:
    'Forecasts highway traffic speed 15, 30, 45 and 60 minutes ahead for the 207 loop-detector sensors of the METR-LA dataset, with four baselines, a LightGBM forecaster and a DCRNN graph neural network scored on identical rows. A React dashboard replays June 2012 and draws every forecast against what actually happened next.',
  stack:
    'Python, pandas, NumPy, LightGBM, PyTorch (DCRNN), FastAPI, Pydantic; React 19, TypeScript, Vite, TanStack Query, Leaflet',
  disclaimer:
    'The data is historical: the replay is March to June 2012, and nothing in the app is live or simulated. Each learned model was trained once, so the reported intervals cover day-to-day variation, not training randomness.',
} as const;

export const features = [
  ['Stack', flowCast.stack],
  ['Data', 'METR-LA: 207 Los Angeles highway sensors, one speed reading every 5 minutes, March to June 2012'],
  ['Models', 'Persistence, historical average, seasonal naive, AR on residuals, LightGBM and DCRNN'],
  ['Horizons', '15, 30, 45 and 60 minutes ahead'],
  ['Dashboard', 'Replays 4 to 27 June 2012 in 5-minute steps; the time, horizon and model live in the URL'],
  ['Status', 'Release v1.0.0; a public demo on GitHub Pages that runs entirely in the browser'],
] as const;

export interface Decision {
  title: string;
  why: string;
  cost: string;
}

export const decisions: Decision[] = [
  {
    title: 'Features that cannot see the future',
    why: 'Every feature for time t uses only readings at or before t. A test overwrites everything after a cut point with random values and requires every earlier feature to stay bit-identical.',
    cost: 'Each new feature needs its own leakage test, and some convenient features (centred windows, future-aware fills) are ruled out.',
  },
  {
    title: 'Every model on the same rows',
    why: 'Missing readings are recorded as 0 in the source. They are treated as missing and excluded from every loss and metric, so no model looks better by skipping hard rows.',
    cost: 'The scoring code has to be shared by every model, and MAPE leaves out speeds under 5 mph.',
  },
  {
    title: 'Congestion relative to each sensor',
    why: 'Free-flow speeds range from 36 to 70 mph, so one threshold would mislabel whole roads. A sensor counts as congested below 60% of its own free-flow speed (its 85th-percentile training speed).',
    cost: 'Severity depends on a per-sensor statistic from the training period, which has to ship with the forecasts.',
  },
  {
    title: 'Serve exactly what was evaluated',
    why: 'The API serves the test-period forecasts the models actually produced, so what the dashboard shows is what the metrics measured.',
    cost: 'The dashboard can only replay the test period; it cannot forecast an arbitrary new day.',
  },
  {
    title: 'A demo with no server',
    why: 'The replay is a fixed past, so every answer the API can give is known in advance. They are exported to static files and rebuilt in the browser, checked against 80 real API answers value for value.',
    cost: 'A 25 MB export to keep in step with the API, and a Content-Security-Policy delivered as a meta tag because GitHub Pages cannot send headers.',
  },
];

/** The pipeline, from the README's "How FlowCast works", with the package that owns each step. */
export const pipeline = [
  ['Rebuild the timeline', 'One canonical time × sensor speed matrix rebuilt from the overlapping published windows, then validated', 'src/flowcast/data/'],
  ['Split by time', 'Train, validation and test are consecutive periods; each timestamp belongs to exactly one', 'src/flowcast/data/'],
  ['Point-in-time features', '39 features per horizon, each built only from readings at or before the forecast time', 'src/flowcast/features/'],
  ['Train and compare', 'Baselines, LightGBM and DCRNN scored on the same rows with the same masked metrics', 'src/flowcast/models/, evaluation/'],
  ['Serve', 'FastAPI holds the evaluated forecasts in memory; read-only endpoints with validated input', 'src/flowcast/api/'],
  ['Replay', 'React dashboard: network map, sensor ranking, forecast against reality, model comparison', 'frontend/src/'],
] as const;

/** Test-period MAE in mph, from models/metrics/{baselines,lightgbm,dcrnn}.json. */
export const results = [
  ['Persistence', '3.48', '4.16', '4.75', '5.30'],
  ['Historical average', '4.19', '4.19', '4.19', '4.19'],
  ['Seasonal naive (week)', '5.09', '5.09', '5.09', '5.09'],
  ['AR on residuals', '3.27', '3.68', '3.89', '4.02'],
  ['LightGBM', '2.71', '3.10', '3.34', '3.49'],
  ['DCRNN', '2.64', '3.02', '3.28', '3.47'],
] as const;

/** DCRNN minus LightGBM test MAE (mph), 95% day-block bootstrap, from docs/model_comparison.md. */
export const significance = [
  ['15 min', '−0.078', '−0.101 to −0.058', '24 of 24', 'DCRNN better'],
  ['30 min', '−0.079', '−0.123 to −0.042', '20 of 24', 'DCRNN better'],
  ['45 min', '−0.055', '−0.119 to −0.006', '15 of 24', 'DCRNN better'],
  ['60 min', '−0.016', '−0.087 to +0.045', '12 of 24', 'No clear difference'],
] as const;

export const securityPoints = [
  'Every endpoint is read-only. Invalid input answers 422 with a reason and an unknown sensor 404; 31 tests cover the API’s security behaviour.',
  'There is no database, no accounts and no user data: the data is public, static and held in memory.',
  'The static demo loads scripts and data from its own origin only, under a Content-Security-Policy that also allows map images from the OpenStreetMap tile server.',
] as const;

export const limitations = [
  'Historical data only: the dashboard replays June 2012 and cannot forecast a new day.',
  'One dataset: 207 sensors in Los Angeles. Nothing has been tested on another network.',
  'Each learned model was trained once, with one seed; the bootstrap intervals do not cover training randomness.',
  'DCRNN uses its published settings and was not tuned for this split.',
  'On RMSE the result is mixed: at 45 and 60 minutes LightGBM is better, so DCRNN’s rare large misses are slightly worse.',
  'No prediction intervals yet: forecasts are point estimates.',
  'The 21 end-to-end flows need the dataset, so they run locally, not in CI.',
] as const;

export type ItemStatus = 'done' | 'open';

export const roadmap: { text: string; status: ItemStatus }[] = [
  { text: 'Dataset reconstruction, validation and exploratory analysis', status: 'done' },
  { text: 'Leakage-tested features, baselines and the evaluation framework', status: 'done' },
  { text: 'LightGBM and DCRNN, compared with bootstrap significance', status: 'done' },
  { text: 'FastAPI backend and React dashboard', status: 'done' },
  { text: 'End-to-end tests, a map performance check and a security review', status: 'done' },
  { text: 'Public demo on GitHub Pages, CI, v1.0 release', status: 'done' },
  { text: 'Calibrated prediction intervals', status: 'open' },
  { text: 'Corridor time-space diagram', status: 'open' },
];

// The network and sensor views are FlowCast's own captures (frontend/scripts/
// screenshots.mjs, docs/assets/screens/, 1440 × 900): they include the map tiles,
// which this environment could not load. The models view was captured for this site
// with scripts/project-shots.mjs from the gh-pages build at the same moment.
export const screenshots: Screenshot[] = [
  {
    light: '/flowcast/flowcast-network-light.png',
    dark: '/flowcast/flowcast-network-dark.png',
    width: 1440,
    height: 900,
    alt: 'FlowCast network screen replaying Tuesday 12 June 2012, 16:30: a map of Los Angeles highways with 207 sensors coloured by forecast congestion for 17:00, a list of sensors slowing next led by 773939 at 68 to 14 mph, and figures of 207 sensors, 63 congested now, 84 slower than free flow and 193 reporting.',
    caption:
      'The network at 16:30 on 12 June 2012, with DCRNN’s 30-minute forecast: 82 sensors forecast congested by 17:00.',
  },
  {
    light: '/flowcast/flowcast-forecast-light.png',
    dark: '/flowcast/flowcast-forecast-dark.png',
    width: 1440,
    height: 900,
    alt: 'FlowCast sensor 773939: 68 mph now and forecasts of 18, 14, 13 and 13 mph at the four horizons with the actual speeds beside them, and a chart of the speed before now, the dashed forecast and what happened, falling from free flow to about 13 mph.',
    caption:
      'Forecast against reality. Sensor 773939 is at 68 mph; DCRNN forecasts 14 mph by 17:00. It was actually 22 mph.',
  },
  {
    light: '/flowcast/flowcast-models-light.png',
    dark: '/flowcast/flowcast-models-dark.png',
    width: 2880,
    height: 1800,
    alt: 'FlowCast models screen: a table of test-period mean absolute error at 15, 30, 45 and 60 minutes for persistence, historical average, seasonal naive, AR on residuals, LightGBM and DCRNN, the sensors with the largest error, and error by hour of day for DCRNN and LightGBM.',
    caption:
      'Every model on the same rows. DCRNN has the lowest error at each horizon; at 60 minutes it ties LightGBM.',
  },
];
