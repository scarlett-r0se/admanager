/*
Disable-ADAccount -Identity TT4758
 Enable-ADAccount -Identity TT4758
*/
$(document).ready(function () {
  console.log(
    "THE PAGE HAS LOADED AND JS AND JQUERY PROBABLY WORK IF YOUR'RE READING THIS"
  );
  sendRequest(`https://ad.inertialframe.net/whoisloggedin`, (output) => {
    console.log(output);
    const data = JSON.parse(output);
    if (data.error) {
      window.location.href = "https://ad.inertialframe.net/login.html";
    }
    let name = JSON.stringify(data.result.givenName);
    name = name.replace(/"/gm, "");
    name = name.replace(/\@.*$/gm, "");
    $("#greeter").empty();
    $("#greeter").append(`Hello ${name}`);
  });

  $("#users").hide();
  sendRequest(`https://ad.inertialframe.net/getADusers`, (output) => {
    data = JSON.parse(output);
    for (var i = 0; i < data.length; i++) {
      console.log(data[i].Name, data[i].GivenName, data[i].Surname);
      let person = {"Username":data[i].Name,"isEnabled":data[i].Enabled}

      $("#users").append(
        `<option value = ${JSON.stringify(person)} >${data[i].Name} - ${data[i].Surname},${data[i].GivenName} - isEnabled : ${data[i].Enabled} </option>`
      );
    }

    $("#users").show();
  });

  $('#disable').click(function() {
    let users = $('#users').val()
    if($('#users').val() =='Default')
    {
      alert("You must select a User");
      return;
    }
    console.log("ENABLE BUTTON CALLED");
    console.log(users);
    const account = JSON.parse(users);
    console.log(account.Username);
    if(!account.isEnabled)
    {
      alert("You cannot deactivate an account that is already deactivated");
    }
    else
    {
      sendRequest(`https://ad.inertialframe.net/deactivate?user=${account.Username}`, (output) => {

      alert(output);
      location.reload();
      })
    }


  })

  $('#enable').click(function() {
    if($('#users').val() =='Default')
    {
      alert("You must select a User");
      return;
    }
    console.log("ENABLE BUTTON CALLED");
    console.log($('#users').val());
    const account = JSON.parse($('#users').val());
    if(account.isEnabled)
    {
      alert("You cannot acctivate an account that is already active");
    }
    else
    {
      sendRequest(`https://ad.inertialframe.net/activate?user=${account.Username}`, (output) => {

      alert(output);
      location.reload();
      })
    }

  })



});
