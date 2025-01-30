export default {
    transform: {
      "^.+\\.tsx?$": "esbuild-jest",
    },
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/test-setup.ts"],
  };
  