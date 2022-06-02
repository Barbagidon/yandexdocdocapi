const postData = async (url) => {
  let res = await fetch(url, {
    method: "GET",
  });
  return await res.json();
};

const makeSelect = (res, claz, select) => {
  if (document.querySelectorAll(`.${claz}`).length < 1) {
    for (let { Name, Id } of res) {
      let newOption = new Option(Name, Id);
      newOption.classList.add(claz);
      select.append(newOption);
    }
  }
};

const removeItems = (selector) => {
  const items = document.querySelectorAll(selector);
  items.forEach((item) => {
    item.remove();
  });
};

const select = document.querySelector("#city");
const metro = document.querySelector("#metro");
const area = document.querySelector("#area");
const mapError = document.querySelector(".map__error");

let coord = [];
let id;
let metroId;
let areaId;
let url;

ymaps.ready(init);
function init() {
  let map = new ymaps.Map(
    "map-test",
    {
      center: [55.73, 37.65],
      zoom: 10,
    },
    {
      searchControlProvider: "yandex#search",
    }
  );

  let objectManager = new ymaps.ObjectManager({
    clusterize: true,
    gridSize: 32,
    clusterDisableClickZoom: true,
  });

  function setCenter() {
    map.setBounds(map.geoObjects.getBounds(), {
      checkZoomRange: true,
      zoomMargin: 35,
    });
  }

  const getSelect = (metroString) => {
    postData(
      "https://barbagidonproxy.herokuapp.com/https://api.docdoc.ru/public/rest/1.0.12/city?pid=29028"
    )
      .then((res) => {
        makeSelect(res.CityList, "city__item", select);
      })
      .then(() => {
        id = select.value;
        postData(
          `https://barbagidonproxy.herokuapp.com/https://api.docdoc.ru/public/rest/1.0.12/metro/city/${select.value}?pid=29028`
        ).then((data) => {
          if (data.MetroList.length < 1) {
            area.style.display = "block";
            metro.style.display = "none";
            postData(
              `https://barbagidonproxy.herokuapp.com/https://api.docdoc.ru/public/rest/1.0.12/district/city/${select.value}?pid=29028`
            ).then((res) => {
              makeSelect(res.DistrictList, "area__item", area);
              //   areaId = area.value;
            });
          } else {
            area.style.display = "none";
            metro.style.display = "block";
            let x = [];
            for (let { Name, Id } of data.MetroList) {
              let obj = { Name: Name, Id: Id };
              x.push(obj);
            }

            const grouped = Object.values(
              x.reduce((acc, n) => {
                acc[n.Name] = acc[n.Name] || { ...n };
                return acc;
              }, {})
            );

            makeSelect(grouped, "metro__item", metro);
          }
        });
        metroId = metro.value;
      })
      .then(() => {
        let url;
        if (metroString) {
          url = `https://barbagidonproxy.herokuapp.com/https://api.docdoc.ru/public/rest/1.0.12/doctor/list/start/0/count/10/city/${select.value}/${metroString}/?pid=29028`;
        } else {
          url = `https://barbagidonproxy.herokuapp.com/https://api.docdoc.ru/public/rest/1.0.12/doctor/list/start/0/count/10/city/${select.value}/speciality/90/?pid=29028`;
        }

        console.log(metroString);
        postData(url)
          .then((res) => {
            for (let { ClinicsInfo } of res.DoctorList) {
              let x = [];
              x.push(ClinicsInfo[0].Latitude);
              x.push(ClinicsInfo[0].Longitude);
              coord.push(x);
            }

            coord.forEach((item, i) => {
              const placemark = new ymaps.Placemark(item);
              map.geoObjects.add(placemark);
              map.geoObjects.getBounds();
            });
            if (coord.length > 0) {
              mapError.style.display = "none";
              mapError.textContent = "Загрузка";
              setCenter(coord);
            } else {
              mapError.style.display = "block";
              mapError.textContent =
                "К сожалению, в вашем городе нет таких врачей";
            }
          })
          .then(() => {
            if (mapError.textContent === "Загрузка") {
              mapError.style.display = "none";
            }
          });
      });
  };

  getSelect();

  const newMap = (item) => {
    coord = [];
    mapError.style.display = "block";
    mapError.textContent = "Загрузка";

    if (item) {
      getSelect(item);
    } else {
      getSelect();
    }

    map.geoObjects.removeAll();
  };

  let correctMetro;
  let correctArea;

  select.addEventListener("change", (e) => {
    if (
      (id != select.value && e.target == select) ||
      e.target.classList.contains("city__item")
    ) {
      removeItems(".metro__item");
      removeItems(".area__item");
      newMap();
    }

    if (id == select.value) {
      mapError.style.display = "none";
    }
  });

  metro.addEventListener("change", function (e) {
    if (this.value === "-1") {
      correctMetro = "-1";
      metroId = "";
      newMap();
    } else {
      correctMetro = "";
    }

    if (
      (metro.value != "Выберите метро" &&
        metroId != metro.value &&
        e.target.classList.contains("metro__item") &&
        correctMetro != "-1") ||
      (e.target === metro && correctMetro != "-1")
    ) {
      console.log(correctMetro);
      metroId = metro.value;
      newMap(`speciality/90/stations/${metroId}`);
    }
  });

  area.addEventListener("change", function (e) {
    if (this.value === "-1") {
      correctArea = "-1";
      areaId = "";
      newMap();
    } else {
      correctArea = "";
    }

    if (
      (e.target === area && correctArea != "-1" && areaId != area.value) ||
      (e.target.classList.contains("area__item") && correctArea != "-1")
    ) {
      console.log(correctArea);
      areaId = area.value;
      newMap(`district/${areaId}/speciality/90/?pid=29028`);
    }
  });
}
