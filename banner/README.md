# Digital Climate Strike

## Banner Einbinden

### Quadratisch

![](https://fridaysforfuture.de/wp-content/uploads/2021/03/2021-03-06-webseiten-gif-300-spru%CC%88hkreide-001-1-1024x1024.gif)

```
<iframe style="width: 300px; height: 300px; border-width: 0;" src="https://fridaysforfuture.de/allefuer1komma5/banner/quadratic"></iframe>
```

### Rechteckig

![](https://klimawahl.world/allefuer1komma5/banner/vertical/2021-03-08-banner.jpg)

```
<div style="position: relative; width: 100%; padding-top: 15.3472222%;"><iframe style="width: 100%; height: 100%; position: absolute; top: 0; left: 0; bottom: 0; right: 0; border-width: 0;" src="https://fridaysforfuture.de/allefuer1komma5/banner/vertical"></iframe></div>
```

## Banner als Overlay Einbinden

### Quadratisch

![](https://fridaysforfuture.de/wp-content/uploads/2021/03/2021-03-06-webseiten-gif-300-spru%CC%88hkreide-001-1-1024x1024.gif)


```
<script>
var DIGITAL_CLIMATE_STRIKE_OPTIONS = {
    websiteName: 'example.com',
    style: 'quadratic',
    position: 'top_left' // <-- bzw. 'top_right', 'bottom_left', 'bottom_right' für die anderen positionen
}
</script>
<script src="https://fridaysforfuture.de/allefuer1komma5/banner/widget.js"></script>
```

### Rechteckig

![](https://klimawahl.world/allefuer1komma5/banner/vertical/2021-03-08-banner.jpg)

```
<script>
var DIGITAL_CLIMATE_STRIKE_OPTIONS = {
    websiteName: 'example.com',
    style: 'vertical',
    position: 'header' // bzw. 'footer'
}
</script>
<script src="https://fridaysforfuture.de/allefuer1komma5/banner/widget.js"></script>
```


## Image Tool - Local dev environment

### Setup

```shell
docker-compose up -d
```
should be enough


### Trouble Shooting

#### DockerCompose is running:

*logs of backend service:* 
```shell
docker-compose logs -f backend
```

*all logs:*

```shell
docker-compose logs -f backend
```

*Jump into backend container*:

```shell
docker-compose exec backend sh
```

There you can run:

```shell
noder run build
```
here you should find most issues, whith i.e. Typescript or routing.

*Call a command in the backend* 

```shell
docker-compose run backend <command>
```

where command can be each script in `image-tool/package.json` or of the underlying framework.



### The file upload - Registration

Available under [http://0.0.0.0:8090/register](http://0.0.0.0:8090/register)

## #The Admin - Moderation

### Pages for Iframes


##  Static pages as example

### Map example

### Fullpage with overlay
