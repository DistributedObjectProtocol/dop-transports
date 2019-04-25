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
- token_local: AAAA
- token_remote: BBBB
- socket: 1

CLIENT
- status: CONNECTED
- token: AAAABBBB
- token_local: BBBB
- token_remote: AAAA
- socket: 1
```

# RECONNECTION

9. If the socket is closed CLIENT will try to reconnect opening a new Socket
10. Server creates another node

```
SERVER1
- status: RECONNECTING
- token: AAAABBBB
- token_local: AAAA
- token_remote: BBBB
- socket: 1 (closed)
SERVER2
- status: OPEN
- token_local: CCCC
- socket: 2

CLIENT
- status: RECONNECTING
- token: AAAABBBB
- token_local: BBBB
- token_remote: AAAA
- socket: 2
```

11. SERVER2 sends `CCCC`
12. CLIENT is PRECONNECTED

```
SERVER1
- status: RECONNECTING
- token: AAAABBBB
- token_local: AAAA
- token_remote: BBBB
- socket: 1 (closed)
SERVER2
- status: OPEN
- token_local: CCCC
- socket: 2

CLIENT
- status: PRECONNECTED
- token: AAAABBBB
- token_local: BBBB
- token_remote: CCCC
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
- token_local: AAAA
- token_remote: BBBB
- socket: 2
SERVER2 (deleted)

CLIENT
- status: PRECONNECTED
- token: AAAABBBB
- token_local: BBBB
- token_remote: CCCC
- socket: 2
```

15. SERVER1 sends `AAAABBBB` to confirm connection on CLIENT

```
SERVER1
- status: CONNECTED
- token: AAAABBBB
- token_local: AAAA
- token_remote: BBBB
- socket: 2

CLIENT
- status: CONNECTED
- token: AAAABBBB
- token_local: BBBB
- token_remote: CCCC
- socket: 2
```

<!--
## DISCONNECTION

9. If any node sends the `token` as instructions means is a formal disconnection. And can't be recovered.
10. CLIENT sends `AAAABBBB`

```
SERVER
- status: DISCONNECTED
- token: AAAABBBB
- token_local: AAAA
- token_remote: BBBB
- socket: 1 (closed)

CLIENT
- status: DISCONNECTED
- token: AAAABBBB
- token_local: BBBB
- token_remote: AAAA
- socket: 1 (closed)
```
-->
