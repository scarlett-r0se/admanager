$(document).ready(function () {
  console.log(
    "THE PAGE HAS LOADED AND JS AND JQUERY PROBABLY WORK IF YOUR'RE READING THIS"
  );

  $("#login").click(function () {
    $("#status").empty();
    let status = "";
    let username = $("#username").val().trim();
    let password = $("#password").val().trim();
    let checkvalue = false;

    if (username == "" || password == "") {
      status += "You Must Specify Login in formation";
    } else {
      checkvalue = true;
    }

    if (checkvalue) {
      //window.location.replace("https://ad.inertialframe.net/createaccount");
      sendRequest(
        `https://ad.inertialframe.net/ldapAuth?username=${username}&password=${password}`,
        (output) => {
          console.log(output);
          data = JSON.parse(output);
          if (data.error) {
            $("#status").empty();
            $("#status").append(JSON.stringify(data.error).replace(/"/gm, ""));
          } else {
            window.location.replace("https://ad.inertialframe.net/accountpage");
            //console.log("yut");
          }
        }
      );
    } else {
      $("#status").append(status);
    }

    console.log("FUNCTION WAS CALLED", username, password);
  });
});
