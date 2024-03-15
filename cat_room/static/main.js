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
    timeElem.setAttribute("class","time-stamp")
    timeElem.textContent = timeStamp.toLocaleString()
    span.append(timeElem)

    content.append(span)
    console.log(user, timeStamp, message, id)
};

function onJoin(user, timeStamp){
    let span = document.createElement("span")
    span.setAttribute("class", "join")

    let spanPrefix = document.createElement("span")
    spanPrefix.setAttribute("class", "user-join-affix")
    spanPrefix.innerHTML = ">> &nbsp"
    span.append(spanPrefix)

    let userNameElem = document.createElement("span")
    userNameElem.setAttribute("class", "user-join")
    userNameElem.textContent = user
    span.append(userNameElem)

    let spanAffix = document.createElement("span")
    spanAffix.setAttribute("class", "user-join-affix")
    spanAffix.innerHTML = " joined."
    span.append(spanAffix)

    let timeElem = document.createElement("span")
    timeElem.setAttribute("class","time-stamp")
    timeElem.textContent = timeStamp.toLocaleString()
    span.append(timeElem)

    content.append(span)
    console.log(user)
};

function onLeave(user, timeStamp){
    console.log(user)
};

async function main(){
    const con = new Connection(onJoin, onMessage, onLeave);

    inp.addEventListener("keydown", (event) => {
      if (event.key !== 'Enter') {
        return;
      };
      var text = inp.value ;
      con.sendMessage(text)
        .catch(console.error)
        .then(()=>{inp.value = ""})
    });

    username_input.addEventListener("keydown", (event) => {
        if (event.key !== 'Enter') {
            return;
          };
        let username = username_input.value;

        con.register(username)
            .then(()=>{popUp.style.display = 'none'})
            .catch((e)=>{
                if(e.message == "Duplicate User!"){
                 // @Micha add user duplicate warning (html/css)
                }else{console.error(e)}
            })
        console.log(username)
    })
};
main()