import logger from '../config/logging';

const handleMessage = message => {
  logger.debug(message);
};

export default handleMessage;
