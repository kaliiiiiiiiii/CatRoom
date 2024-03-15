function onMessage(user, timeStamp, message, id){
    let span = document.createElement("span")
    span.setAttribute("id", id)
    span.setAttribute("class", "message")
    span.innerHTML = '<h4 class="username">' + user + '</h4><span class="message-content">' + message + '</span><span class="time-stamp">' + timeStamp + '</span>'

    content.append(span)
    console.log(user, timeStamp, message, id)
};

function onJoin(user, timeStamp){
    console.log(user, timeStamp)
};

function onLeave(user, timeStamp){
    console.log(user)
};

async function main(){
    const con = new Connection(onJoin, onMessage, onLeave);
    await con.register("Cat-2235");
    try{
        await con.register("Cat-2235");
    }catch(e){console.error(e)};

    await con.sendMessage("Hello?");
};
main()

inp.addEventListener("keydown", (event) => {
  if (event.key !== 'Enter') {
    return;
  }
  // @KALIIIIIIIIIII
});