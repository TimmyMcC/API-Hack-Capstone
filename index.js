'use strict';

const baseURL = 'https://api.openbrewerydb.org/breweries';

function queryParamsToString(params) {
  const queryItems = Object.keys(params)
    .map(key => {
      if (params[key] == null || params[key] === '') {
        return;
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    })
    .filter(Boolean)
  return queryItems.join('&');
}

function getBreweryInfo(query, brewState, brewType, maxResults=10) {

  const params = {
    by_city: query,
    by_state: brewState,
    by_type: brewType,
    per_page: maxResults,
  }
  const queryString = queryParamsToString(params)
  const url = baseURL + '?' + queryString;

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function displayResults(responseJson) {
  
  console.log(responseJson);
  $('#js-brew-info-list').empty();
  $('#js-error-message').empty();
  $('#js-clear-form').removeClass('hidden');

  for (let i = 0; i < responseJson.length; i++){
    let type = responseJson[i].brewery_type.charAt(0).toUpperCase() + responseJson[i].brewery_type.slice(1);
    let street = responseJson[i].street.split(/ /).join('+');
    let city = responseJson[i].city.split(/ /).join('+');
    let state = responseJson[i].state.split(/ /).join('+');
    let address = street + ',' + city + ',' + state;
    let mapName = responseJson[i].name.split(/ /).join('+');
    let phone = responseJson[i].phone;
    let formattedPhone = phone.substr(0, 3) + '-' + phone.substr(3, 3) + '-' + phone.substr(6,4);
    $('#js-brew-info-list').append(
      `<li class="brewBox">
      <h3><a href="${responseJson[i].website_url}" target="_blank" class="siteName">${responseJson[i].name}</a></h3>
      <p>Brewery Type: ${type}</p>
      <p>${responseJson[i].street}</p>
      <p>${responseJson[i].city}, ${responseJson[i].state} ${responseJson[i].postal_code}</p>
      <p>Call: <a href="tel:${formattedPhone}" class="phone">${formattedPhone}</a></p>
      <div id="map" class="mapBox">
        <a href="https://www.google.com/maps/place/${address}" target="_blank"><img class="mapImage" src="https://maps.googleapis.com/maps/api/staticmap?center=${address}&zoom=15&size=400x400&maptype=roadmap&markers=size:mid%7Ccolor:red%7C${address}&key=AIzaSyAYGHKk4ShuVV2kSW1qdriV73JdxAaxCzg"></a>
      </div>
      </li>`
    );
  };
  
  $('#js-brew-info-box').removeClass('hidden');
}

function watchForm() {
  $('#js-brewery-search').on('submit', function() {
    event.preventDefault();
    const brewCity = $('#js-brewery-city').val();
    const brewState = $('#js-brewery-state').val();
    const brewType = $('#js-brewery-type').val();
    const maxResults = $('#js-max-results').val();
    getBreweryInfo(brewCity, brewState, brewType, maxResults);
    clearForm();
  })
}

function clearForm() {
  $('#js-clear-form').on('click', function() {
    event.preventDefault();
    document.getElementById("js-brewery-search").reset();
    $('#js-brew-info-box').addClass('hidden');
    $('#js-clear-form').addClass('hidden');
  })
}

$(watchForm);