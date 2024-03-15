function uuid4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

class Connection {
  constructor(onJoin, OnMessage,OnLeave) {

    this.onJoin = onJoin
    this.onMessage = onMessage
    this.onLeave = onLeave
    // initiate connection
    this.socket = new WebSocket(`ws://${window.location.host}/ws`);
    this.waitOpen = new Promise((resolve, reject) => {
        this.socket.addEventListener("open", resolve);
        this.socket.addEventListener("error", reject);
    })
    this.waitRegister = new Promise(((resolve, reject)=>{this.resolveRegister = resolve, this.rejectRegister = reject}).bind(this));

    // bind to this
    this.WSMessageHandler = this.WSMessageHandler.bind(this);

    // add message handler
    this.socket.addEventListener("message", this.WSMessageHandler);
  }
  async register(userName){
    // register user
    await this.waitOpen;
    this.userName = userName
    this.socket.send(JSON.stringify({"cmd":"register", "user":userName}));
    try{await this.waitRegister}catch(e){
        this.userName = undefined;
        this.waitRegister = new Promise(((resolve, reject)=>{this.resolveRegister = resolve, this.rejectRegister = reject}).bind(this));
        throw e
    }
  }

  async sendMessage(message){
    if(!(this.userName)){throw new Error("Not registered yet")}
    const timeStamp = new Date() / 1000 ;
    this.socket.send(JSON.stringify({"cmd":"msg","time": timeStamp, "msg": message, "id":uuid4()}));
  }
  onJoinHelper(user, timeStamp, status){
    if(user === this.userName){
        var data = {user:user, time:timeStamp, status:status}
        if (status === 0){this.rejectRegister(new Error("Duplicate User!"))
        }else{this.resolveRegister(data)}
    }
    this.onJoin(user, timeStamp)
  }
  WSMessageHandler(event){
    // internal websocket message handler
    var data = JSON.parse(event.data)

    if (data["cmd"] === "err"){
        throw new Error(data["message"])
    } else if(data["cmd"] === "msg"){
        this.onMessage(data["user"], data["time"], data["msg"], data["id"])
    }else if (data["cmd"] === "join"){
        var user = data["user"];
        var timeStamp = data["timeStamp"];
        var status = data["status"];
        this.onJoinHelper(user, timeStamp, status)
    }else if (data["cmd"] == "leave"){this.onLeave(data["user"], data["time"])
    }else{
        console.error("received invalid data:",event.data)
      }
  }
}

