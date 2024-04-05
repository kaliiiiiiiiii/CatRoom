function onMessage(user, timeStamp, message, id){

    let span = document.createElement("span")
    span.setAttribute("class", "span_minor")

    let span_wrapper = document.createElement("span")
    span_wrapper.setAttribute("id", id)

    var timeStampStr = timeStamp.toLocaleString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})
    if(user !== username && lastUser !== user) {
        span_wrapper.setAttribute("class", "message")
        span_wrapper.setAttribute("class", "message-w-username")
        let userNameElem = document.createElement("span")
        userNameElem.setAttribute("class", "username")
        userNameElem.textContent = user
        span.append(userNameElem)
        lastUser = user

        if (lastTimeStampStr !== timesStampStr){
            lastTimeStampStr = timeStampStr
            let timeElem = document.createElement("span")
            timeElem.setAttribute("class","time-stamp")
            timeElem.textContent = timeStampStr
            span.append(timeElem)
        }

    } else if(user == username) {
        span_wrapper.setAttribute("class", "message-self")

        if (lastTimeStampStr !== timesStampStr){
            lastTimeStampStr = timeStampStr
            let timeElem = document.createElement("span")
            timeElem.setAttribute("class","time-stamp")
            timeElem.textContent = timeStampStr
            span.append(timeElem)
        }

        lastUser = user
    } else {
        span_wrapper.setAttribute("class", "message")
    }

    let messageElem = document.createElement("span")
    messageElem.setAttribute("class","message-content")
    messageElem.textContent = message
    span.append(messageElem)


    span_wrapper.append(span)

    content.append(span_wrapper)
    console.log(user, timeStamp, message, id)

    // Fix time for user receiving messages to display after waiting 1 min+ >> Assume we need add time in another if function
};

function onJoin(user, timeStamp){
    lastUser = ""

    let span = document.createElement("span")
    span.setAttribute("class", "join")

    let spanPrefix = document.createElement("span")
    spanPrefix.setAttribute("class", "user-join-affix")
    spanPrefix.innerHTML = "> &nbsp;"
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
    timeElem.textContent = timeStamp.toLocaleString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})
    span.append(timeElem)

    content.append(span)
    console.log(user)
};

function onLeave(user, timeStamp){
    lastUser = ""
    let span = document.createElement("span")
    span.setAttribute("class", "join")

    let spanPrefix = document.createElement("span")
    spanPrefix.setAttribute("class", "user-leave-affix")
    spanPrefix.innerHTML = "> &nbsp;"
    span.append(spanPrefix)

    let userNameElem = document.createElement("span")
    userNameElem.setAttribute("class", "user-leave")
    userNameElem.textContent = user
    span.append(userNameElem)

    let spanAffix = document.createElement("span")
    spanAffix.setAttribute("class", "user-leave-affix")
    spanAffix.innerHTML = " left."
    span.append(spanAffix)

    let timeElem = document.createElement("span")
    timeElem.setAttribute("class","time-stamp")
    timeElem.textContent = timeStamp.toLocaleString([], {year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'})
    span.append(timeElem)

    content.append(span)
};

async function main(){
    const con = new Connection(onJoin, onMessage, onLeave);
    username_input.focus()

    inp.addEventListener("keydown", (event) => {
      if ((event.key === 'Enter'  && event.shiftKey) || event.key !== 'Enter') {
        return;
      };
      var text = inp.innerText;
      inp.textContent = "";
      con.sendMessage(text)
        .catch(console.error)
        .then(()=>{console.log(username, con.users);inp.focus()})
    });
    inp.addEventListener("keyup",(event)=>{
      if ((event.key === 'Enter'  && event.shiftKey) || event.key !== 'Enter') {
        return;
      };
      inp.textContent = "";
    })


    username_input.addEventListener("keydown", (event) => {
        if (event.key !== 'Enter') {
            warn.style.display = "none";
            return;
          };
        username = username_input.value;

        con.register(username)
            .then(()=>{
                popUp.style.display = 'none';
                blur.style.display = 'none';
                warn.style.display = "none";
                bar_username.textContent = username
            })
            .catch((e)=>{
                if(e.message == "Duplicate User!"){
                    warn.innerHTML = "Username taken!"
                    warn_popUp()
                }else if (e.message == "invalid username"){
                    warn.innerHTML = "Username should be between 5 - 30 chars without whitespaces"
                    warn_popUp()
                    //todo @micha
                }
                else{console.error(e)}
            })
        console.log(username)
    })
};

main()

function warn_popUp() {
    warn.style.display = "block";
}