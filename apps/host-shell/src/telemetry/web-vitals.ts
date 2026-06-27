/**
 * Core Web Vitals collection as OpenTelemetry metrics.
 *
 * Uses the `web-vitals` library to observe LCP, INP, and CLS,
 * then records them as OpenTelemetry gauge metrics via the global MeterProvider.
 */
import { onLCP, onINP, onCLS } from 'web-vitals';

import { getMeter } from './index';

let observing = false;

/**
 * Start observing Core Web Vitals and recording them as OTel metrics.
 * Calling this more than once is a no-op.
 */
export function observeWebVitals(): void {
  if (observing) return;
  observing = true;

  const meter = getMeter();

  // LCP - Largest Contentful Paint (milliseconds)
  const lcpGauge = meter.createGauge('web_vitals.lcp', {
    description: 'Largest Contentful Paint in milliseconds',
    unit: 'ms',
  });

  // INP - Interaction to Next Paint (milliseconds)
  // Replaces FID as the responsiveness metric
  const inpGauge = meter.createGauge('web_vitals.inp', {
    description: 'Interaction to Next Paint in milliseconds',
    unit: 'ms',
  });

  // CLS - Cumulative Layout Shift (unitless score)
  const clsGauge = meter.createGauge('web_vitals.cls', {
    description: 'Cumulative Layout Shift score',
    unit: '1',
  });

  onLCP((metric) => {
    lcpGauge.record(metric.value, { metric_id: metric.id });
  });

  onINP((metric) => {
    inpGauge.record(metric.value, { metric_id: metric.id });
  });

  onCLS((metric) => {
    clsGauge.record(metric.value, { metric_id: metric.id });
  });
}

/**
 * Reset observation state (useful for testing).
 */
export function resetWebVitalsObservation(): void {
  observing = false;
}
