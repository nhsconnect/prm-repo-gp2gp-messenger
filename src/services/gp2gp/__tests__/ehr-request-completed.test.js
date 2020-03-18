import { EHRRequestCompleted, EHR_REQUEST_COMPLETED } from '../ehr-request-completed';

describe('EHRRequestCompleted', () => {
  it('should return "EHR Request Completed" when calling name', () => {
    expect(new EHRRequestCompleted().name).toBe('EHR Request Completed');
  });

  it('should return EHR_REQUEST_COMPLETED when calling interactionId', () => {
    expect(new EHRRequestCompleted().interactionId).toBe(EHR_REQUEST_COMPLETED);
  });

  it('should call parseGp2gpMessage? with message', async done => {
    const message = await new EHRRequestCompleted().handleMessage();
    // To Add
    expect(message).toEqual({});
    done();
  });
});
