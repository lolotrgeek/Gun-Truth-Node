# Gun Truth Node
Maintains a truthful graph where null values are recursively rejected.

## Install
```
npm i
```

## Run
config constant found in `server.js`

```
node server
```
## Notes
- Does not stop non-null overwrites.
- Will 'restore' nullified values when syncing.

## Credits
idea from https://github.com/zrrrzzt/bullet-catcher