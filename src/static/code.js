// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
  String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] != "undefined" ? args[number] : match;
    });
  };
}

function docReady(fn) {
  // see if DOM is already available
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

var apList = null;
var selectedSSID = "";
var refreshAPInterval = null;
var checkStatusInterval = null;

function stopCheckStatusInterval() {
  if (checkStatusInterval != null) {
    clearInterval(checkStatusInterval);
    checkStatusInterval = null;
  }
}

function stopRefreshAPInterval() {
  if (refreshAPInterval != null) {
    clearInterval(refreshAPInterval);
    refreshAPInterval = null;
  }
}

function startCheckStatusInterval() {
  checkStatusInterval = setInterval(checkStatus, 950);
}

function startRefreshAPInterval() {
  refreshAPInterval = setInterval(refreshAP, 2800);
}

docReady(function () {
  document.getElementById("wifi-status").addEventListener(
    "click",
    function (e) {
      $("#wifi").slideUp("fast", function () {});
      $("#connect-details").slideDown("fast", function () {});
    },
    false
  );

  document.getElementById("manual_add").addEventListener(
    "click",
    function (e) {
      selectedSSID = $(this).text();
      $("#ssid-pwd").text(selectedSSID);
      $("#wifi").slideUp("fast", function () {});
      $("#connect_manual").slideDown("fast", function () {});
      $("#connect").slideUp("fast", function () {});

      //update wait screen
      $("#loading").show();
      $("#connect-success").hide();
      $("#connect-fail").hide();
    },
    false
  );

  document.getElementById("wifi-list").addEventListener(
    "click",
    function (e) {
      selectedSSID = $(this).text();
      $("#ssid-pwd").text(selectedSSID);
      $("#wifi").slideUp("fast", function () {});
      $("#connect_manual").slideUp("fast", function () {});
      $("#connect").slideDown("fast", function () {});

      //update wait screen
      $("#loading").show();
      $("#connect-success").hide();
      $("#connect-fail").hide();
    },
    false
  );

  // 	document.getElementById("#cancel").addEventListener("click",function(e){
  // 			selectedSSID = "";
  //     		$( "#connect" ).slideUp( "fast", function() {});
  //     		$( "#connect_manual" ).slideUp( "fast", function() {});
  //     		$( "#wifi" ).slideDown( "fast", function() {});
  //     }, false);

  // document.getElementById("#manual_cancel").addEventListener("click",function(e){
  // 		selectedSSID = "";
  //   		$( "#connect" ).slideUp( "fast", function() {});
  //   		$( "#connect_manual" ).slideUp( "fast", function() {});
  //   		$( "#wifi" ).slideDown( "fast", function() {});
  //       }, false);

  // document.getElementById("#join").addEventListener("click",function(e){
  // 		performConnect();
  //
  //       }, false);
  //
  // $().on("click", function() {
  // });
  //
  // document.getElementById("#manual_join").addEventListener("click",function(e){
  // 		performConnect($(this).data('connect'));
  //
  //       }, false);

  // document.getElementById("#ok-details").addEventListener("click",function(e){
  //       $( "#connect-details" ).slideUp( "fast", function() {});
  //       		$( "#wifi" ).slideDown( "fast", function() {});
  //       }, false);

  // document.getElementById("#ok-credits").addEventListener("click",function(e){
  //       	$( "#credits" ).slideUp( "fast", function() {});
  //   		$( "#app" ).slideDown( "fast", function() {});
  //       }, false);
  //
  //
  // document.getElementById("#acredits").addEventListener("click",function(e){
  // 		event.preventDefault();
  //   		$( "#app" ).slideUp( "fast", function() {});
  //   		$( "#credits" ).slideDown( "fast", function() {});
  //       }, false);
  //
  //
  // document.getElementById("#ok-connect").addEventListener("click",function(e){
  // 		$( "#connect-wait" ).slideUp( "fast", function() {});
  //   		$( "#wifi" ).slideDown( "fast", function() {});
  //       }, false);
  //
  //
  //
  // document.getElementById("#disconnect").addEventListener("click",function(e){
  // 		$( "#connect-details-wrap" ).addClass('blur');
  //   		$( "#diag-disconnect" ).slideDown( "fast", function() {});
  //       }, false);
  //
  //
  // document.getElementById("#no-disconnect").addEventListener("click",function(e){
  // $( "#diag-disconnect" ).slideUp( "fast", function() {});
  //   		$( "#connect-details-wrap" ).removeClass('blur');
  //       }, false);
  //
  //
  //
  document.getElementById("#yes-disconnect").addEventListener(
    "click",
    function (e) {
      stopCheckStatusInterval();
      selectedSSID = "";

      $("#diag-disconnect").slideUp("fast", function () {});
      $("#connect-details-wrap").removeClass("blur");

      $.ajax({
        url: "/connect.json",
        dataType: "json",
        method: "DELETE",
        cache: false,
        data: { timestamp: Date.now() },
      });

      startCheckStatusInterval();

      $("#connect-details").slideUp("fast", function () {});
      $("#wifi").slideDown("fast", function () {});
    },
    false
  );

  //first time the page loads: attempt get the connection status and start the wifi scan
  refreshAP();
  startCheckStatusInterval();
  startRefreshAPInterval();
});

function performConnect(conntype) {
  //stop the status refresh. This prevents a race condition where a status
  //request would be refreshed with wrong ip info from a previous connection
  //and the request would automatically shows as succesful.
  stopCheckStatusInterval();

  //stop refreshing wifi list
  stopRefreshAPInterval();

  var pwd;
  if (conntype == "manual") {
    //Grab the manual SSID and PWD
    selectedSSID = $("#manual_ssid").val();
    pwd = $("#manual_pwd").val();
  } else {
    pwd = $("#pwd").val();
  }
  //reset connection
  $("#loading").show();
  $("#connect-success").hide();
  $("#connect-fail").hide();

  $("#ok-connect").prop("disabled", true);
  $("#ssid-wait").text(selectedSSID);
  $("#connect").slideUp("fast", function () {});
  $("#connect_manual").slideUp("fast", function () {});
  $("#connect-wait").slideDown("fast", function () {});

  $.ajax({
    url: "/connect.json",
    dataType: "json",
    method: "POST",
    cache: false,
    headers: { "X-Custom-ssid": selectedSSID, "X-Custom-pwd": pwd },
    data: { timestamp: Date.now() },
  });

  //now we can re-set the intervals regardless of result
  startCheckStatusInterval();
  startRefreshAPInterval();
}

function rssiToIcon(rssi) {
  if (rssi >= -60) {
    return "w0";
  } else if (rssi >= -67) {
    return "w1";
  } else if (rssi >= -75) {
    return "w2";
  } else {
    return "w3";
  }
}

function refreshAP() {
  $.getJSON("/ap.json", function (data) {
    if (data.length > 0) {
      //sort by signal strength
      data.sort(function (a, b) {
        var x = a["rssi"];
        var y = b["rssi"];
        return x < y ? 1 : x > y ? -1 : 0;
      });
      apList = data;
      refreshAPHTML(apList);
    }
  });
}

function refreshAPHTML(data) {
  var h = "";
  data.forEach(function (e, idx, array) {
    h += '<div class="ape{0}"><div class="{1}"><div class="{2}">{3}</div></div></div>'.format(
      idx === array.length - 1 ? "" : " brdb",
      rssiToIcon(e.rssi),
      e.auth == 0 ? "" : "pw",
      e.ssid
    );
    h += "\n";
  });

  $("#wifi-list").html(h);
}

function checkStatus() {
  $.getJSON("/status.json", function (data) {
    if (data.hasOwnProperty("ssid") && data["ssid"] != "") {
      if (data["ssid"] === selectedSSID) {
        //that's a connection attempt
        if (data["urc"] === 0) {
          //got connection
          $("#connected-to span").text(data["ssid"]);
          $("#connect-details h1").text(data["ssid"]);
          $("#ip").text(data["ip"]);
          $("#netmask").text(data["netmask"]);
          $("#gw").text(data["gw"]);
          $("#wifi-status").slideDown("fast", function () {});

          //unlock the wait screen if needed
          $("#ok-connect").prop("disabled", false);

          //update wait screen
          $("#loading").hide();
          $("#connect-success").show();
          $("#connect-fail").hide();

          var link = document.getElementById("outbound_a_href_on_success");
          link.setAttribute("href", "http://" + data["ip"]);
        } else if (data["urc"] === 1) {
          //failed attempt
          $("#connected-to span").text("");
          $("#connect-details h1").text("");
          $("#ip").text("0.0.0.0");
          $("#netmask").text("0.0.0.0");
          $("#gw").text("0.0.0.0");

          //don't show any connection
          $("#wifi-status").slideUp("fast", function () {});

          //unlock the wait screen
          $("#ok-connect").prop("disabled", false);

          //update wait screen
          $("#loading").hide();
          $("#connect-fail").show();
          $("#connect-success").hide();
        }
      } else if (data.hasOwnProperty("urc") && data["urc"] === 0) {
        //ESP32 is already connected to a wifi without having the user do anything
        if (!$("#wifi-status").is(":visible")) {
          $("#connected-to span").text(data["ssid"]);
          $("#connect-details h1").text(data["ssid"]);
          $("#ip").text(data["ip"]);
          $("#netmask").text(data["netmask"]);
          $("#gw").text(data["gw"]);
          $("#wifi-status").slideDown("fast", function () {});

          var link = document.getElementById("outbound_a_href");
          link.setAttribute("href", "http://" + data["ip"]);
        }
      }
    } else if (data.hasOwnProperty("urc") && data["urc"] === 2) {
      //that's a manual disconnect
      if ($("#wifi-status").is(":visible")) {
        $("#wifi-status").slideUp("fast", function () {});
      }
    }
  }).fail(function () {
    //don't do anything, the server might be down while esp32 recalibrates radio
  });
}
