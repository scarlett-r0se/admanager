/*
Disable-ADAccount -Identity TT4758
 Enable-ADAccount -Identity TT4758
*/
$(document).ready(function () {
  console.log(
    "THE PAGE HAS LOADED AND JS AND JQUERY PROBABLY WORK IF YOUR'RE READING THIS"
  );
  sendRequest(`http://10.0.2.6:3000/whoisloggedin`, (output) => {
    console.log(output);
    const data = JSON.parse(output);
    let name = JSON.stringify(data.result.givenName);
    name = name.replace(/"/gm, "");
    name = name.replace(/\@.*$/gm, "");
    //$('#greeter').empty();
    //$('#greeter').append(`Hello ${name}`);
  });

  $("#users").hide();
  sendRequest(`http://10.0.2.6:3000/getADusers`, (output) => {
    data = JSON.parse(output);
    for (var i = 0; i < data.length; i++) {
      console.log(data[i].Name, data[i].GivenName, data[i].Surname);

      $("#users").append(
        `<option>${data[i].Name} - ${data[i].Surname},${data[i].GivenName} - isEnabled : ${data[i].Enabled} </option>`
      );
    }

    $("#users").show();
  });
});
