const service = require('../services/student.service');
const { validateStudent, parseId, parseListQuery } = require('../utils/studentValidator');

async function list(req, res) {
  res.json(await service.list(parseListQuery(req.query)));
}

async function getById(req, res) {
  res.json({ data: await service.getById(parseId(req.params.id)) });
}

async function create(req, res) {
  const student = await service.create(validateStudent(req.body));
  res.status(201).location(`/api/students/${student.studentId}`).json({ data: student });
}

async function update(req, res) {
  const id = parseId(req.params.id);
  res.json({ data: await service.update(id, validateStudent(req.body)) });
}

async function remove(req, res) {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
}

module.exports = { list, getById, create, update, remove };
