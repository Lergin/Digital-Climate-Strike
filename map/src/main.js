const API_URL = 'http://localhost:8000';
const BASE_URL = 'http://localhost:8083';

function socialMediaContent(properties) {
  const { linkFacebook, linkInstagram, linkTwitter } = properties;

  return `
    <div style="text-align:center">
      ${
        linkFacebook != null ? `<a class="social" href="${linkFacebook}"><img src="https://fridaysforfuture.de/wp-content/uploads/2019/08/facebook.png"></a>` : ''
      }
      ${
        linkInstagram != null ? `<a class="social" href="${linkInstagram}"><img src="https://fridaysforfuture.de/wp-content/uploads/2019/08/insta.png"></a>` : ''
      }
      ${
        linkTwitter != null ? `<a class="social" href="${linkTwitter}"><img src="https://fridaysforfuture.de/wp-content/uploads/2019/08/twitter.png"></a>` : ''
      }
    </div>
  `
}

function actionContent(feature) {
  const {name, text, imagePath, state, type} = feature.properties;
  const id = feature.id;

  return `
    <h2>${name}</h2>

    ${
      text != null ? `<p>${text}</p>` : ''
    }

    ${
      state !== 'rejected' && imagePath !== '' && imagePath != null ? `<img class='actionContentImage' src='${API_URL}${imagePath}' />` : ''
    }

    ${
      state === 'none' ? `<span class='available-soon'>Foto noch nicht freigeschaltet.</span>` : ''
    }

    ${
       type === 'strike' ? socialMediaContent(feature.properties) : ''
    }

    <h3 style='margin-top: 20px'>Teilt diesen Eintrag mit dem Link!</h3>
    <p>Ich streike beim globalen Klimastreik am 19. März 2021 Online mit! #FridaysForFuture #AlleFür1Komma5 #NoMoreEmptyPromises</p>
    <a style='margin-top: 20px;' href='${BASE_URL}?participationId=${id}'>${BASE_URL}?participationId=${id}</a>
  `
}


const icon = L.icon({
  iconUrl: "./icons/default.png",
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});
const p4fIcon = L.icon({
  iconUrl: "./icons/p4f.png",
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});
const ogIcon = L.icon({
  iconUrl: "./icons/og.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});
const featuredIcon = L.icon({
  iconUrl: "./icons/featured.png",
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

function getIcon(properties) {
  if (properties.type === 'participation') {
    if (properties.p4f) {
      return p4fIcon;
    }

    if (properties.og) {
      return featuredIcon
    }

    if (properties.bannerState === 'accepted') {
      return featuredIcon
    }

    return icon;
  } else if (properties.type === 'strike') {
    return ogIcon
  }

  return icon;
}

function getParticipationId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("participationId");
}

async function getParticipationData(participationId) {
  const feature = await fetch(`${API_URL}/rest/map/${participationId}`).then(res => res.json());
  return feature;
}

function featureToMarker(feature) {
  return L.marker(
    [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
    { icon: getIcon(feature.properties) }
  )
    .bindPopup(actionContent(feature))
    .on({
      click(e) {
        this.openPopup();
      }
    })
}

(async () => {
  L.Map.addInitHook("addHandler", "gestureHandling", leafletGestureHandling.GestureHandling);
  const options = {
      center: [51.5, 10],
      zoom: 5.5,
      maxZoom: 14,
      zoomSnap: 0,
      prefereCanvas: true,
      gestureHandling: true,
  };

  map = L.map('mapid', options);
  L.tileLayer('https://mapcache.fridaysforfuture.de/{z}/{x}/{y}.png', {
      attribution: '<a href="https://fridaysforfuture.de/">FridaysforFuture.de</a>| &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  var markersCanvas = new L.MarkersCanvas();
  markersCanvas.addTo(map);

  const markers = new Map();

  const features = await fetch(`${API_URL}/rest/map/`).then(res => res.json());

  features.features.forEach(feature => {
    markers.set(feature.id, featureToMarker(feature));
  });

  const participationId = getParticipationId();
  console.log("Shared Marker:", participationId);
  let sharedMarker = null;

  if (participationId != '' && participationId != null) {
    const feature = await getParticipationData(participationId);
    sharedMarker = featureToMarker(feature);
    console.log(feature);

    markers.set(feature.id, sharedMarker);
    map.fitBounds(L.latLngBounds([[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]]));
  }

  markersCanvas.addMarkers(markers);

  sharedMarker?.openPopup();

  console.log("Markers:", markers.size);
})();
