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

5. Both sends the remote token to confirm the connection
6. Server sends `BBBB`
7. Client sends `AAAA`
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
- status: CONNECTED
- token: AAAABBBB
- token_local: AAAA
- token_remote: BBBB
- socket: 1 (closed)
SERVER2
- status: OPEN
- token_local: CCCC
- socket: 2 (closed)

CLIENT
- status: RECONNECTING
- token: AAAABBBB
- token_local: BBBB
- token_remote: AAAA
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
