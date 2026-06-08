import app from "./src/app.js";

// List all registered routes
console.log("🔍 Registered Routes:");
console.log("====================");

function listRoutes(stack, prefix = "") {
  for (let i = 0; i < stack.length; i++) {
    const route = stack[i];
    if (route.route) {
      const methods = Object.keys(route.route.methods).join(", ").toUpperCase();
      console.log(`${methods} ${prefix}${route.route.path}`);
    } else if (route.name === "router") {
      const routerPrefix = route.regexp
        .toString()
        .match(/^\/\^(.+?)\$\//)?.[1]?.replace(/\\\//g, "/") || prefix;
      if (route.handle.stack) {
        listRoutes(route.handle.stack, routerPrefix);
      }
    }
  }
}

listRoutes(app._router.stack);
console.log("====================");
