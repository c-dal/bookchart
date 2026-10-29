const {
  connectTestDatabase,
  clearTestDatabase,
  closeTestDatabase,
} = require("./helpers/database");

beforeAll(async () => {
  await connectTestDatabase();
});

beforeEach(async () => {
  await clearTestDatabase();
});

afterAll(async () => {
  await closeTestDatabase();
});
