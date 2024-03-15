function onMessage(user, timeStamp, message, id){
    // visualize message here @micha
    console.log(user, timeStamp, message, id)
};

function onJoin(user, timeStamp){
    console.log(user, timeStamp)
};

function onLeave(user, timeStamp){
    console.log(user)
};

async function main(){
    const con = new Connection(onJoin, onMessage, onLeave)
    await con.register("Cat-2235")
    await con.sendMessage("Hello?")
}
main()
