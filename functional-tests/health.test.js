import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import config from '../src/config';

describe('/health', () => {
  it('health endpoint returns matching data', async done => {
    const res = await axios.get(`${config.url}/health`, {
      adapter
    });

    expect(res.data).toEqual(
      expect.objectContaining({
        version: '1',
        description: 'Health of GP2GP Adapter service'
      })
    );
    done();
  });
});
