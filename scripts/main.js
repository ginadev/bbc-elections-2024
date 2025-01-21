const API_BASE_URL = "https://jse-assignment.uk/UKGeneral";
const API_KEY = "0cb064e3487398bf016ceb719e865ad8c229d25575bb3bab";


const PARTY_COLOURS = new Map([
  ["LAB", "#E91E0D"],
  ["CON", "#0675C9"],
  ["LD", "#FF9A01"],
  ["SNP", "#FFD02C"],
  ["SF", "#24AA82"],
  ["IND", "#FC86C2"],
  ["REF", "#0DD1E0"],
  ["DUP", "#C9235E"],
  ["GRN", "#5FB25F"],
  ["PC", "#0FE594"],
  ["SDLP", "#224922"],
  ["APNI", "#D6B429"],
  ["UUP", "#3B75A8"],
  ["TUV", "#6DCAD2"],
  ["WPB", "#529ACC"],
  ["YP", "#00B8FD"],
  ["ALB", "#287599"],
  ["PBP", "#E8254F"],
  ["AONT", "#ECAE8E"],
  ["FALLBACK", "#BABABA"]
]);

const resultsContainer = document.getElementById('results-container');
const countySelect = document.getElementById('county-select');
const constituencySearch = document.getElementById('constituency-search');
let constituenciesData = [];
let constituenciesList = [];


async function fetchConstituencyData() {
  try {
    const response = await fetch(`${API_BASE_URL}/constituencies`, {
      headers: { "x-api-key": API_KEY },
    });
    constituenciesData = await response.json();
    if (!constituenciesData || constituenciesData.length === 0) return;

    populateCountyDropdown();
    prepareAutocompleteData();
  } catch (error) {
    console.error("Error fetching constituency data:", error);
    alert("Failed to load constituency data.");
  }
}


async function populateCountyDropdown() {
  try {
    const response = await fetch(`${API_BASE_URL}/constituencies`, {
      headers: { "x-api-key": API_KEY },
    });
    constituencyData = await response.json();
    if (!constituencyData || constituencyData.length === 0) return;

    const uniqueCounties = [...new Set(constituencyData.map(item => item.county))].sort();
    countySelect.innerHTML = '<option value="">Select County</option>';

    uniqueCounties.forEach(county => {
      const option = document.createElement('option');
      option.value = county;
      option.textContent = county;
      countySelect.appendChild(option);
    });

    countySelect.addEventListener('change', (event) => {
      const selectedCounty = event.target.value;
      constituencySearch.value = '';
      if (selectedCounty) {
        displayConstituencyResults(selectedCounty);
      }
    });
  } catch (error) {
    console.error('Error fetching constituency data:', error);
  }
}

async function displayConstituencyResults(county) {
  try {
    const constituenciesInCounty = constituencyData.filter(item => item.county === county);

    if (!constituenciesInCounty || constituenciesInCounty.length === 0) return;

    resultsContainer.innerHTML = '';

    for (const constituency of constituenciesInCounty) {
     await fetchConstituencyResults(constituency.gssId);
    }
  } catch (error) {
    console.error('Error displaying constituency results:', error);
  }
}

function prepareAutocompleteData() {
  constituenciesList = constituenciesData.map(({ gssId, name }) => ({ gssId, name }));
  autocomplete(constituencySearch, constituenciesList);
}


const autocomplete = (input, list) => {
    let currentFocus;
  
    input.addEventListener('input', function () {
      const val = this.value;
      closeAllLists();
      if (!val) return false;
  
      currentFocus = -1;
      const listContainer = document.createElement('div');
      listContainer.setAttribute('id', `${this.id}-autocomplete-list`);
      listContainer.setAttribute('class', 'autocomplete-items absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg divide-y');
      this.parentNode.appendChild(listContainer);
  
      list
        .filter(({ name }) => name.toLowerCase().includes(val.toLowerCase()))
        .forEach(({ gssId, name }) => {
          const item = document.createElement('div');
          item.classList.add('cursor-pointer', 'hover:underline', 'p-2')
          item.innerHTML = `${name.substr(0, val.length)}${name.substr(val.length)}`;
          item.dataset.gssId = gssId;
          item.innerHTML += `<input type="hidden" value="${name}">`;
  
          item.addEventListener('click', function () {
            resultsContainer.innerHTML = '';
            countySelect.value= '';
            input.value = name;
            closeAllLists();
            fetchConstituencyResults(gssId);
          });
  
          listContainer.appendChild(item);
        });
    });
  
input.addEventListener('keydown', function (e) {
  const listItems = document.querySelectorAll(`#${this.id}-autocomplete-list div`);
  if (e.keyCode === 40) {
    currentFocus++;
    addActive(listItems);
  } else if (e.keyCode === 38) {
    currentFocus--;
    addActive(listItems);
  } else if (e.keyCode === 13) {
    e.preventDefault();
    if (currentFocus > -1) listItems[currentFocus].click();
  }
});

function addActive(items) {
    if (!items) return false;
    removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = items.length - 1;
    items[currentFocus].classList.add('autocomplete-active');
  }

  function removeActive(items) {
    items.forEach((item) => item.classList.remove('autocomplete-active'));
  }

  function closeAllLists(elmnt) {
    const items = document.querySelectorAll('.autocomplete-items');
    items.forEach((item) => {
      if (elmnt !== item && elmnt !== input) item.remove();
    });
  }

  document.addEventListener('click', function (e) {
    closeAllLists(e.target);
  });
};

async function fetchConstituencyResults(gssId) {
  try {
    const response = await fetch(`${API_BASE_URL}/results/${gssId}`, {
      headers: { "x-api-key": API_KEY },
    });
    const results = await response.json();
    displayResults(results);
  } catch (error) {
    console.error("Error fetching constituency results:", error);
    alert("Failed to load constituency results.");
  }
}


function displayResults(data) {
  const { name, results, turnout } = data;

  const constituencyNameEl = document.createElement('h2');
  constituencyNameEl.id = 'constituency-name';
  constituencyNameEl.className = 'text-lg font-semibold mt-8 mb-3';
  constituencyNameEl.textContent = name;

  const table = document.createElement('table');
  table.className = 'w-full mt-2 text-center text-sm';

  const thead = document.createElement('thead');
  thead.className = 'bg-gray-100';
  thead.innerHTML = `
    <tr class="divide-x">
      <th class="font-medium px-4 py-3">Party</th>
      <th class="font-medium px-4 py-3">Candidate Name</th>
      <th class="font-medium px-4 py-3">Votes</th>
      <th class="font-medium px-4 py-3">% Share</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  tbody.id = 'results-table-body';
  tbody.className = 'divide-y';

  const sortedResults = results
    .map(({ partyCode, candidateName, partyName, votes, share }) => ({
      partyCode,
      partyName,
      candidateName,
      votes,
      share: Math.round(share),
    }))
    .sort((a, b) => b.share - a.share);

  const winner = sortedResults[0];

  sortedResults.forEach(({ partyCode, candidateName, partyName, votes, share }) => {
    const row = document.createElement('tr');
    row.className = 'grid-item divide-x';
    if (partyName === winner.partyName && candidateName === winner.candidateName) {
      row.classList.add('font-bold');
    }
    row.innerHTML = `
      <td class="py-2">${partyName}</td>
      <td class="py-2">${candidateName || ''}</td>
      <td class="py-2">${votes}</td>
      <td class="py-2">
        <div class="flex items-center">
          <div class="relative w-full h-6 rounded overflow-hidden mr-2">
            <div 
              class="progress-bar absolute top-0 left-0 h-6 rounded" 
              style="width: 0%; background-color: ${PARTY_COLOURS.get(partyCode) || PARTY_COLOURS.get('FALLBACK')};"
              title="${share}%">
            </div>
          </div>
          <span class="text-xs">${share}%</span>
        </div>
      </td>
    `;
    tbody.appendChild(row);
    setTimeout(() => {
      const progressBar = row.querySelector('.progress-bar');
      progressBar.style.transition = 'width 2s ease';
      progressBar.style.width = `${share}%`;
    }, 100);
  });

  table.appendChild(tbody);

  const turnoutEl = document.createElement('p');
  turnoutEl.className = 'text-sm mt-5 mb-14';
  turnoutEl.innerHTML = `Turnout: <span>${turnout}</span>`;

  resultsContainer.appendChild(constituencyNameEl);
  resultsContainer.appendChild(table);
  resultsContainer.appendChild(turnoutEl);

  resultsContainer.classList.remove('hidden');
  resultsContainer.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
  resultsContainer.style.opacity = '0';
  resultsContainer.style.transform = 'scale(0.9)';

  setTimeout(() => {
    resultsContainer.style.opacity = '1';
    resultsContainer.style.transform = 'scale(1)';
  }, 100);
}


function resetContainer(){
  resultsContainer.classList.add('hidden');
  resultsContainer.style.opacity = '0';
  resultsContainer.style.transform = 'scale(0.9)';
}

function clearResults(){
  countySelect.value= '';
  constituencySearch.value = '';
  resetContainer();
}

fetchConstituencyData();
