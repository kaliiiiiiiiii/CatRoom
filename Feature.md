# Persistent Login
Add cookies such that the user doesn't get logged-out on reload

## Implementation

- [ ] Backend
    - [ ] Add a [MongoDB](https://www.mongodb.com/docs/drivers/motor/) server with a collection of document in the following format:
        ```js
        {"userName":userName, "created":timeStamp, "value":"someVeryLongUniqueId"}
        ```
    - [ ] on [user register](cat_room/serve.py#L128) \
        (pseudocode)
        ```
        def registerNew:
            create a UUID4 and timestamp
            respond to Frontend with SetCookie (expires after:10min)
            store UUID4, `TimeStamp` and UserName(key) in database
      
        if cookie in database:
            if (now - timestamp) > 10 minutes:
                registerNew()
            else:
                resolve register with stored userName
        elif userName in database:
            report duplicated user
        else:
            registerNew()
        ```
- [ ] Frontend
    - [ ] add dialog for `Load the previous session?`
      - options
        - Yes
        - No
    - [ ] save the last userName in local-storage & try to register (=> login) with it

Notes:
- `class Server` should add an extra kwarg `logoutTimeout` with those default `60*10 sec. = 10 min.`
- This feature doesn't aim nor will persist the messages itself

