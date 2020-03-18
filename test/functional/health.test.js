import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import config from '../../src/config';

describe('/health', () => {
  it('should return 200', () => {
    return expect(
      axios.get(`${config.url}/health`, {
        adapter
      })
    ).resolves.toEqual(expect.objectContaining({ status: 200 }));
  });

  it('should return matching data', () => {
    return expect(
      axios.get(`${config.url}/health`, {
        adapter
      })
    ).resolves.toEqual(
      expect.objectContaining({
        data: expect.objectContaining({
          version: '1',
          description: 'Health of GP2GP Adapter service'
        })
      })
    );
  });
});
