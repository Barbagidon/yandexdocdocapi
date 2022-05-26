



const postData = async (url) => {
    let res = await fetch(url, {
        method: 'GET',
    });
    return await res.json();
};


const select = document.querySelector('#city');
const metro = document.querySelector('#metro');
const area = document.querySelector("#area");

postData('https://barbagidonproxy.herokuapp.com/https://api.docdoc.ru/public/rest/1.0.12/city?pid=29028')

    .then(res => {
        const makeSelect = (res, claz, select) => {

            for (let { Name, Id } of res) {
                let newOption = new Option(Name, Id);
                newOption.classList.add(claz);
                select.append(newOption);

            }

        };

        makeSelect(res.CityList, 'city__item', select);

        const removeItems = (selector) => {
            const items = document.querySelectorAll(selector);
            items.forEach(item => {
                item.remove();
            });
        };


        const onSelect = () => {
            postData(`https://barbagidonproxy.herokuapp.com/https://api.docdoc.ru/public/rest/1.0.12/metro/city/${select.value}?pid=29028`)
                .then((data) => {
                    console.log(data);
                    let x = [];
                    for (let { Name, Id } of data.MetroList) {
                        let obj = { Name: Name, Id: Id };
                        x.push(obj);

                    }

                    const grouped = Object.values(x.reduce((acc, n) => {
                        (acc[n.Name] = acc[n.Name] || { ...n });
                        return acc;
                    }, {}));

                    removeItems('.metro__item');
                    makeSelect(grouped, 'metro__item', metro);

                    metro.addEventListener('click', (e) => {
                        let areaAdd = [];

                        let distId;
                        if (metro.value != 'Выберите метро') {
                            for (let { DistrictIds, Id, Longitude, Latitude } of data.MetroList) {

                                if (e.target.value === Id) {

                                    distId = DistrictIds[0];
                                    if (!distId) {
                                        postData(`https://barbagidonproxy.herokuapp.com/https://geocode-maps.yandex.ru/1.x/?format=json&apikey=dae61a1e-cfff-4f9a-893b-b5a2a4850b55&geocode=${Longitude} ${Latitude}`)
                                            .then((res) => {
                                                console.log(res);
                                                res.response.GeoObjectCollection.featureMember.forEach(item => {
                                                    if (item.GeoObject.description) {
                                                        const areaDescr = item.GeoObject.description;
                                                        if (areaDescr.search('район') > 0) {
                                                            const areaEdited = areaDescr.split(',')[0];
                                                            areaAdd.push(areaEdited);
                                                            let newOption = new Option(areaAdd[0], areaAdd[0]);
                                                            newOption.classList.add('area__item');
                                                            area.append(newOption);


                                                        }
                                                    }



                                                });
                                            });
                                    } else {


                                        console.log(distId);

                                        postData(`https://barbagidonproxy.herokuapp.com/https://api.docdoc.ru/public/rest/1.0.12/district/city/${select.value}?pid=29028`)
                                            .then((res) => {

                                                removeItems('.city__area');

                                                res.DistrictList.forEach(item => {

                                                    if (distId == item.Id) {
                                                        let newOption = new Option(item.Name, item.Id);
                                                        newOption.classList.add('city__area');
                                                        area.append(newOption);

                                                    }

                                                });










                                            });


                                    }



                                }


                            }




                        }


                    })

                });





            postData(`https://barbagidonproxy.herokuapp.com/https://api.docdoc.ru/public/rest/1.0.12/district/city/${select.value}?pid=29028`)
                .then((areas) => {
                    console.log(areas);
                    makeSelect(areas.DistrictList, 'city__area', area);

                });

        };

        onSelect();


        select.addEventListener('click', (e) => {
            onSelect();
            console.log(res);
            console.log(select.value);


        });





    }).then((res) => {







    });

var url = "https://barbagidonproxy.herokuapp.com/https://cleaner.dadata.ru/api/v1/clean/address";
var token = "e54d7c2949f842fb6f52adc0fb7cdf5692eadcf7";
var secret = "f38c77221ddb607e5f01530af33119e110f01204";
var query = "москва сухонская 11";

var options = {
    method: "POST",
    mode: "cors",
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Token " + token,
        "X-Secret": secret
    },
    body: JSON.stringify([query])
}

fetch(url, options)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log("error", error));




// 55.76, 37.64

// postData('https://barbagidonproxy.herokuapp.com/https://geocode-maps.yandex.ru/1.x/?format=json&apikey=dae61a1e-cfff-4f9a-893b-b5a2a4850b55&geocode=30.2026 59.988003')
//     .then((res) => {
//         console.log(res);
//     });





// function init() {
//     let c;
//     let map = new ymaps.Map('map-test', {
//         center: [5, 3],
//         zoom: 16,


//     }, {
//         searchControlProvider: 'yandex#search'
//     }),
//         yellowCollection = new ymaps.GeoObjectCollection(null, {
//             preset: 'islands#yellowIcon'
//         }),
//         blueCollection = new ymaps.GeoObjectCollection(null, {
//             preset: 'islands#blueIcon'
//         }),
//         yellowCoords = [[55.73, 37.75]],
//         blueCoords = [[55.73, 37.65]];


//     for (let i = 0, l = yellowCoords.length; i < l; i++) {
//         yellowCollection.add(new ymaps.Placemark(yellowCoords[i]));
//     }
//     for (let i = 0, l = blueCoords.length; i < l; i++) {
//         blueCollection.add(new ymaps.Placemark(blueCoords[i]));
//     }

//     map.panTo([55.73, 37.75], [55.73, 37.65], {
//         delay: 1500,
//         safe: true,
//         duration: 4000,
//     });

//     map.geoObjects.add(yellowCollection).add(blueCollection);


//     map.setBounds(map.geoObjects.getBounds());


//     console.log(map.geoObjects);





//     // window.addEventListener('click', (e) => {
//     //

//     // });



// }

// ymaps.ready(init);






