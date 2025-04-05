use core::time;
use gethostname::gethostname;
use serde::{Deserialize, Serialize};
use std::{
    collections::HashSet,
    env, fs,
    path::Path,
    process::{self, Command},
};
use sys_info;

const COLLECT_ENDPOINT: &str = "/api/collect";

#[derive(Deserialize)]
struct Server {
    url: String,
    token: String,
}

#[derive(Deserialize)]
struct Collect {
    cycle: u64,
}

#[derive(Deserialize)]
struct Config {
    server: Server,
    collect: Collect,
}

#[derive(Serialize)]
struct Load {
    date: String,
    one: f64,
    five: f64,
    fifteen: f64,
    ram_used: u64,
    connected_users: usize,
}

#[derive(Serialize)]
struct Host<'a> {
    hostname: &'a str,
    cpus: usize,
    ram: u64,
    uptime: i64,
}

#[derive(Serialize)]
struct Payload<'a> {
    host: Host<'a>,
    load: Load,
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Config path not specified");
        process::exit(1)
    }

    let config_path = Path::new(&args[1]);
    let config = fs::read_to_string(config_path).expect("Config not found");
    let config: Config = toml::from_str(&config).unwrap();

    let hostname = gethostname();
    let hostname = hostname
        .to_str()
        .expect("Could not convert hostname to string");

    let full_url = config.server.url + COLLECT_ENDPOINT;
    let mem_info = sys_info::mem_info().expect("Can't get memory information");

    let host = Host {
        hostname,
        cpus: num_cpus::get(),
        ram: mem_info.total,
        uptime: sys_info::boottime().expect("Can't get uptime").tv_sec,
    };

    let mut body = Payload {
        host,
        load: Load {
            date: String::new(),
            one: 0.0,
            five: 0.0,
            fifteen: 0.0,
            ram_used: 0,
            connected_users: 0,
        },
    };

    loop {
        let l = sys_info::loadavg().unwrap();
        let date = chrono::offset::Utc::now();

        body.load = Load {
            date: date.to_rfc3339(),
            one: l.one,
            five: l.five,
            fifteen: l.fifteen,
            ram_used: mem_info.total - mem_info.avail,
            connected_users: get_connected_users(),
        };

        let body = match serde_json::to_string(&body) {
            Ok(b) => b,
            Err(e) => {
                eprint!("Error seriliazing: {e}");
                std::thread::sleep(time::Duration::from_secs(config.collect.cycle));
                continue;
            }
        };

        let res = minreq::post(&full_url)
            .with_header("X-API-Token", &config.server.token)
            .with_body(body)
            .send();

        match res {
            Ok(res) => {
                if res.status_code < 200 || res.status_code >= 300 {
                    eprint!(
                        "Status code of the request was {}. Body: {}",
                        res.status_code,
                        res.as_str()
                            .expect("Should be able to convert body of response to str")
                    );
                }
            }
            Err(e) => eprint!("Error making http request: {e}"),
        }

        std::thread::sleep(time::Duration::from_secs(config.collect.cycle));
    }
}

fn get_connected_users() -> usize {
    let out = Command::new("who").output();
    if let Err(err) = out {
        eprintln!("Error executing 'who' {}", err);
        return 0;
    }

    let out = out.unwrap();
    let stdout = String::from_utf8_lossy(&out.stdout);
    let mut users = HashSet::new();

    for line in stdout.lines() {
        if let Some(username) = line.split_whitespace().next() {
            users.insert(username.to_string());
        }
    }

    users.len()
}
