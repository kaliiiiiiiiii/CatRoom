class Connection {
  constructor() {
    // initiate connection
    this.socket = new WebSocket(`ws://${window.location.host}/ws`);
    this.waitOpen = new Promise((resolve, reject) => {
        this.socket.addEventListener("open", resolve);
        this.socket.addEventListener("error", reject);
    })

    // bind to this
    this.WSMessageHandler = this.WSMessageHandler.bind(this);

    // add message handler
    this.socket.addEventListener("message", this.WSMessageHandler);
  }
  async register(userName){
    // register user
    await this.waitOpen;
    this.socket.send(JSON.stringify({"cmd":"register", "user":userName}));
    this.userName = userName
  }
  async sendMessage(message){
    const timeStamp = new Date() / 1000 ;
    this.socket.send(JSON.stringify({"cmd":"msg","user": this.userName, "time": timeStamp, "msg": message}));
  }
  onMessage(user, timeStamp, message){
    // visualize message here @micha
    console.log(user, timeStamp, message)
  }
  WSMessageHandler(event){
    // internal websocket message handler
    var data = JSON.parse(event.data)

    if (data["cmd"] === "err"){
        throw new Error(data["message"])
    } else if(data["cmd"] === "msg"){
        this.onMessage(data["user"], data["time"], data["msg"])
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

