# CONNECTIVITY PROTOCOL PROPOSAL

`SERVER` and `CLIENT` are both nodes instances in the dop world.

## STATUS

```
OPEN: 0
PRECONNECTED: 1
CONNECTED: 2
RECONNECTING: 3
DISCONNECTED: 4
```

---

## CONNECTION

1. Connection opened via WebSockets and this is the state for both nodes:

```
SERVER
- status: OPEN
- token_local: AAAA
- socket: 1

CLIENT
- status: OPEN
- token_local: BBBB
- socket: 1
```

2. Both sends the instruction to start the connection
3. Client sends `BBBB`
4. Server sends `AAAA`

```
SERVER
- status: PRECONNECTED
- token_local: AAAA
- token_remote: BBBB
- socket: 1

CLIENT
- status: PRECONNECTED
- token_local: BBBB
- token_remote: AAAA
- socket: 1
```

5. Both sends the local token again to confirm the connection
6. Server sends `AAAA`
7. Client sends `BBBB`
8. Both nodes merge the local and remote token to create the final token (The merge must be in alphabetical order)

```
SERVER
- status: CONNECTED
- token: AAAABBBB
- socket: 1

CLIENT
- status: CONNECTED
- token: AAAABBBB
- socket: 1
```

# RECONNECTION

9. If the socket is closed CLIENT will try to reconnect opening a new Socket
10. Server creates another node

```
SERVER1
- status: RECONNECTING
- token: AAAABBBB
- socket: 1 (closed)
SERVER2
- status: OPEN
- token_local: CCCC
- socket: 2

CLIENT
- status: RECONNECTING
- token: AAAABBBB
- socket: 2
```

11. SERVER2 sends `CCCC`
12. CLIENT is PRECONNECTED

```
SERVER1
- status: RECONNECTING
- token: AAAABBBB
- socket: 1 (closed)
SERVER2
- status: OPEN
- token_local: CCCC
- socket: 2

CLIENT
- status: PRECONNECTED
- token: AAAABBBB
- socket: 2
```

12. CLIENT sends `AAAABBBB`
13. SERVER1 becomes as CONNECTED
14. SERVER1 gets socket from SERVER2
15. We delete SERVER2

```
SERVER1
- status: CONNECTED
- token: AAAABBBB
- socket: 2
SERVER2 (deleted)

CLIENT
- status: PRECONNECTED
- token: AAAABBBB
- socket: 2
```

15. SERVER1 sends `AAAABBBB` to confirm connection on CLIENT

```
SERVER1
- status: CONNECTED
- token: AAAABBBB
- socket: 2

CLIENT
- status: CONNECTED
- token: AAAABBBB
- socket: 2
```

# RECONNECTION FAILS AND BECOME A NEW CONNECTION

15. Socket is closed and SERVER1 is deleted because of the timeout/garbage collector.
16. CLIENT will try to reconnect opening a new Socket
17. Server creates another node

```
SERVER1 (deleted)
SERVER2
- status: OPEN
- token_local: DDDD
- socket: 3

CLIENT
- status: RECONNECTING
- token: AAAABBBB
- socket: 3
```

18. SERVER2 sends `DDDD`
19. CLIENT is PRECONNECTING
20. CLIENT sends `AAAABBBB`

```
SERVER2
- status: OPEN
- token_local: DDDD
- token_remote: AAAABBBB
- socket: 3

CLIENT
- status: RECONNECTING
- token_local: AAAABBBB
- token_remote: DDDD
- socket: 3
```

21. CLIENT is now PRECONNECTED
22. SERVER2 is now PRECONNECTED
23. SERVER2 sends again `DDDD`

```
SERVER2
- status: PRECONNECTED
- token_local: DDDD
- token_remote: AAAABBBB
- socket: 3

CLIENT
- status: PRECONNECTED
- token_local: AAAABBBB
- token_remote: DDDD
- socket: 3
```

24. CLIENT creates another node and transfer socket
25. CLIENT2 sends again `AAAABBBB`

```
SERVER2
- status: PRECONNECTED
- token_local: DDDD
- token_remote: AAAABBBB
- socket: 3

CLIENT1 (deleted)
- status: PRECONNECTED
- token_local: AAAABBBB
CLIENT2
- status: CONNECTED
- token: AAAADDDD
- socket: 3
```

25. SERVER2 is now connected

```
SERVER2
- status: CONNECTED
- token: AAAADDDD
- socket: 3

CLIENT1 (deleted)
CLIENT2
- status: CONNECTED
- token: AAAADDDD
- socket: 3
```

## DISCONNECTION

26. If any node sends the `token` as instructions means is a formal disconnection. And can't be recovered.
27. CLIENT sends `AAAADDDD`

```
SERVER2
- status: DISCONNECTED
- token: AAAADDDD
- socket: 3 (closed)

CLIENT2
- status: DISCONNECTED
- token: AAAADDDD
- socket: 3 (closed)
```
