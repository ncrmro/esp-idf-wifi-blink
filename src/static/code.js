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
      document.getElementById("wifi").style.display = "none";
      document
        .getElementById("connect-details").style.display = "block";
    },
    false
  );

  document.getElementById("manual_add").addEventListener(
    "click",
    function (e) {
      selectedSSID = e.target.innerText;

      document.getElementById("ssid-pwd").textContent = selectedSSID
      document.getElementById("wifi").style.display="none";
      document.getElementById("connect_manual").style.display="block";
      document.getElementById("connect").style.display="none";

      document.getElementById("connect-success").display = "none";
      document.getElementById("connect-fail").display = "none";
    },
    false
  );

  document.getElementById("wifi-list").addEventListener(
    "click",
    function (e) {
      selectedSSID = e.target.innerText;
      console.log('selected', selectedSSID)
      document.getElementById("ssid-pwd").textContent = selectedSSID
      document.getElementById("connect").style.display = "block";
      document.getElementById("wifi").style.display = "none";
      // init_cancel();
    },
    false
  );

  function cancel (e) {
    selectedSSID = "";
    document.getElementById("connect").style.display = "none";
    document.getElementById("connect_manual").style.display = "none";
    document.getElementById("wifi").style.display = "block";
  }

  document.getElementById("cancel").addEventListener(
    "click", cancel,
    false
  );

  document.getElementById("manual_cancel").addEventListener(
    "click", cancel,
    false
  );

  document.getElementById("join").addEventListener(
    "click",
    function (e) {
      performConnect();
    },
    false
  );

  $().on("click", function () {});

  document.getElementById("manual_join").addEventListener(
    "click",
    function (e) {
      performConnect($(this).data("connect"));
    },
    false
  );

  document.getElementById("ok-details").addEventListener(
    "click",
    function (e) {
      document.getElementById("connect-details").slideUp("fast", function () {});
      document.getElementById("wifi").slideDown("fast", function () {});
    },
    false
  );

  document.getElementById("ok-credits").addEventListener(
    "click",
    function (e) {
      document.getElementById("credits").slideUp("fast", function () {});
      document.getElementById("app").slideDown("fast", function () {});
    },
    false
  );

  document.getElementById("acredits").addEventListener(
    "click",
    function (e) {
      event.preventDefault();
      document.getElementById("app").slideUp("fast", function () {});
      document.getElementById("credits").slideDown("fast", function () {});
    },
    false
  );

  document.getElementById("ok-connect").addEventListener(
    "click",
    function (e) {
      document.getElementById("connect-wait").slideUp("fast", function () {});
      document.getElementById("wifi").slideDown("fast", function () {});
    },
    false
  );

  document.getElementById("disconnect").addEventListener(
    "click",
    function (e) {
      document.getElementById("connect-details-wrap").addClass("blur");
      document.getElementById("diag-disconnect").slideDown("fast", function () {});
    },
    false
  );

  document.getElementById("no-disconnect").addEventListener(
    "click",
    function (e) {
      document.getElementById("diag-disconnect").slideUp("fast", function () {});
      document.getElementById("connect-details-wrap").removeClass("blur");
    },
    false
  );

  document.getElementById("yes-disconnect").addEventListener(
    "click",
    function (e) {
      stopCheckStatusInterval();
      selectedSSID = "";

      document
        .getElementById("diag-disconnect")
        .slideUp("fast", function () {});
      document.getElementById("connect-details-wrap").removeClass("blur");

      $.ajax({
        url: "/connect.json",
        dataType: "json",
        method: "DELETE",
        cache: false,
        data: { timestamp: Date.now() },
      });

      startCheckStatusInterval();

      document
        .getElementById("connect-details")
        .slideUp("fast", function () {});
      document.getElementById("wifi").slideDown("fast", function () {});
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
    selectedSSID = document.getElementById("manual_ssid").value;
    pwd = document.getElementById("manual_pwd").value;
  } else {
    pwd = document.getElementById("pwd").value;
  }
  //reset connection
  document.getElementById("loading").style.display= "block";
  document.getElementById("connect-success").style.display = "none";
  document.getElementById("connect-fail").style.display = "none";

  document.getElementById("ok-connect").disabled = true;
  document.getElementById("ssid-wait").textContent =selectedSSID
  document.getElementById("connect").style.display = "none";
  document.getElementById("connect_manual").style.display = "none";
  document.getElementById("connect-wait").style.display = "block";

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

async function refreshAP(url = "/ap.json") {
  // const response = await fetch(url, {
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  // })
  const response = {
    ok: true,
  };
  if (response.ok) {
    // TODO fix
    // const data = response.json();
    const data = [
      {
        ssid: "DIRECT-F9-HP OfficeJet Pro 7740",
        chan: 6,
        rssi: -81,
        auth: 3,
      },
      {
        ssid: "ATT6bCj4W5",
        chan: 11,
        rssi: -94,
        auth: 3,
      },
    ];

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
  }
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

  document.getElementById("wifi-list").innerHTML = h;
}

function checkStatus(url = status.json) {
  // const response = await fetch(url, {
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  // })
  const response = {
    ok: true,
  };
  if (response.ok) {
    // TODO fix
    // const data = response.json();
    const data = {
      ssid: "ATT6bCj4W5",
      chan: 11,
      rssi: -94,
      auth: 3,
    };

    if (data.hasOwnProperty("ssid") && data["ssid"] != "") {
      if (data["ssid"] === selectedSSID) {
        //that's a connection attempt
        if (data["urc"] === 0) {
          //got connection
          document.getElementById("connected-to span").textContent =data["ssid"]
          document.getElementById("connect-details h1").textContent =data["ssid"]
          document.getElementById("ip").textContent =data["ip"]
          document.getElementById("netmask").textContent =data["netmask"]
          document.getElementById("gw").textContent =data["gw"]
          document
            .getElementById("wifi-status")
            .slideDown("fast", function () {});

          //unlock the wait screen if needed
          document.getElementById("ok-connect").prop("disabled", false);

          //update wait screen
          document.getElementById("loading").display = "none";
          document.getElementById("connect-success").show();
          document.getElementById("connect-fail").display = "none";

          var link = document.getElementById("outbound_a_href_on_success");
          link.setAttribute("href", "http://" + data["ip"]);
        } else if (data["urc"] === 1) {
          //failed attempt
          document.getElementById("connected-to span").textContent =""
          document.getElementById("connect-details h1").textContent =""
          document.getElementById("ip").textContent ="0.0.0.0"
          document.getElementById("netmask").textContent ="0.0.0.0"
          document.getElementById("gw").textContent ="0.0.0.0"

          //don't show any connection
          document
            .getElementById("wifi-status")
            .slideUp("fast", function () {});

          //unlock the wait screen
          document.getElementById("ok-connect").prop("disabled", false);

          //update wait screen
          document.getElementById("loading").display = "none";
          document.getElementById("connect-fail").show();
          document.getElementById("connect-success").display = "none";
        }
      } else if (data.hasOwnProperty("urc") && data["urc"] === 0) {
        //ESP32 is already connected to a wifi without having the user do anything
        if (!document.getElementById("wifi-status").is(":visible")) {
          document.getElementById("connected-to span").textContent =data["ssid"]
          document.getElementById("connect-details h1").textContent =data["ssid"]
          document.getElementById("ip").textContent =data["ip"]
          document.getElementById("netmask").textContent =data["netmask"]
          document.getElementById("gw").textContent =data["gw"]
          document
            .getElementById("wifi-status")
            .slideDown("fast", function () {});

          var link = document.getElementById("outbound_a_href");
          link.setAttribute("href", "http://" + data["ip"]);
        }
      }
    } else if (data.hasOwnProperty("urc") && data["urc"] === 2) {
      //that's a manual disconnect
      if (document.getElementById("wifi-status").is(":visible")) {
        document.getElementById("wifi-status").slideUp("fast", function () {});
      }
    }
  }
}
