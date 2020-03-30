import { mockClient } from '../../../../__mocks__/stompit';

export const connectToQueue = jest.fn().mockImplementation(callback => callback(false, mockClient));
