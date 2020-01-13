const axios = require('axios');

axios
  .get(process.env.GP2GP_URL + '/health')
  .then(response => {
    console.log(response);
    if (response.status !== 200) {
      process.exit(5);
    }
  })
  .catch(err => {
    console.log(err);
    process.exit(8);
  });
