import axios from 'axios';
import adapter from 'axios/lib/adapters/http';
import config from '../src/config';

describe('/health', () => {
  it('health endpoint returns matching data', async () => {
    const baseURL = process.env.GP2GP_URL ? process.env.GP2GP_URL : config.url;

    const healthUrl = `${baseURL}/health`;
    const res = await axios.get(healthUrl, {
      adapter
    });

    expect(res.data).toEqual(
      expect.objectContaining({
        version: '1',
        description: 'Health of GP2GP Adapter service'
      })
    );
  });
});
