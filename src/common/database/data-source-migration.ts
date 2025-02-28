import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
// import config from 'config';

import { DataSource } from 'typeorm';
import { typeOrmConfig } from './data-source';

const dataSource = new DataSource(typeOrmConfig);
dataSource.initialize();
export default dataSource;
