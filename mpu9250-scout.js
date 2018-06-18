const config = require('./config');
const Scout = require(process.lynxari.scout);
const Mpu = require('./mpu9250');

module.exports = class MpuScout extends Scout {

  constructor(opts) {

    super();

    if (typeof opts !== 'undefined') {
      // copy all config options defined in the server
      for (const key in opts) {
        if (typeof opts[key] !== 'undefined') {
          config[key] = opts[key];
        }
      }
    }

    if (config.name === undefined) { config.name = "MPU9250" }
    this.name = config.name;

    this.mpu9250 = new Mpu(config);

  }

  init(next) {
    const query = this.server.where({name: this.name});
  
    const self = this;

    this.server.find(query, function(err, results) {
      if (!err) {
        if (results[0]) {
          self.provision(results[0], self.mpu9250);
          self.server.info('Provisioned known device ' + self.name);
        } else {
          self.discover(self.mpu9250);
          self.server.info('Discovered new device ' + self.name);
        }
      }
      else {
        self.server.error(err);
      }
    });

    next();
  }

}