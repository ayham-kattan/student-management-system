const fs = require('fs');
const path = require('path');
const YAML = require('yaml');
const { Router } = require('express');
const swaggerUi = require('swagger-ui-express');

const spec = YAML.parse(fs.readFileSync(path.join(__dirname, 'openapi.yaml'), 'utf8'));

const router = Router();

router.get('/openapi.json', (req, res) => res.json(spec));
router.use('/', swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: 'Student Management API' }));

module.exports = router;
