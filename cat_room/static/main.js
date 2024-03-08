class Connection {
  constructor() {
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
    this.socket.send(JSON.stringify({"cmd":"msg","user": this.userName, "time": timeStamp, "msg": message}));
  }
  onMessage(user, timeStamp, message){
    // visualize message here @micha
    console.log(user, timeStamp, message)
  }
  onJoin(user, timeStamp, status){
    if(user === this.userName){
        var data = {user:user, time:timeStamp, status:status}
        if (status === 0){this.rejectRegister(new Error("Duplicate User!"))
        }else{this.resolveRegister(data)}
    }
    console.log(user, timeStamp, status)
  }
  WSMessageHandler(event){
    // internal websocket message handler
    var data = JSON.parse(event.data)

    if (data["cmd"] === "err"){
        throw new Error(data["message"])
    } else if(data["cmd"] === "msg"){
        this.onMessage(data["user"], data["time"], data["msg"])
    }else if (data["cmd"] === "join"){
        var user = data["user"];
        var timeStamp = data["timeStamp"];
        var status = data["status"];
        this.onJoin(user, timeStamp, status)
    }else{
        console.error("received invalid data:",event.data)
      }
  }
}

async function main(){
    const con = new Connection()
    await con.register("Cat-2235")
    await con.sendMessage("Hello?")
}
main()

