function connect(){
    const socket = new WebSocket(`ws://${window.location.host}/ws`);

    socket.addEventListener("open", (event) => {
      socket.send(JSON.stringify({"cmd":"register", "user":"Cat-2235"}));
    });

    socket.addEventListener("message", (event) => {
      data = JSON.parse(event.data)
      if (data["msg"] === "err"){throw Error(data["message"])}
      console.log(event.data);
    });
};

connect()