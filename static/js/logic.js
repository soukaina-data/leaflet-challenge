var apiKey = "pk.eyJ1Ijoic291a2FpbmEyMyIsImEiOiJjazcxM3NpYXQwMnUwM2ZtZHF2bTM0MnE3In0.ETF9QRUxFeu4A0U_9mbxrw"

var graymap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: apiKey
});

var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets-satellite",
    accessToken: apiKey
});

var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: apiKey
});

var map = L.map('map', {
    center: [
        40.7, -94.5
    ],
    zoom: 4,
    layers: [graymap,satellitemap,outdoors]
});

graymap.addTo(map);

var tectonicplates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

var baseMaps = {
    Satellite: satellitemap,
    Grayscale: graymap,
    Outdoors: outdoors
};

var overlays = {
    'Tectonic Plates': tectonicplates,
    Earthquakes: earthquakes
}

L   
    .control
    .layers(baseMaps, overlays)
    .addTo(map);

d3.json('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson', function (data) {
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillColor: getColor(feature.properties.mag),
            color: '#000000',
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    function getColor(magnitude) {
        switch (true) {
            case magnitude > 5:
                return '#ea2c2c';
            case magnitude > 4:
                return '#ea822c';
            case magnitude > 3:
                return '#ee9c00';
            case magnitude > 2:
                return '#eecc00';
            case magnitude > 1:
                return '#d4ee00';
            default:
                return '#98ee00';
        }
    }

    function getRadius(magnitude) {
        if (magnitude === 0) {
            return 1;
        }
        return magnitude * 4;
    }

    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: styleInfo,

        onEachFeature: function (feature, layer) {
            layer.bindPopup('Magnitude: ' + feature.properties.mag + '<br>Location: ' + feature.properties.place);
        }
    }).addTo(earthquakes);

    earthquakes.addTo(map);
    
    var legend = L.control({
        position: "bottomright"
      });
    
      // Then add all the details for the legend
      legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
    
        var grades = [0, 1, 2, 3, 4, 5];
        var colors = [
          "#98ee00",
          "#d4ee00",
          "#eecc00",
          "#ee9c00",
          "#ea822c",
          "#ea2c2c"
        ];
    
        // Looping through our intervals to generate a label with a colored square for each interval.
        for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
            "<i style='background: " + colors[i] + "'></i> " +
            grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
      };
    
      // Finally, we our legend to the map.
      legend.addTo(map);

      d3.json('https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json', function (platedata) {
          L.geoJson(platedata, {
              color: 'orange',
              weight: 2
          })
          .addTo(tectonicplates);

          tectonicplates.addTo(map);
      })
    });