# Image tool - Upload, Moderate, example pages

## Disclaimer

This DockerCompose setup should be called for checking prod mode only. Please run the docker-compose.yml in
root folder for dev purpose!

## Local Environment

To set it up please run

```shell
cp .env.dist .env
```
This will prepare a local env var situation like we have it on prod. To read in your env var run

```shell
export $(xargs <.env)
```

which will export the env vars to your current shell. A first DockerCompose call should now get the service
up running:

```shell
docker-compose up -d --build
```

having the `--build` there would re-build the complete container, as this DockerCompose setup has no volume mount
or smth else to work in dev mode.

## Inside the container

> An awesome project based on Ts.ED framework

See [Ts.ED](https://tsed.io) project for more information.

## Build setup

> **Important!** Ts.ED requires Node >= 10, Express >= 4 and TypeScript >= 3.

```batch
# install dependencies
$ yarn install

# serve
$ yarn start

# build for production
$ yarn build
$ yarn start:prod
```
