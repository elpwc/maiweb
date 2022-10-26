//@ts-ignore
const { generateService } = require('@umijs/openapi');
//import appconfig from './appconfig';

generateService({
  requestLibPath: "import request from '../../utils/request'",
  schemaPath: `http://localhost:3005/api-json`,
  serversPath: './src/services/',
});
