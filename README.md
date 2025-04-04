# DUMBO

Disi Usage Monitor BOlogna is a tool to monitor the load average and uptime of
some machines that are available to the students for ssh and projects.

# How it works

## Client

On every machine there is a systemd job that every minute will collect the load
average of the machine and send it to a server. This is the `client` and is 
located on the `client/` directory.

## Server
The server is responsible for receiving the data from the clients and storing it 
in a database. It is also responsible for serving the data to the web interface.
The server is located in the `server/` directory.


## Web interface
The web interface enables the user to see monitor which machines are up and how
much load they have. It is located in the `frontend/` directory.
