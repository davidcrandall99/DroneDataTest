## Usage

### Install dependencies

```
npm install
```
### .env variables

In the `renderer` directory, add a `.env` file with a maptiler API key

```
API_KEY=asfdasdfadsfasdf
```

Run the app locally

```
npm run dev
```

## NOTE

A few things to note:

1. The "Saving" is not persistent. In a scenario like this, we'd want an offline-first database, such as Realm with MongoDB, or a fully offline dataset like sqlite or spacialite, for geo-based coordinates.
2. The state management here is using React's native state management, and it's all in a single file. In a normal scenario, this would be broken up.
3. A lot of the UI is in a single file, just to get it working; in a normal scenario, UI would be broken into additional functional components.
