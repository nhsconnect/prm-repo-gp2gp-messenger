import { getCurrentSpanAttributes, setCurrentSpanAttributes, startRequest } from "../tracing";

describe('tracing config', () => {
  it('should let us store and retrieve attributes related to the request', () => {
    startRequest(() => {
      setCurrentSpanAttributes({ weather: 'cloudy' });
      const attributes = getCurrentSpanAttributes();
      expect(attributes.weather).toBe('cloudy');
    });
  });

  it('should not let us retrieve stored attributes after the request has ended', () => {
    const requestTracing = startRequest(() => {
      setCurrentSpanAttributes({ city: 'London' });
    });
    requestTracing.endRequest();
    const attributes = getCurrentSpanAttributes();
    expect(attributes).toBe(undefined);
  });

  it('should support multiple independent requests', () => {
    const firstRequestTracing = startRequest(() => {
      setCurrentSpanAttributes({ river: 'Thames' });

      expect(getCurrentSpanAttributes()).toStrictEqual({ river: 'Thames' });
    });
    const secondRequestTracing = startRequest(() => {
      setCurrentSpanAttributes({ mountain: 'Snowden' });

      expect(getCurrentSpanAttributes()).toStrictEqual({ mountain: 'Snowden' });
    });
    secondRequestTracing.endRequest();
    firstRequestTracing.endRequest();
  });

  it('should let us store and retrieve multiple attributes', () => {
    startRequest(() => {
      setCurrentSpanAttributes({ colour: 'green', shape: 'oval' });
      const attributes = getCurrentSpanAttributes();
      expect(attributes).toStrictEqual({ colour: 'green', shape: 'oval' });
    });
  });

  it('should let us retrieve the merged set of attributes from multiple calls', () => {
    startRequest(() => {
      setCurrentSpanAttributes({ floor: 'carpet', paint: 'white' });
      setCurrentSpanAttributes({ paint: 'green', door: 'wood' });
      const attributes = getCurrentSpanAttributes();
      expect(attributes).toStrictEqual({ floor: 'carpet', paint: 'green', door: 'wood' });
    });
  });
});
