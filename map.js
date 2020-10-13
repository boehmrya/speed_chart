var state_id =  {
    '01': 'AL',
    '02': 'AK',
    '04': 'AZ',
    '05': 'AR',
    '06': 'CA',
    '08': 'CO',
    '09': 'CT',
    '10': 'DE',
    '11': 'DC',
    '12': 'FL',
    '13': 'GA',
    '15': 'HI',
    '16': 'ID',
    '17': 'IL',
    '18': 'IN',
    '19': 'IA',
    '20': 'KS',
    '21': 'KY',
    '22': 'LA',
    '23': 'ME',
    '24': 'MD',
    '25': 'MA',
    '26': 'MI',
    '27': 'MN',
    '28': 'MS',
    '29': 'MO',
    '30': 'MT',
    '31': 'NE',
    '32': 'NV',
    '33': 'NH',
    '34': 'NJ',
    '35': 'NM',
    '36': 'NY',
    '37': 'NC',
    '38': 'ND',
    '39': 'OH',
    '40': 'OK',
    '41': 'OR',
    '42': 'PA',
    '44': 'RI',
    '45': 'SC',
    '46': 'SD',
    '47': 'TN',
    '48': 'TX',
    '49': 'UT',
    '50': 'VT',
    '51': 'VA',
    '53': 'WA',
    '54': 'WV',
    '55': 'WI',
    '56': 'WY'
  };


// to handle lookups to detect when small states are clicked
var small_states =  {
    'VT': 'Vermont',
    'NH': 'New Hampshire',
    'MA': 'Massachusetts',
    'RI': 'Rhode Island',
    'CT': 'Connecticut',
    'NJ': 'New Jersey',
    'DE': 'Delaware',
    'MD': 'Maryland',
    'DC': 'District of Columbia'
};



jQuery(function($){


  function drawMap(w) {
    var width, height, wScale, hScale, mapSize, mapRatio, viewBox;

    //Width and height of map
    width = parseInt(d3.select('#state-map').style('width'));
    mapRatio = .71
    height = width * mapRatio;
    viewBox = "0 0 " + width + " " + height;

    /*
    if (w > 992) {
      mapSize = 1.4 * width;
    }
    else {
      mapSize = 0.5 * width;
    }
    */

    // D3 Projection
    var projection = d3.geo.albersUsa()
    				   .translate([width/2, height/2.2])    // translate to center of screen
    				   .scale([1.4 * width]);          // scale things down so see entire US

    // Define path generator
    var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
    		  	 .projection(projection);  // tell path generator to use albersUsa projection


    //Create SVG element and append map to the SVG
    var svg = d3.select("#state-map")
    			.append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", viewBox);
    			//.attr("width", width)
    			//.attr("height", height);

    // Load GeoJSON for US States
    d3.json("/wp-content/themes/explore-beyond/maps/us-states.json", function(json) {

      // Bind the data to the SVG and create one path per GeoJSON feature
      // This builds the map
      svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("id", function(d) { return state_id[d.id]; })
        .attr("class", 'state')
        .style("cursor", "pointer")
        .style("stroke", "rgb(255,255,255)")
        .style("stroke-width", "1.5")
        .style("fill", "rgb(104,204,231)")
        .on('mouseover', function(d, i) {
          if (!d3.select(this).classed('active')) {
            d3.select(this).style('fill', 'rgb(255, 202, 54)'); // change to blue on hover
          }
        })
        .on('mouseout', function(d, i) {
          if (!d3.select(this).classed('active')) {
            d3.select(this).style('fill', 'rgb(104,204,231)'); // remove blue
          }
        })
        .on('click', function(d, i) {
          d3.selectAll('#state-map svg path').classed('active', false); // remove active classes
          d3.selectAll('#state-map svg path').style({ 'fill': 'rgb(104,204,231)' }); // clear all colors
          d3.select(this).attr('class', 'active'); // add active class to current element
          d3.select(this).style('fill', 'rgb(255, 202, 54)'); // fill current clicked state with blue

          // clear colors on all existing small boxes
          $('#small-states .small-state .box').css('background', '#68cce7');

          // check if it is a small state
          // if so, find the box and make it purple
          if (small_states.hasOwnProperty(state_id[d.id])) {
            var state_box_id = '#' + state_id[d.id] + '-Box';
            $(state_box_id).css('background', '#ffca36');
          }

          // update the select list to the chosen state
          $("#filterFormStateSelect").val(state_id[d.id]).trigger('change');
          // run update data function
          updateData(state_id[d.id]);

          var distanceLearningMapStateId = state_id[d.id];
          dataLayer.push({'event': 'distance_learning_map_state_click',
                          'distance_learning_map_state_id': distanceLearningMapStateId });
        });

    });

  }

  function removeMap() {
    $('#state-map svg').remove();
  }


  // trigger map click events on select list change events
  $("#filterFormStateSelect").change(function() {
    $("#filterFormStateSelect option:selected").each(function(){
      var selected = $(this).val();
      var selected_elem = '#state-map svg #' + selected;

      // update the map
      d3.selectAll('#state-map svg path').classed('active', false); // remove active classes
      d3.selectAll('#state-map svg path').style({ 'fill': 'rgb(104,204,231)' }); // clear all colors
      d3.select(selected_elem).attr('class', 'active'); // add active class to current element
      d3.select(selected_elem).style('fill', 'rgb(255, 202, 54)'); // fill current clicked state with blue

      // clear colors on all existing small boxes
      $('#small-states .small-state .box').css('background', '#68cce7');

      // check if it is a small state
      // if so, find the box and make it purple
      if (small_states.hasOwnProperty(selected)) {
        var state_box_id = '#' + selected + '-Box';
        $(state_box_id).css('background', '#ffca36');
      }

      // update data in sidebar
      updateData(selected);
    });
  });

  // update information in sidebar card
  // runs when dot is clicked or option in dropdown is selected
  function updateData(state_id) {
    // get location from dict
    var state = data_states_metrics[state_id];

    // fill in cale isps with name and link
    // first, empty out the block
    jQuery("#isp-operator-names").empty();

    // Loading provider names into array to allow alpha sorting of provider images (quickfix - this module is not tied to its own Drupal admin sort preference...)
    var providerNames = [];
    jQuery.each(data_states_metrics[state_id].providers, function(i,v) {
         providerNames.push(this.name);
    });

    providerNames.sort();

    for(var q=0; q < providerNames.length; q++) {
        jQuery.each(data_states_metrics[state_id].providers, function(i,v) {
            if(this.name == providerNames[q])
              jQuery("#isp-operator-names").append("<div class=\"provider\"><a href=\"" + this.link + "\" target=\"_blank\">" + this.name + "</a></div>");
        });
    }


    var distanceLearningMapCompanyLink = $('.isp-operators .provider a');
    distanceLearningMapCompanyLink.on('click', function() {
      var distanceLearningMapCompanyLinkText = $(this).text();
      dataLayer.push({'event': 'distance_learning_map_company_link_click',
                      'distance_learning_map_company_link_name': distanceLearningMapCompanyLinkText });
    });
  }
  // end updateData function

  // convert select list into custom menu
  $('#filterFormStateSelect').select2();

  // trigger events when small boxes are clicked
  $('#small-states .small-state .box').on('click', function() {
    // clear colors on all existing small boxes
    $('#small-states .small-state .box').css('background', '#68cce7');

    // make background of this small box purple
    $(this).css('background', '#ffca36');

    // split the id on the box to get the state abbreviation
    var box_id = $(this).attr('id');
    var box_id_parts = box_id.split("-");
    var box_state = box_id_parts[0];

    // set value in the select list and trigger an on change event
    $("#filterFormStateSelect").val(box_state).trigger('change');
  });


  // distance Learning select2 dropdown click event
  var select2Dropdown = $('#filterFormStateSelect');
  select2Dropdown.on('select2:select', function(e) {
    console.log('distance_learning_map_filter_click');
    var data = e.params.data;
    var select2DropdownText = data.text;
    dataLayer.push({'event': 'distance_learning_map_filter_click',
                    'distance_learning_filter_item_text': select2DropdownText });
  });

  // distance learning map state from small state button click event
  var distanceLearningMapSmallStateButton = $('#small-states .box');
  distanceLearningMapSmallStateButton.on('click', function() {
    console.log('distance_learning_map_state_click');
    var distanceLearningMapSmallStateButtonId = $(this).attr('id');
    var smallStateArray = distanceLearningMapSmallStateButtonId.split("-");
    var smallStateAbbrev = smallStateArray[1];
    dataLayer.push({'event': 'distance_learning_map_state_click',
                    'distance_learning_map_state_id': smallStateAbbrev });
  });

  // initialize map and data
  var w = window.innerWidth;
  if (w > 767) {
    drawMap(w);
  }
  updateData('US');

  // redraw map on throttled resize
  /*
  $(window).on('resize', function() {
    if (w > 767) {
      var throttled = false;
      var delay = 250;

      // only run if we're not throttled
      if (!throttled) {

        removeMap();
        drawMap(w);

        // we're throttled!
        throttled = true;
        // set a timeout to un-throttle
        setTimeout(function() {
          throttled = false;
        }, delay);
      }
    }
  });
  */


});
