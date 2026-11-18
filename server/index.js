// Starts the server. The app itself is in app.js (so tests can use it without a port).
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
