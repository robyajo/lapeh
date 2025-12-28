process.env.JWT_SECRET = "test-secret";
process.env.AVATAR_UPLOAD_DIR = "tests/temp/uploads";
process.env.NO_REDIS = "true"; // Disable Redis for tests

// Mock global prisma
jest.mock("@lapeh/core/database", () => {
  const { prisma } = jest.requireActual("./mocks/database");
  return { prisma };
});
