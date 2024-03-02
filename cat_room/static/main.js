function connect(){
    const socket = new WebSocket(`ws://${window.location.host}/ws`);

    socket.addEventListener("open", (event) => {
      socket.send(JSON.stringify({"cmd":"register", "user":"Cat-2235"}));
    });

    socket.addEventListener("message", (event) => {
      data = JSON.parse(event.data)
      if (data["cmd"] === "err"){throw new Error(data["message"])
      } else if(data["cmd"] === "msg"){
        // message received
        on_message_received(data["user"], data["time"], data["msg"])
      }else{console.error("received invalid data:",event.data)}
    });
};

function on_message_received(user, timeStamp, message){
    // visualize message here @micha
    console.log(user, timeStamp, message)
}


connect()