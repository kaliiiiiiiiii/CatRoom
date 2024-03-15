function onMessage(user, timeStamp, message, id){
    let span = document.createElement("span")
    span.setAttribute("id", id)
    span.setAttribute("class", "message")

    let userNameElem = document.createElement("h4")
    userNameElem.setAttribute("class", "username")
    userNameElem.textContent = user
    span.append(userNameElem)

    let messageElem = document.createElement("span")
    messageElem.setAttribute("class","message-content")
    messageElem.textContent = message
    span.append(messageElem)

    let timeElem = document.createElement("span")
    messageElem.setAttribute("class","time-stamp")
    timeElem.textContent = timeStamp.toLocaleString()
    span.append(timeElem)

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

    inp.addEventListener("keydown", (event) => {
      if (event.key !== 'Enter') {
        return;
      };
      var text = inp.value ;
      con.sendMessage(text)
        .catch(console.error)
        .then(()=>{inp.value = ""})
    });
    await con.sendMessage("Hello?");
};
main()


