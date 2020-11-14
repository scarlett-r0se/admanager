$(document).ready(function () {
  console.log(
    "THE PAGE HAS LOADED AND JS AND JQUERY PROBABLY WORK IF YOUR'RE READING THIS"
  );

  sendRequest(
    `https://ad.inertialframe.net/vpn?q={%20"jsonrpc":%20"2.0",%20"id":%20"rpc_call_id",%20"method":%20"EnumHub",%20"params":%20{}%20}`,
    (output) => {
      const data = JSON.parse(output);
      console.log(data);
      let vpndata = $("#vpndata");
      vpndata.append(`<tr>
            <td>${"TransAD VPN"}</td>
            <td>${data.result.HubList[0].HubName_str}</td>
            <td>${data.result.HubList[0].NumSessions_u32 - 1}</td>
            </tr>`);
    }
  );

  sendRequest(
    `https://ad.inertialframe.net/vpn?q={%20%22jsonrpc%22:%20%222.0%22,%20%22id%22:%20%22rpc_call_id%22,%20%22method%22:%20%22EnumSession%22,%20%22params%22:%20{%20%22HubName_str%22:%20%22TRANSAD_VPN%22%20}%20}`,
    (output) => {
      const data2 = JSON.parse(output);
      console.log(data2);
      let vpnconnections = $("#vpnconnections");
      for (let i = 1; i < data2.result.SessionList.length; i++) {
        vpnconnections.append(`<tr>
            <td>${data2.result.SessionList[i].Username_str}</td>
            <td>${data2.result.SessionList[i].CreatedTime_dt}</td>
            <td>${data2.result.SessionList[i].ClientIP_ip}</td>
            </tr>`);
      }
    }
  );
});
