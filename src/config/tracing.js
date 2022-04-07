import { context, trace, propagation } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

const tracerProvider = new NodeTracerProvider({});

propagation.setGlobalPropagator(new W3CTraceContextPropagator());

tracerProvider.register();
registerInstrumentations({
  tracerProvider: tracerProvider,
  instrumentations: [new HttpInstrumentation()]
});

console.log('Tracing initialised');

export const tracer = tracerProvider.getTracer('gp2gp-messenger-tracer');

// this works
export const setCurrentSpanAttributes = attributes => {
  const currentSpan = trace.getSpan(context.active());
  if (currentSpan) {
    currentSpan.setAttributes(attributes);
  }
};

export const setTraceId = traceId => {
  const currentSpan = trace.getSpan(context.active());
  if (currentSpan) {
    currentSpan.setAttribute('traceId', traceId);
    trace.setSpan(context.active(), currentSpan);
  }
};
