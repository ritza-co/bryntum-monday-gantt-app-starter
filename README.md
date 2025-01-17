# How to connect and sync Bryntum Gantt to monday.com

The code for the complete app is on the `complete-gantt` branch. The full guide is available on the Bryntum blog: [How to connect and sync Bryntum Gantt to monday.com](https://bryntum.com/blog/how-to-connect-and-sync-bryntum-gantt-to-monday-com/)

## Getting Started

Create a `.env` file in the root folder of your project and add your monday.com access token to the following environment variable:

```
VITE_MONDAY_ACCESS_TOKEN=
```

Install the Vite dev dependency by running the following command:

```bash
npm install
```

Run the dev server as follows: 

```bash
npm run dev
```

The application will be accessible on `http://localhost:8080/`.
