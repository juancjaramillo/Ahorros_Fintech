import "@testing-library/jest-dom";


beforeAll(() => {
  Object.defineProperty(window, "scrollTo", {
    value: () => {},
    writable: true,
  });
});


const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    const msg = args[0];
    if (typeof msg === "string" && msg.includes("Not implemented: window.scrollTo")) {
      return; 
    }
    originalConsoleError(...args); 
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});
