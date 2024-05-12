function uuid4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

class Connection {
  constructor(onJoin, OnMessage,OnLeave) {
    this.fetchUsers()
    this.users = new Set([])
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
    if (!userName.match(/^(?![\r\n\t\f\v ])(?!.*\s)(.{5,30})$/gm)){throw new Error("invalid username")}
    await this.waitOpen;
    this.userName = userName
    this.socket.send(JSON.stringify({"cmd":"register", "user":userName}));
    try{await this.waitRegister}catch(e){
        this.userName = undefined;
        this.waitRegister = new Promise(((resolve, reject)=>{this.resolveRegister = resolve, this.rejectRegister = reject}).bind(this));
        throw e
    }
  }
  async fetchUsers(){
    var request = await fetch("get_users");
    this.users = new Set(await request.json());
    return this.users
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
        }else{this.resolveRegister(data); this.users.add(user)}
    }else{
        var t = new Date(1970, 0, 1);
        t.setSeconds(timeStamp)
        if(status==1){
            this.users.add(user);
            this.onJoin(user, t);
        }
    }
  }
  WSMessageHandler(event){
    // internal websocket message handler
    var data = JSON.parse(event.data)

    if (data["cmd"] === "err"){
        throw new Error(data["message"])
    } else if(data["cmd"] === "msg"){
        var t = new Date(1970, 0, 1);
        t.setSeconds(data["time"])
        this.onMessage(data["user"], t, data["msg"], data["id"])
    }else if (data["cmd"] === "join"){
        this.onJoinHelper(data["user"], data["time"], data["status"])
    }else if (data["cmd"] == "leave"){
        this.users.delete(data["user"])
        var t = new Date(1970, 0, 1);
        t.setSeconds(data["time"])
        this.onLeave(data["user"], t)
    }else{
        console.error("received invalid data:",event.data)
      }
  }
}

