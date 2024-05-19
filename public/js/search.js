const searchInput = document.querySelector('#search');
const cardsContainer = document.querySelector('.cardCont');

searchInput.addEventListener('input', async function () {
  const searchTerm = capitalizeFirstLetter(searchInput.value.trim());

  try {
    const response = await fetch(`/testx/${searchTerm}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();

    displaySearchResults(data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
});

function displaySearchResults(data) {
  cardsContainer.innerHTML = ''; // Clear existing content

  if (data.length === 0) {
    cardsContainer.textContent = 'No results found.';
    return;
  }

  data.forEach(listing => {
    const card = createCard(listing);
    cardsContainer.appendChild(card);
  });
}

function createCard(listing) {
  const card = document.createElement('div');
  card.classList.add('card');

  const link = document.createElement('a');
  link.setAttribute('href', `/show/${listing._id}`);

  const image = document.createElement('img');
  image.src = listing.image;
  image.alt = 'Product Image';

  const cardInfo = document.createElement('div');
  cardInfo.classList.add('cardinfo');

  const title = createElementWithText('p', listing.title);
  const price = createElementWithText('p', `₹${listing.price}/ night`, 'price');
  const description = createElementWithText('p', listing.desc, 'desc');

  const location = document.createElement('div');
  location.classList.add('location');

  const mapIcon = document.createElement('i');
  mapIcon.classList.add('ri-map-pin-line');

  const locationText = createElementWithText('p', `${listing.location}, ${listing.country}`);

  location.appendChild(mapIcon);
  location.appendChild(locationText);

  cardInfo.appendChild(title);
  cardInfo.appendChild(price);
  cardInfo.appendChild(description);

  link.appendChild(image);
  link.appendChild(cardInfo);
  link.appendChild(location);

  card.appendChild(link);

  return card;
}

function createElementWithText(tagName, textContent, className) {
  const element = document.createElement(tagName);
  element.textContent = textContent;
  if (className) {
    element.classList.add(className);
  }
  return element;
}

function capitalizeFirstLetter(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
}
