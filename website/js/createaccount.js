$(document).ready(function() {
    console.log("THE PAGE HAS LOADED AND JS AND JQUERY PROBABLY WORK IF YOUR'RE READING THIS")

    sendRequest(`http://10.0.2.6:3000/whoisloggedin`, (output) => {
        console.log(output);
        const data = JSON.parse(output);
        let name = JSON.stringify(data.result.givenName)
        name = name.replace(/"/gm, "");
        name = name.replace(/\@.*$/gm, "");
        $('#greeter').empty();
        $('#greeter').append(`Hello ${name}`);
        console.log(data.result.email);
    });


    $('#register').click(function()

        {
            $('#status').empty();
            $('#status').removeClass();

            console.log("Account Register has been called");
            let fname = $('#fname').val().trim();
            let lname = $('#lname').val().trim();
            let pass = $('#pass').val().trim();
            let cpass = $('#cpass').val().trim();
            let group = $('#group').val().trim();
            let dataCheck = false;
            status = '';
            if (fname == '' || lname == '')
                status = 'Please Enter a Valid First and Last name. ';
            else if (pass == '' && cpass == '') {
                status = status + 'Passwords cannot be left blank';
            } else if (cpass != pass) {
                status = status + 'Passwords Must Match';
            } else if (group == 'Default') {
                status = status + 'You must select a defualt group';

            } else {
                dataCheck = true;
                profile = createUserJson(fname, lname, pass, group);
                console.log(profile);
            }





            console.log(`You have entered ${fname} and ${lname} and ${pass} and ${group}`);
            //`http://localhost/newuser=?Fname=${fname}&Lname=${lname}&Password=${pass}`


            if (dataCheck) {
                sendRequest(`http://10.0.2.6:3000/newuser?Fname=${fname}&Lname=${lname}&Password=${pass}&Group=${profile.Group}&Username=${profile.Username}`, (output) => {
                    console.log(output);
                    $('#status').empty();
                    $('#status').addClass("suc");
                    $('#status').append(`${output}`);
                    alert(`Username is ${profile.Username}`)


                });
            } else {
                $('#status').addClass("err");
                $('#status').append(status);
            }

        });

    $('#logout').click(function() {
        $('#logoutmodal').show();
    });

    $('#modalclose').click(function() {
        $('#logoutmodal').hide();
    })

    $('#modallogout').click(function() {
        sendRequest(`http://10.0.2.6:3000/logout`, (output) => {

            let data = JSON.parse(output);
            if (data.error == "Nobody is logged in."); {
                window.location.replace("http://10.0.2.6:3000/");
            }
        });
    })


});
