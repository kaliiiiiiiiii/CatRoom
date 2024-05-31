function uuid4() {
  // generate UUID4 (unique identifier as str)
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

class Connection {
  constructor(onJoin, OnMessage,OnLeave) {
    // onJoin:Callable[user:str, timeStamp:float]
    // OnMessage:Callable[user:str, timeStamp:float, message:str, id:str]
    // onLeave:Callable[user, timeStamp]
    this.fetchUsers()
    this.users = new Set([])
    this.onJoin = onJoin
    this.onMessage = onMessage
    this.onLeave = onLeave

    // initiate connection
    var protocol = "ws://"
    if (location.protocol === 'https:') {
        var protocol = "wss://"
    }
    this.socket = new WebSocket(protocol+window.location.host+"/ws");

    // wrap "open" and "close" into a promise (=> async)
    this.waitOpen = new Promise((resolve, reject) => {
        this.socket.addEventListener("open", resolve);
        this.socket.addEventListener("error", reject);
    })

    // add this.resolveRegister:function and this.rejectRegister:function
    this.waitRegister = new Promise(((resolve, reject)=>{this.resolveRegister = resolve, this.rejectRegister = reject}).bind(this));

    this.WSMessageHandler = this.WSMessageHandler.bind(this);
    this.socket.addEventListener("message", this.WSMessageHandler);
  }
  async register(userName){
    // register this user
    // userName:str

    // userName cannot include invisible characters
    // and has to be between 5 and 30 letters long
    if (!userName.match(/^(?![\r\n\t\f\v ])(?!.*\s)(.{5,30})$/gm)){throw new Error("invalid username")}


    await this.waitOpen;
    this.userName = userName
    this.socket.send(JSON.stringify({"cmd":"register", "user":userName}));
    try{await this.waitRegister}catch(e){
        // error for example due to a duplicate (validated and reported from backend, see this.onJoinHelper)
        this.userName = undefined;

        // re-create this.resolveRegister and this.rejectRegister
        this.waitRegister = new Promise(((resolve, reject)=>{this.resolveRegister = resolve, this.rejectRegister = reject}).bind(this));
        throw e
    }
  }
  async fetchUsers(){
    // gets the list of already connected users form the server
    // returns: Set
    var response = await fetch("get_users");
    if (response.status != 404){
        this.users = new Set(await response.json());
    }
    return this.users
  }

  async sendMessage(message){
    // send Chat-Message from this user
    if(!(this.userName)){throw new Error("Not registered yet")}
    const timeStamp = new Date() / 1000 ;
    this.socket.send(JSON.stringify({"cmd":"msg","time": timeStamp, "msg": message, "id":uuid4()}));
  }
  onJoinHelper(user, timeStamp, status){
    if(user === this.userName){
        var data = {user:user, time:timeStamp, status:status}

        // reject user registration due to duplicate
        if (status === 0){this.rejectRegister(new Error("Duplicate User!"))

        // user registration successful
        }else{this.resolveRegister(data); this.users.add(user)}
    }else{
        // another user has joined => track, call this.onJoin
        var t = new Date(1970, 0, 1);
        t.setSeconds(timeStamp)
        if(status==1){
            this.users.add(user);
            this.onJoin(user, t);
        }
    }
  }
  WSMessageHandler(event){
    // a websocket message has been received
    var data = JSON.parse(event.data)

    if (data["cmd"] === "err"){
        // received an error event from backend
        throw new Error(data["message"])
    } else if(data["cmd"] === "msg"){
        // server broadcasts a ChatMessage
        var t = new Date(1970, 0, 1);
        t.setSeconds(data["time"])
        this.onMessage(data["user"], t, data["msg"], data["id"])
    }else if (data["cmd"] === "join"){
        // server broadcasts that a user joined
        this.onJoinHelper(data["user"], data["time"], data["status"])
    }else if (data["cmd"] == "leave"){
        // server broadcasts that a user has left
        this.users.delete(data["user"])
        var t = new Date(1970, 0, 1);
        t.setSeconds(data["time"])
        this.onLeave(data["user"], t)
    }else{
        // server sent an invalid message
        console.error("Received invalid data:",event.data)
      }
  }
}

