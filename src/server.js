import app from './app';
import { logEvent } from './middleware/logging';

app.listen(3000, () => logEvent('Listening on port 3000'));
