/**
 * OpenTelemetry browser SDK initialization.
 *
 * Configures a WebTracerProvider with a BatchSpanProcessor (5-second flush interval)
 * and a MeterProvider for recording metrics. Uses ConsoleSpanExporter by default;
 * when a collector endpoint is provided, uses OTLPTraceExporter.
 */
import { trace, metrics, type Tracer, type Meter } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import {
  WebTracerProvider,
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-web';

export interface TelemetryConfig {
  /** OTLP collector endpoint. Empty string means use ConsoleSpanExporter. */
  collectorEndpoint: string;
  /** Minimum interval between batch exports in milliseconds. */
  batchIntervalMs: number;
  /** Service name for trace attribution. */
  serviceName: string;
}

const DEFAULT_CONFIG: TelemetryConfig = {
  collectorEndpoint: '',
  batchIntervalMs: 5000,
  serviceName: 'host-shell',
};

let tracerInstance: Tracer | null = null;
let meterInstance: Meter | null = null;
let initialized = false;

/**
 * Initialize the OpenTelemetry SDK. Calling this more than once is a no-op.
 */
export function initTelemetry(config: Partial<TelemetryConfig> = {}): void {
  if (initialized) return;

  const resolvedConfig: TelemetryConfig = { ...DEFAULT_CONFIG, ...config };

  // --- Tracing setup ---
  const spanExporter = resolvedConfig.collectorEndpoint
    ? new OTLPTraceExporter({ url: resolvedConfig.collectorEndpoint })
    : new ConsoleSpanExporter();

  const tracerProvider = new WebTracerProvider({
    spanProcessors: [
      new BatchSpanProcessor(spanExporter, {
        scheduledDelayMillis: resolvedConfig.batchIntervalMs,
      }),
    ],
  });

  tracerProvider.register();

  // --- Metrics setup ---
  const meterProvider = new MeterProvider({
    readers: [
      new PeriodicExportingMetricReader({
        exporter: new ConsoleMetricExporter(),
        exportIntervalMillis: resolvedConfig.batchIntervalMs,
      }),
    ],
  });

  metrics.setGlobalMeterProvider(meterProvider);

  tracerInstance = trace.getTracer(resolvedConfig.serviceName);
  meterInstance = metrics.getMeter(resolvedConfig.serviceName);
  initialized = true;
}

/**
 * Get the global tracer instance. Initializes telemetry with defaults if not yet initialized.
 */
export function getTracer(): Tracer {
  if (!tracerInstance) {
    initTelemetry();
  }
  return tracerInstance!;
}

/**
 * Get the global meter instance. Initializes telemetry with defaults if not yet initialized.
 */
export function getMeter(): Meter {
  if (!meterInstance) {
    initTelemetry();
  }
  return meterInstance!;
}

/**
 * Reset telemetry state (useful for testing).
 */
export function resetTelemetry(): void {
  tracerInstance = null;
  meterInstance = null;
  initialized = false;
}
