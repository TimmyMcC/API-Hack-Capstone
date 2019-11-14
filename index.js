'use strict';

const baseURL = 'https://api.openbrewerydb.org/breweries';

function queryParamsToString(params) {
  const queryItems = Object.keys(params)
    // Filters out unused optional search criteria so the url will be functional
    .map(key => {
      if (params[key] == null || params[key] === '') {
        return;
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
    })
    .filter(Boolean)
  return queryItems.join('&');
}

function getBreweryInfo(query, brewState, brewType, maxResults) {

  const params = {
    by_city: query,
    by_state: brewState,
    by_type: brewType,
    per_page: maxResults,
  }
  const queryString = queryParamsToString(params)
  const url = baseURL + '?' + queryString;
  
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      // If the search brings back no results (an empty array), user is alerted
      if (responseJson.length === 0){
        alert('Search yielded zero results. Try searching with different criteria.');
      }
      // Attempting to alert the user that their search was unsuccessful
      // Haven't come across an instance of this happening during testing, so I'm not 100% sure it works
      else if (response.statusText === 'Failed to fetch') {
        $('#js-error-message').empty();
        alert('Search was unsuccessful. Please try again.');
      }
      // If the search brings back fewer results than requested, user is alerted as to how many, then the results are displayed
      else if (responseJson.length < $('#js-max-results').val()) {
        alert(`Search yielded fewer results than were requested. Only ${responseJson.length} breweries were found.`);
        displayResults(responseJson);
      }
      else {displayResults(responseJson);}
    })
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function formatResults(responseJson) {
  for (let i = 0; i < responseJson.length; i++){
    // Capitalizes first letter of brewery type
    let type = responseJson[i].brewery_type.charAt(0).toUpperCase() + responseJson[i].brewery_type.slice(1);
    // Modifies the address components so they can be used in the Google Maps link
    let street = responseJson[i].street.split(/ /).join('+');
    let city = responseJson[i].city.split(/ /).join('+');
    let state = responseJson[i].state.split(/ /).join('+');
    let address = street + ',' + city + ',' + state;
    // Removes +4 from zip code to save on space once rendered
    let zip = responseJson[i].postal_code.substr(0, 5);
    // Changes phone number into a normal format
    let phone = responseJson[i].phone;
    let formattedPhone = '(' + phone.substr(0, 3) + ') ' + phone.substr(3, 3) + '-' + phone.substr(6,4);
    // Adds formatted results to the HTML 
    $('#js-brew-info-list').append(
      `<li class="brewBox">
      <h3 class="siteName"><a href="${responseJson[i].website_url}" target="_blank">${responseJson[i].name}</a></h3>
      <p>Brewery Type: ${type}</p>
      <p>${responseJson[i].street}</p>
      <p>${responseJson[i].city}, ${responseJson[i].state} ${zip}</p>
      <p>Call: <a href="tel:${formattedPhone}" class="phone">${formattedPhone}</a></p>
      <div id="map" class="mapBox">
          <a href="https://www.google.com/maps/place/${address}" target="_blank"><img class="mapImage" src="https://maps.googleapis.com/maps/api/staticmap?center=${address}&zoom=15&size=400x400&maptype=roadmap&markers=size:mid%7Ccolor:red%7C${address}&key=AIzaSyDj9_prueHs6rCxIYROe8FFn97GeGnlcSg"></a>
      </div>
    </li>`
  );
  };
}

function displayResults(responseJson) {
  $('#js-brew-info-list').empty();
  $('#js-error-message').empty();
  $('#js-restart-search').removeClass('hidden');
  formatResults(responseJson);
  $('#js-brew-info-box').removeClass('hidden');
}

function restartSearch() {
  $('#js-restart-search').on('click', function() {
    event.preventDefault();
    document.getElementById("js-brewery-search").reset();
    $('#js-brew-info-box').addClass('hidden');
    $('#js-restart-search').addClass('hidden');
  })
}

function watchForm() {
  $('#js-brewery-search').on('submit', function() {
    event.preventDefault();
    const brewCity = $('#js-brewery-city').val();
    const brewState = $('#js-brewery-state').val();
    const brewType = $('#js-brewery-type').val();
    const maxResults = $('#js-max-results').val();
    getBreweryInfo(brewCity, brewState, brewType, maxResults);
    restartSearch();
  })
}

$(watchForm);
