const popularDestinations = [
  'Big Sur, California',
  'Prescott, Arizona',
  'Fort Myers, Florida',
  'Tucson, Arizona',
  'St. Joseph, Michigan',
  'Madrid, Spain',
  'Salerno, Italy',
  'Lake Como, Italy',
  'Udaipur, India',
  'Los Angeles, United States',
  'Paris, France',
  'Rome, Italy',
  'Tokyo, Japan',
  'Bali, Indonesia',
  'Sydney, Australia',
  'Cape Town, South Africa',
  'Reykjavik, Iceland',
  'Zermatt, Switzerland'
];

const countryList = [
  'United States', 'Italy', 'Spain', 'India', 'France', 'Japan', 'Switzerland',
  'Australia', 'Canada', 'Greece', 'Portugal', 'United Kingdom', 'Germany',
  'Austria', 'Norway', 'Iceland', 'New Zealand', 'Indonesia', 'Thailand',
  'South Africa', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Peru', 'Egypt',
  'Morocco', 'Turkey', 'United Arab Emirates', 'Singapore', 'Vietnam', 'Croatia'
];

const combinedSearchSources = [...popularDestinations, ...countryList];

const autoCompleteJS = new autoComplete({
  selector: '#location',
  placeHolder: 'Destination or country...',
  data: {
    src: combinedSearchSources,
    cache: true,
  },
  resultItem: {
    highlight: true,
  },
  events: {
    input: {
      selection: (event) => {
        const selection = event.detail.selection.value;
        autoCompleteJS.input.value = selection;
        
        if (typeof window.filterDestinationsByQuery === 'function') {
          window.filterDestinationsByQuery(selection);
        }
      },
    },
  },
  resultList: {
    maxResultsLimit: 8,
  },
  searchEngine: 'loose',
});
