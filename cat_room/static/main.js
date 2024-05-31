function onMessage(user, timeStamp, message, id){
    // message received from server broadcast

    let _scroll = checkScrollNeeded()

    // create message element
    let span = document.createElement("span")
    span.setAttribute("class", "span_minor")
    span.setAttribute("style", "border-color:" + userColors[user]);

    let span_wrapper = document.createElement("span")
    span_wrapper.setAttribute("id", id)

    var timeStampStr = timeStamp.toLocaleString([], {weekday: 'short', hour: '2-digit', minute: '2-digit'})
    if(user !== username && lastUser !== user) {
        // message not from this user
        // and
        // message not from the last user message
        // do show username
        span_wrapper.setAttribute("class", "message-w-username")
        let userNameElem = document.createElement("span")
        userNameElem.setAttribute("class", "username")
        userNameElem.setAttribute("style", "color:" + userColors[user]);
        userNameElem.textContent = user
        span.append(userNameElem)

    } else if(user == username) {
        // user is this user
        // don't show username
        span_wrapper.setAttribute("class", "message-self")

    } else {
        // last user message is user
        // => don't show username
        span_wrapper.setAttribute("class", "message")
    }

    if(user !== lastUser || lastTimeStampStr !== timeStampStr) {
        // user is not same user as last message
        // last timestamp is different form current
        // timestampStr in minutes
        // => show the timestamp
        let timeElem = document.createElement("span")
        timeElem.setAttribute("class","time-stamp")
        timeElem.textContent = timeStampStr
        span.append(timeElem)
    }

    lastUser = user
    lastTimeStampStr = timeStampStr

    // message element
    for (line of message.split("\n")){
        // span element for each line
        let messageElem = document.createElement("span")
        messageElem.setAttribute("class","message-content")
        messageElem.textContent = line
        span.append(messageElem)
    };

    span_wrapper.append(span)

    content.append(span_wrapper)
    console.log(user, timeStamp, message, id)

    if (_scroll) {
        // sroll if necessary
        scroll()
    }
};

function onJoin(user, timeStamp){
    // onJoin received from server broadcast
    lastUser = ""

    let _scroll = checkScrollNeeded()

    // assign random color for user
    randomColor(user);

    // user joined element
    let span = document.createElement("span")
    span.setAttribute("class", "join")

    // Span prefix before username ">  "
    let spanPrefix = document.createElement("span")
    spanPrefix.setAttribute("class", "user-join-affix")
    spanPrefix.innerHTML = "> &nbsp;" // &nbsp; = non breaking space
    span.append(spanPrefix)

    // username
    let userNameElem = document.createElement("span")
    userNameElem.setAttribute("class", "user-join")
    userNameElem.setAttribute("style", "color:" + userColors[user]);
    userNameElem.textContent = user
    span.append(userNameElem)

    // "joined"
    let spanAffix = document.createElement("span")
    spanAffix.setAttribute("class", "user-join-affix")
    spanAffix.innerHTML = " joined."
    span.append(spanAffix)

    // timeStamp
    let timeElem = document.createElement("span")
    timeElem.setAttribute("class","time-stamp")
    timeElem.textContent = timeStamp.toLocaleString([], {weekday: 'short', hour: '2-digit', minute: '2-digit'})
    span.append(timeElem)

    content.append(span)

    // Add to userList
    span = document.createElement("span");
    span.setAttribute("class", "user");
    span.setAttribute("style", "color:" + userColors[user]);
    span.textContent = user;
    userList.append(span);
    console.log(user)

    if (_scroll) {
        scroll()
    }
};

function onLeave(user, timeStamp){
    // onUserLeft broadcasted from server
    try{
        if(!user) {
            return;
        }

        let _scroll = checkScrollNeeded()

        // user left element
        lastUser = ""
        let span = document.createElement("span")
        span.setAttribute("class", "join")

        let spanPrefix = document.createElement("span")
        spanPrefix.setAttribute("class", "user-leave-affix")
        spanPrefix.innerHTML = "> &nbsp;"
        span.append(spanPrefix)

        // username
        let userNameElem = document.createElement("span")
        userNameElem.setAttribute("class", "user-leave")
        userNameElem.setAttribute("style", "color:" + userColors[user]);
        userNameElem.textContent = user
        span.append(userNameElem)

        // "left"
        let spanAffix = document.createElement("span")
        spanAffix.setAttribute("class", "user-leave-affix")
        spanAffix.innerHTML = " left."
        span.append(spanAffix)

        // timeStamp
        let timeElem = document.createElement("span")
        timeElem.setAttribute("class","time-stamp")
        timeElem.textContent = timeStamp.toLocaleString([], {weekday: 'short', hour: '2-digit', minute: '2-digit'})
        span.append(timeElem)

        content.append(span)

        // Remove from userList
        let u = document.getElementsByClassName("user")
        for(let i in u) {
            if(u[i].innerHTML !== user) {continue;}
            u[i].parentNode.removeChild(u[i]);
        }
        delete userColors[user];

        if (_scroll) {
            scroll()
        }
    }catch(e){
        // cleanup memory whatever happens
        delete userColors[user];
        throw e
    }
};

function scroll() {
    // scroll to bottom
    content.scrollTo(0, content.scrollHeight);
}

async function main(){
    // the main function

    const con = new Connection(onJoin, onMessage, onLeave);
    username_input.focus()

    inp.addEventListener("keydown", (event) => {
      // keydown on message Input
      if ((event.key === 'Enter'  && event.shiftKey) || event.key !== 'Enter') {
        // SHIFT + ENTER or (not ENTER) pressed
        return;
      };
      // ENTER without SHIFT pressed, send message

      // don't treat as ENTER
      event.preventDefault();

      var text = inp.innerText;
      inp.textContent = "";
      con.sendMessage(text)
        .catch(console.error)
        .then(()=>{console.log(username, con.users);inp.focus()})
    });

    inp.addEventListener("keyup",(event)=>{
      // after message sent
      if ((event.key === 'Enter'  && event.shiftKey) || event.key !== 'Enter') {
        // // SHIFT + ENTER or (not ENTER) pressed (=> no message sent)
        return;
      };

      // scroll to bottom
      content.scrollTo(0, content.scrollHeight);
    })


    username_input.addEventListener("keydown", (event) => {
        // register this user
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
                inp.focus()
                bar_username.textContent = username

                // get currently connected users, visualize and assign colors
                con.fetchUsers().then((users)=>{
                    for(let user of users) {

                        // visualize & add to currently connected users
                        if(user == username) {continue;}

                        randomColor(user);

                        let span = document.createElement("span");
                        span.setAttribute("class", "user");
                        span.setAttribute("style", "color:" + userColors[user]);
                        span.textContent = user;
                        userList.append(span);
                        console.log(user);
                    }
                })

            })
            .catch((e)=>{
                if(e.message == "Duplicate User!"){
                    warn.innerHTML = "Username taken!"
                    warn_popUp()
                }else if (e.message == "invalid username"){
                    warn.innerHTML = "Username should be between 5 - 30 chars without whitespaces"
                    warn_popUp()
                }
                else{console.error(e)}
            })
        console.log(username)
    })
};

main()

function randomColor(user) {
    userColors[user] = "rgb("+Math.ceil(Math.random() * 155 + 100)+","+Math.ceil(Math.random() * 155 + 100)+","+Math.ceil(Math.random() * 155 + 100)+")";
}

function checkScrollNeeded() {
    // Scroll when almost at bottom
    return (content.scrollHeight - content.offsetHeight - content.scrollTop <= 50)
}

function warn_popUp() {
    warn.style.display = "block";
}

function userListSidebar() {
    if(userListBool) {
        // show userList
        wrapperMessages.style.display = "none";
        wrapperUsers.style.display = "flex";
        wrapperUsers.style.width = "100%";
        userListButton.innerHTML = "Chat"
    } else {
        // hide userList
        wrapperMessages.style.display = "flex";
        wrapperUsers.style.display = "none";
        wrapperUsers.style.width = "25%";
        userListButton.innerHTML = "User list"
    }
    userListBool = !userListBool
}