# api atlas

Api atlas is a very lightweight library for mapping an api with a simple configuration. It creates a client that handles caching and parsing for you. It can also be integrated with react using react-api-atlas.

### Installation

With npm
```sh
$ npm install --save api-atlas
```

With yarn
```sh
$ yarn add api-atlas
```

### Getting started

Atlas export three functions:
* AtlasClient
* AtlasMap
* createNetworkInterface

```js
import { AtlasClient, AtlasMap, createNetworkInterface } from 'api-atlas';
```

**>>>> FOR A VERY QUICK START, READ STEP 1 AND 5 <<<<**

### Step 1

Create an atlas configuration. The configuration is a js object with the following shape:
```js
const apiConfig = {
    host: 'your api host', 
    options: {}, // root level options
    resources: { // each resource is an object with a path and end-points
        Users: { // The resource name
            path: '/users', // The resource path
            options: {}, // resource level options
            endPoints: { // Each end-point is an object with path and options (fetchOptions - see below)
                getUsers: {
                    path: '/{username}/repos',
                    options: { // options is all fetch options (see below), plus cache and params (see below)
                        cache: false, // turn cache on or off for this request
                        params: { // default parameters
                            username: 'gugamm', // used if no username is supplied
                        },
                    },
                },
            },
        },
    },
};
```

**Note**: fetchOptions are options supported by the fetch api. For more information access [fetch](https://github.com/github/fetch)
**Note 2**: You can provide options at resource and root level. You could for example turn off cache for the entire api, or  just for a resource, however, inner options override outer options.

### Step 2

create an api map

```js
import { AtlasMap } from 'api-atlas';

const apiConfig = /* ... */;
const apiMap = AtlasMap(apiConfig); // This is the map of your api
```

The map of your api provide functions to build a request definition. This request definition is passed to the client so it can solve the request based on your configurations. That's why you need a map. We gonna see how to use it in the next steps.

### Step 3

create a network interface

```js
import { AtlasMap, createNetworkInterface } from 'api-atlas';

const apiConfig = /* ... */;
const apiMap = AtlasMap(apiConfig); // This is the map of your api
const networkInterface = createNetworkInterface({
    responseParser: response => response.json(), // you can provide a custom parser (optional)
});
networkInterface.setBeforeRequestListener(
    (url, options) => new Promise(resolve => setTimeout(resolve, 5000)),
); // You can provide a middleware that must return a promise that will resolve. You can override the url and the options by resolving with a object of { url, options }.
// Example: resolve({ url: 'newurl', options: {...options, body: 'newbody' } });
```

**note** There is no need to pass a responseParser. The network interface uses a json parser by default.
**note 2** You can use setBeforeRequestListener as a middleware to modify and log data about the request. Here you could set headers like authorization by returning new options. (see example below)

```js
networkInterface.setBeforeRequestListener(
    (url, options) => new Promise(resolve => {
        let token = null;
        if (window.localStorage) {
            token = window.localStorage.getItem('TOKEN');
        }
        resolve({ 
            options: {
                headers: {
                    ...options.headers, // <<-- Important! If you don't do this, other headers can be lost.
                    Authorization: token,
                },
            },
        });
    }),
);
```

### Step 4

Finally! Create your client and you are ready to go!

```js
import { AtlasClient, AtlasMap, createNetworkInterface } from 'api-atlas';

const apiConfig = /* ... */;
const apiMap = AtlasMap(apiConfig); // This is the map of your api
const networkInterface = createNetworkInterface(); // You can use the default constructor
const client = AtlasClient({
    networkInterface,
    getIdFromRequest: (url, options) => url, //return a unique id for the request
});
```

**note** You must pass a networkInterface
**note 2** getIdFromRequest is an optional function used by the cache handler to get an unique id for a request. This way it can look into the cache to see if there is a cached response there. This parameter is optional, but you can override to provide a better implementation. The default one uses the function above (id = url).

### Step 5

Using atlas

```js
import { AtlasClient, AtlasMap, createNetworkInterface } from 'api-atlas';

const apiConfig = /* ... */;
const apiMap = AtlasMap(apiConfig); // This is the map of your api
const networkInterface = createNetworkInterface(); // You can use the default constructor
const client = AtlasClient({ networkInterface });
const fetchDefinition = apiMap.Users.getUsers(); //You must call as a function so it return the fetch definition
const fetchOptions = { params: { username: 'gugamm' } }; //You can pass options
client.fetch(fetchDefinition, fetchOptions).then(repos => console.log(repos)); //yay!!
```

### More topics (comming soon)

* ApiClient docs (updating cache after mutating and clearing cache)

License
----

MIT
